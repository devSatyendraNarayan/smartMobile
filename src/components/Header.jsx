import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <nav className="bg-base-100 shadow-md z-50 w-full fixed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to='/home' className="cursor-pointer">
              {" "}
              <h1 className="  text-2xl font-bold text-base-content">
                Smart Mobile
              </h1>
            </Link>
          </div>
          <div>
            <span className="text-base-content">
              Welcome,{" "}
              <span className="font-bold">{user?.displayName || "Admin"}</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
