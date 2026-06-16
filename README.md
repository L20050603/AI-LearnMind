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

## 第二阶段扩展建议

- 接入真实用户登录和 SQLite 数据持久化。
- 增加知识图谱，按课程知识点关系生成学习路径。
- 接入大语言模型，实现个性化复习解释和题目生成。
- 增加专家系统规则引擎，用于学习风险和心理压力预警。
