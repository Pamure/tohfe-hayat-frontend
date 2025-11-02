// src/App.jsx
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Toast } from './components/Toast';
import { Navbar } from './components/Navbar';

import { DonationsPage } from './pages/DonationsPage.jsx';
import { RequestsPage } from './pages/RequestsPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx'; // <-- IMPORT THE FINAL PAGE

function App() {
  const { user, token } = useAuth();
  const [toast, setToast]  = useState(null);
  const [currentPage, setCurrentPage] = useState('donations');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'donations':
        return <DonationsPage showToast={showToast} />;
      case 'requests':
        return <RequestsPage showToast={showToast} />;
      case 'dashboard':
        return <DashboardPage showToast={showToast} />;
      default:
        return <DonationsPage showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {(!user || !token) ? (
        <AuthPage showToast={showToast} />
      ) : (
        <>
          <Navbar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            {renderPage()}
          </main>
        </>
      )}

    </div>
  );
}

export default App;
