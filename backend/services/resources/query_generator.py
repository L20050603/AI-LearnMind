from services.knowledge_graph_service import graph_point


def build_resource_queries(knowledge_point_id=None, course="操作系统", goal="期末复习", resource_types=None, extra_query=""):
    point = graph_point(knowledge_point_id) if knowledge_point_id else None
    name = point["name"] if point else extra_query or course
    types = resource_types or ["article", "exercise", "quiz"]
    templates = [
        f"{course} {name} 基础讲解",
        f"{course} {name} 例题解析",
        f"{name} 练习题 测验 {goal}",
    ]
    if extra_query:
        templates.insert(0, f"{name} {extra_query}")
    if "video" in types:
        templates.append(f"{name} 可视化 讲解 视频")
    return templates[:5]
