import os

from sqlalchemy import Index, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.environ.get('DATABASE_URL','postgresql+psycopg://vaani:vaani@localhost:5432/vaani')
engine = create_engine(DATABASE_URL, pool_pre_ping=True, **({'connect_args':{'check_same_thread':False}} if DATABASE_URL.startswith('sqlite') else {}))
SessionLocal=sessionmaker(bind=engine)
class Base(DeclarativeBase): pass

class User(Base):
    __tablename__='user'
    id:Mapped[str]=mapped_column(String(36),primary_key=True)
    name:Mapped[str|None]=mapped_column(String,nullable=True)
    email:Mapped[str|None]=mapped_column(String,nullable=True)
    emailVerified:Mapped[int|None]=mapped_column(Integer,nullable=True)
    image:Mapped[str|None]=mapped_column(String,nullable=True)

class PracticeSession(Base):
    __tablename__='practice_sessions'
    id:Mapped[str]=mapped_column(String(36),primary_key=True)
    owner:Mapped[str]=mapped_column(String(64),nullable=False)
    role_id:Mapped[str]=mapped_column(String(40),nullable=False)
    role_title:Mapped[str]=mapped_column(String(100),nullable=False)
    date:Mapped[str]=mapped_column(String(40),nullable=False)
    mode:Mapped[str]=mapped_column(String(12),nullable=False)
    score:Mapped[int]=mapped_column(Integer,nullable=False)
    content:Mapped[int]=mapped_column(Integer,nullable=False)
    clarity:Mapped[int]=mapped_column(Integer,nullable=False)
    confidence:Mapped[int|None]=mapped_column(Integer,nullable=True)
    completed:Mapped[int]=mapped_column(Integer,nullable=False)
    __table_args__=(Index('idx_sessions_owner_date','owner','date'),)
    def public(self):
        return {"id": self.id, "roleId": self.role_id, "roleTitle": self.role_title, "date": self.date, "mode": self.mode, "score": self.score, "content": self.content, "clarity": self.clarity, "confidence": self.confidence, "completed": self.completed}
