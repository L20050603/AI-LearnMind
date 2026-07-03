import json
import shutil

import services.knowledge_graph_service as knowledge_graph_service


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


def test_custom_course_create_update_delete(client, monkeypatch, tmp_path):
    temp_pack = tmp_path / "course_packs.json"
    shutil.copyfile(knowledge_graph_service.COURSE_PACKS_PATH, temp_pack)
    monkeypatch.setattr(knowledge_graph_service, "COURSE_PACKS_PATH", temp_pack)
    knowledge_graph_service.load_course_packs.cache_clear()
    knowledge_graph_service.load_knowledge_graph.cache_clear()

    created = client.post(
        "/api/courses",
        json={
            "code": "data_structure",
            "name": "数据结构",
            "description": "线性表、树、图和算法复杂度。",
            "point_names": ["线性表", "栈和队列", "树与二叉树", "图", "综合挑战"],
        },
    )
    assert created.status_code == 200
    assert created.json()["code"] == "data_structure"

    switched = client.patch("/api/courses/active", json={"course_code": "data_structure"})
    assert switched.status_code == 200
    assert switched.json()["active_course_code"] == "data_structure"

    learning_map = client.get("/api/learning-map")
    assert learning_map.status_code == 200
    assert any("树与二叉树" in node["title"] for node in learning_map.json())

    updated = client.patch(
        "/api/courses/data_structure",
        json={"name": "数据结构与算法", "description": "更偏算法应用。", "point_names": ["数组", "链表", "树", "图", "排序综合挑战"]},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "数据结构与算法"

    client.patch("/api/courses/active", json={"course_code": "artificial_intelligence"})
    deleted = client.delete("/api/courses/data_structure")
    assert deleted.status_code == 200

    courses = client.get("/api/courses")
    assert "data_structure" not in {course["code"] for course in courses.json()}
    knowledge_graph_service.load_course_packs.cache_clear()
    knowledge_graph_service.load_knowledge_graph.cache_clear()
