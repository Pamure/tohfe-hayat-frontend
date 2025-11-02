// src/pages/RequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, X, Search, Heart, Loader2, HandHeart } from 'lucide-react';
import { CreateDonationForm } from '../components/CreateDonationForm'; // <-- 1. IMPORT

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RequestsPage = ({ showToast }) => {
  const [showForm, setShowForm] = useState(false); // For creating a request
  const [showFulfillForm, setShowFulfillForm] = useState(false); // <-- 2. NEW STATE
  const [fulfillInitialData, setFulfillInitialData] = useState({}); // <-- 3. NEW STATE

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({ city: '', blood_group: '', organ_needed: '' });
  const { token, user } = useAuth(); // <-- 4. GET USER

  const [formData, setFormData] = useState({
    requester_name: '', age: '', blood_group: '', organ_needed: '', contact: '', city: ''
  });

  const fetchRequests = async () => {
    // ... (This function is the same as before) ...
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.blood_group) params.append('blood_group', filters.blood_group);
    if (filters.organ_needed) params.append('organ_needed', filters.organ_needed);
    try {
      const res = await fetch(`${API_BASE_URL}/requests?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
      else showToast(data.message || 'Failed to fetch requests', 'error');
    } catch (error) {
      showToast('Network error while fetching requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchRequests(); }, [token]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = () => fetchRequests();

  // This is for CREATING A REQUEST
  const handleSubmitRequest = async (e) => {
    // ... (This function is the same as before) ...
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === 'matched') showToast('Request created and an immediate match was found!', 'success');
        else showToast(data.message || 'Request created successfully!', 'success');
        setShowForm(false);
        setFormData({ requester_name: '', age: '', blood_group: '', organ_needed: '', contact: '', city: '' });
        fetchRequests();
      } else {
        showToast(data.message || 'Failed to create request', 'error');
      }
    } catch (error) {
      showToast('Network error while creating request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. NEW FUNCTION TO OPEN THE FULFILL FORM ---
  const handleOpenFulfillForm = (request) => {
    // Pre-fill the form with the request's organ and the user's info
    setFulfillInitialData({
      organ: request.organ_needed, // <-- Pre-fill the organ
      donor_name: user?.full_name || '',
      blood_group: user?.blood_group || '',
      contact: user?.phone || '',
      city: user?.city || '',
      availability_date: '' // Leave date blank
    });
    setShowFulfillForm(true); // Show the donation form
    setShowForm(false); // Hide the request form
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Available Requests</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowFulfillForm(false); // <-- 6. Hide other form
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Create Request'}
        </button>
      </div>

      {/* --- CREATE REQUEST FORM --- */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideIn">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">New Request Form</h3>
          <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... (Request form inputs are the same) ... */}
            <input name="requester_name" type="text" placeholder="Requester Name" value={formData.requester_name} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <input name="blood_group" type="text" placeholder="Blood Group" value={formData.blood_group} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <input name="organ_needed" type="text" placeholder="Organ Needed" value={formData.organ_needed} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <input name="contact" type="tel" placeholder="Contact" value={formData.contact} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- 7. RENDER THE FULFILL FORM --- */}
      {showFulfillForm && (
        <CreateDonationForm
          token={token}
          showToast={showToast}
          initialData={fulfillInitialData}
          onComplete={() => {
            setShowFulfillForm(false);
            fetchRequests(); // Refresh the requests list
          }}
        />
      )}

      {/* --- FILTER BAR (same) --- */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {/* ... (filter logic is the same) ... */}
        <div className="flex items-center gap-2 mb-4"> <Filter size={20} className="text-gray-600" /> <h3 className="text-lg font-semibold text-gray-800">Filter Requests</h3> </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input name="city" type="text" placeholder="City" value={filters.city} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <input name="blood_group" type="text" placeholder="Blood Group" value={filters.blood_group} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <input name="organ_needed" type="text" placeholder="Organ Needed" value={filters.organ_needed} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <button onClick={handleFilterSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"> <Search size={18} /> Search </button>
        </div>
      </div>

      {/* --- REQUEST LIST --- */}
      {loading ? (
        <div className="text-center py-12"> <Loader2 className="inline-block animate-spin text-blue-600" size={48} /> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 flex flex-col justify-between">
              {/* Card content (same) */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div> <h3 className="text-xl font-bold text-blue-600">{request.organ_needed}</h3> <p className="text-sm text-gray-500">Blood: {request.blood_group}</p> </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"> Pending </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">Requester:</span> {request.requester_name}</p>
                  <p><span className="font-medium">Age:</span> {request.age}</p>
                  <p><span className="font-medium">City:</span> {request.city}</p>
                  <p><span className="font-medium">Contact:</span> {request.contact}</p>
                </div>
              </div>

              {/* --- 8. NEW "FULFILL" BUTTON --- */}
              {user?.id !== request.requester_user_id && (
                <button
                  onClick={() => handleOpenFulfillForm(request)}
                  className="w-full mt-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                >
                  <HandHeart size={18} />
                  Fulfill This Request
                </button>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Heart size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No requests found.</h3>
              <p>Try adjusting your filters or create a new request.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
