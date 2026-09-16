import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="error-panel">
      <AlertCircle size={20} style={{ flexShrink: 0 }} />
      <div>
        <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
          Unable to process support request
        </strong>
        <span style={{ fontSize: '0.85rem' }}>{message}</span>
      </div>
    </div>
  );
};
