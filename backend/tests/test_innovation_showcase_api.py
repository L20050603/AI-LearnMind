def test_risk_current_contains_expert_system_view(client):
    response = client.get("/api/risk/current")
    assert response.status_code == 200
    data = response.json()
    assert "expert_system_view" in data
    assert "knowledge_base" in data["expert_system_view"]
    assert "working_memory" in data["expert_system_view"]
    assert "inference_engine" in data["expert_system_view"]


def test_bot_state_and_interact(client):
    state = client.get("/api/bot/state")
    assert state.status_code == 200
    assert state.json()["bot_name"] == "LearnMind Bot"

    response = client.post("/api/bot/interact", json={"message": "我很焦虑，今天只有 20 分钟", "available_minutes": 20})
    assert response.status_code == 200
    data = response.json()
    assert data["emotion_detected"] in {"anxious", "stable"}
    assert data["recommended_action"]
    assert data["matched_rules"]


def test_agent_run_contains_blackboard_showcase_fields(client):
    response = client.get("/api/agents/run")
    assert response.status_code == 200
    data = response.json()
    assert data["reasoning_trace"]
    assert data["blackboard_final_state"]
    assert data["data_quality"]
    assert all("role" in item and "reads" in item and "writes" in item for item in data["blackboard"])


def test_knowledge_graph_explain(client):
    response = client.get("/api/knowledge/graph/explain/105")
    assert response.status_code == 200
    data = response.json()
    assert data["point"]["name"]
    assert "graph_based_strategy" in data
    assert "path_planning_reason" in data


def test_innovation_summary_report(client):
    response = client.get("/api/reports/innovation-summary")
    assert response.status_code == 200
    data = response.json()
    assert "markdown" in data
    assert "设计初衷" in data["markdown"]
    assert data["innovation_points"]
