import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

const funnyMessages = [
  "Oops! The internet took a coffee break.",
  "Houston, we have a connection problem!",
  "The internet is playing hide and seek.",
  "Your Wi-Fi is on a vacation.",
  "The internet gremlins are at it again!",
];

const NoInternetConnection = () => {
  const [message, setMessage] = useState(funnyMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
      <div className="text-center p-8 bg-white bg-opacity-20 rounded-lg backdrop-blur-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <WifiOff className="w-24 h-24 mx-auto mb-6 text-yellow-300" />
        </motion.div>
        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No Internet Connection
        </motion.h1>
        <motion.p
          className="text-xl mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-300 text-purple-700 font-semibold py-2 px-4 rounded-full hover:bg-yellow-400 transition duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NoInternetConnection;