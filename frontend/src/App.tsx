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

  // Separate loading state for fetching a historical ticket by ID.
  // This keeps the form interactive while the GET /api/tickets/{id} is in-flight.
  const [isFetchingTicket, setIsFetchingTicket] = useState<boolean>(false);

  // Track whether the currently displayed ticket came from the history panel
  // so we can label it distinctly in ResponseView.
  const [isHistoricalView, setIsHistoricalView] = useState<boolean>(false);

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
    setActiveTicket(null);
    setIsHistoricalView(false);
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

  /**
   * Fetch a ticket by ID from the backend (GET /api/tickets/{id}).
   * This proves real DB persistence — the data is read fresh from SQLite,
   * not from any in-memory cache.
   */
  const handleSelectRecentTicket = async (id: number) => {
    setError(null);
    setIsFetchingTicket(true);
    setActiveTicket(null);
    try {
      const ticket = await getTicketById(id);
      setActiveTicket(ticket);
      setIsHistoricalView(true);
    } catch (err: any) {
      setError(err.message || `Failed to load ticket #${id} from database.`);
      setIsHistoricalView(false);
    } finally {
      setIsFetchingTicket(false);
    }
  };

  const handleReset = () => {
    setActiveTicket(null);
    setIsHistoricalView(false);
    setError(null);
  };

  // Show either the submission spinner or the ticket-fetch spinner
  const showLoadingPane = isLoading || isFetchingTicket;
  const loadingLabel = isFetchingTicket ? 'fetch' : 'submit';

  return (
    <div className="container">
      <Header health={health} />

      <div className="app-grid">
        <div>
          <TicketForm onSubmit={handleAskSupport} isLoading={isLoading} />

          {error && <ErrorAlert message={error} />}

          {showLoadingPane && <LoadingState mode={loadingLabel} />}

          {!showLoadingPane && activeTicket && (
            <ResponseView
              ticket={activeTicket}
              onReset={handleReset}
              isHistoricalView={isHistoricalView}
            />
          )}
        </div>

        <div>
          <RecentTickets
            tickets={recentTickets}
            onSelectTicket={handleSelectRecentTicket}
            activeTicketId={activeTicket?.id}
            isLoadingTicket={isFetchingTicket}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
