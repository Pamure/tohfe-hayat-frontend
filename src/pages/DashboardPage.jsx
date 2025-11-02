// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Mail, Phone, MapPin, Droplet, Loader2, CheckCircle, Clock } from 'lucide-react';
import { MatchDetailModal } from '../components/MatchDetailModal'; // <-- IMPORT OUR NEW MODAL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const DashboardPage = ({ showToast }) => {
  const { user, token } = useAuth(); // Get user and token

  // State for our data
  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Fetch all user activity
  const fetchMyActivity = async () => {
    setLoading(true);
    try {
      // Fetch both endpoints at the same time
      const [donationsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/donations/my-activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/requests/my-activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const donationsData = await donationsRes.json();
      const requestsData = await requestsRes.json();

      if (donationsRes.ok) setMyDonations(donationsData.donations || []);
      else showToast(donationsData.message || 'Failed to get donations', 'error');

      if (requestsRes.ok) setMyRequests(requestsData.requests || []);
      else showToast(requestsData.message || 'Failed to get requests', 'error');

    } catch (error) {
      showToast('Network error fetching activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the page loads
  useEffect(() => {
    if (token) {
      fetchMyActivity();
    }
  }, [token]);

  // --- Modal Functions ---
  const handleOpenModal = (matchData) => {
    setSelectedMatch(matchData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  // Helper component for user info
  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-gray-600 font-medium">{label}</span>
      </div>
      <span className="text-gray-800 font-semibold">{value || 'Not set'}</span>
    </div>
  );

  return (
    <>
      {/* --- RENDER THE MODAL --- */}
      <MatchDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        matchData={selectedMatch}
      />

      <div className="space-y-8">
        {/* --- User Profile Card (Same as before) --- */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800">{user?.full_name}</h3>
              <p className="text-lg text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <InfoRow icon={<Mail size={18} className="text-gray-500" />} label="Email" value={user?.email} />
            <InfoRow icon={<Phone size={18} className="text-gray-500" />} label="Phone" value={user?.phone} />
            <InfoRow icon={<Droplet size={18} className="text-gray-500" />} label="Blood Group" value={user?.blood_group} />
            <InfoRow icon={<MapPin size={18} className="text-gray-500" />} label="City" value={user?.city} />
          </div>
        </div>

        {/* --- "My Activity" Section (NEW) --- */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin text-teal-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* --- MY DONATIONS COLUMN --- */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">My Donations</h3>
              {myDonations.length === 0 ? (
                <p className="text-gray-500">You have not created any donations.</p>
              ) : (
                myDonations.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-5 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-teal-600">{item.organ}</span>
                      <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status === 'pending' ? <Clock size={14} /> : <CheckCircle size={14} />}
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">For: {item.donor_name} in {item.city}</p>
                    {item.status === 'accepted' && (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="w-full text-sm mt-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                      >
                        View Recipient Contact
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* --- MY REQUESTS COLUMN --- */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">My Requests</h3>
              {myRequests.length === 0 ? (
                <p className="text-gray-500">You have not created any requests.</p>
              ) : (
                myRequests.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-5 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-blue-600">{item.organ_needed}</span>
                      <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status === 'pending' ? <Clock size={14} /> : <CheckCircle size={14} />}
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">For: {item.requester_name} in {item.city}</p>
                    {item.status === 'matched' && (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="w-full text-sm mt-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                      >
                        View Donor Contact
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};
