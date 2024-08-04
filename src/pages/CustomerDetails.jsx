import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSave } from "../context/SaveContext";
import { format } from "date-fns";
import debounce from 'lodash/debounce';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from "../context/ThemeContext";
import Breadcrumbs from "../components/Breadcrumbs";
import { FaSearch, FaSort, FaCopy } from "react-icons/fa";

const CustomerCard = ({ customer, onRemove, collectionName }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleClick = () => {
    navigate(`/details/${collectionName}/${customer.id}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const renderContent = () => {
    const fields = {
      bankAccounts: [
        { label: "Account Holder", value: customer.accountHolderName },
        { label: "Account Number", value: customer.accountNumber },
        { label: "Bank Name", value: customer.bankName },
        { label: "IFSC Code", value: customer.ifscCode },
      ],
      phoneNumbers: [
        { label: "Name", value: customer.name },
        { label: "Phone Number", value: customer.phoneNumber },
        { label: "Platform", value: customer.platform },
      ],
      upiTransfers: [
        { label: "Username", value: customer.username },
        { label: "UPI ID", value: customer.upiId },
      ],
    };

    return fields[collectionName].map((field, index) => (
      <div key={index} className="flex flex-col mb-2">
        <span className="text-sm font-medium text-gray-500">{field.label}</span>
        <div className="flex items-center mt-1">
          <span className="text-lg font-semibold">{field.value}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(field.value);
            }}
            className="ml-2 text-primary hover:text-primary-focus transition-colors duration-300"
            title="Copy to clipboard"
          >
            <FaCopy />
          </button>
        </div>
      </div>
    ));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-base-100 p-6 rounded-lg shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}
      onClick={handleClick}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderContent()}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Updated: {format(new Date(customer.updatedAt.toDate()), "PPpp")}
      </div>
    </motion.div>
  );
};

const CustomerDetails = () => {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState("bankAccounts");
  const [sortOrder, setSortOrder] = useState("desc");
  const { theme } = useTheme();

  const { getDocuments, deleteDocument } = useSave();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const documents = await getDocuments(selectedCollection);
      setCustomers(documents);
      setFilteredCustomers(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to fetch customers. Please try again.");
      toast.error("Failed to fetch customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedCollection, getDocuments]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const debouncedSearch = useCallback(
    debounce((query) => {
      const filtered = customers.filter((customer) =>
        Object.values(customer).some((value) =>
          value.toString().toLowerCase().includes(query.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }, 300),
    [customers]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleRemove = useCallback(
    async (customerId) => {
      try {
        await deleteDocument(selectedCollection, customerId);
        setCustomers((prevCustomers) =>
          prevCustomers.filter((customer) => customer.id !== customerId)
        );
        setFilteredCustomers((prevFiltered) =>
          prevFiltered.filter((customer) => customer.id !== customerId)
        );
        toast.success("Customer removed successfully");
      } catch (error) {
        console.error("Error removing customer:", error);
        setError("Failed to remove customer. Please try again.");
        toast.error("Failed to remove customer. Please try again.");
      }
    },
    [selectedCollection, deleteDocument]
  );

  const handleSort = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    const sorted = [...filteredCustomers].sort((a, b) => {
      if (newSortOrder === "asc") {
        return new Date(a.updatedAt.toDate()) - new Date(b.updatedAt.toDate());
      } else {
        return new Date(b.updatedAt.toDate()) - new Date(a.updatedAt.toDate());
      }
    });
    setFilteredCustomers(sorted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <main className="container mx-auto py-12 px-4 relative z-10">
        <Breadcrumbs />
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
        >
          Customer Details
        </motion.h1>

        <div className="mb-6">
          <select
            value={selectedCollection}
            onChange={(e) => {
              setSelectedCollection(e.target.value);
              toast.success(`Switched to ${e.target.value} collection`);
            }}
            className="w-full p-3 border rounded-md shadow-sm bg-base-100 text-base-content focus:ring-primary focus:border-primary transition-all duration-300"
          >
            <option value="bankAccounts">Bank Accounts</option>
            <option value="phoneNumbers">Phone Numbers</option>
            <option value="upiTransfers">UPI Transfers</option>
          </select>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-grow mr-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSort}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-focus transition-colors duration-300"
          >
            <FaSort className="mr-2" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <AnimatePresence>
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onRemove={handleRemove}
              collectionName={selectedCollection}
            />
          ))}
        </AnimatePresence>

        {!loading && filteredCustomers.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No customers found</p>
        )}

        <Toaster position="bottom-center" />
      </main>
    </div>
  );
};

export default CustomerDetails;