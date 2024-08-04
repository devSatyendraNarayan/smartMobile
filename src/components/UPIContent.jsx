import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/alert";
import { useSave } from "../context/SaveContext"; // Import the save context
import { useTheme } from "../context/ThemeContext"; // Import the theme context
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore functions

const UPIContent = () => {
  const { createDocument } = useSave(); // Destructure createDocument from context
  const { theme } = useTheme(); // Get the current theme from context

  const [formData, setFormData] = useState({
    userName: "",
    upiId: "",
  });

  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "User name is required";
    }
    if (!formData.upiId.trim()) {
      newErrors.upiId = "UPI ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateUPI = async (upiId) => {
    const db = getFirestore();
    const upiCollection = collection(db, "upiTransfers");
    const q = query(upiCollection, where("upiId", "==", upiId));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const isDuplicate = await checkDuplicateUPI(formData.upiId);
        if (isDuplicate) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            upiId: "This UPI ID already exists",
          }));
          setShowErrorAlert(true);
          return;
        }

        await createDocument("upiTransfers", {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // Reset form after submission
        setFormData({
          userName: "",
          upiId: "",
        });
        setShowErrorAlert(false);
      } catch (error) {
        console.error("Error saving document:", error);
        setShowErrorAlert(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showErrorAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to add UPI transfer details. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
          placeholder="Enter user name"
        />
        {errors.userName && (
          <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="upiId"
          value={formData.upiId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
          placeholder="Enter UPI ID"
        />
        {errors.upiId && (
          <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-indigo-400 text-gray-100' : 'bg-indigo-600 text-white'}`}
      >
        Add UPI
      </button>
    </form>
  );
};

export default UPIContent;
