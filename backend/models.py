from sqlalchemy import Column, Integer, String

from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    goal = Column(String, default="")
