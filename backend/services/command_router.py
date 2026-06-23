ROUTES = {
    "open_learning_map": "/map",
    "open_task_center": "/tasks",
    "analyze_learning_state": "/risk",
    "run_agent_analysis": "/agents",
    "explain_current_level": "/tutor",
    "find_learning_resources": "/resources",
    "generate_quiz": "/tutor",
    "start_focus": "/focus",
    "pause_focus": "/focus",
    "resume_focus": "/focus",
    "finish_focus": "/focus",
    "generate_weekly_report": "/reports",
}


def build_actions(intent: str, selected_level_id: int | None = None, minutes: int | None = None):
    actions = []
    route = ROUTES.get(intent)
    if route:
        actions.append({"type": "navigate", "target": route})

    if intent == "explain_current_level":
        actions.append({"type": "call_api", "name": "tutorExplain", "payload": {"knowledgePointId": selected_level_id}})
    elif intent == "find_learning_resources":
        actions.append({"type": "call_api", "name": "searchResources", "payload": {"knowledgePointId": selected_level_id}})
    elif intent == "generate_quiz":
        actions.append({"type": "call_api", "name": "tutorGenerateQuiz", "payload": {"knowledge_point_id": selected_level_id, "count": 5}})
    elif intent == "start_focus":
        actions.append(
            {
                "type": "call_api",
                "name": "startFocus",
                "payload": {"knowledgePointId": selected_level_id, "plannedMinutes": minutes or 25, "source": "voice"},
            }
        )
    elif intent in {"pause_focus", "resume_focus", "finish_focus"}:
        actions.append({"type": "call_api", "name": intent.replace("_focus", "Focus"), "payload": {}})
    elif intent == "run_agent_analysis":
        actions.append({"type": "call_api", "name": "runAgents", "payload": {}})
    elif intent == "generate_weekly_report":
        actions.append({"type": "call_api", "name": "getWeeklyReport", "payload": {}})
    elif intent == "analyze_learning_state":
        actions.append({"type": "call_api", "name": "evaluateRisk", "payload": {}})

    return actions
