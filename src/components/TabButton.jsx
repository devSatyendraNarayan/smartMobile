import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Smartphone } from 'lucide-react';

const iconMap = {
  CreditCard: CreditCard,
  DollarSign: DollarSign,
  Smartphone: Smartphone,
};

const TabButton = ({ icon, label, tab, activeTab, setActiveTab }) => {
  const Icon = iconMap[icon];
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
        activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </motion.button>
  );
};

export default TabButton;
