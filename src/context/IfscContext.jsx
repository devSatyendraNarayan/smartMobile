// src/context/IfscContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const IfscContext = createContext();

export const IfscProvider = ({ children }) => {
  const [ifscDetails, setIfscDetails] = useState(null);
  const [error, setError] = useState('');

  const fetchIfscDetails = useCallback(async (ifscCode) => {
    setError('');
    setIfscDetails(null);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setIfscDetails(data);
    } catch (error) {
      setError('Failed to fetch details or invalid IFSC code');
    }
  }, []);

  const validateIfscCode = (ifscCode) => {
    const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return IFSC_REGEX.test(ifscCode);
  };

  return (
    <IfscContext.Provider value={{ ifscDetails, error, fetchIfscDetails, validateIfscCode }}>
      {children}
    </IfscContext.Provider>
  );
};

export const useIfsc = () => useContext(IfscContext);
