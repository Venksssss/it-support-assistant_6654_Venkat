from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    return {
        "status": "ok",
        "service": "AI-Powered IT Support Assistant",
        "version": "1.0.0"
    }
