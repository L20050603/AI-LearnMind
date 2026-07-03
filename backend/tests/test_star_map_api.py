def test_star_map_returns_galaxy_payload(client):
    response = client.get("/api/star-map/knowledge")

    assert response.status_code == 200
    data = response.json()
    assert data["courses"]
    assert len(data["nodes"]) >= 8
    assert data["links"]

    boss = next(node for node in data["nodes"] if node["id"] == 111)
    assert "智能学习专家系统" in boss["title"]
    assert boss["type"] == "boss"
    assert boss["size"] > 1
    assert "resource_count" in boss
    assert "quiz_count" in boss

    client.patch("/api/courses/active", json={"course_code": "operating_system"})
    os_response = client.get("/api/star-map/knowledge")
    assert os_response.status_code == 200
    assert any(node["id"] == 6 and node["type"] == "boss" for node in os_response.json()["nodes"])
