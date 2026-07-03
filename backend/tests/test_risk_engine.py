from services.risk_engine import evaluate_risk


def test_risk_score_is_explainable_and_data_driven(db_session):
    result = evaluate_risk(db_session, persist=False, user_id=1, course_code="operating_system")

    assert 0 <= result["risk_score"] <= 100
    assert result["risk_level"] in {"低", "中等", "高"}
    assert result["reasons"]
    assert result["suggestions"]
    assert result["triggered_rules"]
    assert result["metrics"]["wrong_rate"] > 0
    assert result["metrics"]["stress_score"] >= 50
