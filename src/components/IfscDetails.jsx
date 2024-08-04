import React, { useState } from 'react';
import { useIfsc } from '../context/IfscContext';
import { motion } from 'framer-motion';
import { FaSearch, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Breadcrumbs from './Breadcrumbs';

const IfscDetails = () => {
  const [ifscCode, setIfscCode] = useState('');
  const { ifscDetails, error, fetchIfscDetails } = useIfsc();

  const handleFetchDetails = () => {
    if (!ifscCode) {
      toast.error('Please enter an IFSC code');
      return;
    }
    fetchIfscDetails(ifscCode);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-6">
      <Breadcrumbs/>
      <div className="max-w-3xl mx-auto bg-base-100 rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">IFSC Code Details</h2>
        <div className="flex mb-6">
          <input
            type="text"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            placeholder="Enter IFSC code"
            className="flex-grow px-4 py-2 rounded-l-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFetchDetails}
            className="bg-primary text-white px-6 py-2 rounded-r-lg flex items-center"
          >
            <FaSearch className="mr-2" /> Fetch
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-error mb-4"
          >
            {error}
          </motion.p>
        )}

        {ifscDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-base-200 rounded-lg p-6"
          >
            <h3 className="text-2xl font-semibold mb-4 text-secondary">Bank Details</h3>
            {Object.entries(ifscDetails).map(([key, value]) => (
              <div key={key} className="mb-3 flex items-center justify-between">
                <span className="font-medium text-base-content">{key}:</span>
                <div className="flex items-center">
                  <span className="text-base-content mr-2">{value}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(value)}
                    className="text-primary hover:text-secondary"
                  >
                    <FaCopy />
                  </motion.button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IfscDetails;