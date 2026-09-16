export interface KnowledgeItem {
  id: number;
  title: string;
  problem: string;
  solution: string;
  keywords: string;
  category: string;
  created_at: string;
  score?: number;
}

export interface Ticket {
  id: number;
  question: string;
  retrieved_context: string;
  ai_response: string;
  status: string;
  created_at: string;
  retrieved_knowledge?: KnowledgeItem[];
}

export interface TicketCreatePayload {
  question: string;
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
}
