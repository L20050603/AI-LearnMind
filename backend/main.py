from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers import charts, chat, dashboard, emotion_checkins, learning_map, study_records, tasks, wrong_questions
from seed import seed_database

app = FastAPI(
    title="AI-LearnMind API",
    description="知学伴数据库驱动接口",
    version="0.2.0",
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


@app.on_event("startup")
def startup():
    init_db()
    seed_database(reset=False)


app.include_router(dashboard.router)
app.include_router(learning_map.router)
app.include_router(charts.router)
app.include_router(chat.router)
app.include_router(tasks.router)
app.include_router(study_records.router)
app.include_router(emotion_checkins.router)
app.include_router(wrong_questions.router)


@app.get("/")
def health_check():
    return {"message": "AI-LearnMind backend is running", "version": "0.2.0"}
