import React from 'react';

export function Spinner({ size = '2rem', text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '0.85rem',
      }}
    >
      <div className="spinner" style={{ width: size, height: size }} />
      {text && <p style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 600 }}>{text}</p>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = '1.25rem', style = {}, count = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: '100%', height, ...style }} />
      ))}
    </div>
  );
}

