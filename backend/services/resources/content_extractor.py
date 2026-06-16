import re


def extract_title(html: str, fallback="外部资源"):
    match = re.search(r"<title[^>]*>(.*?)</title>", html or "", flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return fallback
    return re.sub(r"\s+", " ", match.group(1)).strip()[:120] or fallback


def extract_text(html: str, limit=1400):
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html or "", flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]
