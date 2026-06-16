import json
from pathlib import Path

LEXICON_PATH = Path(__file__).with_name("emotion_lexicon.json")

MOOD_BASE = {
    "轻松": 26,
    "平稳": 42,
    "焦虑但可控": 60,
    "焦虑": 72,
    "疲惫": 68,
    "低落": 70,
}

CATEGORY_WEIGHTS = {
    "anxiety": 9,
    "fatigue": 7,
    "positive": -6,
    "procrastination": 8,
    "help_seeking": 4,
}

CATEGORY_LABELS = {
    "anxiety": "焦虑类词",
    "fatigue": "疲惫类词",
    "positive": "积极类词",
    "procrastination": "拖延类词",
    "help_seeking": "求助类词",
}


def load_lexicon():
    with LEXICON_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def analyze_emotion_text(mood: str = "平稳", text: str = ""):
    lexicon = load_lexicon()
    score = MOOD_BASE.get(mood, 48)
    hits = {}

    for category, words in lexicon.items():
        matched = [word for word in words if word and word in text]
        hits[category] = matched
        score += len(matched) * CATEGORY_WEIGHTS.get(category, 0)

    score = max(0, min(100, int(round(score))))
    if score >= 75:
        level = "高"
    elif score >= 50:
        level = "中等"
    else:
        level = "低"

    readable_hits = [
        {"category": CATEGORY_LABELS.get(category, category), "words": words}
        for category, words in hits.items()
        if words
    ]

    return {
        "stress_score": score,
        "stress_level": level,
        "matched_categories": readable_hits,
        "raw_hits": hits,
    }


def analyze_emotion(mood: str, text: str):
    result = analyze_emotion_text(mood, text)
    return result["stress_score"], result["stress_level"]
