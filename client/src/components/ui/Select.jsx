import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  { label, id, name, options = [], error, placeholder = 'Select an option', className = '', containerStyle = {}, ...props },
  ref
) {
  const selectId = id || name;

  return (
    <div style={{ marginBottom: '1rem', ...containerStyle }}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        ref={ref}
        id={selectId}
        name={name}
        className={`${error ? 'error' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

