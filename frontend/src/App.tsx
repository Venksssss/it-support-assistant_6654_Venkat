import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TicketForm } from './components/TicketForm';
import { LoadingState } from './components/LoadingState';
import { ErrorAlert } from './components/ErrorAlert';
import { ResponseView } from './components/ResponseView';
import { RecentTickets } from './components/RecentTickets';
import { Ticket, HealthStatus } from './types';
import { checkHealth, createTicket, getRecentTickets, getTicketById } from './services/api';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Poll/check backend health and fetch initial tickets
  useEffect(() => {
    fetchHealth();
    fetchRecentTicketsList();
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setHealth(null);
    }
  };

  const fetchRecentTicketsList = async () => {
    try {
      const list = await getRecentTickets();
      setRecentTickets(list);
    } catch (err) {
      // Backend may be starting up
    }
  };

  const handleAskSupport = async (question: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const ticket = await createTicket(question);
      setActiveTicket(ticket);
      await fetchRecentTicketsList();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while contacting support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecentTicket = async (id: number) => {
    setError(null);
    try {
      const ticket = await getTicketById(id);
      setActiveTicket(ticket);
    } catch (err: any) {
      setError(err.message || `Failed to load ticket #${id}`);
    }
  };

  const handleReset = () => {
    setActiveTicket(null);
    setError(null);
  };

  return (
    <div className="container">
      <Header health={health} />

      <div className="app-grid">
        <div>
          <TicketForm onSubmit={handleAskSupport} isLoading={isLoading} />

          {error && <ErrorAlert message={error} />}

          {isLoading && <LoadingState />}

          {!isLoading && activeTicket && (
            <ResponseView ticket={activeTicket} onReset={handleReset} />
          )}
        </div>

        <div>
          <RecentTickets
            tickets={recentTickets}
            onSelectTicket={handleSelectRecentTicket}
            activeTicketId={activeTicket?.id}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
