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
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("DOUBAO_API_KEY") or os.getenv("ARK_API_KEY") or ""
        self.api_url = os.getenv("LLM_API_URL") or os.getenv("DOUBAO_TEXT_ENDPOINT") or ""
        self.base_url = os.getenv("LLM_API_BASE_URL") or self._base_url_from_endpoint(self.api_url) or "https://api.openai.com/v1"
        self.api_url = self.api_url or f"{self.base_url.rstrip('/')}/chat/completions"
        self.model = os.getenv("LLM_MODEL") or os.getenv("DOUBAO_TEXT_MODEL") or "gpt-4o-mini"
        self.temperature = float(os.getenv("LLM_TEMPERATURE") or "0.3")

    def _base_url_from_endpoint(self, endpoint: str):
        if not endpoint:
            return None
        if "/responses" in endpoint:
            return endpoint.split("/responses")[0]
        if "/chat/completions" in endpoint:
            return endpoint.split("/chat/completions")[0]
        return None

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
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
            with urllib.request.urlopen(request, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"LLM request failed: {exc}") from exc
        text = self._extract_text(data)
        if not text:
            raise RuntimeError("LLM response did not contain a message")
        return text

    def _extract_text(self, data: dict) -> str:
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
                        f"Explain this topic for a student: {topic}\n{context_block(context)}\n"
                        "Return JSON with answer, steps, examples, suggestedQuestions."
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
                        f"Explain and repair this wrong question.\nQuestion: {question}\nReason: {reason}\n{context_block(context)}\n"
                        "Return JSON with answer, rootCause, repairPlan, suggestedQuestions."
                    ),
                },
            ],
            self.temperature,
        )
        return extract_json_object(text, {"answer": text, "rootCause": reason, "repairPlan": [], "suggestedQuestions": []})

    def generate_quiz(self, topic: str, context: dict, count: int = 5) -> list[dict]:
        text = self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"Generate {count} quiz questions for {topic}.\n{context_block(context)}\n"
                        "Return JSON array. Each item needs id, type, question, options, answer, explanation."
                    ),
                },
            ],
            self.temperature,
        )
        data = extract_json_object(text, [])
        return data if isinstance(data, list) else []

    def summarize_resource(self, title: str, content: str, context: dict) -> dict:
        text = self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Summarize this resource for study use.\nTitle: {title}\nContent: {content[:2500]}"},
            ],
            self.temperature,
        )
        return extract_json_object(text, {"summary": text, "keyPoints": [], "suggestedUse": ""})

    def generate_weekly_report(self, data: dict) -> str:
        return self.chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Generate a concise weekly markdown report from this data:\n{json.dumps(data, ensure_ascii=False)}"},
            ],
            self.temperature,
        )
