# AI-LearnMind 知学伴

AI-LearnMind 是一个基于多智能体协同的大学生学习状态诊断与心理陪伴系统。项目采用 React + Vite 前端、FastAPI + SQLite 后端，围绕学习任务、学习记录、错题、情绪打卡、风险评估、知识图谱和学习路径规划形成闭环。

## 后端运行

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

接口地址：

```text
http://127.0.0.1:8000
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

## 初始化示例数据

```bash
cd backend
venv\Scripts\activate
python seed.py
```

## 已完成阶段

### 第一阶段：项目骨架与学习闯关地图

- 搭建 FastAPI 后端和 React/Vite/Tailwind 前端。
- 首页采用暗色科技风、粒子背景、玻璃拟态卡片和学习闯关地图。
- 支持 AI 导师模拟问答、ECharts 趋势图、知识雷达图和情绪压力图。

### 第二阶段：数据库与真实学习数据 CRUD

- 接入 SQLAlchemy + SQLite，数据保存到 `backend/learnmind.db`。
- 新增 `User`、`LearningTask`、`StudyRecord`、`EmotionCheckin`、`WrongQuestion`、`KnowledgePoint`、`RiskReport`。
- 实现任务、学习记录、情绪打卡、错题记录 CRUD。
- Dashboard 从数据库统计今日任务完成率、本周学习时长、错题数量和连续学习天数。

### 第三阶段：专家规则引擎与可解释风险评分

- 新增 `risk_engine.py`、`emotion_service.py`、`mastery_service.py`、`explanation_service.py`。
- 使用 `emotion_lexicon.json` 做焦虑、疲惫、积极、拖延、求助类情绪词分析。
- 风险评分综合任务完成率、正确率、错题率、知识掌握度、学习时长稳定性和压力等级。
- 新增 `GET /api/risk/current`、`POST /api/risk/evaluate`。
- 前端新增风险中心，展示风险仪表盘、触发规则、风险原因和建议卡片。

### 第四阶段：知识图谱与真实学习路径规划

- 新增 `services/knowledge_graph.json`，以知识点、前置关系、难度、考试权重、预计时长和 Boss 类型描述课程图谱。
- 新增 `knowledge_graph_service.py`、`unlock_service.py`、`path_planner.py`。
- `GET /api/learning-map` 改为由知识图谱、掌握度和解锁规则动态生成。
- 新增 `GET /api/knowledge/graph`，返回 React Flow 可视化图谱节点和边。
- 新增 `GET /api/learning-path/today`，返回当前推荐关卡、今日学习路径和候选优先级。
- 学习路径使用可解释公式：

```text
priority = exam_weight * 0.35
         + weakness_score * 0.35
         + prerequisite_importance * 0.2
         + urgency * 0.1
```

### 第五阶段：多 Agent 黑板协同系统

- 新增 `services/agents/`，包含 Profile、Diagnosis、Planner、Emotion、Intervention、Report 六个规则 Agent。
- 每个 Agent 都基于真实数据库、风险评分、情绪词典、知识图谱和今日路径输出结论。
- 新增 `blackboard.py`，统一保存 `agent_name`、`input_summary`、`conclusion`、`confidence`、`evidence`、`suggestions`。
- 新增 `agent_coordinator.py`，依次运行多个 Agent，并用置信度加权和风险规则生成最终综合建议。
- 新增接口：
  - `GET /api/agents/run`
  - `GET /api/agents/blackboard`
  - `GET /api/agents/final-advice`
- 前端 AI 导师面板升级为多 Agent 协同面板，支持依次分析动画、黑板证据展示和最终建议卡片。

### 第六阶段：AI 导师、课程资料检索与学习报告

- `/api/chat` 支持连续对话历史；配置 `OPENAI_API_KEY` 或 `LLM_API_KEY` 时尝试调用真实 LLM，否则使用本地课程资料检索和模板回复。
- 新增 `services/course_materials.json`，以本地 JSON 课程资料支撑关键词检索。
- 新增 `retrieval_service.py`、`tutor_service.py`、`report_service.py`。
- 新增 `POST /api/tutor/explain`，可针对某个知识点生成讲解、步骤、例子和相关资料来源。
- 新增 `GET /api/reports/weekly` 和 `GET /api/reports/export-md`，生成周报 JSON 和 Markdown。
- 周报包含本周学习总时长、任务完成率、知识掌握变化、薄弱知识点、情绪压力变化、风险原因、下周建议和 Agent 综合总结。
- 前端 AI 导师支持连续对话、知识点讲解、一键生成周报和复制 Markdown。

## 主要接口

- `GET /api/dashboard`
- `GET /api/learning-map`
- `GET /api/charts`
- `POST /api/chat`
- `GET/POST /api/tasks`
- `PATCH/DELETE /api/tasks/{id}`
- `GET/POST /api/study-records`
- `GET/POST /api/emotion-checkins`
- `GET/POST /api/wrong-questions`
- `GET /api/risk/current`
- `POST /api/risk/evaluate`
- `GET /api/knowledge/graph`
- `GET /api/learning-path/today`
- `GET /api/agents/run`
- `GET /api/agents/blackboard`
- `GET /api/agents/final-advice`
- `POST /api/tutor/explain`
- `GET /api/reports/weekly`
- `GET /api/reports/export-md`
