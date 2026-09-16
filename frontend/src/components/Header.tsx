import React from 'react';
import { Bot, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HealthStatus } from '../types';

interface HeaderProps {
  health: HealthStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  return (
    <header className="header">
      <div className="header-title-group">
        <h1>
          <Bot size={32} color="#3b82f6" />
          AI IT SUPPORT ASSISTANT
        </h1>
        <p>Describe your technical problem and get guided troubleshooting steps.</p>
      </div>

      <div>
        {health ? (
          <div className="status-badge">
            <div className="status-dot"></div>
            Backend Online
          </div>
        ) : (
          <div className="status-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <AlertTriangle size={14} />
            Backend Offline
          </div>
        )}
      </div>
    </header>
  );
};
