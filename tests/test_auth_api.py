import pytest
from fastapi.testclient import TestClient
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from main import app  # type: ignore[import-not-found]

client = TestClient(app)

def test_register_and_login_user():
    email = "testuser@example.com"
    password = "TestPassword123!"

    # Register
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "email": email, "password": password}
    )
    assert reg_response.status_code in [201, 400]

    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
