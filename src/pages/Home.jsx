import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave } from "react-icons/fa";
import { MdTaskAlt } from "react-icons/md";
import { CiCircleList } from "react-icons/ci";
import { GiPayMoney } from "react-icons/gi";
import { AiFillProduct } from "react-icons/ai";
import { TbListDetails } from "react-icons/tb";
import { useTheme } from '../context/ThemeContext';
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import { BsGraphUpArrow } from "react-icons/bs";
const cards = [
  { icon: BsGraphUpArrow , text: "Transaction Report", path: "/transaction" },

  { icon: FaMoneyBillWave, text: "Transfer Money", path: "/transfer-money" },
  { icon: MdOutlineScreenSearchDesktop, text: "IFSC Search", path: "/Bank-details" },
  { icon: TbListDetails, text: "Customer Details", path: "/customers-details" },
  { icon: AiFillProduct, text: "Sales", path: "/sales" },
  { icon: GiPayMoney, text: "Expenses", path: "/expenses" },
  { icon: CiCircleList, text: "Lists", path: "/lists" },
  { icon: MdTaskAlt, text: "Tasks", path: "/tasks" },
];

function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary rounded-full"
            style={{
              width: Math.random() * 10 + 5 + "px",
              height: Math.random() * 10 + 5 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-4xl font-bold mb-12 text-base-content text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Dashboard
          </span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl shadow-xl bg-base-100 cursor-pointer backdrop-blur-sm bg-opacity-80 border border-base-300"
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(card.path)}
            >
              <div className="flex items-center mb-4">
                <card.icon className="text-5xl mr-4 text-primary" />
                <p className="text-xl font-semibold text-base-content">{card.text}</p>
              </div>

              <motion.div
                className="w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;