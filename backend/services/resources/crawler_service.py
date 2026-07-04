from urllib.parse import urlparse
import urllib.error
import urllib.request

from services.resources.content_extractor import extract_text, extract_title

BLOCKED_HINTS = ["login", "signin", "pay", "captcha", "verify", "private", "account", "auth", "download", "attachment"]
BLOCKED_EXTENSIONS = [".pdf", ".zip", ".rar", ".7z", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"]
USER_AGENT = "AI-LearnMind-ResourceHunter/1.0 EducationalUse"
MAX_READ_BYTES = 150000


def _blocked(message):
    return {"ok": False, "status": "blocked", "message": message, "http_status": 0, "title": "", "excerpt": ""}


def _robots_allowed(parsed):
    # 只做基础 robots.txt 合规检查；如果无法确认规则，按作业展示场景采取谨慎拒绝。
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    request = urllib.request.Request(robots_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            text = response.read(60000).decode(response.headers.get_content_charset() or "utf-8", errors="ignore")
    except (urllib.error.URLError, TimeoutError):
        return False, "无法确认 robots.txt 规则，已谨慎拒绝抓取。"

    user_agent_matched = False
    path = parsed.path or "/"
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, value = [part.strip() for part in line.split(":", 1)]
        key = key.lower()
        if key == "user-agent":
            user_agent_matched = value in {"*", "AI-LearnMind-ResourceHunter"}
        elif user_agent_matched and key == "disallow" and value:
            if path.startswith(value):
                return False, "robots.txt 明确禁止抓取该路径。"
        elif key == "user-agent":
            user_agent_matched = False
    return True, "robots.txt 未禁止该路径。"


def crawl_url(url: str):
    # URL 抓取只用于公开学习资料摘要，不绕过登录、付费墙、验证码或下载限制。
    parsed = urlparse(url)
    lowered = url.lower()
    if parsed.scheme not in {"http", "https"}:
        return _blocked("仅支持 http/https URL。")
    if any(hint in lowered for hint in BLOCKED_HINTS):
        return _blocked("不抓取登录、付费、验证码、账号、私有、下载或附件页面。")
    if any(parsed.path.lower().endswith(ext) for ext in BLOCKED_EXTENSIONS):
        return _blocked("暂不抓取 PDF、Office 或压缩包等大文件。")

    allowed, reason = _robots_allowed(parsed)
    if not allowed:
        return _blocked(reason)

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type and "text/plain" not in content_type:
                return _blocked("仅抓取公开 HTML 或纯文本学习页面。")
            raw = response.read(MAX_READ_BYTES)
            html = raw.decode(response.headers.get_content_charset() or "utf-8", errors="ignore")
            title = extract_title(html, parsed.netloc)
            excerpt = extract_text(html)
            return {
                "ok": True,
                "status": "success",
                "message": f"抓取成功。{reason} 系统仅保存标题、摘要和片段，不绕过登录、付费墙或验证码。",
                "http_status": response.status,
                "title": title,
                "excerpt": excerpt,
            }
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"ok": False, "status": "failed", "message": f"抓取失败：{exc}", "http_status": 0, "title": "", "excerpt": ""}
