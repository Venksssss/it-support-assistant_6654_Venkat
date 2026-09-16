from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketResponse
from app.services.knowledge_service import KnowledgeService
from app.services.llm_service import LLMService

class TicketService:
    @staticmethod
    def create_ticket(db: Session, ticket_in: TicketCreate) -> TicketResponse:
        # 1. Search knowledge base
        knowledge_results, context_string = KnowledgeService.search(db, ticket_in.question)

        # 2. Call LLM for troubleshooting steps
        ai_response = LLMService.generate_troubleshooting_response(
            question=ticket_in.question,
            context=context_string
        )

        # 3. Store ticket in database
        db_ticket = Ticket(
            question=ticket_in.question,
            retrieved_context=context_string,
            ai_response=ai_response,
            status="completed"
        )
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)

        # 4. Construct response schema
        return TicketResponse(
            id=db_ticket.id,
            question=db_ticket.question,
            retrieved_context=db_ticket.retrieved_context,
            ai_response=db_ticket.ai_response,
            status=db_ticket.status,
            created_at=db_ticket.created_at,
            retrieved_knowledge=knowledge_results
        )

    @staticmethod
    def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
        return db.query(Ticket).filter(Ticket.id == ticket_id).first()

    @staticmethod
    def get_recent_tickets(db: Session, limit: int = 10) -> List[Ticket]:
        return db.query(Ticket).order_by(Ticket.id.desc()).limit(limit).all()
