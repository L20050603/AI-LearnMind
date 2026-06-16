from urllib.parse import urlparse
import urllib.error
import urllib.request

from services.resources.content_extractor import extract_text, extract_title

BLOCKED_HINTS = ["login", "signin", "pay", "captcha", "verify"]


def crawl_url(url: str):
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return {"ok": False, "status": "blocked", "message": "仅支持 http/https URL", "http_status": 0, "title": "", "excerpt": ""}
    if any(hint in url.lower() for hint in BLOCKED_HINTS):
        return {"ok": False, "status": "blocked", "message": "不抓取登录、付费或验证码页面", "http_status": 0, "title": "", "excerpt": ""}
    request = urllib.request.Request(url, headers={"User-Agent": "AI-LearnMind-ResourceHunter/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            raw = response.read(220000)
            html = raw.decode(response.headers.get_content_charset() or "utf-8", errors="ignore")
            title = extract_title(html, parsed.netloc)
            excerpt = extract_text(html)
            return {"ok": True, "status": "success", "message": "抓取成功", "http_status": response.status, "title": title, "excerpt": excerpt}
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"ok": False, "status": "failed", "message": f"抓取失败：{exc}", "http_status": 0, "title": "", "excerpt": ""}
