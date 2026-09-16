import React, { useState } from 'react';
import { Send, HelpCircle } from 'lucide-react';

interface TicketFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUESTIONS = [
  "My laptop connects to Wi-Fi but websites are not opening.",
  "VPN connection timed out when connecting from home.",
  "Documents sent to printer are stuck in print queue.",
  "Outlook is not receiving new emails and throws sync error."
];

export const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim().length >= 5 && !isLoading) {
      onSubmit(question);
    }
  };

  const handlePillClick = (sample: string) => {
    setQuestion(sample);
  };

  return (
    <div className="card">
      <div className="card-title">
        <HelpCircle size={20} color="#3b82f6" />
        Ask For Help
      </div>

      <form onSubmit={handleSubmit} className="form-group">
        <div className="textarea-wrapper">
          <textarea
            className="support-input"
            placeholder="e.g. My laptop connects to Wi-Fi but I cannot access any websites."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            maxLength={2000}
          />
        </div>

        <div className="char-counter">
          <span>
            {question.trim().length < 5 && question.length > 0 && (
              <span style={{ color: '#f87171' }}>Minimum 5 characters required</span>
            )}
          </span>
          <span>{question.length} / 2000</span>
        </div>

        <div>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || question.trim().length < 5}
          >
            <Send size={16} />
            {isLoading ? 'Processing...' : 'Ask Support'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Try sample technical questions:
        </p>
        <div className="sample-prompts">
          {SAMPLE_QUESTIONS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-pill"
              onClick={() => handlePillClick(sample)}
              disabled={isLoading}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
