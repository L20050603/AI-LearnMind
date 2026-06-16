class AIProvider:
    provider_name = "base"
    mode = "local"
    model = "unknown"
    base_url = None

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
        raise NotImplementedError

    def explain_topic(self, topic: str, context: dict) -> dict:
        raise NotImplementedError

    def explain_wrong_question(self, question: str, reason: str, context: dict) -> dict:
        raise NotImplementedError

    def generate_quiz(self, topic: str, context: dict, count: int = 5) -> list[dict]:
        raise NotImplementedError

    def summarize_resource(self, title: str, content: str, context: dict) -> dict:
        raise NotImplementedError

    def generate_weekly_report(self, data: dict) -> str:
        raise NotImplementedError
