import { Ticket, KnowledgeItem, HealthStatus } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error('Service health check failed');
  }
  return res.json();
}

export async function createTicket(question: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    if (res.status === 422) {
      const errorData = await res.json();
      const detail = errorData.detail?.[0]?.msg || 'Question must be at least 5 characters long.';
      throw new Error(detail);
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate troubleshooting response. Please try again.');
  }

  return res.json();
}

export async function getTicketById(id: number): Promise<Ticket> {
  const res = await fetch(`${API_BASE_URL}/tickets/${id}`);
  if (!res.ok) {
    throw new Error(`Ticket #${id} not found.`);
  }
  return res.json();
}

export async function getRecentTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API_BASE_URL}/tickets`);
  if (!res.ok) {
    throw new Error('Failed to fetch recent tickets.');
  }
  return res.json();
}

export async function getKnowledgeBase(): Promise<KnowledgeItem[]> {
  const res = await fetch(`${API_BASE_URL}/knowledge`);
  if (!res.ok) {
    throw new Error('Failed to fetch knowledge base.');
  }
  return res.json();
}
