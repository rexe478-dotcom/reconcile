import os
import requests

TARGET_URL = os.environ.get("TARGET_URL", "https://reconcile-api-9htz.onrender.com").rstrip("/")

def test_backend_health():
    # 1. Root route responds
    resp_root = requests.get(f"{TARGET_URL}/", timeout=15)
    assert resp_root.status_code == 200, f"Expected 200, got {resp_root.status_code}"
    root_data = resp_root.json()
    assert "version" in root_data

    # 2. Database & API health check
    resp_health = requests.get(f"{TARGET_URL}/health", timeout=15)
    assert resp_health.status_code == 200, f"Expected 200, got {resp_health.status_code}"
    health_data = resp_health.json()
    assert health_data.get("status") == "healthy", f"Expected healthy status, got {health_data}"
    assert health_data.get("database") == "connected", f"Database not connected: {health_data}"

    # 3. Public Provider Registry
    resp_prov = requests.get(f"{TARGET_URL}/api/v1/providers", timeout=15)
    assert resp_prov.status_code == 200, f"Expected 200, got {resp_prov.status_code}"
    providers = resp_prov.json()
    assert isinstance(providers, list) and len(providers) > 0, "Expected non-empty list of providers"

if __name__ == "__main__":
    test_backend_health()
    print("All backend health assertions passed.")
