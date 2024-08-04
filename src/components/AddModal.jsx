// src/components/AddModal.js
import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import BankAccountsContent from "./BankAccountsContent";
import PhoneNumberContent from "./PhoneNumberContent";
import UPIContent from "./UPIContent";

const AddModal = ({ onClose }) => {
  const [selectedOption, setSelectedOption] = useState("bankAccounts");
  const { theme } = useTheme();

  const renderForm = () => {
    switch (selectedOption) {
      case "bankAccounts":
        return <BankAccountsContent />;
      case "phoneNumbers":
        return <PhoneNumberContent />;
      case "upiTransfers":
        return <UPIContent />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${theme === 'dark' ? 'bg-opacity-75' : 'bg-opacity-50'}`}
      onClick={onClose}
    >
      <div
        className={`rounded-lg shadow-lg p-6 modal-box ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add New Record</h2>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className={`w-full p-3 border rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300`}
        >
          <option value="bankAccounts">Bank Accounts</option>
          <option value="phoneNumbers">Phone Numbers</option>
          <option value="upiTransfers">UPI Transfers</option>
        </select>
        <div className="mt-4">
          {renderForm()}
        </div>
        <button
          onClick={onClose}
          className={`mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${theme === 'dark' ? 'bg-red-400' : 'bg-red-500'}`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AddModal;
