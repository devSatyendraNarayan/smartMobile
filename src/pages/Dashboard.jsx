import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import TabButton from '../components/TabButton';
import BankAccountsContent from '../components/BankAccountsContent';
import UPIContent from '../components/UPIContent';
import PhoneNumberContent from '../components/PhoneNumberContent';
import { Alert } from '../components/alert';
import { motion } from 'framer-motion';
import Search from '../components/Search';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bank-accounts');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutAlert(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bank-accounts':
        return <BankAccountsContent />;
      case 'upi-id':
        return <UPIContent />;
      case 'phone-number':
        return <PhoneNumberContent />;
      default:
        return <div>Select a tab to view its content.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-800">Smart Mobile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 tooltip tooltip-bottom" data-tip={user?.email}>
                Welcome, <span className="font-bold">{user?.displayName || 'Admin'}</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 transition-colors duration-200"
                aria-label="Logout"
              >
                <LogOut className="h-6 w-6" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 px-5">
        <Breadcrumbs />
        <Search/>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-2"
          >
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600">
                <h2 className="text-xl font-semibold text-white">Transfer Money</h2>
              </div>
              <div className="p-6">
                <div className="flex space-x-4 mb-6 ">
                  <TabButton icon="CreditCard" label="Bank Accounts"  tab="bank-accounts" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton icon="DollarSign" label="UPI ID" tab="upi-id" activeTab={activeTab} setActiveTab={setActiveTab} />
                  <TabButton icon="Smartphone" label="Phone Number" tab="phone-number" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div className="mt-4">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1"
          >
          </motion.div>
        </div>
      </main>
      {showLogoutAlert && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-72">
          <AlertDescription>
            Failed to logout. Please try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;
