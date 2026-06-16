from services.knowledge_graph_service import graph_point, graph_points

UNLOCK_THRESHOLD = 55
COMPLETE_THRESHOLD = 80
BOSS_CLEAR_THRESHOLD = 65


def prerequisites_status(point, mastery_scores):
    details = []
    unlocked = True
    for prereq_id in point.get("prerequisites", []):
        prereq = graph_point(prereq_id)
        mastery = mastery_scores.get(prereq_id, 0)
        passed = mastery >= UNLOCK_THRESHOLD
        unlocked = unlocked and passed
        details.append(
            {
                "id": prereq_id,
                "name": prereq["name"] if prereq else f"知识点 {prereq_id}",
                "mastery": mastery,
                "passed": passed,
            }
        )
    return unlocked, details


def node_status(point, mastery_scores):
    mastery = mastery_scores.get(point["id"], 0)
    unlocked, _ = prerequisites_status(point, mastery_scores)
    if not unlocked:
        return "locked"
    if point["type"] == "boss" and mastery < BOSS_CLEAR_THRESHOLD:
        return "boss"
    if mastery >= COMPLETE_THRESHOLD:
        return "completed"
    return "current"


def unlock_snapshot(mastery_scores):
    return {
        point["id"]: {
            "status": node_status(point, mastery_scores),
            "unlocked": prerequisites_status(point, mastery_scores)[0],
            "prerequisites": prerequisites_status(point, mastery_scores)[1],
        }
        for point in graph_points()
    }
