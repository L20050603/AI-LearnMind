from pydantic import BaseModel


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
