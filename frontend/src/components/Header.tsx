import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HealthStatus } from '../types';

interface HeaderProps {
  health: HealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-icon">
          <Terminal size={17} color="#2dd4bf" />
        </div>
        <div className="header-title-group">
          <h1>IT Support Assistant</h1>
          <p>AI-powered technical troubleshooting</p>
        </div>
      </div>

      {health ? (
        <div className="status-badge">
          <div className="status-dot" />
          Backend Online
        </div>
      ) : (
        <div className="status-badge offline">
          <AlertTriangle size={11} />
          Backend Offline
        </div>
      )}
    </header>
  );
};
