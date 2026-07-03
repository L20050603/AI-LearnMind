# AI-LearnMind 知学伴

AI-LearnMind 知学伴是一个“基于专家系统、知识图谱与情感计算的个性化学习诊断与情智一体陪伴机器人原型”。系统面向大学生自主学习场景，通过学习数据采集、知识图谱建模、专家规则推理、多 Agent 黑板协同和情绪陪伴反馈，形成从学习诊断到个性化干预的智能闭环。

系统保留学习平台能力，同时强化为机器智能课程期末大作业可展示原型：既能展示学习地图、资源、测验和报告，也能解释专家系统结构、知识表示方法、协同式黑板机制和 LearnMind Bot 情智一体机器人思想。

## 技术栈

- 前端：React、Vite、Tailwind CSS、Framer Motion、ECharts、React Flow、Three.js、axios
- 后端：FastAPI、SQLAlchemy、SQLite、Pydantic、pytest
- 智能模块：专家规则引擎、情绪词典分析、知识图谱、学习路径规划、多 Agent 黑板协同、可解释风险评分、本地资料检索、可选 LLM

## 期末大作业展示说明

项目定位：

```text
AI-LearnMind 知学伴：基于专家系统、知识图谱与情感计算的个性化学习诊断与情智一体陪伴机器人原型
```

对应课程要求：

- 设计初衷：解决学生学习路径不清、薄弱点难定位、学习焦虑和普通 AI 缺少长期画像的问题。
- 与已有产品不同：不只是刷题或聊天，而是结合学习画像、知识图谱、专家规则、Agent 黑板和情绪陪伴。
- 主要功能：学习主题管理、学习地图、知识图谱、风险诊断、多 Agent 协同、资源猎手、测验、AI 导师、专注空间、LearnMind Bot、学习报告。
- 主要智能技术：专家系统规则推理、知识表示、情绪词典分析、学习路径规划、多 Agent 黑板协同、本地检索与可选 LLM。
- 系统框架：用户层 → 数据感知层 → 知识表示层 → 专家推理层 → Agent 协同层 → 情绪陪伴层 → 行为反馈层 → 报告生成层。
- 创新点：CoursePack 自定义主题、轻量知识图谱、可解释风险诊断、认知与情绪联合分析、情智一体陪伴机器人、无 API Key 本地可演示。

新增展示页面：

- `创新设计中心 /innovation-design`：集中展示设计初衷、产品差异、智能技术、系统框架、工作原理和创新点。
- `LearnMind Bot /bot`：展示感知层、判断层、动作层、反馈层，并支持本地规则式情绪陪伴交互。
- `风险诊断 /risk`：展示专家系统五部分和推理链。
- `学习报告 /reports`：可生成“创新设计素材”Markdown。

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

访问：`http://localhost:5173`

演示账号：`demo` / `123456`

## 学习主题切换

系统已经支持轻量级“课程包 / 学习主题”：

- 默认主题：人工智能与机器智能基础
- 可切换主题：操作系统

切换位置：登录后进入 `系统设置`，在“学习主题设置”卡片中选择课程。

切换后会影响：

- Dashboard 推荐内容
- 学习地图
- 知识图谱
- 知识星图
- 今日学习路径
- 资源猎手默认课程和知识点
- AI 导师本地资料检索
- 本地测验题库
- 学习报告中的课程名

切换课程不会删除历史数据。不同课程使用不同 `knowledge_point_id`，掌握度和错题不会互相污染。

## 资源猎手搜索模式

资源猎手支持三种来源：

- `local`：本地课程资料库，默认模式，不联网。
- `web`：通过用户配置的官方搜索 API 联网搜索。
- `crawl`：用户手动提供公开 URL，系统抓取标题、摘要和文本片段。

默认 `SEARCH_PROVIDER=local`，不需要任何 API Key。

### 配置联网搜索

在 `backend/.env` 中配置：

```env
SEARCH_PROVIDER=local
SEARCH_API_KEY=
SEARCH_API_BASE_URL=
```

支持：

- `SEARCH_PROVIDER=local`：本地资料库。
- `SEARCH_PROVIDER=custom`：向 `SEARCH_API_BASE_URL` POST JSON：`{"query": "...", "limit": 8}`。
- `SEARCH_PROVIDER=tavily`：Tavily 风格接口，默认 `https://api.tavily.com/search`。
- `SEARCH_PROVIDER=bing`：Bing Web Search 风格接口，Header 使用 `Ocp-Apim-Subscription-Key`。

如果没有 API Key、请求失败、超时或返回格式不正确，系统会自动 fallback 到本地资料库。

### 合规限制

资源猎手不会爬取搜索引擎结果页，不绕过登录、付费墙、验证码或 robots 限制。

手动 URL 抓取限制：

- 只允许 `http/https`。
- 禁止 login、signin、pay、captcha、verify、private、account、auth、download、attachment 等路径。
- 暂不抓取 PDF、Office、压缩包等大文件。
- 读取大小限制为 150000 bytes。
- 使用明确 User-Agent：`AI-LearnMind-ResourceHunter/1.0 EducationalUse`。
- 如果 `robots.txt` 明确禁止当前路径，系统会拒绝抓取。

## 演示路线

1. 登录 demo。
2. 进入系统设置，查看当前主题“人工智能与机器智能基础”。
3. 打开学习地图，展示 AI/机器智能知识点。
4. 切换到“操作系统”，查看操作系统学习地图仍然保留。
5. 切回“人工智能与机器智能基础”。
6. 打开资源猎手，选择“专家系统”或“知识图谱”相关关卡。
7. 搜索“专家系统”。
8. 未配置搜索 API 时展示本地 fallback。
9. 配置官方搜索 API 后展示联网搜索结果和合规说明。

## 主要 API

- `GET /api/courses`
- `GET /api/courses/active`
- `PATCH /api/courses/active`
- `PATCH /api/profile/active-course`
- `GET /api/dashboard`
- `GET /api/learning-map`
- `GET /api/knowledge/graph`
- `GET /api/star-map/knowledge`
- `GET /api/learning-path/today`
- `POST /api/resources/search`
- `POST /api/resources/crawl`
- `POST /api/quiz/generate`
- `POST /api/quiz/{quiz_id}/submit`

## 测试

```bash
cd backend
pytest

cd ../frontend
npm run build
```
