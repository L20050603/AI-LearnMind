def test_star_map_returns_galaxy_payload(client):
    response = client.get("/api/star-map/knowledge")

    assert response.status_code == 200
    data = response.json()
    assert data["courses"]
    assert len(data["nodes"]) >= 8
    assert data["links"]

    boss = next(node for node in data["nodes"] if node["id"] == 6)
    assert boss["title"] == "页面置换算法 Boss"
    assert boss["type"] == "boss"
    assert boss["size"] > 1
    assert "resource_count" in boss
    assert "quiz_count" in boss
