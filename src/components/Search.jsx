// src/components/Search.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSave } from "../context/SaveContext";
import { SearchIcon, XCircleIcon, CreditCard, Phone, Send, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import debounce from 'lodash/debounce';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from "../context/ThemeContext";
import AddModal from "./AddModal";  // Import the AddModal component

const SearchResult = ({ doc, onRemove, collectionName }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleClick = () => {
    navigate(`/details/${collectionName}/${doc.id}`);
  };

  const renderContent = () => {
    const commonClasses = `text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`;
    switch (collectionName) {
      case "bankAccounts":
        return (
          <>
            <CreditCard className={`mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{doc.accountHolderName}</h3>
            <p className={commonClasses}>Account: •••• {doc.accountNumber.slice(-4)}</p>
            <p className={commonClasses}>Bank: {doc.bankName}</p>
          </>
        );
      case "phoneNumbers":
        return (
          <>
            <Phone className={`mb-2 ${theme === 'dark' ? 'text-green-300' : 'text-green-500'}`} size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{doc.name}</h3>
            <p className={commonClasses}>Phone: {doc.phoneNumber}</p>
            <p className={commonClasses}>Platform: {doc.platform}</p>
          </>
        );
      case "upiTransfers":
        return (
          <>
            <Send className={`mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`} size={20} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{doc.username}</h3>
            <p className={commonClasses}>UPI ID: {doc.upiId}</p>
          </>
        );
      default:
        return <p>Unknown collection type</p>;
    }
  };

  return (
    <div
      className={` shadow-sm rounded-lg p-4 mb-4 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border border-white' : 'bg-white'}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {renderContent()}
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} mt-2`}>
            Updated: {format(new Date(doc.updatedAt.toDate()), "PPpp")}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(doc.id);
            }}
            className={`text-red-400 hover:text-red-600 transition-colors duration-300 ${theme === 'dark' ? 'text-red-300' : 'text-red-400'}`}
            aria-label="Remove item"
          >
            <XCircleIcon size={20} />
          </button>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mt-2`}>
            ₹{doc.amount}
          </p>
        </div>
      </div>
      <div className={`absolute bottom-0 right-0 p-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`}>
        <ChevronRight size={20} />
      </div>
    </div>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("bankAccounts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  const { getDocuments, deleteDocument } = useSave();

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const documents = await getDocuments(selectedCollection);
        const filteredDocs = documents.filter((doc) =>
          Object.values(doc).some((value) =>
            value.toString().toLowerCase().includes(query.toLowerCase())
          )
        );
        setResults(filteredDocs);
        if (filteredDocs.length === 0) {
          // toast.error("No results found");
        }
      } catch (error) {
        console.error("Error searching documents:", error);
        setError("Failed to search items. Please try again.");
        toast.error("Failed to search items. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300),
    [selectedCollection, getDocuments]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleRemove = useCallback(
    async (docId) => {
      try {
        await deleteDocument(selectedCollection, docId);
        setResults((prevResults) =>
          prevResults.filter((doc) => doc.id !== docId)
        );
        toast.success("Item removed successfully");
      } catch (error) {
        console.error("Error removing document:", error);
        setError("Failed to remove item. Please try again.");
        toast.error("Failed to remove item. Please try again.");
      }
    },
    [selectedCollection, deleteDocument]
  );

  return (
    <div className={`max-w-3xl mx-auto p-6 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <Toaster position="bottom-center" />
      <div className={`shadow-lg rounded-xl p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-6">Search Records</h2>
        <div className="mb-6">
          <label htmlFor="collection-select" className="block text-sm font-medium mb-2">
            Select Collection
          </label>
          <select
            id="collection-select"
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value);
              toast.success(`Switched to ${e.target.value} collection`);
            }}
            className={`w-full p-3 border rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300`}
            aria-label="Select Collection"
          >
            <option value="bankAccounts">Bank Accounts</option>
            <option value="phoneNumbers">Phone Numbers</option>
            <option value="upiTransfers">UPI Transfers</option>
          </select>
        </div>

        <div className="relative mb-6">
          <label className={`input input-bordered flex items-center gap-2 p-3 rounded-md shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <SearchIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className={`grow outline-none ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
              aria-label="Search"
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
        </div>
      )}

      {error && (
        <p className="text-red-500 mb-4 text-center">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className={`bg-gray-100 rounded-xl p-6 shadow-inner ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          {results.map((doc) => (
            <SearchResult
              key={doc.id}
              doc={doc}
              onRemove={handleRemove}
              collectionName={selectedCollection}
            />
          ))}
        </div>
      )}

      {query.trim() && !loading && results.length === 0 && (
        <div className="text-center mt-4">
          <p className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No results found
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'}`}
          >
            Add
          </button>
        </div>
      )}

      {/* Modal Component */}
      {isModalOpen && (
        <AddModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Search;
