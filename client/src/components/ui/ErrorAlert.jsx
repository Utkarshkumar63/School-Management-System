import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorAlert({ message = 'An error occurred while loading data.', onRetry }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(254, 242, 242, 0.85)',
        border: '1px solid rgba(254, 202, 202, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        margin: '1rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={24} color="#dc2626" />
        <span style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.95rem' }}>{message}</span>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" icon={<RefreshCw size={14} />}>
          Retry
        </Button>
      )}
    </div>
  );
}

