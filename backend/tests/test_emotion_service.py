from services.emotion_service import analyze_emotion_text


def test_emotion_lexicon_detects_pressure_words():
    result = analyze_emotion_text("焦虑", "我很焦虑也很疲惫，页面置换拖延了两天，需要帮助")

    assert result["stress_score"] >= 70
    categories = {item["category"] for item in result["matched_categories"]}
    assert any("焦虑" in category for category in categories)
    assert any("疲惫" in category for category in categories)
    assert result["raw_hits"]["help_seeking"]
