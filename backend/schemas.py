from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class StudentProfile(BaseModel):
    name: str
    level: int
    xp: int
    goal: str
    target_score: int = 85
    exam_date: str = ""
    daily_minutes_goal: int = 90
    weekly_minutes_goal: int = 540
    preferred_study_time: str = ""
    study_style: str = ""


class DashboardStats(BaseModel):
    taskCompletion: int
    efficiencyScore: int
    learningRisk: int
    stressLevel: str
    streakDays: int
    todayXp: int
    weeklyStudyMinutes: int
    wrongQuestionCount: int


class AgentMessage(BaseModel):
    agent: str
    message: str


class DashboardResponse(BaseModel):
    student: StudentProfile
    stats: DashboardStats
    agentMessages: list[AgentMessage]


class LearningNode(BaseModel):
    id: int
    title: str
    status: str
    mastery: int
    time: str
    type: str
    course: str | None = None
    difficulty: int | None = None
    exam_weight: int | None = None
    estimated_minutes: int | None = None
    prerequisites: list[dict] = Field(default_factory=list)
    strategy: str | None = None
    unlocked: bool | None = None


class ChatRequest(BaseModel):
    question: str
    history: list[dict] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    sources: list[dict] = Field(default_factory=list)
    mode: str = "local"


class TutorExplainRequest(BaseModel):
    topic: str
    question: str = ""
    selectedLevelId: int | None = None


class TutorExplainResponse(BaseModel):
    topic: str
    explanation: str
    steps: list[str]
    examples: list[str]
    related_points: list[str]
    sources: list[dict] = Field(default_factory=list)


class TutorChatRequest(BaseModel):
    message: str
    selectedLevelId: int | None = None
    history: list[dict] = Field(default_factory=list)


class TutorWrongQuestionRequest(BaseModel):
    wrong_question_id: int | None = None


class TutorQuizRequest(BaseModel):
    knowledge_point_id: int
    count: int = Field(default=5, ge=1, le=10)


class TutorResourceSummaryRequest(BaseModel):
    resource_id: str | None = None
    title: str = ""
    content: str = ""


class TutorAIResponse(BaseModel):
    answer: str
    mode: str = "local"
    sources: list[dict] = Field(default_factory=list)
    suggestedQuestions: list[str] = Field(default_factory=list)
    topic: str | None = None
    steps: list[str] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    quiz: list[dict] = Field(default_factory=list)
    summary: dict | None = None


class UserPublic(BaseModel):
    id: int
    username: str = ""
    email: str = ""
    name: str
    avatar: str = ""
    major: str = ""
    grade: str = ""
    level: int
    xp: int
    goal: str = ""
    target_score: int = 85
    exam_date: str = ""
    daily_minutes_goal: int = 90
    weekly_minutes_goal: int = 540
    preferred_study_time: str = "晚上 19:00-22:00"
    study_style: str = "闯关 + 测验驱动"

    model_config = {"from_attributes": True}


class AuthRegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=40)
    email: str
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=60)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str):
        cleaned = value.strip()
        if "@" not in cleaned or "." not in cleaned.split("@")[-1]:
            raise ValueError("邮箱格式不正确")
        return cleaned


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    avatar: str | None = None
    major: str | None = None
    grade: str | None = None
    email: str | None = None


class GoalUpdateRequest(BaseModel):
    goal: str
    target_score: int = Field(default=85, ge=0, le=100)
    exam_date: str = ""


class StudyPlanUpdateRequest(BaseModel):
    daily_minutes_goal: int = Field(default=90, ge=0, le=600)
    weekly_minutes_goal: int = Field(default=540, ge=0, le=4200)
    preferred_study_time: str = ""
    study_style: str = ""


class ResourceSearchRequest(BaseModel):
    query: str = ""
    knowledge_point_id: int | None = None
    limit: int = Field(default=6, ge=1, le=20)


class ResourceFavoriteRequest(BaseModel):
    resource_id: str
    knowledge_point_id: int | None = None
    title: str = ""


class ResourceSearchResponse(BaseModel):
    query: str
    knowledge_point_id: int | None = None
    total: int
    resources: list[dict]
    related_points: list[str] = Field(default_factory=list)


