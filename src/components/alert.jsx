// src/components/ui/alert.jsx

import React from 'react';
import PropTypes from 'prop-types';

export const Alert = ({ variant, className, children }) => {
  const variantStyles = {
    destructive: 'bg-red-100 text-red-700 border-red-400',
    // You can add more variants like 'success', 'warning', etc.
  };

  return (
    <div className={`border-l-4 p-4 ${variantStyles[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

export const AlertDescription = ({ children }) => (
  <p className="text-sm">
    {children}
  </p>
);

AlertDescription.propTypes = {
  children: PropTypes.node,
};
