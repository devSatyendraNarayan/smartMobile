import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/alert";
import { useSave } from "../context/SaveContext";
import { Toaster, toast } from 'react-hot-toast';

const BankAccountsContent = () => {
  const { createDocument, getDocuments } = useSave();
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    amount: "",
  });

  const [errors, setErrors] = useState({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateAccount = async (accountNumber) => {
    try {
      const querySnapshot = await getDocuments("bankAccounts", {
        where: [["accountNumber", "==", accountNumber]],
      });

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      setShowErrorAlert(true);
      toast.error("Error checking for duplicate accounts");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const isDuplicate = await checkDuplicateAccount(formData.accountNumber);

        if (isDuplicate) {
          setShowDuplicateAlert(true);
          toast.error("This account number already exists");
          return;
        }

        await createDocument("bankAccounts", {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // Reset form after submission
        setFormData({
          bankName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          accountHolderName: "",
          amount: "",
        });
        setShowErrorAlert(false);
        setShowDuplicateAlert(false);
        toast.success("Account details added successfully");
      } catch (error) {
        console.error("Error saving document:", error);
        setShowErrorAlert(true);
        toast.error("Failed to add account details. Please try again.");
      }
    } else {
      toast.error("Please correct the errors in the form");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Toaster position="bottom-center" />

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

      <div>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter Bank name"
        />
      </div>

      <div>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          name="ifscCode"
          value={formData.ifscCode}
          onChange={handleChange}
          className="w-full px-4  bg-white text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter IFSC code"
        />
      </div>

      <div>
        <input
          type="text"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          className="w-full bg-white text-gray-800 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Account Holder name"
        />
      </div>

      <div>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full px-4 bg-white text-gray-800 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter amount"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Account Details
      </button>
    </form>
  );
};

export default BankAccountsContent;