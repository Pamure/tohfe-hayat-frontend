import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, X, Search, Heart, Loader2, HandHeart } from 'lucide-react';
import { CreateDonationForm } from '../components/CreateDonationForm'; // For fulfilling
import { CreateRequestForm } from '../components/CreateRequestForm';   // <-- IMPORT NEW

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const RequestsPage = ({ showToast }) => {
  const [showForm, setShowForm] = useState(false); // For creating a request
  const [showFulfillForm, setShowFulfillForm] = useState(false);
  const [fulfillInitialData, setFulfillInitialData] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null); // <-- NEW: To pass request ID

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', blood_group: '', organ_needed: '' });
  const { token, user } = useAuth();

  // --- All this logic is now GONE ---
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [formData, setFormData] = useState({...});
  // const handleChange = (e) => ...
  // const handleSubmitRequest = async (e) => ...
  // (It's all inside CreateRequestForm now!)

  const fetchRequests = async () => {
    setLoading(true);
    const params = new URLSearchParams(filters);
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

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleFilterSubmit = () => fetchRequests();

  // This function is for a DONOR manually clicking "Fulfill"
  const handleOpenFulfillForm = (request) => {
    setSelectedRequestId(request.id); // <-- Store the request ID
    setFulfillInitialData({
      organ: request.organ_needed,
      donor_name: user?.full_name || '',
      blood_group: user?.blood_group || '',
      contact: user?.phone || '',
      city: user?.city || '',
      availability_date: '',
      requestId: request.id // <-- Pass the request ID to the form
    });
    setShowFulfillForm(true);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Available Requests</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setShowFulfillForm(false);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Create Request'}
        </button>
      </div>

      {/* --- This now renders our "smart" request form --- */}
      {showForm && (
        <CreateRequestForm
          token={token}
          showToast={showToast}
          onComplete={() => {
            setShowForm(false);
            fetchRequests();
          }}
        />
      )}

      {/* --- This now renders the "smart" donation form for FULFILLING --- */}
      {showFulfillForm && (
        <CreateDonationForm
          token={token}
          showToast={showToast}
          initialData={fulfillInitialData} // <-- This now includes the requestId
          onComplete={() => {
            setShowFulfillForm(false);
            fetchRequests(); // Refresh the requests list
          }}
        />
      )}

      {/* --- FILTER BAR (Unchanged) --- */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {/* ... (filter JSX) ... */}
        <div className="flex items-center gap-2 mb-4"> <Filter size={20} className="text-gray-600" /> <h3 className="text-lg font-semibold text-gray-800">Filter Requests</h3> </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input name="city" type="text" placeholder="City" value={filters.city} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <input name="blood_group" type="text" placeholder="Blood Group" value={filters.blood_group} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <input name="organ_needed" type="text" placeholder="Organ Needed" value={filters.organ_needed} onChange={handleFilterChange} className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          <button onClick={handleFilterSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"> <Search size={18} /> Search </button>
        </div>
      </div>

      {/* --- REQUEST LIST (Unchanged) --- */}
      {loading ? (
        <div className="text-center py-12"> <Loader2 className="inline-block animate-spin text-blue-600" size={48} /> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200 flex flex-col justify-between">
              <div>
                {/* ... (card content) ... */}
                <div className="flex items-start justify-between mb-4"> <div> <h3 className="text-xl font-bold text-blue-600">{request.organ_needed}</h3> <p className="text-sm text-gray-500">Blood: {request.blood_group}</p> </div> <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"> Pending </div> </div> <div className="space-y-2 text-sm text-gray-600 mb-4"> <p><span className="font-medium">Requester:</span> {request.requester_name}</p> <p><span className="font-medium">Age:</span> {request.age}</p> <p><span className="font-medium">City:</span> {request.city}</p> <p><span className="font-medium">Contact:</span> {request.contact}</p> </div>
              </div>

              {/* This "Fulfill" button is correct */}
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};