class ResourceSearchPayload(BaseModel):
    knowledgePointId: int | None = None
    course: str = "操作系统"
    goal: str = "期末复习"
    resourceTypes: list[str] = Field(default_factory=lambda: ["article", "exercise", "video"])
    query: str = ""
    limit: int = Field(default=8, ge=1, le=20)


class ResourceCrawlPayload(BaseModel):
    url: str
    knowledgePointId: int | None = None


class ResourceCardPayload(BaseModel):
    resourceId: int


class QuizGeneratePayload(BaseModel):
    knowledgePointId: int
    sourceType: str = "level"
    sourceId: int | None = None
    count: int = Field(default=5, ge=1, le=10)


class QuizSubmitPayload(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


class FocusStartPayload(BaseModel):
    knowledgePointId: int
    taskId: int | None = None
    plannedMinutes: int = Field(default=25, ge=1, le=180)
    source: str = "manual"


class VoiceIntentPayload(BaseModel):
    text: str
    currentPage: str = ""
    selectedLevelId: int | None = None


class TaskCreate(BaseModel):
    title: str
    knowledge_point_id: int
    difficulty: str = "normal"
    estimated_minutes: int = Field(default=30, ge=1)
    due_date: str = ""


class TaskUpdate(BaseModel):
    title: str | None = None
    knowledge_point_id: int | None = None
    difficulty: str | None = None
    estimated_minutes: int | None = Field(default=None, ge=1)
    due_date: str | None = None
    completed: bool | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    knowledge_point_id: int
    difficulty: str
    estimated_minutes: int
    due_date: str
    completed: bool

    model_config = {"from_attributes": True}


class StudyRecordCreate(BaseModel):
    knowledge_point_id: int
    task_id: int | None = None
    study_minutes: int = Field(ge=1)
    correct_count: int = Field(default=0, ge=0)
    wrong_count: int = Field(default=0, ge=0)
    note: str = ""


class StudyRecordResponse(BaseModel):
    id: int
    knowledge_point_id: int
    task_id: int | None
    study_minutes: int
    correct_count: int
    wrong_count: int
    note: str

    model_config = {"from_attributes": True}


class EmotionCheckinCreate(BaseModel):
    mood: str
    text: str


class EmotionCheckinResponse(BaseModel):
    id: int
    mood: str
    text: str
    stress_score: int
    stress_level: str
    matched_words: list[dict] = Field(default_factory=list)
    risk: dict | None = None

    model_config = {"from_attributes": True}


class WrongQuestionCreate(BaseModel):
    knowledge_point_id: int
    question: str
    reason: str = ""
    fixed: bool = False


class WrongQuestionResponse(BaseModel):
    id: int
    knowledge_point_id: int
    question: str
    reason: str
    fixed: bool
    fixed_at: datetime | None = None

    model_config = {"from_attributes": True}


class RiskEvaluateRequest(BaseModel):
    mood: str | None = None
    text: str | None = None


class RiskMetrics(BaseModel):
    task_completion: int
    accuracy: int
    wrong_rate: int
    average_mastery: int
    study_stability: int
    learning_efficiency: int
    stress_score: int
    stress_level: str
    knowledge_mastery: dict[int, int]
    emotion_hits: list[dict]


class RiskResponse(BaseModel):
    risk_score: int
    risk_level: str
    reasons: list[str]
    suggestions: list[str]
    triggered_rules: list[str]
    metrics: RiskMetrics


class LevelCompleteRequest(BaseModel):
    study_minutes: int = Field(default=30, ge=1)
    correct_count: int = Field(default=5, ge=0)
    wrong_count: int = Field(default=1, ge=0)
    source: str = "manual_complete"


class LevelCompleteResponse(BaseModel):
    success: bool
    levelId: int
    newMastery: int
    xpGained: int
    unlockedLevels: list[int]
    message: str
    level: dict


class InteractionEventCreate(BaseModel):
    type: str
    name: str = ""
    action: str = ""
    page: str = ""
    target_id: int | None = None
    metadata: dict = Field(default_factory=dict)


class InteractionEventResponse(BaseModel):
    id: int
    user_id: int
    type: str
    name: str
    action: str
    page: str
    target_id: int | None
    metadata_json: str

    model_config = {"from_attributes": True}
