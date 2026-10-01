import React from 'react';
import './Button.css';

export default function Button({
  type = 'button',
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}
