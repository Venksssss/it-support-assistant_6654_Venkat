import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Ticket } from '../types';
import {
  Sparkles, Database, Tag, Copy, Check, Info,
  Search, FileText, Bot, CheckCircle2, RotateCcw, AlertCircle
} from 'lucide-react';

interface ResponseViewProps {
  ticket: Ticket;
  onReset: () => void;
}

export const ResponseView: React.FC<ResponseViewProps> = ({ ticket, onReset }) => {
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
    <div className="card response-card">

      {/* ── Header row: title + copy + ticket ID ─────────────────────────── */}
      <div className="ticket-header-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={20} color="#3b82f6" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff' }}>
            Support Response
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopy}
            title="Copy troubleshooting response"
          >
            {copied ? (
              <>
                <Check size={14} color="#34d399" />
                <span style={{ color: '#34d399' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Response</span>
              </>
            )}
          </button>
          <span className="ticket-id-badge">Ticket #{ticket.id}</span>
        </div>
      </div>

      {/* ── Question echo ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Your Question</p>
        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          "{ticket.question}"
        </p>
      </div>

      {/* ── RAG Workflow Indicator ────────────────────────────────────────── */}
      <div className="rag-pipeline">
        <div className="rag-step">
          <Search size={13} color="#34d399" />
          <span>Knowledge base searched</span>
          <CheckCircle2 size={13} color="#34d399" style={{ marginLeft: 'auto' }} />
        </div>
        <div className="rag-step">
          <FileText size={13} color="#34d399" />
          <span>
            {hasKnowledge
              ? `${ticket.retrieved_knowledge!.length} relevant article${ticket.retrieved_knowledge!.length > 1 ? 's' : ''} retrieved`
              : 'No closely matching articles found'}
          </span>
          {hasKnowledge
            ? <CheckCircle2 size={13} color="#34d399" style={{ marginLeft: 'auto' }} />
            : <AlertCircle size={13} color="var(--warning-text)" style={{ marginLeft: 'auto' }} />}
        </div>
        <div className="rag-step">
          <Sparkles size={13} color="#34d399" />
          <span>Gemini response generated</span>
          <CheckCircle2 size={13} color="#34d399" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* ── Knowledge Base Sources ───────────────────────────────────────── */}
      {hasKnowledge ? (
        <div className="kb-sources-section">
          <div className="kb-sources-header">
            <Database size={14} color="#3b82f6" />
            <span>Knowledge Base Sources</span>
            <span className="kb-sources-count">{ticket.retrieved_knowledge!.length} matched</span>
          </div>
          <div className="kb-sources-list">
            {ticket.retrieved_knowledge!.map((item, idx) => (
              <div key={item.id} className="kb-source-item">
                <div className="kb-source-meta">
                  <span className="kb-source-rank">#{idx + 1}</span>
                  <span className="kb-source-title">{item.title}</span>
                  <span className="kb-source-tag">
                    <Tag size={9} />
                    {item.category}
                  </span>
                  <span className="kb-retrieved-badge">Retrieved</span>
                </div>
                <p className="kb-source-desc">{item.problem}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="kb-empty-notice">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>
            No closely matching knowledge-base articles were found. The AI response was generated without retrieved KB context.
          </span>
        </div>
      )}

      {/* ── AI Troubleshooting Response ───────────────────────────────────── */}
      <div className="ai-response-section">
        <div className="ai-response-label">
          <Sparkles size={14} color="#3b82f6" />
          AI Troubleshooting Response
        </div>
        <div className="markdown-body">
          <ReactMarkdown>{ticket.ai_response}</ReactMarkdown>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div className="ai-disclaimer">
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>AI-generated troubleshooting guidance. If the issue persists, contact your IT administrator.</span>
      </div>

      {/* ── Footer: status + Ask Another ─────────────────────────────────── */}
      <div className="response-footer">
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Status: <strong style={{ color: 'var(--success-text)' }}>{ticket.status}</strong>
          &ensp;·&ensp;Created: {new Date(ticket.created_at).toLocaleString()}
        </span>
        <button type="button" className="reset-btn" onClick={onReset}>
          <RotateCcw size={13} />
          Ask Another Question
        </button>
      </div>
    </div>
  );
};
