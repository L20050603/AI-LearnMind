def test_task_crud_flow(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    initial_count = len(response.json())

    created = client.post(
        "/api/tasks",
        json={
            "title": "新增调度算法练习",
            "knowledge_point_id": 4,
            "difficulty": "normal",
            "estimated_minutes": 30,
            "due_date": "2026-06-20",
        },
    )
    assert created.status_code == 200
    task = created.json()
    assert task["title"] == "新增调度算法练习"
    assert task["completed"] is False

    patched = client.patch(f"/api/tasks/{task['id']}", json={"completed": True})
    assert patched.status_code == 200
    assert patched.json()["completed"] is True

    deleted = client.delete(f"/api/tasks/{task['id']}")
    assert deleted.status_code == 200
    assert deleted.json()["ok"] is True

    final = client.get("/api/tasks")
    assert len(final.json()) == initial_count
