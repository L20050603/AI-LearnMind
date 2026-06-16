import { useEffect, useState } from "react";

export default function TypewriterText({ text = "", speed = 22 }) {
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    setVisibleText("");
    if (!text) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {visibleText}
      {visibleText.length < text.length && <span className="typing-caret">|</span>}
    </span>
  );
}
