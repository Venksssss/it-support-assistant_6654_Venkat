import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTIONS = """You are an IT Support Assistant.
Answer the user's technical support question using the provided knowledge-base context.

Rules:
1. Give practical troubleshooting steps clearly and step-by-step.
2. Prefer the retrieved knowledge context when relevant.
3. Do not invent company-specific policies.
4. If the context is insufficient, state what is known and ask clarifying questions if necessary.
5. Never claim you performed an action on the user's computer.
6. Keep the response professional, well-structured, and easy to follow."""

FALLBACK_MODELS = ["gemini-3.6-flash", "gemini-1.5-flash", "gemini-2.0-flash"]

class LLMService:
    @staticmethod
    def generate_troubleshooting_response(question: str, context: str) -> str:
        """
        Call Google Gemini API using configured model and API key.
        Handles errors gracefully without exposing sensitive credentials.
        """
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        configured_model = settings.GEMINI_MODEL or os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

        if not api_key:
            logger.warning("GEMINI_API_KEY is missing in settings or environment.")
            return (
                "AI service is temporarily unavailable. (Missing API Key configuration)\n\n"
                "Summary based on Knowledge Base:\n" + context
            )

        prompt = (
            f"{SYSTEM_INSTRUCTIONS}\n\n"
            f"USER QUESTION:\n{question}\n\n"
            f"RETRIEVED KNOWLEDGE:\n{context}\n\n"
            f"TROUBLESHOOTING RESPONSE:"
        )

        models_to_try = [configured_model] + [m for m in FALLBACK_MODELS if m != configured_model]

        # Attempt using google-genai SDK first
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            for m in models_to_try:
                try:
                    response = client.models.generate_content(
                        model=m,
                        contents=prompt
                    )
                    if response and hasattr(response, "text") and response.text:
                        return response.text.strip()
                except Exception as e:
                    logger.warning(f"google-genai SDK call for model {m} failed: {str(e)}")
        except ImportError:
            pass

        # Fallback to google-generativeai SDK
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=api_key)
            for m in models_to_try:
                try:
                    model = genai_legacy.GenerativeModel(m)
                    response = model.generate_content(prompt)
                    if response and hasattr(response, "text") and response.text:
                        return response.text.strip()
                except Exception as e:
                    logger.warning(f"google.generativeai SDK call for model {m} failed: {str(e)}")
        except ImportError:
            pass

        return "AI service is temporarily unavailable. Please try again."
