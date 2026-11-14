import React from 'react';

export function Card({ title, subtitle, action, children, className = '', hover = true, style = {} }) {
  return (
    <div
      className={`glass-panel ${hover ? 'glass-panel-hover' : ''} ${className}`}
      style={{ padding: '1.5rem', ...style }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>{title}</h3>}
            {subtitle && (
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

