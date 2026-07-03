def test_resource_plan_and_quiz_closed_loop(client, monkeypatch):
    import services.quiz.quiz_generator as quiz_generator

    def offline_provider(*args, **kwargs):
        raise RuntimeError("offline in test")

    monkeypatch.setattr(quiz_generator, "call_provider", offline_provider)

    search = client.post(
        "/api/resources/search",
        json={
            "knowledgePointId": 6,
            "course": "操作系统",
            "goal": "期末复习",
            "resourceTypes": ["article", "exercise", "quiz"],
            "limit": 3,
        },
    )
    assert search.status_code == 200
    resources = search.json()["resources"]
    assert resources
    resource_id = resources[0]["id"]

    favorite = client.patch(f"/api/resources/{resource_id}/favorite")
    assert favorite.status_code == 200
    assert favorite.json()["is_favorite"] is True

    plan = client.post(f"/api/resources/{resource_id}/add-to-plan")
    assert plan.status_code == 200
    assert plan.json()["task"]["knowledge_point_id"] == resources[0]["related_knowledge_point_id"]

    quiz_created = client.post(f"/api/resources/{resource_id}/generate-quiz")
    assert quiz_created.status_code == 200
    quiz_id = quiz_created.json()["quizId"]

    quiz = client.get(f"/api/quiz/{quiz_id}")
    assert quiz.status_code == 200
    questions = quiz.json()["questions"]
    assert questions

    answers = {str(question["id"]): question["options"][0] for question in questions}
    submitted = client.post(f"/api/quiz/{quiz_id}/submit", json={"answers": answers})
    assert submitted.status_code == 200
    result = submitted.json()
    assert result["totalCount"] == len(questions)
    assert result["xpGained"] >= 40

    deleted = client.delete(f"/api/resources/{resource_id}")
    assert deleted.status_code == 200
    missing = client.get(f"/api/resources/{resource_id}")
    assert missing.status_code == 404
