import base64
import hashlib
from typing import Optional
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    """
    Derives a 32-byte urlsafe base64 key from GMAIL_ENCRYPTION_KEY or JWT_SECRET_KEY.
    Ensures deterministic encryption/decryption without requiring manual key generation in dev.
    """
    raw_key = settings.GMAIL_ENCRYPTION_KEY or settings.JWT_SECRET_KEY
    derived_bytes = hashlib.sha256(raw_key.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(derived_bytes)
    return Fernet(fernet_key)

def encrypt_secret(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    f = _get_fernet()
    return f.encrypt(value.encode("utf-8")).decode("utf-8")

def decrypt_secret(cipher_text: Optional[str]) -> Optional[str]:
    if not cipher_text:
        return None
    try:
        f = _get_fernet()
        return f.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
    except Exception:
        return None
