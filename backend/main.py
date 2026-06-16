from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import charts, chat, dashboard, learning_map

app = FastAPI(
    title="AI-LearnMind API",
    description="知学伴第一阶段模拟数据接口",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(learning_map.router)
app.include_router(charts.router)
app.include_router(chat.router)


@app.get("/")
def health_check():
    return {"message": "AI-LearnMind backend is running"}
