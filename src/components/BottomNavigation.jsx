import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BottomNavigation = () => {
  const { theme } = useTheme();

  return (
    <nav className="fixed bottom-0 w-full bg-base-100 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16 items-center">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-primary' : 'text-base-content'}`
            }
          >
            <Home className="h-6 w-6" />
            <span className="text-sm">Home</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-primary' : 'text-base-content'}`
            }
          >
            <Settings className="h-6 w-6" />
            <span className="text-sm">Settings</span>
          </NavLink>
          {/* Add more navigation items here */}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;