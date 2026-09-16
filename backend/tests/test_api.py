import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.services.knowledge_service import KnowledgeService
from app.services.llm_service import LLMService

# ---------------------------------------------------------------------------
# Infrastructure tests
# ---------------------------------------------------------------------------

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_get_knowledge():
    with TestClient(app) as client:
        response = client.get("/api/knowledge")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 10


def test_ticket_validation_short_question():
    with TestClient(app) as client:
        response = client.post("/api/tickets", json={"question": "abc"})
        assert response.status_code == 422


# ---------------------------------------------------------------------------
# Retrieval quality tests — 5 specific queries
# Each test asserts that the TOP-1 result is the expected article.
# We don't check exact scores (they may vary) — only ranking matters.
# ---------------------------------------------------------------------------

def _search(question: str, top_k: int = 3):
    """Helper: run a search inside a real DB session (with seeded data)."""
    with TestClient(app):  # triggers lifespan → seeds DB
        db = SessionLocal()
        try:
            results, context = KnowledgeService.search(db, question, top_k=top_k)
            return results, context
        finally:
            db.close()


def test_retrieval_wifi_no_internet():
    """'Wi-Fi connected but no internet' should rank #1 for Wi-Fi/websites query."""
    results, context = _search("My laptop connects to Wi-Fi but websites are not opening.")
    assert len(results) > 0, "Expected at least 1 result"
    top_title = results[0].title.lower()
    assert "wi-fi" in top_title or "wifi" in top_title or "internet" in top_title, (
        f"Expected Wi-Fi article at top, got: {results[0].title!r}"
    )


def test_retrieval_email_not_syncing():
    """'Email not syncing' should rank #1 for Outlook sync query."""
    results, context = _search("Outlook is not receiving new emails and throws sync error.")
    assert len(results) > 0, "Expected at least 1 result"
    top_title = results[0].title.lower()
    assert "email" in top_title or "sync" in top_title or "outlook" in top_title, (
        f"Expected Email/Outlook article at top, got: {results[0].title!r}"
    )
    # Also confirm BSOD and Windows update do NOT outrank the email article
    all_titles = [r.title.lower() for r in results]
    if len(results) > 1:
        # Email article should be first, not a system crash / update article
        assert "blue screen" not in all_titles[0] and "windows update" not in all_titles[0], (
            f"Unrelated article ranked #1: {results[0].title!r}"
        )


def test_retrieval_vpn_not_connecting():
    """'VPN not connecting' should rank #1 for company VPN query."""
    results, context = _search("My VPN is not connecting to the company network.")
    assert len(results) > 0, "Expected at least 1 result"
    top_title = results[0].title.lower()
    assert "vpn" in top_title, (
        f"Expected VPN article at top, got: {results[0].title!r}"
    )


def test_retrieval_printer_not_printing():
    """'Printer not printing' should rank #1 for printer stuck query."""
    results, context = _search("My printer is powered on but nothing prints.")
    assert len(results) > 0, "Expected at least 1 result"
    top_title = results[0].title.lower()
    assert "printer" in top_title or "print" in top_title, (
        f"Expected Printer article at top, got: {results[0].title!r}"
    )


def test_retrieval_blue_screen_crash():
    """'Blue screen / system crash' should rank #1 for BSOD query."""
    results, context = _search("My laptop suddenly shows a blue screen and crashes.")
    assert len(results) > 0, "Expected at least 1 result"
    top_title = results[0].title.lower()
    assert "blue screen" in top_title or "bsod" in top_title or "crash" in top_title, (
        f"Expected BSOD article at top, got: {results[0].title!r}"
    )


def test_context_string_format():
    """Context string should be well-formatted with KNOWLEDGE BASE RESULT markers."""
    _, context = _search("My laptop connects to Wi-Fi but websites are not opening.")
    assert "KNOWLEDGE BASE RESULT 1" in context
    assert "Title:" in context
    assert "Solution:" in context


# ---------------------------------------------------------------------------
# Ticket creation / persistence / GET tests (with mocked LLM)
# ---------------------------------------------------------------------------

def test_ticket_creation_mocked_gemini():
    """Verify POST /api/tickets flow end-to-end with mocked Gemini service."""
    mock_ai_output = "1. Flush your DNS using ipconfig /flushdns.\n2. Reset Winsock.\n3. Restart router."

    with patch("app.services.llm_service.LLMService.generate_troubleshooting_response", return_value=mock_ai_output):
        with TestClient(app) as client:
            payload = {"question": "My laptop connects to Wi-Fi but websites are not opening."}
            response = client.post("/api/tickets", json=payload)

            assert response.status_code == 201
            data = response.json()
            assert "id" in data
            assert data["question"] == payload["question"]
            assert "KNOWLEDGE BASE RESULT" in data["retrieved_context"]
            assert data["ai_response"] == mock_ai_output
            assert data["status"] == "completed"
            assert isinstance(data["retrieved_knowledge"], list)


def test_ticket_persistence_and_get_by_id():
    """Verify created ticket is persisted in database and readable via GET /api/tickets/{id}."""
    mock_ai_output = "Steps to fix VPN connection."

    with patch("app.services.llm_service.LLMService.generate_troubleshooting_response", return_value=mock_ai_output):
        with TestClient(app) as client:
            create_res = client.post("/api/tickets", json={"question": "VPN connection timed out when connecting from home."})
            assert create_res.status_code == 201
            ticket_id = create_res.json()["id"]

            get_res = client.get(f"/api/tickets/{ticket_id}")
            assert get_res.status_code == 200
            fetched_data = get_res.json()
            assert fetched_data["id"] == ticket_id
            assert fetched_data["question"] == "VPN connection timed out when connecting from home."
            assert fetched_data["ai_response"] == mock_ai_output


def test_llm_failure_handling_missing_key():
    """Verify LLM service returns safe fallback message when GEMINI_API_KEY is missing/empty."""
    with patch("app.core.config.settings.GEMINI_API_KEY", ""):
        fallback_msg = LLMService.generate_troubleshooting_response(
            question="My laptop connects to Wi-Fi but websites are not opening.",
            context="KNOWLEDGE BASE RESULT 1: Wi-Fi connected but no internet"
        )
        assert "AI service is temporarily unavailable" in fallback_msg
        assert "api_key" not in fallback_msg.lower()
        assert "traceback" not in fallback_msg.lower()
