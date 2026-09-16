import React from 'react';
import { Ticket } from '../types';
import { History, ChevronRight } from 'lucide-react';

interface RecentTicketsProps {
  tickets: Ticket[];
  onSelectTicket: (id: number) => void;
  activeTicketId?: number;
}

export const RecentTickets: React.FC<RecentTicketsProps> = ({ tickets, onSelectTicket, activeTicketId }) => {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="card">
        <div className="card-title">
          <History size={18} color="#3b82f6" />
          Recent Tickets
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No support tickets created yet. Submit a question to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <History size={18} color="#3b82f6" />
        Recent Tickets ({tickets.length})
      </div>

      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        {tickets.map((ticket) => {
          const isActive = ticket.id === activeTicketId;
          return (
            <div
              key={ticket.id}
              className="recent-ticket-item"
              style={{
                borderColor: isActive ? 'var(--accent-primary)' : undefined,
                backgroundColor: isActive ? 'var(--bg-hover)' : undefined
              }}
              onClick={() => onSelectTicket(ticket.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  #{ticket.id}
                </span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
              <p className="recent-ticket-question">{ticket.question}</p>
              <div className="recent-ticket-meta">
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span style={{ color: 'var(--success-text)' }}>{ticket.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
