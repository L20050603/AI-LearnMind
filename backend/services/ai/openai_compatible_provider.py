import json
import os
import urllib.error
import urllib.request

from services.ai.ai_provider import AIProvider
from services.ai.json_utils import extract_json_object
from services.ai.prompt_templates import SYSTEM_PROMPT, context_block


class OpenAICompatibleProvider(AIProvider):
    provider_name = "openai-compatible"
    mode = "llm"

    def __init__(self):
        # 同时兼容通用 OpenAI 风格变量和豆包 Ark 变量，便于学生低成本接入。
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("DOUBAO_API_KEY") or os.getenv("ARK_API_KEY") or ""
        self.api_url = os.getenv("LLM_API_URL") or os.getenv("DOUBAO_TEXT_ENDPOINT") or ""
        self.base_url = os.getenv("LLM_API_BASE_URL") or self._base_url_from_endpoint(self.api_url) or "https://api.openai.com/v1"
        self.api_url = self.api_url or f"{self.base_url.rstrip('/')}/chat/completions"
        self.model = os.getenv("LLM_MODEL") or os.getenv("DOUBAO_TEXT_MODEL") or "gpt-4o-mini"
        self.temperature = float(os.getenv("LLM_TEMPERATURE") or "0.3")
        self.timeout = int(os.getenv("LLM_TIMEOUT_SECONDS") or "90")

    def _base_url_from_endpoint(self, endpoint: str):
        if not endpoint:
            return None
        if "/responses" in endpoint:
            return endpoint.split("/responses")[0]
        if "/chat/completions" in endpoint:
            return endpoint.split("/chat/completions")[0]
        return None

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
        # 豆包 responses 端点和 chat/completions 端点请求体不同，这里统一封装。
        if not self.api_key:
            raise RuntimeError("LLM API key is not configured")
        if self.api_url.rstrip("/").endswith("/responses"):
            user_text = "\n\n".join(f"{item.get('role', 'user')}: {item.get('content', '')}" for item in messages)
            payload_data = {
                "model": self.model,
                "input": user_text,
                "temperature": temperature if temperature is not None else self.temperature,
            }
        else:
            payload_data = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature if temperature is not None else self.temperature,
            }
        payload = json.dumps(payload_data, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.api_url,
            data=payload,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"LLM request failed: {exc}") from exc
        text = self._extract_text(data)
        if not text:
            raise RuntimeError("LLM response did not contain a message")
        return text

    def _extract_text(self, data: dict) -> str:
        # 兼容 output_text、choices.message.content 和 responses.output.content 多种返回格式。
        if data.get("output_text"):
            return data["output_text"]
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            pass
        chunks = []
        for item in data.get("output", []) or []:
            for content in item.get("content", []) or []:
                text = content.get("text") or content.get("value")
                if text:
                    chunks.append(text)
        return "\n".join(chunks).strip()

    def explain_topic(self, topic: str, context: dict) -> dict:
        text = self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"请面向大学生解释这个知识点：{topic}\n{context_block(context)}\n"
                        "请返回 JSON：answer, steps, examples, suggestedQuestions。"
                    ),
                },
            ],
            self.temperature,
        )
        return extract_json_object(text, {"answer": text, "steps": [], "examples": [], "suggestedQuestions": []})

    def explain_wrong_question(self, question: str, reason: str, context: dict) -> dict:
        text = self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"请讲解并修复这道错题。\n题目：{question}\n错因：{reason}\n{context_block(context)}\n"
                        "请返回 JSON：answer, rootCause, repairPlan, suggestedQuestions。"
                    ),
                },
            ],
            self.temperature,
        )
        return extract_json_object(text, {"answer": text, "rootCause": reason, "repairPlan": [], "suggestedQuestions": []})

    def generate_quiz(self, topic: str, context: dict, count: int = 5) -> list[dict]:
        # 小测验要求返回结构化 JSON，后续还会经过 quiz_generator 的质量校验。
        level = context.get("selected_level") or {}
        risk = context.get("risk") or {}
        source = (context.get("sources") or [{}])[0]
        knowledge = context.get("knowledge_point") or {}
        wrong_questions = context.get("wrong_questions") or []
        study_records = context.get("study_records") or []
        compact_context = (
            f"知识点：{topic}\n"
            f"课程：{knowledge.get('course', '操作系统')}\n"
            f"章节：{knowledge.get('chapter', '')}\n"
            f"类型：{knowledge.get('type', level.get('type', 'normal'))}\n"
            f"难度：{knowledge.get('difficulty', level.get('difficulty', '未知'))}\n"
            f"考试权重：{knowledge.get('exam_weight', level.get('exam_weight', '未知'))}\n"
            f"知识点说明：{knowledge.get('description', level.get('strategy', ''))}\n"
            f"前置知识：{knowledge.get('prerequisites', [])}\n"
            f"当前掌握度：{level.get('mastery', '未知')}%\n"
            f"风险等级：{risk.get('risk_level', '未知')}，风险分：{risk.get('risk_score', '未知')}\n"
            f"近期错题：{json.dumps(wrong_questions[:3], ensure_ascii=False)}\n"
            f"近期学习记录：{json.dumps(study_records[:3], ensure_ascii=False)}\n"
            f"参考资料：{source.get('title', '本地课程资料')} - {source.get('summary') or source.get('snippet') or ''}"
        )
        schema = """
只输出 JSON 数组，不要输出 Markdown，不要输出解释性前后缀。
数组中每个对象必须包含：
{
  "id": 1,
  "type": "single_choice | multiple_choice | calculation | scenario | diagnosis | short_answer",
  "question": "题干，必须紧扣当前知识点，不能泛泛地问关键概念",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "单选/计算/简答为字符串；多选为字符串数组",
  "explanation": "解析要给出推理步骤或错因",
  "examPoint": "具体考点",
  "difficulty": "easy | normal | hard",
  "tags": ["关键词1", "关键词2"]
}
要求：
1. 至少包含 3 种题型，其中必须有 calculation 或 scenario，必须有 diagnosis 或 short_answer。
2. 如果知识点是页面置换算法，必须出现访问串、物理块数、FIFO/LRU/OPT/Clock、缺页次数或淘汰页计算。
3. 如果是调度算法，必须出现进程到达时间、运行时间、等待时间、周转时间或时间片。
4. 选择题必须 4 个选项；多选题 answer 必须是数组。
5. 严禁生成“请说明一个关键概念或判断步骤”这类模板题。
"""
        text = self.chat(
            [
                {"role": "system", "content": "你是大学《操作系统》课程的严谨出题老师，擅长生成有计算过程、应用场景和错因诊断的中文测验题。"},
                {"role": "user", "content": f"请基于以下学生上下文生成 {count} 道中文小测题。\n\n{compact_context}\n\n{schema}"},
            ],
            self.temperature,
        )
        data = extract_json_object(text, [])
        if not isinstance(data, list) or not data:
            raise RuntimeError("LLM quiz response was not a valid non-empty JSON array")
        return data

    def summarize_resource(self, title: str, content: str, context: dict) -> dict:
        text = self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请把这个学习资源总结成可复习材料。\n标题：{title}\n内容：{content[:2500]}"},
            ],
            self.temperature,
        )
        return extract_json_object(text, {"summary": text, "keyPoints": [], "suggestedUse": ""})

    def generate_weekly_report(self, data: dict) -> str:
        return self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"请根据这些数据生成一份简洁的中文 Markdown 周报：\n{json.dumps(data, ensure_ascii=False)}"},
            ],
            self.temperature,
        )
