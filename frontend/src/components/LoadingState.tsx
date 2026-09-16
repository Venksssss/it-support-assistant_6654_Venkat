import React from 'react';
import { Cpu, Search, Sparkles, Database } from 'lucide-react';

interface LoadingStateProps {
  /** 'submit' = new ticket being processed; 'fetch' = loading a historical ticket from DB */
  mode?: 'submit' | 'fetch';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ mode = 'submit' }) => {
  if (mode === 'fetch') {
    return (
      <div className="loading-box" style={{ marginTop: '1.25rem' }}>
        <div className="spinner" />
        <p className="loading-heading">Loading ticket details</p>
        <div className="loading-steps-list">
          <div className="loading-step-row">
            <Database size={14} color="#2dd4bf" />
            <span>Fetching persisted ticket from database…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-box" style={{ marginTop: '1.25rem' }}>
      <div className="spinner" />
      <p className="loading-heading">Processing your request</p>
      <div className="loading-steps-list">
        <div className="loading-step-row">
          <Cpu size={14} color="#2dd4bf" />
          <span>Analyzing technical question…</span>
        </div>
        <div className="loading-step-row">
          <Search size={14} color="#2dd4bf" />
          <span>Searching IT knowledge base…</span>
        </div>
        <div className="loading-step-row">
          <Sparkles size={14} color="#2dd4bf" />
          <span>Generating AI troubleshooting guide…</span>
        </div>
      </div>
    </div>
  );
};
