import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="error-panel" style={{ marginTop: '1.25rem' }}>
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.05rem' }} />
      <div>
        <strong>Unable to process support request</strong>
        <span>{message}</span>
      </div>
    </div>
  );
};
