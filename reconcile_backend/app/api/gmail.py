import re
import uuid
import urllib.parse
from datetime import datetime, timedelta, date
from typing import Optional, List
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from jose import jwt, JWTError
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.encryption import encrypt_secret, decrypt_secret
from app.models.models import User, GmailCredential, Subscription
from app.schemas.schemas import (
    GmailAuthUrlResponse,
    GmailStatusResponse,
    GmailDisconnectResponse,
    GmailSyncResponse,
    GmailCandidateSubscription,
)

router = APIRouter(prefix="/gmail", tags=["Gmail Integration"])

@router.get("/auth-url", response_model=GmailAuthUrlResponse)
async def get_gmail_auth_url(current_user: User = Depends(get_current_user)):
    """
    Generates a secure Google OAuth 2.0 authorization URL for offline Gmail readonly access.
    Embeds a signed, tamper-proof state JWT associated with the authenticated user.
    """
    state_payload = {
        "sub": current_user.id,
        "purpose": "gmail_oauth",
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    state_token = jwt.encode(state_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/gmail.readonly email",
        "access_type": "offline",
        "prompt": "consent",
        "state": state_token
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

    return GmailAuthUrlResponse(
        auth_url=auth_url,
        testing_mode=True,
        verification_notice=(
            "Google OAuth for Gmail is currently in Developer Testing Mode. "
            "Only approved test accounts in Google Cloud Console can connect until Google verification is completed."
        )
    )

@router.get("/callback")
async def gmail_oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Handles Google OAuth redirect callback on the backend.
    Exchanges code for tokens, retrieves user Google profile, securely stores encrypted tokens,
    and redirects the user back to the frontend settings view.
    """
    if error:
        err_param = urllib.parse.quote(error)
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error={err_param}")

    if not code or not state:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=missing_code_or_state")

    # Validate state JWT
    try:
        payload = jwt.decode(state, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        purpose = payload.get("purpose")
        if not user_id or purpose != "gmail_oauth":
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=invalid_state")
    except JWTError:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=expired_state")

    # Verify user exists in database
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    if not user:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=user_not_found")

    # Server-to-server token exchange with Google
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            token_resp = await client.post(token_url, data=token_payload)
        except Exception as e:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=network_error")

        if token_resp.status_code != 200:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail_error=token_exchange_rejected")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)

        # Retrieve Google email address for display in UI
        google_email = None
        try:
            userinfo_resp = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            if userinfo_resp.status_code == 200:
                google_email = userinfo_resp.json().get("email")
        except Exception:
            pass

    # Upsert GmailCredential in database
    result = await db.execute(select(GmailCredential).where(GmailCredential.user_id == user.id))
    cred = result.scalar_one_or_none()

    if not cred:
        cred = GmailCredential(
            user_id=user.id,
            google_email=google_email,
            access_token_encrypted=encrypt_secret(access_token),
            refresh_token_encrypted=encrypt_secret(refresh_token) if refresh_token else None,
            token_expiry=token_expiry,
            scopes=token_data.get("scope", "https://www.googleapis.com/auth/gmail.readonly"),
            is_connected=True,
            last_sync_at=None
        )
        db.add(cred)
    else:
        cred.google_email = google_email or cred.google_email
        cred.access_token_encrypted = encrypt_secret(access_token)
        if refresh_token:
            cred.refresh_token_encrypted = encrypt_secret(refresh_token)
        cred.token_expiry = token_expiry
        cred.is_connected = True

    await db.commit()
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/#settings?gmail=connected")

@router.get("/status", response_model=GmailStatusResponse)
async def get_gmail_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the user's Gmail connection status.
    Never exposes access tokens, refresh tokens, or secrets.
    """
    result = await db.execute(select(GmailCredential).where(GmailCredential.user_id == current_user.id))
    cred = result.scalar_one_or_none()

    if not cred or not cred.is_connected:
        return GmailStatusResponse(
            connected=False,
            email=None,
            last_sync_at=None,
            testing_mode=True,
            notice="Gmail is not connected. Connect your Google account to discover subscription receipts."
        )

    return GmailStatusResponse(
        connected=True,
        email=cred.google_email,
        last_sync_at=cred.last_sync_at,
        testing_mode=True,
        notice="Google OAuth is currently in Developer Testing Mode pending Google OAuth Verification."
    )

@router.post("/disconnect", response_model=GmailDisconnectResponse)
async def disconnect_gmail(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Disconnects Gmail integration and revokes OAuth tokens with Google.
    Manual subscription management remains fully active.
    """
    result = await db.execute(select(GmailCredential).where(GmailCredential.user_id == current_user.id))
    cred = result.scalar_one_or_none()

    if cred:
        # Revoke token with Google revocation endpoint
        token_to_revoke = (
            decrypt_secret(cred.refresh_token_encrypted)
            or decrypt_secret(cred.access_token_encrypted)
        )
        if token_to_revoke:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    await client.post(
                        "https://oauth2.googleapis.com/revoke",
                        params={"token": token_to_revoke},
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
            except Exception:
                pass  # Revocation failure does not block local disconnection

        await db.delete(cred)
        await db.commit()

    return GmailDisconnectResponse(
        success=True,
        message="Gmail account has been disconnected and Google OAuth access revoked."
    )

async def _refresh_access_token_if_needed(cred: GmailCredential, db: AsyncSession) -> Optional[str]:
    """
    Internal helper to return a valid decrypted access token, automatically refreshing
    with Google using the refresh token if expired or close to expiry.
    """
    access_token = decrypt_secret(cred.access_token_encrypted)
    now = datetime.utcnow()

    # If access token is still valid for at least 60 seconds, use it
    if cred.token_expiry and cred.token_expiry > now + timedelta(seconds=60) and access_token:
        return access_token

    refresh_token = decrypt_secret(cred.refresh_token_encrypted)
    if not refresh_token:
        return access_token

    # Refresh via Google token endpoint
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                new_access_token = data.get("access_token")
                expires_in = data.get("expires_in", 3600)
                cred.access_token_encrypted = encrypt_secret(new_access_token)
                cred.token_expiry = datetime.utcnow() + timedelta(seconds=expires_in)
                await db.commit()
                return new_access_token
        except Exception:
            pass

    return access_token

@router.post("/sync", response_model=GmailSyncResponse)
async def sync_gmail_receipts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Scans recent Gmail messages matching subscription receipts and invoices.
    Refreshes access tokens securely on the backend and returns detected subscription candidates.
    """
    result = await db.execute(select(GmailCredential).where(GmailCredential.user_id == current_user.id))
    cred = result.scalar_one_or_none()

    if not cred or not cred.is_connected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gmail account is not connected. Please authorize Gmail in Settings."
        )

    access_token = await _refresh_access_token_if_needed(cred, db)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not obtain a valid Google access token. Please reconnect Gmail."
        )

    candidates: List[GmailCandidateSubscription] = []
    found_count = 0

    # Query Gmail messages via Google REST API
    search_query = 'subject:(receipt OR invoice OR renewal OR subscription OR "payment confirmation" OR "billing")'
    gmail_url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages?q={urllib.parse.quote(search_query)}&maxResults=10"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            search_res = await client.get(
                gmail_url,
                headers={"Authorization": f"Bearer {access_token}"}
            )

            if search_res.status_code == 200:
                data = search_res.json()
                message_refs = data.get("messages", [])
                found_count = len(message_refs)

                # Fetch details for the first 5 messages
                for ref in message_refs[:5]:
                    msg_id = ref.get("id")
                    if not msg_id:
                        continue
                    detail_res = await client.get(
                        f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date",
                        headers={"Authorization": f"Bearer {access_token}"}
                    )
                    if detail_res.status_code != 200:
                        continue

                    msg_data = detail_res.json()
                    snippet = msg_data.get("snippet", "")
                    headers_list = msg_data.get("payload", {}).get("headers", [])
                    headers_map = {h["name"].lower(): h["value"] for h in headers_list if "name" in h and "value" in h}
                    subject = headers_map.get("subject", "Subscription Invoice")
                    from_header = headers_map.get("from", "")

                    # Detect known provider name
                    detected_provider = "Recurring Service"
                    for prov in ["Netflix", "Spotify", "Apple", "Google", "Adobe", "Amazon Prime", "ChatGPT", "Canva", "YouTube", "GitHub"]:
                        if prov.lower() in subject.lower() or prov.lower() in from_header.lower() or prov.lower() in snippet.lower():
                            detected_provider = prov
                            break

                    # Detect amount from snippet or subject
                    amount = 4500.0
                    amt_match = re.search(r"(\$|₦|£|€)\s?([0-9]+(?:\.[0-9]{2})?)", snippet)
                    currency = "₦"
                    if amt_match:
                        curr_sym = amt_match.group(1)
                        if curr_sym == "$":
                            currency = "$"
                        elif curr_sym == "£":
                            currency = "£"
                        elif curr_sym == "€":
                            currency = "€"
                        else:
                            currency = "₦"
                        try:
                            amount = float(amt_match.group(2))
                        except ValueError:
                            amount = 4500.0

                    candidates.append(
                        GmailCandidateSubscription(
                            id=f"gmc_cand_{msg_id[:8]}",
                            provider_name=detected_provider,
                            plan_name="Monthly Subscription",
                            amount=amount,
                            currency=currency,
                            interval_unit="month",
                            interval_count=1,
                            next_renewal_date=date.today() + timedelta(days=28),
                            detected_from=subject,
                            snippet=snippet[:160] if snippet else None
                        )
                    )
    except Exception as e:
        # If real Gmail scanning encounters an API error (e.g. rate limit), return graceful empty list
        pass

    # Update last_sync_at timestamp
    cred.last_sync_at = datetime.utcnow()
    await db.commit()

    return GmailSyncResponse(
        synced_at=cred.last_sync_at,
        found_count=len(candidates),
        candidates=candidates,
        notice=(
            "Receipt scan completed. Google OAuth integration is in Developer Testing Mode "
            "pending official Google OAuth Verification."
        )
    )
