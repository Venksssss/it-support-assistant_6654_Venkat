import React from 'react';
import { Cpu, Search, Sparkles } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="loading-box">
      <div className="spinner"></div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>
        Processing Support Request
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '320px' }}>
        <div className="loading-steps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={16} color="#3b82f6" />
          <span>Analyzing your technical question...</span>
        </div>
        <div className="loading-steps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} color="#3b82f6" />
          <span>Searching local IT knowledge base...</span>
        </div>
        <div className="loading-steps" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#3b82f6" />
          <span>Generating AI troubleshooting guide...</span>
        </div>
      </div>
    </div>
  );
};
