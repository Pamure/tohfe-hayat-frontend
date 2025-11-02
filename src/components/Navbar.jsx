// src/components/Navbar.jsx
import React from 'react';
import { Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// This component receives the 'currentPage' and 'setCurrentPage'
// functions from its parent (App.jsx)
export const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth(); // Get user and logout function

  // Helper to create a nav button
  const NavButton = ({ page, label, icon }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => setCurrentPage(page)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all
          ${isActive
            ? 'bg-teal-100 text-teal-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
          }
        `}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">

          {/* Logo/Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('donations')}>
            <Heart className="text-teal-600" size={32} fill="currentColor" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Tohfe Hayat
            </h1>
          </div>

          {/* Navigation Links (only shown if user is logged in) */}
          {user && (
            <div className="flex items-center gap-4">
              <NavButton
                page="donations"
                label="Donations"
              />
              <NavButton
                page="requests"
                label="Requests"
              />
              <NavButton
                page="dashboard"
                label="Dashboard"
                icon={<User size={18} />}
              />
              <button
                onClick={logout} // <-- Use the logout function from our context
                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};
