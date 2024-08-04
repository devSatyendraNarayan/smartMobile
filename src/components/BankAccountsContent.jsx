// src/components/BankAccountsContent.js
import React, { useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/alert";
import { useSave } from "../context/SaveContext";
import { useTheme } from "../context/ThemeContext";
import { useIfsc } from "../context/IfscContext";
import { where } from "firebase/firestore";

const BankAccountsContent = () => {
  const [ifscCode, setIfscCode] = useState("");
  const { ifscDetails, fetchIfscDetails } = useIfsc();
  const { createDocument, getDocuments } = useSave();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [selectedOption, setSelectedOption] = useState("bankAccounts");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    // Validate phone number to be 10 digits and remove leading zeros
    if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const checkDuplicateAccount = useCallback(
    async (accountNumber) => {
      try {
        const querySnapshot = await getDocuments("bankAccounts", [
          where("accountNumber", "==", accountNumber),
        ]);
        return querySnapshot.length > 0;
      } catch (error) {
        console.error("Error checking for duplicates:", error);
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 3000);
        return false;
      }
    },
    [getDocuments]
  );

  const handleFetchDetails = useCallback(() => {
    if (!ifscCode) {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
      return;
    }
    fetchIfscDetails(ifscCode.toUpperCase());
  }, [ifscCode, fetchIfscDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format phone number: remove leading zeros
    let formattedPhoneNumber = formData.phoneNumber.replace(/^0+/, "");
    if (formattedPhoneNumber.length > 10) {
      formattedPhoneNumber = formattedPhoneNumber.slice(0, 10);
    }

    const updatedFormData = {
      ...formData,
      phoneNumber: formattedPhoneNumber,
      bankName: formData.bankName || ifscDetails?.BANK || "",
      ifscCode: ifscCode.toUpperCase(),
    };

    setFormData(updatedFormData);

    if (validateForm()) {
      try {
        const isDuplicate = await checkDuplicateAccount(formData.accountNumber);

        if (isDuplicate) {
          setShowDuplicateAlert(true);
          setTimeout(() => setShowDuplicateAlert(false), 3000);
          return;
        }

        await createDocument(selectedOption, {
          ...updatedFormData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setFormData({
          bankName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          accountHolderName: "",
          phoneNumber: "",
        });
        setErrors({});
        setShowErrorAlert(false);
        setShowDuplicateAlert(false);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } catch (error) {
        console.error("Error saving document:", error);
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 3000);
      }
    } else {
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showErrorAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to add account details. Please try again.
          </AlertDescription>
        </Alert>
      )}
      {showDuplicateAlert && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This account number already exists.
          </AlertDescription>
        </Alert>
      )}
      {showSuccessAlert && (
        <Alert variant="success">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Account details added successfully.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <input
          type="text"
          name="ifscCode"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Enter IFSC code"
        />
        {errors.ifscCode && (
          <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleFetchDetails}
        className={`w-full py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          theme === "dark"
            ? "bg-indigo-400 text-gray-100"
            : "bg-indigo-600 text-white"
        }`}
      >
        Fetch Details
      </button>

      <div>
        <input
          type="text"
          name="bankName"
          value={formData.bankName || ifscDetails?.BANK || ""}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Enter Bank name"
        />
      </div>

      <div>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Enter account number"
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="confirmAccountNumber"
          value={formData.confirmAccountNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Confirm account number"
        />
        {errors.confirmAccountNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmAccountNumber}
          </p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Account Holder name"
        />
      </div>

      <div>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            theme === "dark"
              ? "bg-gray-800 text-gray-100 border-gray-600"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          placeholder="Enter phone number"
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
        )}
      </div>

      <button
        type="submit"
        className={`w-full py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          theme === "dark"
            ? "bg-indigo-400 text-gray-100"
            : "bg-indigo-600 text-white"
        }`}
      >
        Add Account Details
      </button>
    </form>
  );
};

export default BankAccountsContent;
