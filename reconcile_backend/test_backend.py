import asyncio
import uuid
import httpx
from app.main import app
from app.services.renewal_engine import RenewalEngine
from datetime import date

async def run_tests():
    print("=== Reconcile Backend & Cloud PostgreSQL Verification ===\n")
    from app.core.database import engine, Base
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS category VARCHAR(64) DEFAULT 'General'"))
    print("  [OK] Database schema verified and synchronized.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        print("[1] Testing /health...")
        res = await client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health_data = res.json()
        print(f"  [OK] Health Status: {health_data['status']}")
        print(f"  [OK] Cloud Database: {health_data['database']}")
        print(f"  [OK] Version: {health_data['version']}")
        assert health_data["database"] == "connected", "Database connection is not healthy"

        # 2. Registration
        test_email = f"test_{uuid.uuid4().hex[:8]}@reconcileapp.com"
        test_password = "SecurePassword123!"
        print(f"\n[2] Testing Registration ({test_email})...")
        res = await client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": test_password,
            "preferred_timezone": "Africa/Lagos"
        })
        assert res.status_code == 201, f"Register failed: {res.text}"
        auth_data = res.json()
        token = auth_data["access_token"]
        user_id = auth_data["user"]["id"]
        print(f"  [OK] User registered with ID: {user_id}")
        print(f"  [OK] JWT token issued: {token[:25]}...")

        # 3. Login
        print("\n[3] Testing Login with issued credentials...")
        res = await client.post("/api/v1/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert res.status_code == 200, f"Login failed: {res.text}"
        headers = {"Authorization": f"Bearer {token}"}
        print("  [OK] Login succeeded with valid bearer token")

        # 4. User profile (/auth/me)
        print("\n[4] Testing /auth/me...")
        res = await client.get("/api/v1/auth/me", headers=headers)
        assert res.status_code == 200
        assert res.json()["email"] == test_email
        print(f"  [OK] Authenticated user confirmed: {res.json()['email']}")

        # 5. Create Subscriptions matching reference mock
        print("\n[5] Testing Subscription Creation...")
        subs_to_create = [
            {
                "provider_name": "Netflix",
                "plan_name": "Standard HD",
                "amount": 7500.0,
                "currency": "NGN ",
                "interval_unit": "month",
                "interval_count": 1,
                "next_renewal_date": "2025-04-28",
                "status": "active",
                "notes": "Family streaming profile"
            },
            {
                "provider_name": "Spotify",
                "plan_name": "Premium Individual",
                "amount": 2500.0,
                "currency": "NGN ",
                "interval_unit": "month",
                "interval_count": 1,
                "next_renewal_date": "2025-04-30",
                "status": "active",
                "notes": "Music. Podcasts. More."
            },
            {
                "provider_name": "Adobe",
                "plan_name": "Creative Cloud",
                "amount": 14000.0,
                "currency": "NGN ",
                "interval_unit": "month",
                "interval_count": 1,
                "next_renewal_date": "2025-05-02",
                "status": "needs_review",
                "notes": "Photography Suite"
            },
            {
                "provider_name": "Google One",
                "plan_name": "100GB Storage",
                "amount": 500.0,
                "currency": "NGN ",
                "interval_unit": "month",
                "interval_count": 1,
                "next_renewal_date": "2025-05-12",
                "status": "active"
            }
        ]

        created_ids = []
        for s in subs_to_create:
            res = await client.post("/api/v1/subscriptions", json=s, headers=headers)
            assert res.status_code == 201, f"Failed creating {s['provider_name']}: {res.text}"
            data = res.json()
            created_ids.append(data["id"])
            print(f"  [OK] Created {data['provider_name']} (NGN {data['amount']:,.0f}) -> ID: {data['id']}")

        # 6. Listing and Spend Insights
        print("\n[6] Testing List & Insights Summary...")
        res = await client.get("/api/v1/subscriptions", headers=headers)
        assert res.status_code == 200
        items = res.json()
        assert len(items) == 4, f"Expected 4 subscriptions, got {len(items)}"
        print(f"  [OK] Retrieved {len(items)} active subscriptions")

        res = await client.get("/api/v1/subscriptions/insights/summary", headers=headers)
        assert res.status_code == 200
        insights = res.json()
        print(f"  [OK] Total monthly spend: NGN {insights['total_monthly_normalized']:,.0f} (Expected NGN 24,500)")
        assert insights["total_monthly_normalized"] == 24500.0, f"Expected 24500.0, got {insights['total_monthly_normalized']}"
        assert insights["total_active_subscriptions"] == 4

        # 7. Calendar Projections
        print("\n[7] Testing Calendar Projections (/calendar)...")
        res = await client.get("/api/v1/calendar?from=2025-04-01&to=2025-05-31", headers=headers)
        assert res.status_code == 200
        cal = res.json()
        print(f"  [OK] Total projected renewal occurrences: {cal['total_occurrences']}")
        assert cal["total_occurrences"] >= 4

        # 8. Provider Registry
        print("\n[8] Testing Provider Registry (/providers)...")
        res = await client.get("/api/v1/providers")
        assert res.status_code == 200
        providers = res.json()
        print(f"  [OK] Verified provider cancellation destinations: {len(providers)}")
        assert len(providers) >= 6

        # 9. Cancellation Handoff Logging
        print("\n[9] Testing Cancellation Handoff Logging...")
        spotify_id = created_ids[1]
        res = await client.post(
            f"/api/v1/subscriptions/{spotify_id}/cancellation-attempts",
            json={"destination_url": "https://www.spotify.com/account/overview/"},
            headers=headers
        )
        assert res.status_code == 201
        print("  [OK] Official provider cancellation attempt logged successfully")

        # Confirm cancellation report
        res = await client.post(
            f"/api/v1/subscriptions/{spotify_id}/cancellation-report",
            json={"outcome": "cancelled"},
            headers=headers
        )
        assert res.status_code == 200
        assert res.json()["status"] == "cancelled"
        print("  [OK] User-confirmed cancellation recorded. Status updated to 'cancelled'")

        # 10. Clean up test records
        print("\n[10] Cleaning up test records...")
        for cid in created_ids:
            res = await client.delete(f"/api/v1/subscriptions/{cid}", headers=headers)
            assert res.status_code == 204
        print("  [OK] All test subscriptions deleted cleanly")

        # 11. Clerk Session Sync
        print("\n[11] Testing Clerk Session Sync (/api/v1/auth/clerk-sync)...")
        clerk_test_id = f"user_clerk_{uuid.uuid4().hex[:12]}"
        clerk_test_email = f"clerk_{uuid.uuid4().hex[:8]}@example.com"
        res = await client.post("/api/v1/auth/clerk-sync", json={
            "clerk_id": clerk_test_id,
            "email": clerk_test_email,
            "preferred_timezone": "UTC"
        })
        assert res.status_code == 200, f"Clerk sync failed: {res.text}"
        clerk_sync_data = res.json()
        assert clerk_sync_data["user"]["id"] == clerk_test_id
        clerk_jwt = clerk_sync_data["access_token"]
        clerk_headers = {"Authorization": f"Bearer {clerk_jwt}"}
        print(f"  [OK] Clerk user synced with ID: {clerk_test_id}")
        print(f"  [OK] Issued backend JWT: {clerk_jwt[:25]}...")

        # 12. Multi-User Isolation Verification
        print("\n[12] Testing Strict Multi-User Data Isolation...")
        # Create User A subscription
        sub_a_res = await client.post("/api/v1/subscriptions", json={
            "provider_name": "User A Private Service",
            "plan_name": "Personal Pro",
            "amount": 49.99,
            "currency": "USD",
            "interval_unit": "month",
            "interval_count": 1,
            "category": "Cloud & Utilities",
            "cancellation_url": "https://example.com/cancel-a",
            "next_renewal_date": "2026-12-01"
        }, headers=clerk_headers)
        assert sub_a_res.status_code == 201, f"User A sub creation failed: {sub_a_res.text}"
        sub_a_id = sub_a_res.json()["id"]
        assert sub_a_res.json()["category"] == "Cloud & Utilities"

        # Create separate User B
        user_b_id = f"user_clerk_b_{uuid.uuid4().hex[:10]}"
        res_b_sync = await client.post("/api/v1/auth/clerk-sync", json={
            "clerk_id": user_b_id,
            "email": f"user_b_{uuid.uuid4().hex[:6]}@example.com",
            "preferred_timezone": "UTC"
        })
        assert res_b_sync.status_code == 200
        jwt_b = res_b_sync.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {jwt_b}"}

        # User B starts with genuine empty state (0 subscriptions)
        b_subs_res = await client.get("/api/v1/subscriptions", headers=headers_b)
        assert b_subs_res.status_code == 200
        assert len(b_subs_res.json()) == 0, f"User B should have 0 subscriptions, got {len(b_subs_res.json())}"
        print("  [OK] User B starts with 0 subscriptions (genuine empty state)")

        # User B cannot access, modify, or delete User A's subscription
        res_unauth_get = await client.get(f"/api/v1/subscriptions/{sub_a_id}", headers=headers_b)
        assert res_unauth_get.status_code == 404, "User B must not read User A subscription"
        res_unauth_patch = await client.patch(f"/api/v1/subscriptions/{sub_a_id}", json={"amount": 0.01}, headers=headers_b)
        assert res_unauth_patch.status_code == 404, "User B must not modify User A subscription"
        res_unauth_del = await client.delete(f"/api/v1/subscriptions/{sub_a_id}", headers=headers_b)
        assert res_unauth_del.status_code == 404, "User B must not delete User A subscription"
        print("  [OK] User B strictly isolated from User A (zero data cross-talk: 404 on GET/PATCH/DELETE)")

        # Clean up User A subscription
        del_a = await client.delete(f"/api/v1/subscriptions/{sub_a_id}", headers=clerk_headers)
        assert del_a.status_code == 204
        print("  [OK] User A test record cleaned up")

        # 13. Quarterly Recurrence & Spend Insights
        print("\n[13] Testing Quarterly Billing Engine & Spend Calculation...")
        d_base = date(2026, 1, 15)
        d_next = RenewalEngine.calculate_next_renewal_date(d_base, "quarter", 1)
        assert d_next.year == 2026 and d_next.month == 4 and d_next.day == 15, f"Expected 2026-04-15, got {d_next}"
        print(f"  [OK] Quarterly renewal (+3 months): {d_base.strftime('%Y-%m-%d')} -> {d_next.strftime('%Y-%m-%d')}")

        # Create a quarterly subscription for clerk user
        q_res = await client.post("/api/v1/subscriptions", json={
            "provider_name": "Quarterly SaaS",
            "plan_name": "Pro Team",
            "amount": 30.00,
            "currency": "USD",
            "interval_unit": "quarter",
            "interval_count": 1,
            "category": "Software & Productivity",
            "next_renewal_date": "2026-06-01"
        }, headers=clerk_headers)
        assert q_res.status_code == 201, f"Quarterly creation failed: {q_res.text}"
        q_id = q_res.json()["id"]

        spend_res = await client.get("/api/v1/subscriptions/insights/summary", headers=clerk_headers)
        assert spend_res.status_code == 200, f"Spend insights failed: {spend_res.text}"
        spend_data = spend_res.json()
        # 30.00 / 3 months = 10.00 / mo
        assert abs(spend_data["total_monthly_normalized"] - 10.00) < 0.01, f"Expected 10.00 monthly spend for 30 quarterly, got {spend_data['total_monthly_normalized']}"
        print(f"  [OK] Quarterly spend normalized to monthly: $30/quarter -> ${spend_data['total_monthly_normalized']:.2f}/mo")

        # Clean up quarterly record
        await client.delete(f"/api/v1/subscriptions/{q_id}", headers=clerk_headers)

        print("\n==================================================")
        print("ALL BACKEND & MULTI-USER ISOLATION TESTS PASSED (13/13)!")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())

