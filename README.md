# AI-LearnMind

知学伴：多智能体驱动的大学生学习状态诊断与心理陪伴智能系统。第一阶段实现全栈项目骨架、FastAPI 模拟接口、React 闯关地图首页、AI 导师模拟回复和 ECharts 数据可视化。

## 后端运行

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

接口地址：

```text
http://localhost:8000
```

## 前端运行

```bash
cd frontend
npm install
npm run dev
```

访问地址：

```text
http://localhost:5173
```

## 第一阶段功能

- 顶部科技感导航栏，展示学生、目标、等级和 XP。
- 中央游戏化学习闯关地图，支持 completed/current/locked/boss 状态。
- 节点 hover 展示掌握度和推荐学习时间，点击后展示关卡详情。
- 左侧学习状态面板，展示任务完成率、效率、风险、压力、连续学习和 XP。
- 右侧多 Agent AI 导师面板，支持模拟问答和逐字输出效果。
- 底部 ECharts 图表展示学习趋势、知识掌握和情绪压力变化。

## 第二阶段功能

- 后端接入 SQLAlchemy + SQLite，数据保存在 `backend/learnmind.db`。
- 新增真实数据模型：User、LearningTask、StudyRecord、EmotionCheckin、WrongQuestion、KnowledgePoint、RiskReport。
- 新增 CRUD 接口：
  - `GET/POST /api/tasks`
  - `PATCH/DELETE /api/tasks/{id}`
  - `GET/POST /api/study-records`
  - `GET/POST /api/emotion-checkins`
  - `GET/POST /api/wrong-questions`
- Dashboard 统计改为从数据库计算：今日任务完成率、本周学习时长、错题数量、连续学习天数。
- 学习闯关地图会根据学习记录、任务完成情况和错题数动态计算掌握度与解锁状态。
- 前端新增学习数据闭环控制台，可新增任务、完成任务、添加学习记录、情绪打卡和错题记录。

## 初始化示例数据

```bash
cd backend
venv\Scripts\activate
python seed.py
```

## 第三阶段功能

- 新增专家规则引擎与可解释风险评分。
- 新增服务：
  - `services/risk_engine.py`
  - `services/emotion_service.py`
  - `services/mastery_service.py`
  - `services/explanation_service.py`
  - `services/emotion_lexicon.json`
- 风险评分会综合任务完成率、正确率、错题率、知识掌握度、学习时长稳定性和情绪压力。
- 情绪压力使用词典命中分析，包含焦虑、疲惫、积极、拖延、求助五类词。
- 新增接口：
  - `GET /api/risk/current`
  - `POST /api/risk/evaluate`
- 每次风险评分返回 `risk_score`、`risk_level`、`reasons`、`suggestions`、`triggered_rules` 和详细指标。
- 前端新增风险中心，展示风险仪表盘、触发规则、风险原因和 AI 建议卡片。

## 第二阶段扩展建议

- 接入真实用户登录和 SQLite 数据持久化。
- 增加知识图谱，按课程知识点关系生成学习路径。
- 接入大语言模型，实现个性化复习解释和题目生成。
- 增加专家系统规则引擎，用于学习风险和心理压力预警。
