import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun, FaSignOutAlt, FaUser, FaBell, FaLock } from 'react-icons/fa';

const SettingsPage = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold mb-6 text-base-content">Settings</h2>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <FaUser className="mr-2" /> Account
          </h3>
          <p className="text-base-content">
            Logged in as: <span className="font-semibold">{user?.displayName || 'Admin'}</span>
          </p>
          <p className="text-base-content">
            Email: <span className="font-semibold">{user?.email || 'admin@example.com'}</span>
          </p>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <FaBell className="mr-2" /> Preferences
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base-content">Theme</span>
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                onChange={toggleTheme}
                checked={theme === 'dark'}
                className="hidden"
              />
              <FaSun className="swap-on fill-current w-6 h-6 text-yellow-500" />
              <FaMoon className="swap-off fill-current w-6 h-6 text-gray-500" />
            </label>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <FaLock className="mr-2" /> Security
          </h3>
          <button className="btn btn-primary">Change Password</button>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">
            <FaSignOutAlt className="mr-2" /> Logout
          </h3>
          <button
            onClick={handleLogout}
            className="btn btn-error"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;