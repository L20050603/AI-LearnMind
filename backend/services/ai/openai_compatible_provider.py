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
        self.api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        self.base_url = os.getenv("LLM_API_BASE_URL") or "https://api.openai.com/v1"
        self.api_url = os.getenv("LLM_API_URL") or f"{self.base_url.rstrip('/')}/chat/completions"
        self.model = os.getenv("LLM_MODEL") or "gpt-4o-mini"
        self.temperature = float(os.getenv("LLM_TEMPERATURE") or "0.3")

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
        if not self.api_key:
            raise RuntimeError("LLM API key is not configured")
        payload = json.dumps(
            {
                "model": self.model,
                "messages": messages,
                "temperature": temperature if temperature is not None else self.temperature,
            }
        ).encode("utf-8")
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
        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError("LLM response did not contain a message") from exc

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
