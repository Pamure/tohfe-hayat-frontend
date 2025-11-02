// src/pages/DonationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, X, Search, Heart, Loader2, HandHeart } from 'lucide-react';
import { CreateDonationForm } from '../components/CreateDonationForm'; // <-- 1. IMPORT

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const DonationsPage = ({ showToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', blood_group: '', organ: '' });
  const { token, user } = useAuth(); // <-- Get the user

  const fetchDonations = async () => {
    // ... (This function is the same as before) ...
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.blood_group) params.append('blood_group', filters.blood_group);
    if (filters.organ) params.append('organ', filters.organ);
    try {
      const res = await fetch(`${API_BASE_URL}/donations?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setDonations(data.donations || []);
      else showToast(data.message || 'Failed to fetch donations', 'error');
    } catch (error) {
      showToast('Network error while fetching donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchDonations(); }, [token]);
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = () => fetchDonations();

  // --- 2. NEW "ACCEPT" FUNCTION ---
  const handleAcceptDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to accept this donation? This will notify the donor.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/donations/${donationId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Donation accepted! Check your dashboard for details.', 'success');
        fetchDonations(); // Refresh the list
      } else {
        showToast(data.message || 'Failed to accept donation', 'error');
      }
    } catch (error) {
      showToast('Network error while accepting donation', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Available Donations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Create Donation'}
        </button>
      </div>

      {/* --- 3. USE THE NEW COMPONENT --- */}
      {showForm && (
        <CreateDonationForm
          token={token}
          showToast={showToast}
          onComplete={() => {
            setShowForm(false);
            fetchDonations();
          }}
        />
      )}

      {/* --- FILTER BAR (same) --- */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {/* ... (filter logic is the same) ... */}
        <div className="flex items-center gap-2 mb-4"> <Filter size={20} className="text-gray-600" /> <h3 className="text-lg font-semibold text-gray-800">Filter Donations</h3> </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input name="city" type="text" placeholder="City" value={filters.city} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" />
          <input name="blood_group" type="text" placeholder="Blood Group" value={filters.blood_group} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" />
          <input name="organ" type="text" placeholder="Organ" value={filters.organ} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" />
          <button onClick={handleFilterSubmit} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2"> <Search size={18} /> Search </button>
        </div>
      </div>

      {/* --- DONATION LIST --- */}
      {loading ? (
        <div className="text-center py-12"> <Loader2 className="inline-block animate-spin text-teal-600" size={48} /> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 flex flex-col justify-between">
              {/* Card content (same) */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div> <h3 className="text-xl font-bold text-teal-600">{donation.organ}</h3> <p className="text-sm text-gray-500">Blood: {donation.blood_group}</p> </div>
                  <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium"> Available </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Donor:</span> {donation.donor_name}</p>
                  <p><span className="font-medium">Age:</span> {donation.age}</p>
                  <p><span className="font-medium">City:</span> {donation.city}</p>
                  <p><span className="font-medium">Contact:</span> {donation.contact}</p>
                  <p><span className="font-medium">Date:</span> {new Date(donation.availability_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* --- 4. NEW "ACCEPT" BUTTON --- */}
              {user?.id !== donation.user_id && (
                <button
                  onClick={() => handleAcceptDonation(donation.id)}
                  className="w-full mt-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <HandHeart size={18} />
                  Accept This Donation
                </button>
              )}
            </div>
          ))}
          {donations.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No donations found.</h3>
              <p>Try adjusting your filters or be the first to create one!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
