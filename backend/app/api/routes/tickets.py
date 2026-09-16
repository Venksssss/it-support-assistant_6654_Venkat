from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.ticket import TicketCreate, TicketResponse
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    """
    Create a new technical support ticket.
    Flow: Validate -> Search KB -> Query Gemini LLM -> Store Ticket -> Return Response
    """
    try:
        return TicketService.create_ticket(db, ticket_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your support ticket."
        )

@router.get("", response_model=List[TicketResponse])
def get_recent_tickets(limit: int = 10, db: Session = Depends(get_db)):
    """Get list of recent tickets."""
    return TicketService.get_recent_tickets(db, limit)

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get a stored ticket by ID."""
    ticket = TicketService.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket #{ticket_id} not found."
        )
    return ticket
