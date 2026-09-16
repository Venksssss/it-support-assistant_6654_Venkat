import React, { useState } from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';

interface TicketFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  'Wi-Fi connected but websites not opening',
  'VPN times out from home network',
  'Printer queue stuck — nothing prints',
  'Outlook not receiving new emails',
];

const SAMPLE_FULL_QUESTIONS = [
  'My laptop connects to Wi-Fi but websites are not opening.',
  'VPN connection timed out when connecting from home.',
  'Documents sent to printer are stuck in print queue.',
  'Outlook is not receiving new emails and throws sync error.',
];

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length >= 5 && !isLoading) {
      onSubmit(question);
    }
  };

  const isShort = question.length > 0 && question.trim().length < 5;
  const pct = Math.round((question.length / 2000) * 100);
  const nearLimit = question.length > 1800;

  return (
    <div className="card" style={{ marginBottom: '0' }}>
      {/* Hero heading */}
      <div className="form-hero">
        <h2 className="form-hero-heading">How can we help?</h2>
        <p className="form-hero-sub">
          Describe your IT problem in detail and get AI-generated troubleshooting steps backed by our knowledge base.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-group" style={{ marginTop: '1.1rem' }}>
        <div className="textarea-wrapper">
          <textarea
            id="support-question"
            className="support-input"
            placeholder="e.g. My laptop connects to Wi-Fi but I cannot access any websites. Tried restarting the router but the problem persists."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            maxLength={2000}
            aria-label="Technical support question"
          />
        </div>

        <div className="char-counter">
          <span>
            {isShort && <span className="char-warn">Minimum 5 characters required</span>}
          </span>
          <span style={{ color: nearLimit ? 'var(--amber)' : undefined }}>
            {question.length}&thinsp;/&thinsp;2000
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            id="submit-ticket-btn"
            type="submit"
            className="btn-primary"
            disabled={isLoading || question.trim().length < 5}
          >
            {isLoading ? (
              <>Processing…</>
            ) : (
              <>
                Get Troubleshooting Help
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Sample questions */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <p className="sample-prompts-label">
          <Lightbulb size={11} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
          Quick examples — click to use
        </p>
        <div className="sample-prompts">
          {SAMPLE_QUESTIONS.map((label, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-pill"
              onClick={() => setQuestion(SAMPLE_FULL_QUESTIONS[idx])}
              disabled={isLoading}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
