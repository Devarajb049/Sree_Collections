import React from 'react';

const LoadingSpinner = ({ text = 'Loading Saree Collections...' }) => {
  return (
    <div className="loading-spinner-wrapper">
      <div className="traditional-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-core">⚜️</div>
      </div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
