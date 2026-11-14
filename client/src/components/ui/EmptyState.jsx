import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon = <FolderOpen size={48} color="#9ca3af" />,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionText,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', color: '#374151', marginBottom: '0.35rem' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem', color: '#6b7280', maxWidth: '380px', marginBottom: actionText ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}
