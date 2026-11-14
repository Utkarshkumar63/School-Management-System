import React from 'react';

export function Badge({ status, variant, children, style = {} }) {
  const value = status || children;

  let badgeVariant = variant || 'neutral';

  if (!variant && typeof value === 'string') {
    const lower = value.toLowerCase();
    if (['present', 'paid', 'success', 'passed', 'active'].includes(lower)) {
      badgeVariant = 'success';
    } else if (['late', 'partially paid', 'pending', 'warning'].includes(lower)) {
      badgeVariant = 'warning';
    } else if (['absent', 'failed', 'overdue', 'cancelled', 'inactive', 'danger'].includes(lower)) {
      badgeVariant = 'danger';
    } else if (['excused', 'admin', 'teacher', 'guardian', 'info'].includes(lower)) {
      badgeVariant = 'info';
    }
  }

  return (
    <span className={`badge badge-${badgeVariant}`} style={style}>
      {children || status}
    </span>
  );
}

