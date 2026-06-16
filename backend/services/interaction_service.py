import json

from models import InteractionEvent


def log_event(db, event_type, name="", action="", page="", target_id=None, metadata=None):
    event = InteractionEvent(
        user_id=1,
        type=event_type,
        name=name,
        action=action,
        page=page,
        target_id=target_id,
        metadata_json=json.dumps(metadata or {}, ensure_ascii=False),
    )
    db.add(event)
    return event
