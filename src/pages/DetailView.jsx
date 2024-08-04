import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSave } from "../context/SaveContext";
import { useTransfer } from "../context/TransferContext";
import { format } from "date-fns";
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from "../context/ThemeContext";
import Breadcrumbs from "../components/Breadcrumbs";
import { FaCopy, FaEdit, FaSave, FaPlus } from "react-icons/fa";

const DetailView = () => {
  const { collectionName, docId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState("");

  const { getDocuments, updateDocument } = useSave();
  const { addToToday } = useTransfer();

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const documents = await getDocuments(collectionName);
        const doc = documents.find((doc) => doc.id === docId);
        setDocument(doc);
        setNewAmount(doc.amount);
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to fetch document. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, docId, getDocuments]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleAmountUpdate = async () => {
    try {
      await updateDocument(collectionName, docId, { amount: newAmount });
      setDocument({ ...document, amount: newAmount });
      setEditingAmount(false);
      toast.success("Amount updated successfully!");
    } catch (error) {
      console.error("Error updating amount:", error);
      toast.error("Failed to update amount. Please try again.");
    }
  };

  const handleAddToToday = async () => {
    if (document) {
      try {
        await addToToday(collectionName, document);
        toast.success("Document added to Today!");
      } catch (error) {
        console.error("Error adding document to Today:", error);
        toast.error("Document is already in the Today collection.");
      }
    }
  };

  const renderField = (label, value, isAmount = false) => (
    <div className="flex flex-col mb-4">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="flex items-center mt-1">
        {isAmount && editingAmount ? (
          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="text-lg font-semibold mr-2 border rounded px-2 py-1"
          />
        ) : (
          <span className="text-lg font-semibold mr-2">{value}</span>
        )}
        {isAmount && (
          <button
            onClick={() => editingAmount ? handleAmountUpdate() : setEditingAmount(true)}
            className="mr-2 text-primary hover:text-primary-focus transition-colors duration-300"
            title={editingAmount ? "Save" : "Edit"}
          >
            {editingAmount ? <FaSave /> : <FaEdit />}
          </button>
        )}
        <button
          onClick={() => copyToClipboard(value)}
          className="text-primary hover:text-primary-focus transition-colors duration-300"
          title="Copy to clipboard"
        >
          <FaCopy />
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!document) return null;

    const fields = {
      bankAccounts: [
        { label: "Account Holder", value: document.accountHolderName },
        { label: "Account Number", value: document.accountNumber },
        { label: "Bank Name", value: document.bankName },
        { label: "IFSC Code", value: document.ifscCode },
        { label: "Phone Number", value: document.phoneNumber },
      ],
      phoneNumbers: [
        { label: "Name", value: document.name },
        { label: "Phone Number", value: document.phoneNumber },
        { label: "Platform", value: document.platform },
      ],
      upiTransfers: [
        { label: "Username", value: document.username },
        { label: "UPI ID", value: document.upiId },
      ],
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {fields[collectionName].map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {renderField(field.label, field.value)}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!document) return <p className="text-gray-500 text-center">Document not found</p>;

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
          {collectionName === 'bankAccounts' && 'Bank Account Details'}
          {collectionName === 'phoneNumbers' && 'Phone Number Details'}
          {collectionName === 'upiTransfers' && 'UPI Transfer Details'}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-base-100 p-6 rounded-lg shadow-lg"
        >
          {renderContent()}
          <motion.div
            className="flex justify-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={handleAddToToday}
              className="bg-primary text-white px-4 py-2 rounded-full flex items-center hover:bg-primary-focus transition-colors duration-300"
            >
              <FaPlus className="mr-2" />
              Add to Today
            </button>
          </motion.div>
          <motion.p
            className="text-sm text-center mt-4 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Updated: {format(new Date(document.updatedAt.toDate()), "PPpp")}
          </motion.p>
        </motion.div>
      </main>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default DetailView;