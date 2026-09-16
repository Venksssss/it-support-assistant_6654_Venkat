import React from 'react';
import { Ticket } from '../types';
import { Clock, ChevronRight, History } from 'lucide-react';

interface RecentTicketsProps {
  tickets: Ticket[];
  onSelectTicket: (id: number) => void;
  activeTicketId?: number;
  /** True while GET /api/tickets/{id} is in-flight — dims the list to prevent double-clicks */
  isLoadingTicket?: boolean;
}

export const RecentTickets: React.FC<RecentTicketsProps> = ({
  tickets,
  onSelectTicket,
  activeTicketId,
  isLoadingTicket = false,
}) => {
  return (
    <div className="sidebar-card">
      <div className="sidebar-header">
        <History size={13} />
        {isLoadingTicket ? 'Fetching from database…' : 'Ticket History'}
        {tickets.length > 0 && !isLoadingTicket && (
          <span className="sidebar-header-count">{tickets.length}</span>
        )}
      </div>

      {tickets.length === 0 ? (
        <p className="sidebar-empty">
          No tickets yet. Submit a question to get started.
        </p>
      ) : (
        <div
          className="sidebar-ticket-list"
          style={isLoadingTicket ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
        >
          {tickets.map((ticket) => {
            const isActive = ticket.id === activeTicketId;
            return (
              <div
                key={ticket.id}
                className={`recent-ticket-item${isActive ? ' active' : ''}`}
                onClick={() => !isLoadingTicket && onSelectTicket(ticket.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => !isLoadingTicket && e.key === 'Enter' && onSelectTicket(ticket.id)}
                title={`View ticket #${ticket.id} — loads persisted data from database`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="recent-ticket-num">TICKET #{ticket.id}</span>
                  <ChevronRight size={12} color="var(--text-muted)" />
                </div>
                <p className="recent-ticket-question">{ticket.question}</p>
                <div className="recent-ticket-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} />
                    {new Date(ticket.created_at).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className="recent-ticket-status">{ticket.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
