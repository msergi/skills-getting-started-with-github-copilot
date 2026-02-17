import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_for_activity_success():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure user is not already signed up
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity}"
    assert email in activities[activity]["participants"]

def test_signup_for_activity_already_signed_up():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure user is signed up
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", params={"email": "someone@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_unregister_participant_success():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Ensure user is signed up
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.delete(f"/activities/{activity}/unregister", params={"participant": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"{email} removed from {activity}"
    assert email not in activities[activity]["participants"]

def test_unregister_participant_not_found():
    activity = "Chess Club"
    email = "notfound@mergington.edu"
    # Ensure user is not signed up
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.delete(f"/activities/{activity}/unregister", params={"participant": email})
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found"

def test_unregister_activity_not_found():
    response = client.delete("/activities/Nonexistent/unregister", params={"participant": "someone@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
