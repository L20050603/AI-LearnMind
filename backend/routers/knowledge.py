from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.knowledge_graph_service import graph_edges, graph_node_payload, graph_points
from services.mastery_service import mastery_map
from services.unlock_service import node_status

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


@router.get("/graph")
def get_knowledge_graph(db: Session = Depends(get_db)):
    scores = mastery_map(db)
    return {
        "nodes": [
            graph_node_payload(
                point,
                status=node_status(point, scores),
                mastery=scores.get(point["id"], 0),
            )
            for point in graph_points()
        ],
        "edges": graph_edges(),
    }
