def test_courses_and_active_default(client):
    courses = client.get("/api/courses")
    assert courses.status_code == 200
    codes = {item["code"] for item in courses.json()}
    assert {"artificial_intelligence", "operating_system"} <= codes

    active = client.get("/api/courses/active")
    assert active.status_code == 200
    assert active.json()["active_course_code"] == "artificial_intelligence"


def test_course_switch_changes_learning_surfaces(client):
    ai_map = client.get("/api/learning-map")
    assert ai_map.status_code == 200
    ai_titles = [item["title"] for item in ai_map.json()]
    assert any("专家系统" in title or "知识图谱" in title for title in ai_titles)

    ai_graph = client.get("/api/knowledge/graph")
    assert ai_graph.status_code == 200
    assert any("专家系统" in node["data"]["label"] or "知识图谱" in node["data"]["label"] for node in ai_graph.json()["nodes"])

    ai_path = client.get("/api/learning-path/today")
    assert ai_path.status_code == 200
    assert ai_path.json()["recommended"]["id"] >= 101

    switched = client.patch("/api/courses/active", json={"course_code": "operating_system"})
    assert switched.status_code == 200
    assert switched.json()["active_course_code"] == "operating_system"

    os_map = client.get("/api/learning-map")
    assert os_map.status_code == 200
    os_titles = [item["title"] for item in os_map.json()]
    assert any("操作系统基础" in title or "页面置换算法 Boss" in title for title in os_titles)

    os_graph = client.get("/api/knowledge/graph")
    assert os_graph.status_code == 200
    assert any("操作系统基础" in node["data"]["label"] or "页面置换算法 Boss" in node["data"]["label"] for node in os_graph.json()["nodes"])


def test_local_resource_search_and_quiz_payload(client, monkeypatch):
    monkeypatch.setenv("SEARCH_PROVIDER", "local")
    monkeypatch.delenv("SEARCH_API_KEY", raising=False)

    response = client.post("/api/resources/search", json={"knowledgePointId": 105, "query": "专家系统", "limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "local"
    assert data["provider"] == "local"
    assert data["resources"]

    generated = client.post("/api/quiz/generate", json={"knowledgePointId": 105, "sourceType": "level", "sourceId": 105, "count": 2})
    assert generated.status_code == 200
    quiz_id = generated.json()["quiz"]["id"]
    quiz = client.get(f"/api/quiz/{quiz_id}")
    assert quiz.status_code == 200
    assert quiz.json()["questions"]
    assert all("answer" not in question for question in quiz.json()["questions"])
