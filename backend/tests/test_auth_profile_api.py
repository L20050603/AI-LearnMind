def test_auth_register_login_profile_flow(client):
    register = client.post(
        "/api/auth/register",
        json={"username": "student001", "email": "student001@example.com", "password": "123456", "name": "王同学"},
    )
    assert register.status_code == 200
    token = register.json()["access_token"]
    assert token

    isolated = client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert isolated.status_code == 200
    assert isolated.json() == []

    goal = client.patch(
        "/api/profile/goal",
        json={"goal": "操作系统期末 90+", "target_score": 90, "exam_date": "2026-07-05"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert goal.status_code == 200
    assert goal.json()["target_score"] == 90

    plan = client.patch(
        "/api/profile/study-plan",
        json={"daily_minutes_goal": 120, "weekly_minutes_goal": 720, "preferred_study_time": "晚上 19:00-22:00", "study_style": "闯关 + 测验驱动"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert plan.status_code == 200
    assert plan.json()["weekly_minutes_goal"] == 720

    login = client.post("/api/auth/login", json={"username": "student001", "password": "123456"})
    assert login.status_code == 200
    assert login.json()["user"]["name"] == "王同学"


def test_business_api_requires_login(client):
    response = client.get("/api/dashboard", headers={"Authorization": ""})
    assert response.status_code == 401
