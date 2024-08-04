import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSave } from "../context/SaveContext";
import { SearchIcon, XCircleIcon, CreditCard, Phone, Send, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import debounce from 'lodash/debounce';
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from 'react-hot-toast';

const SearchResult = ({ doc, onRemove, collectionName }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/details/${collectionName}/${doc.id}`);
  };

  const renderContent = () => {
    const commonClasses = "text-sm text-gray-600";
    switch (collectionName) {
      case "bankAccounts":
        return (
          <>
            <CreditCard className="text-blue-500 mb-2" size={20} />
            <h3 className="text-lg font-semibold">{doc.accountHolderName}</h3>
            <p className={commonClasses}>Account: •••• {doc.accountNumber.slice(-4)}</p>
            <p className={commonClasses}>Bank: {doc.bankName}</p>
          </>
        );
      case "phoneNumbers":
        return (
          <>
            <Phone className="text-green-500 mb-2" size={20} />
            <h3 className="text-lg font-semibold">{doc.name}</h3>
            <p className={commonClasses}>Phone: {doc.phoneNumber}</p>
            <p className={commonClasses}>Platform: {doc.platform}</p>
          </>
        );
      case "upiTransfers":
        return (
          <>
            <Send className="text-purple-500 mb-2" size={20} />
            <h3 className="text-lg font-semibold">{doc.username}</h3>
            <p className={commonClasses}>UPI ID: {doc.upiId}</p>
          </>
        );
      default:
        return <p>Unknown collection type</p>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white shadow-sm rounded-lg p-4 mb-4 hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          {renderContent()}
          <p className="text-xs text-gray-400 mt-2">
            Updated: {format(new Date(doc.updatedAt.toDate()), "PPpp")}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(doc.id);
            }}
            className="text-red-400 hover:text-red-600 transition-colors duration-300"
            aria-label="Remove item"
          >
            <XCircleIcon size={20} />
          </button>
          <p className="text-lg font-bold text-green-600 mt-2">₹{doc.amount}</p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 p-2 text-blue-500">
        <ChevronRight size={20} />
      </div>
    </motion.div>
  );
};

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("bankAccounts");

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
          toast.error("No results found");
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
    <div className="max-w-3xl mx-auto p-6">
      <Toaster position="bottom-center" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Search Records</h2>
        <div className="mb-6">
          <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Collection
          </label>
          <select
            id="collection-select"
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value);
              toast.success(`Switched to ${e.target.value} collection`);
            }}
            className="w-full bg-white text-gray-800 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            aria-label="Select Collection"
          >
            <option value="bankAccounts">Bank Accounts</option>
            <option value="phoneNumbers">Phone Numbers</option>
            <option value="upiTransfers">UPI Transfers</option>
          </select>
        </div>

        <div className="relative mb-6">
          <label className="input input-bordered bg-white flex items-center gap-2 p-3 rounded-md shadow-sm">
            <SearchIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="grow outline-none text-gray-800"
              aria-label="Search"
            />
          </label>
        </div>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 mb-4 text-center"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-100 rounded-xl p-6 shadow-inner"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Search Results</h2>
            {results.map((doc) => (
              <SearchResult
                key={doc.id}
                doc={doc}
                onRemove={handleRemove}
                collectionName={selectedCollection}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {query.trim() && !loading && results.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-center mt-4"
        >
          No results found
        </motion.p>
      )}
    </div>
  );
};

export default Search;