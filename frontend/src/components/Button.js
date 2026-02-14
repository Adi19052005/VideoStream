import React from 'react';
import '../styles/Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${
    loading ? 'loading' : ''
  }`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className="spinner-small"></span> : null}
      {children}
    </button>
  );
};

export default Button;
