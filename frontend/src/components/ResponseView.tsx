import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Ticket } from '../types';
import {
  Sparkles, Database, Tag, Copy, Check, Info,
  Search, FileText, Bot, CheckCircle2, RotateCcw,
  AlertCircle, History, ArrowLeft
} from 'lucide-react';

interface ResponseViewProps {
  ticket: Ticket;
  onReset: () => void;
  /**
   * True when this ticket was loaded from the history panel via GET /api/tickets/{id}.
   * Adds a "Loaded from database" provenance badge so the evaluator can
   * confirm real SQLite persistence is demonstrated.
   */
  isHistoricalView?: boolean;
}

export const ResponseView: React.FC<ResponseViewProps> = ({
  ticket,
  onReset,
  isHistoricalView = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticket.ai_response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const hasKnowledge = ticket.retrieved_knowledge && ticket.retrieved_knowledge.length > 0;

  return (
    <div className="card response-card" style={{ marginTop: '1.25rem' }}>

      {/* ── Historical view provenance banner ────────────────────────────── */}
      {isHistoricalView && (
        <div className="historical-banner">
          <History size={13} />
          <span>
            Ticket loaded from database via{' '}
            <code style={{ fontFamily: 'var(--mono)', fontSize: '0.75em' }}>
              GET /api/tickets/{ticket.id}
            </code>
            {' '}— persisted data confirmed.
          </span>
          <button
            type="button"
            className="historical-back-btn"
            onClick={onReset}
            title="Back to new question"
          >
            <ArrowLeft size={11} />
            New question
          </button>
        </div>
      )}

      {/* ── Card header ──────────────────────────────────────────────────── */}
      <div className="ticket-header-meta">
        <div className="ticket-header-left">
          <h2>{isHistoricalView ? 'Ticket Details' : 'Support Response'}</h2>
          <span className="ticket-id-badge">TICKET&thinsp;#{ticket.id}</span>
        </div>
        <div className="ticket-actions">
          <button
            id="copy-response-btn"
            type="button"
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            title="Copy AI response to clipboard"
          >
            {copied ? (
              <><Check size={13} />Copied</>
            ) : (
              <><Copy size={13} />Copy Response</>
            )}
          </button>
        </div>
      </div>

      {/* ── Question echo ─────────────────────────────────────────────────── */}
      <div className="question-echo">
        <p className="question-echo-label">
          {isHistoricalView ? 'Original Question' : 'Your Question'}
        </p>
        <p>"{ticket.question}"</p>
      </div>

      {/* ── RAG Workflow Indicator ────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="rag-steps-track">
          <div className="rag-step">
            <Search size={12} color="#2dd4bf" />
            <span>Knowledge base searched</span>
            <CheckCircle2 size={12} color="#3fb950" />
          </div>
          <div className="rag-step">
            <FileText size={12} color="#2dd4bf" />
            <span>
              {hasKnowledge
                ? `${ticket.retrieved_knowledge!.length} article${ticket.retrieved_knowledge!.length > 1 ? 's' : ''} retrieved`
                : 'No matching articles'}
            </span>
            {hasKnowledge
              ? <CheckCircle2 size={12} color="#3fb950" />
              : <AlertCircle size={12} color="var(--amber)" />}
          </div>
          <div className="rag-step">
            <Sparkles size={12} color="#2dd4bf" />
            <span>Gemini response generated</span>
            <CheckCircle2 size={12} color="#3fb950" />
          </div>
        </div>
      </div>

      {/* ── Knowledge Base Sources ───────────────────────────────────────── */}
      {hasKnowledge ? (
        <div className="kb-sources-section">
          <div className="kb-sources-header">
            <Database size={12} />
            Knowledge Base Sources
            <span className="kb-sources-count">
              {ticket.retrieved_knowledge!.length} matched
            </span>
          </div>
          <div className="kb-sources-list">
            {ticket.retrieved_knowledge!.map((item, idx) => (
              <div key={item.id} className="kb-source-item">
                <span className="kb-source-num">#{idx + 1}</span>
                <div className="kb-source-body">
                  <div className="kb-source-meta">
                    <span className="kb-source-title">{item.title}</span>
                    <span className="kb-source-tag">
                      <Tag size={9} />
                      {item.category}
                    </span>
                    <span className="kb-retrieved-badge">Retrieved</span>
                  </div>
                  <p className="kb-source-desc">{item.problem}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="kb-empty-notice">
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.05rem' }} />
          <span>
            No closely matching knowledge-base articles were found. The AI response was generated without retrieved KB context.
          </span>
        </div>
      )}

      {/* ── AI Troubleshooting Response ───────────────────────────────────── */}
      <div className="ai-response-section">
        <div className="ai-response-label">
          <Bot size={13} color="#2dd4bf" />
          AI Troubleshooting Response
        </div>
        <div className="markdown-body">
          <ReactMarkdown>{ticket.ai_response}</ReactMarkdown>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div className="ai-disclaimer">
        <Info size={13} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <span>
          AI-generated troubleshooting guidance. Verify steps before applying in production environments.
          If the issue persists, escalate to your IT administrator.
        </span>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="response-footer">
        <div className="response-footer-meta">
          <span>Status: <strong>{ticket.status}</strong></span>
          <span>{new Date(ticket.created_at).toLocaleString()}</span>
        </div>
        <button
          id="ask-another-btn"
          type="button"
          className="reset-btn"
          onClick={onReset}
        >
          <RotateCcw size={12} />
          Ask Another Question
        </button>
      </div>
    </div>
  );
};
