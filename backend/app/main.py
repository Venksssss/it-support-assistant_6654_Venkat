from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.seed.knowledge_seed import seed_knowledge_base
from app.api.routes import health, knowledge, tickets

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed knowledge base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_knowledge_base(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered IT Support Assistant backend API powered by FastAPI and Google Gemini.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router endpoints under /api
app.include_router(health.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "AI-Powered IT Support Assistant API is running.",
        "swagger_docs": "/docs",
        "health_check": "/api/health"
    }
