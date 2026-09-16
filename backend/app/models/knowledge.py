from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.base import Base

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    keywords = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
