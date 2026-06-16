# AI-LearnMind 知学伴

AI-LearnMind 是一个“基于多智能体协同的大学生学习状态诊断与心理陪伴系统”。系统以学习闯关地图为主界面，把操作系统知识点设计成可解锁关卡，并通过真实数据库、专家规则、知识图谱、多 Agent 黑板协同和本地课程资料检索，完成从学习记录到个性化建议和周报生成的闭环。

## 技术栈

前端：

- React
- Vite
- Tailwind CSS
- Framer Motion
- ECharts
- React Flow
- axios
- lucide-react

后端：

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- pytest

智能模块：

- 专家规则引擎
- 情绪词典分析
- 知识图谱
- 学习路径规划
- 多 Agent 黑板协同
- 本地课程资料关键词检索
- 可选 LLM 接口
- Markdown 学习报告生成

## 功能说明

- 学习闯关地图：8 个操作系统知识点节点，支持已完成、当前、锁定、Boss 状态。
- 数据 CRUD：学习任务、学习记录、情绪打卡、错题记录。
- 动态掌握度：根据正确率、错题率、复习次数、任务完成情况计算。
- 风险评分：输出风险分、风险等级、触发规则、原因和建议。
- 知识图谱：根据前置知识判断解锁状态，并生成今日学习路径。
- 多 Agent 协同：Profile、Diagnosis、Planner、Emotion、Intervention、Report 六个 Agent 写入黑板。
- AI 导师：支持连续对话；有 API Key 时调用 LLM，没有 API Key 时使用本地资料检索和模板回复。
- 学习周报：生成 JSON 周报和可复制 Markdown 报告。

## 运行命令

后端：

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

前端：

```bash
cd frontend
npm install
npm run dev
```

访问：

```text
http://localhost:5173
```

## 演示数据

运行 `python seed.py` 会生成：

- 操作系统课程
- 8 个知识点
- 10 条学习任务
- 7 天学习记录
- 5 条情绪打卡
- 10 条错题记录

演示脚本见：[docs/demo_script.md](docs/demo_script.md)

## 系统架构

```text
frontend/
  React Dashboard
    ├─ 学习闯关地图
    ├─ 数据录入面板
    ├─ 风险中心
    ├─ 多 Agent 协同面板
    ├─ 知识图谱 React Flow
    └─ ECharts 仪表盘

backend/
  FastAPI
    ├─ CRUD Routers
    ├─ Risk Engine
    ├─ Emotion Service
    ├─ Mastery Service
    ├─ Knowledge Graph Service
    ├─ Path Planner
    ├─ Agent Coordinator + Blackboard
    ├─ Tutor Retrieval Service
    └─ Report Service

SQLite
  users / learning_tasks / study_records / emotion_checkins
  wrong_questions / knowledge_points / risk_reports
```

## API 说明

基础数据：

- `GET /api/dashboard`
- `GET /api/charts`
- `GET /api/learning-map`
- `GET /api/knowledge/graph`
- `GET /api/learning-path/today`

学习数据：

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/study-records`
- `POST /api/study-records`
- `GET /api/emotion-checkins`
- `POST /api/emotion-checkins`
- `GET /api/wrong-questions`
- `POST /api/wrong-questions`

智能诊断：

- `GET /api/risk/current`
- `POST /api/risk/evaluate`
- `GET /api/agents/run`
- `GET /api/agents/blackboard`
- `GET /api/agents/final-advice`

AI 导师与报告：

- `POST /api/chat`
- `POST /api/tutor/explain`
- `GET /api/reports/weekly`
- `GET /api/reports/export-md`

## 测试

```bash
cd backend
venv\Scripts\activate
pytest
```

测试覆盖：

- 任务接口 CRUD
- 风险评分可解释输出
- 情绪词典分析
- 学习路径规划

## 可选 LLM 配置

默认不需要任何 API Key。系统会使用本地课程资料检索和模板生成回复。

如果要接入真实 LLM，可配置：

```bash
set OPENAI_API_KEY=你的Key
set LLM_MODEL=gpt-4o-mini
```

或：

```bash
set LLM_API_KEY=你的Key
set LLM_API_URL=https://api.openai.com/v1/chat/completions
set LLM_MODEL=gpt-4o-mini
```

## 完整闭环

演示主线：

```text
添加学习记录
  → 掌握度重新计算
  → 风险评分更新
  → Agent 黑板协同
  → 今日路径规划
  → 学习报告生成
```
