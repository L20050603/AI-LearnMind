from datetime import UTC, datetime


class Blackboard:
    def __init__(self):
        self.entries = []

    def write(self, entry):
        stored = {
            "id": len(self.entries) + 1,
            "created_at": datetime.now(UTC).replace(tzinfo=None).isoformat(timespec="seconds"),
            "agent_name": entry["agent_name"],
            "input_summary": entry["input_summary"],
            "conclusion": entry["conclusion"],
            "confidence": round(float(entry.get("confidence", 0)), 2),
            "evidence": entry.get("evidence", []),
            "suggestions": entry.get("suggestions", []),
            "meta": entry.get("meta", {}),
        }
        self.entries.append(stored)
        return stored

    def snapshot(self):
        return self.entries
