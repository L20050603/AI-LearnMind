def test_focus_session_lifecycle(client):
    started = client.post(
        "/api/focus/start",
        json={"knowledgePointId": 6, "taskId": None, "plannedMinutes": 25, "source": "test"},
    )
    assert started.status_code == 200
    session = started.json()
    assert session["status"] == "running"
    assert session["planned_minutes"] == 25

    current = client.get("/api/focus/current")
    assert current.status_code == 200
    assert current.json()["id"] == session["id"]

    paused = client.post(f"/api/focus/{session['id']}/pause")
    assert paused.status_code == 200
    assert paused.json()["status"] == "paused"

    resumed = client.post(f"/api/focus/{session['id']}/resume")
    assert resumed.status_code == 200
    assert resumed.json()["status"] == "running"

    finished = client.post(f"/api/focus/{session['id']}/finish")
    assert finished.status_code == 200
    result = finished.json()
    assert result["session"]["status"] == "finished"
    assert result["xpGained"] > 0
    assert result["mastery"] >= 0
    assert "risk_score" in result["risk"]

    stats = client.get("/api/focus/stats")
    assert stats.status_code == 200
    assert stats.json()["finishedSessions"] >= 1


def test_voice_intent_returns_executable_actions(client):
    response = client.post(
        "/api/voice/intent",
        json={"text": "帮我讲解当前关卡", "currentPage": "MultimodalLab", "selectedLevelId": 6},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "explain_current_level"
    assert data["actions"]
    assert any(action["type"] == "navigate" and action["target"] == "/tutor" for action in data["actions"])
    assert any(action["type"] == "call_api" and action["name"] == "tutorExplain" for action in data["actions"])

    focus = client.post(
        "/api/voice/intent",
        json={"text": "开始 25 分钟专注", "currentPage": "MultimodalLab", "selectedLevelId": 6},
    )
    assert focus.status_code == 200
    payload = focus.json()
    assert payload["intent"] == "start_focus"
    assert any(action["type"] == "call_api" and action["name"] == "startFocus" for action in payload["actions"])
