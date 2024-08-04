// src/components/DetailView.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSave } from "../context/SaveContext";
import { format } from "date-fns";
import { CreditCard, Phone, Send, Copy, CheckCircle, Edit, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from 'react-hot-toast';

const DetailView = () => {
  const { collectionName, docId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState("");

  const { getDocuments, updateDocument } = useSave();

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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${field} copied to clipboard!`, {
        icon: <CheckCircle className="text-green-500" />,
      });
    });
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

  const renderField = (label, value, icon, isAmount = false) => (
    <motion.div
      className="flex items-center justify-between bg-white rounded-lg p-4 shadow-md mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-2 text-gray-700">{label}:</span>
        {isAmount && editingAmount ? (

          <input
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            className="ml-2 border bg-white rounded px-2 py-1 w-24"
          />
        ) : (
          <span className="ml-2 font-semibold">{value}</span>
        )}
      </div>
      <div className="flex items-center">
        {isAmount && (
          <button
            onClick={() => editingAmount ? handleAmountUpdate() : setEditingAmount(true)}
            className={`mr-2 ${editingAmount ? 'text-green-500 hover:text-green-700' : 'text-blue-500 hover:text-blue-700'} transition-colors`}
          >
            {editingAmount ? <Save size={18} /> : <Edit size={18} />}
          </button>
        )}
        <button
          onClick={() => copyToClipboard(value, label)}
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Copy size={18} />
        </button>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    if (!document) return null;

    const commonFields = [
      { label: "Amount", value: `₹${document.amount}`, icon: <CreditCard className="text-green-500" size={18} />, isAmount: true },
    ];

    const fields = {
      bankAccounts: [
        { label: "Account Holder", value: document.accountHolderName, icon: <CreditCard className="text-blue-500" size={18} /> },
        { label: "Account Number", value: document.accountNumber, icon: <CreditCard className="text-blue-500" size={18} /> },
        { label: "Bank Name", value: document.bankName, icon: <CreditCard className="text-blue-500" size={18} /> },
        { label: "IFSC Code", value: document.ifscCode, icon: <CreditCard className="text-blue-500" size={18} /> },
        ...commonFields,
      ],
      phoneNumbers: [
        { label: "Name", value: document.name, icon: <Phone className="text-green-500" size={18} /> },
        { label: "Phone Number", value: document.phoneNumber, icon: <Phone className="text-green-500" size={18} /> },
        { label: "Platform", value: document.platform, icon: <Phone className="text-green-500" size={18} /> },
        ...commonFields,
      ],
      upiTransfers: [
        { label: "Username", value: document.username, icon: <Send className="text-purple-500" size={18} /> },
        { label: "UPI ID", value: document.upiId, icon: <Send className="text-purple-500" size={18} /> },
        ...commonFields,
      ],
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {fields[collectionName].map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {renderField(field.label, field.value, field.icon, field.isAmount)}
          </motion.div>
        ))}
      </motion.div>
    );
  };

  if (loading) return <motion.div className="flex justify-center items-center py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></motion.div>;
  if (error) return <motion.p className="text-red-500 mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.p>;
  if (!document) return <motion.p className="text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Document not found</motion.p>;

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {collectionName === 'bankAccounts' && 'Bank Account Details'}
        {collectionName === 'phoneNumbers' && 'Phone Number Details'}
        {collectionName === 'upiTransfers' && 'UPI Transfer Details'}
      </h1>
      {renderContent()}
      <motion.p
        className="text-sm text-gray-500 mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Updated: {format(new Date(document.updatedAt.toDate()), "PPpp")}
      </motion.p>
      <Toaster position="bottom-center" />
    </motion.div>
  );
};

export default DetailView;