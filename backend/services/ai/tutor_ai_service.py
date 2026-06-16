from services.ai.provider_factory import get_ai_provider


def call_provider(method_name: str, *args, **kwargs):
    provider = get_ai_provider()
    result = getattr(provider, method_name)(*args, **kwargs)
    mode = getattr(provider, "last_mode", provider.mode)
    return result, mode
