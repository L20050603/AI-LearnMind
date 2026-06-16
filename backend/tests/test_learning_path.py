from services.path_planner import today_learning_path


def test_today_learning_path_uses_priority_formula(db_session):
    path = today_learning_path(db_session)

    assert path["recommended"]
    assert path["steps"]
    assert "priority = exam_weight * 0.35" in path["priority_formula"]
    priorities = [item["priority"] for item in path["candidates"]]
    assert all(0 <= value <= 100 for value in priorities)
    assert any(item["type"] == "boss" for item in path["candidates"])
