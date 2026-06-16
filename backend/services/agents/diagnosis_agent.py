from collections import Counter


def run(context):
    nodes = context["nodes"]
    wrong_questions = context["wrong_questions"]
    weak_nodes = sorted(
        [node for node in nodes if node["status"] != "locked"],
        key=lambda node: (node["mastery"], -node.get("exam_weight", 0)),
    )[:3]
    wrong_counter = Counter(question.knowledge_point_id for question in wrong_questions if not question.fixed)
    wrong_focus = [
        {
            "id": node["id"],
            "title": node["title"],
            "count": wrong_counter.get(node["id"], 0),
            "mastery": node["mastery"],
        }
        for node in nodes
        if wrong_counter.get(node["id"], 0) > 0
    ]
    wrong_focus = sorted(wrong_focus, key=lambda item: (-item["count"], item["mastery"]))[:3]
    target = weak_nodes[0] if weak_nodes else nodes[0]

    evidence = [f"{node['title']} 掌握度 {node['mastery']}%" for node in weak_nodes]
    evidence.extend([f"{item['title']} 未订正错题 {item['count']} 道" for item in wrong_focus])

    return {
        "agent_name": "Diagnosis Agent",
        "input_summary": f"分析 {len(nodes)} 个图谱节点和 {len(wrong_questions)} 条错题记录。",
        "conclusion": f"当前最需要处理的是「{target['title']}」，掌握度 {target['mastery']}%。",
        "confidence": min(0.95, 0.62 + len(wrong_questions) * 0.025 + len(nodes) * 0.01),
        "evidence": evidence[:5],
        "suggestions": [
            f"先复盘「{target['title']}」的概念和典型题，再补一条学习记录验证掌握度。",
            "未订正错题优先按知识点归类，避免只记答案不修原因。",
        ],
        "meta": {"weak_nodes": weak_nodes, "wrong_focus": wrong_focus},
    }
