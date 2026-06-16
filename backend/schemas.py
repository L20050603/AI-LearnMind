from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    name: str
    level: int
    xp: int
    goal: str


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


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    reply: str


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

    model_config = {"from_attributes": True}
