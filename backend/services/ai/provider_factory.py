import os
from pathlib import Path

from services.ai.ai_provider import AIProvider
from services.ai.local_template_provider import LocalTemplateProvider
from services.ai.openai_compatible_provider import OpenAICompatibleProvider


class FallbackAIProvider(AIProvider):
    def __init__(self, primary: AIProvider, fallback: AIProvider):
        self.primary = primary
        self.fallback = fallback
        self.provider_name = primary.provider_name
        self.mode = primary.mode
        self.model = primary.model
        self.base_url = primary.base_url
        self.last_mode = primary.mode

    def _call(self, method_name, *args, **kwargs):
        try:
            result = getattr(self.primary, method_name)(*args, **kwargs)
            self.last_mode = self.primary.mode
            return result
        except Exception:
            result = getattr(self.fallback, method_name)(*args, **kwargs)
            self.last_mode = self.fallback.mode
            return result

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
        return self._call("chat", messages, temperature)

    def explain_topic(self, topic: str, context: dict) -> dict:
        return self._call("explain_topic", topic, context)

    def explain_wrong_question(self, question: str, reason: str, context: dict) -> dict:
        return self._call("explain_wrong_question", question, reason, context)

    def generate_quiz(self, topic: str, context: dict, count: int = 5) -> list[dict]:
        return self._call("generate_quiz", topic, context, count)

    def summarize_resource(self, title: str, content: str, context: dict) -> dict:
        return self._call("summarize_resource", title, content, context)

    def generate_weekly_report(self, data: dict) -> str:
        return self._call("generate_weekly_report", data)


def load_backend_env():
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def has_llm_key():
    load_backend_env()
    return bool(os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("DOUBAO_API_KEY") or os.getenv("ARK_API_KEY"))


def get_ai_provider():
    load_backend_env()
    local = LocalTemplateProvider()
    if has_llm_key():
        return FallbackAIProvider(OpenAICompatibleProvider(), local)
    return local


def get_ai_status():
    load_backend_env()
    if has_llm_key():
        provider = OpenAICompatibleProvider()
        return {
            "configured": True,
            "provider": provider.provider_name,
            "mode": "llm",
            "model": provider.model,
            "baseUrl": provider.base_url,
        }
    local = LocalTemplateProvider()
    return {
        "configured": False,
        "provider": local.provider_name,
        "mode": "local",
        "model": local.model,
        "baseUrl": None,
    }
