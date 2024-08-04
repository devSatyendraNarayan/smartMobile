import React, { useEffect, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useSave } from "../context/SaveContext";
import { useTransfer } from "../context/TransferContext";
import { format } from "date-fns";
import { Toaster, toast } from "react-hot-toast";
import { FaSearch, FaSort, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function TransferMoneyPage() {
  const { getDocuments } = useSave();
  const { addToToday } = useTransfer();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedCard, setSelectedCard] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState({
    amount: "",
    senderName: "",
    paymentGatewayName: "",
    transferCharges: "",
    status: "pending",
  });

  const navigate = useNavigate(); // Use navigate hook for routing

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const todayDocs = await getDocuments("Today");
        const previousDaysDocs = await getDocuments("Previous Days");
        setDocuments([...todayDocs, ...previousDaysDocs]);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to fetch documents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [getDocuments]);

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.accountNumber.includes(searchTerm) ||
      doc.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    const dateA =
      a.updatedAt && typeof a.updatedAt.toDate === "function"
        ? a.updatedAt.toDate()
        : new Date(a.updatedAt);
    const dateB =
      b.updatedAt && typeof b.updatedAt.toDate === "function"
        ? b.updatedAt.toDate()
        : new Date(b.updatedAt);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCardClick = (doc) => {
    setSelectedCard(doc);
    setAdditionalInfo({
      amount: doc.amount || "",
      senderName: doc.senderName || "",
      paymentGatewayName: doc.paymentGatewayName || "",
      transferCharges: doc.transferCharges || "",
      status: doc.status || "pending",
    });
  };

  const handleInputChange = (e) => {
    setAdditionalInfo({
      ...additionalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedDoc = {
        ...selectedCard,
        ...additionalInfo,
        updatedAt: new Date(),
      };
      await addToToday("Transfer", updatedDoc);
      toast.success("Transfer information updated successfully!");
      setSelectedCard(null);
      // Refresh the documents list
      const updatedDocs = documents.map((doc) =>
        doc.id === updatedDoc.id ? updatedDoc : doc
      );
      setDocuments(updatedDocs);
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update transfer information.");
    }
  };

  const formatDate = (date) => {
    if (date && typeof date.toDate === "function") {
      return format(date.toDate(), "PPpp");
    } else if (date instanceof Date) {
      return format(date, "PPpp");
    } else {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const renderDocumentList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {sortedDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-base-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer relative overflow-hidden"
            onClick={() => handleCardClick(doc)}
          >
            <div className={`absolute top-0 left-0 w-2 h-full ${getStatusColor(doc.status)}`}></div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Account No: {doc.accountNumber}</span>
                <span className={`text-sm font-medium ${getStatusTextColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">{doc.accountHolderName}</div>

              <div className="text-sm text-gray-500">{doc.bankName}</div>
              <div className="text-sm">₹{doc.amount || "N/A"}</div>
              <div className="mt-4 text-xs text-gray-400">
                Updated: {formatDate(doc.updatedAt)}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 w-full bg-secondary text-white px-4 py-2 rounded-full hover:bg-secondary-focus transition-colors duration-300 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(doc);
              }}
            >
              <FaEdit className="mr-2" />
              Edit Details
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderAdditionalInfoForm = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full m-4"
      >
        <h2 className="text-2xl font-bold mb-4">Edit Transfer Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Amount
            </label>
            <input
              type="text"
              name="amount"
              value={additionalInfo.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Sender Name
            </label>
            <input
              type="text"
              name="senderName"
              value={additionalInfo.senderName}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Payment Gateway
            </label>
            <input
              type="text"
              name="paymentGatewayName"
              value={additionalInfo.paymentGatewayName}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Transfer Charges
            </label>
            <input
              type="text"
              name="transferCharges"
              value={additionalInfo.transferCharges}
              onChange={handleInputChange}
              className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500">
              Status
            </label>
            <select
              name="status"
              value={additionalInfo.status}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setSelectedCard(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Save
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <main className="container mx-auto py-12 px-4 relative z-10">
        <Breadcrumbs />
        <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Transfer Money
        </h1>
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transfers..."
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-focus transition-colors duration-300"
          >
            <FaSort className="mr-2" />
            {sortOrder === "asc" ? "Oldest First" : "Newest First"}
          </motion.button>
        </div>
        {renderDocumentList()}
        <AnimatePresence>
          {selectedCard && renderAdditionalInfoForm()}
        </AnimatePresence>
        <Toaster position="bottom-center" />
      </main>
    </div>
  );
}

export default TransferMoneyPage;
