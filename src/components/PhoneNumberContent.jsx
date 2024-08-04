import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/alert";
import { useSave } from "../context/SaveContext"; // Import the save context
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Import Firestore functions

const PhoneNumberContent = () => {
  const { createDocument } = useSave(); // Destructure createDocument from context
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    platform: "",
    amount: "",
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

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicatePhoneNumber = async (phoneNumber) => {
    const db = getFirestore();
    const phoneNumberCollection = collection(db, "phoneNumbers");
    const q = query(phoneNumberCollection, where("phoneNumber", "==", phoneNumber));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const isDuplicate = await checkDuplicatePhoneNumber(formData.phoneNumber);
        if (isDuplicate) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            phoneNumber: "This phone number already exists",
          }));
          setShowErrorAlert(true);
          return;
        }

        await createDocument("phoneNumbers", {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // Reset form after submission
        setFormData({
          name: "",
          phoneNumber: "",
          platform: "",
          amount: "",
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
            Failed to add phone number details. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter name"
        />
      </div>

      <div>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Paytm, PhonePe, Gpay etc.."
        />
      </div>

      <div>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter amount"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Phone Number
      </button>
    </form>
  );
};

export default PhoneNumberContent;
