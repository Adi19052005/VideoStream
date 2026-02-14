import React from 'react';
import '../styles/Error.css';

const Error = ({ message, onDismiss }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <p className="error-message">{message}</p>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;
