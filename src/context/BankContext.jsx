// src/context/BankContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BankContext = createContext();

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};

export const BankProvider = ({ children }) => {
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const response = await axios.post(
          'https://india-bank-search.sameerkumar.website/api/',
          {
            q_bank: 'icici',
            q_branch: 'kalkaji market'
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        setBankData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBankData();
  }, []);

  return (
    <BankContext.Provider value={{ bankData, loading, error }}>
      {children}
    </BankContext.Provider>
  );
};
