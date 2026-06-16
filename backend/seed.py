from datetime import timedelta

from database import SessionLocal, init_db
from models import EmotionCheckin, KnowledgePoint, LearningTask, StudyRecord, User, WrongQuestion, utc_now
from services.emotion_service import analyze_emotion


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

        now = utc_now()
        user = User(id=1, name="李同学", level=7, xp=2680, goal="期末冲刺 85+")
        db.add(user)

        points = [
            KnowledgePoint(id=1, title="学习画像初始化", description="建立学习目标、薄弱点和复习节奏画像。", prerequisite_ids="[]", node_type="normal", recommended_minutes=10, base_mastery=100),
            KnowledgePoint(id=2, title="操作系统基础", description="理解操作系统目标、结构和资源管理职责。", prerequisite_ids="[1]", node_type="normal", recommended_minutes=30, base_mastery=88),
            KnowledgePoint(id=3, title="进程与线程", description="掌握进程状态、线程模型和上下文切换。", prerequisite_ids="[2]", node_type="normal", recommended_minutes=45, base_mastery=82),
            KnowledgePoint(id=4, title="调度算法", description="掌握 FCFS、SJF、RR 和优先级调度。", prerequisite_ids="[3]", node_type="normal", recommended_minutes=50, base_mastery=74),
            KnowledgePoint(id=5, title="存储管理", description="理解分页、分段、虚拟内存和地址转换。", prerequisite_ids="[4]", node_type="normal", recommended_minutes=60, base_mastery=61),
            KnowledgePoint(id=6, title="页面置换算法 Boss", description="对比 OPT、FIFO、LRU、Clock 并计算缺页率。", prerequisite_ids="[5]", node_type="boss", recommended_minutes=90, base_mastery=38),
            KnowledgePoint(id=7, title="文件系统", description="掌握目录结构、文件分配和空闲空间管理。", prerequisite_ids="[6]", node_type="normal", recommended_minutes=60, base_mastery=18),
            KnowledgePoint(id=8, title="期末综合挑战", description="综合应用操作系统核心知识完成模拟测试。", prerequisite_ids="[2,3,4,5,6,7]", node_type="boss", recommended_minutes=120, base_mastery=8),
        ]
        db.add_all(points)

        task_specs = [
            (2, "梳理操作系统四大管理功能", "normal", 30, True, 6),
            (3, "绘制进程五状态转换图", "normal", 35, True, 5),
            (3, "对比进程与线程资源模型", "normal", 30, True, 5),
            (4, "完成 FCFS/SJF/RR 调度计算", "hard", 45, True, 4),
            (4, "整理调度算法判分步骤", "normal", 30, True, 3),
            (5, "整理分页与分段对比表", "normal", 35, True, 2),
            (5, "手算一次地址转换题", "hard", 40, False, 1),
            (6, "手算 3 组页面置换访问序列", "boss", 60, False, 0),
            (6, "完成 LRU/FIFO/OPT 错题复盘", "hard", 45, False, 0),
            (7, "预习文件分配方式与目录结构", "normal", 35, False, -1),
        ]
        tasks = []
        for index, (point_id, title, difficulty, minutes, completed, day_offset) in enumerate(task_specs, start=1):
            created_at = now - timedelta(days=max(day_offset, 0))
            task = LearningTask(
                id=index,
                user_id=1,
                knowledge_point_id=point_id,
                title=title,
                difficulty=difficulty,
                estimated_minutes=minutes,
                due_date=(now.date() + timedelta(days=max(day_offset, 0) - 1)).isoformat(),
                completed=completed,
                completed_at=created_at + timedelta(minutes=minutes) if completed else None,
                created_at=created_at,
            )
            tasks.append(task)
        db.add_all(tasks)

        record_specs = [
            (2, 35, 10, 1, "复盘操作系统基础，概念比较清楚。", 6),
            (3, 42, 9, 2, "进程状态图基本掌握，线程共享资源还需巩固。", 5),
            (3, 38, 8, 2, "同步互斥概念有进步。", 4),
            (4, 50, 7, 4, "调度算法甘特图会画，但等待时间偶尔算错。", 3),
            (5, 55, 7, 3, "分页地址转换基本掌握。", 2),
            (5, 40, 5, 4, "TLB 和缺页中断容易混淆。", 1),
            (6, 35, 3, 6, "LRU 手算容易漏更新访问顺序。", 0),
        ]
        db.add_all(
            [
                StudyRecord(
                    user_id=1,
                    knowledge_point_id=point_id,
                    study_minutes=minutes,
                    correct_count=correct,
                    wrong_count=wrong,
                    note=note,
                    created_at=now - timedelta(days=day_offset),
                )
                for point_id, minutes, correct, wrong, note, day_offset in record_specs
            ]
        )

        emotion_specs = [
            ("平稳", "今天按计划完成了进程线程复习，感觉还可以。", 6),
            ("轻松", "调度算法做对了几题，有一点信心。", 4),
            ("疲惫", "连续复习后有些疲惫，地址转换题反复出错。", 2),
            ("焦虑但可控", "临近期末有点焦虑，页面置换算法总是算错，但还能继续学。", 1),
            ("焦虑", "Boss 关卡压力比较大，需要帮助拆分复习任务。", 0),
        ]
        for mood, text, day_offset in emotion_specs:
            stress_score, stress_level = analyze_emotion(mood, text)
            db.add(
                EmotionCheckin(
                    user_id=1,
                    mood=mood,
                    text=text,
                    stress_score=stress_score,
                    stress_level=stress_level,
                    created_at=now - timedelta(days=day_offset),
                )
            )

        wrong_specs = [
            (3, "线程是否拥有独立地址空间？", "混淆进程和线程的资源归属。", True, 5),
            (3, "信号量 P/V 操作顺序题", "没有先判断临界区互斥关系。", False, 4),
            (4, "SJF 平均等待时间计算", "甘特图完成时间写错。", True, 3),
            (4, "RR 时间片为 2 的调度顺序", "队列入队时机判断不稳。", False, 3),
            (5, "逻辑地址页号与页内偏移拆分", "页大小换算不熟练。", True, 2),
            (5, "TLB 命中后是否访问内存", "没有区分页表访问和数据访问。", False, 2),
            (6, "FIFO 页面置换缺页次数", "页框状态更新漏了一步。", False, 1),
            (6, "LRU 页面访问序列 7 0 1 2 0 3 0 4", "没有及时更新最近使用顺序。", False, 1),
            (6, "OPT 与 LRU 结果对比", "把未来最长不访问和最近最久未使用混淆。", False, 0),
            (7, "索引分配与链式分配优缺点", "文件系统还没有系统复习。", False, 0),
        ]
        db.add_all(
            [
                WrongQuestion(
                    user_id=1,
                    knowledge_point_id=point_id,
                    question=question,
                    reason=reason,
                    fixed=fixed,
                    created_at=now - timedelta(days=day_offset),
                )
                for point_id, question, reason, fixed, day_offset in wrong_specs
            ]
        )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(reset=True)
    print("AI-LearnMind demo data initialized.")
