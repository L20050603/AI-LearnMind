from datetime import timedelta

from database import SessionLocal, init_db
from models import EmotionCheckin, KnowledgePoint, LearningTask, StudyRecord, User, WrongQuestion, utc_now
from services.analytics import analyze_emotion


def seed_database(reset: bool = False):
    init_db()
    db = SessionLocal()
    try:
        if reset:
            for model in [WrongQuestion, EmotionCheckin, StudyRecord, LearningTask, KnowledgePoint, User]:
                db.query(model).delete()
            db.commit()

        if db.query(User).first():
            return

        user = User(id=1, name="李同学", level=7, xp=2680, goal="期末冲刺 85+")
        db.add(user)

        points = [
            KnowledgePoint(id=1, title="学习画像初始化", description="建立学习目标、薄弱点和复习节奏画像。", prerequisite_ids="[]", node_type="normal", recommended_minutes=10, base_mastery=100),
            KnowledgePoint(id=2, title="操作系统基础", description="理解操作系统目标、结构和资源管理职责。", prerequisite_ids="[1]", node_type="normal", recommended_minutes=30, base_mastery=88),
            KnowledgePoint(id=3, title="进程与线程", description="掌握进程状态、线程模型和上下文切换。", prerequisite_ids="[2]", node_type="normal", recommended_minutes=45, base_mastery=82),
            KnowledgePoint(id=4, title="调度算法", description="掌握 FCFS、SJF、RR 和优先级调度。", prerequisite_ids="[3]", node_type="normal", recommended_minutes=50, base_mastery=74),
            KnowledgePoint(id=5, title="存储管理", description="理解连续分配、分页、分段和虚拟内存。", prerequisite_ids="[4]", node_type="normal", recommended_minutes=60, base_mastery=61),
            KnowledgePoint(id=6, title="页面置换算法 Boss", description="对比 OPT、FIFO、LRU 并计算缺页率。", prerequisite_ids="[5]", node_type="boss", recommended_minutes=90, base_mastery=38),
            KnowledgePoint(id=7, title="文件系统", description="掌握目录结构、文件分配和空闲空间管理。", prerequisite_ids="[6]", node_type="normal", recommended_minutes=60, base_mastery=18),
            KnowledgePoint(id=8, title="期末综合挑战", description="综合应用操作系统核心知识完成模拟测试。", prerequisite_ids="[2,3,4,5,6,7]", node_type="boss", recommended_minutes=120, base_mastery=8),
        ]
        db.add_all(points)

        now = utc_now()
        tasks = [
            LearningTask(user_id=1, knowledge_point_id=5, title="整理分页与分段对比表", difficulty="normal", estimated_minutes=35, completed=True, completed_at=now - timedelta(days=1), created_at=now - timedelta(days=1)),
            LearningTask(user_id=1, knowledge_point_id=6, title="手算 3 组页面置换访问序列", difficulty="boss", estimated_minutes=50, completed=False, created_at=now),
            LearningTask(user_id=1, knowledge_point_id=6, title="完成 LRU/FIFO/OPT 错题复盘", difficulty="hard", estimated_minutes=40, completed=False, created_at=now),
            LearningTask(user_id=1, knowledge_point_id=7, title="预习文件分配方式", difficulty="normal", estimated_minutes=30, completed=False, created_at=now),
        ]
        db.add_all(tasks)

        records = [
            StudyRecord(user_id=1, knowledge_point_id=4, study_minutes=45, correct_count=8, wrong_count=2, note="调度算法整体清楚。", created_at=now - timedelta(days=3)),
            StudyRecord(user_id=1, knowledge_point_id=5, study_minutes=55, correct_count=7, wrong_count=3, note="分页地址转换基本掌握。", created_at=now - timedelta(days=1)),
            StudyRecord(user_id=1, knowledge_point_id=6, study_minutes=35, correct_count=3, wrong_count=5, note="LRU 手算容易漏顺序。", created_at=now),
        ]
        db.add_all(records)

        stress_score, stress_level = analyze_emotion("焦虑但可控", "临近期末有点焦虑，页面置换算法老是算错，但今天还能继续学。")
        db.add(EmotionCheckin(user_id=1, mood="焦虑但可控", text="临近期末有点焦虑，页面置换算法老是算错，但今天还能继续学。", stress_score=stress_score, stress_level=stress_level, created_at=now))
        db.add(WrongQuestion(user_id=1, knowledge_point_id=6, question="LRU 页面访问序列 7 0 1 2 0 3 0 4 的缺页次数是多少？", reason="没有及时更新最近使用顺序。"))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(reset=True)
    print("Seed data initialized.")
