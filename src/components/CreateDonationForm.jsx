// src/components/CreateDonationForm.jsx
import React, { useState, useEffect } from 'react'; // <-- Keep useEffect, we need it
import { Loader2, CheckCircle, X, HandHeart } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const CreateDonationForm = ({ token, showToast, onComplete, initialData = {} }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState([]);

  // --- THIS IS THE FIX ---
  // We initialize the state directly from initialData.
  // This function ONLY runs ONCE when the component is first created.
  const [formData, setFormData] = useState({
    donor_name: initialData.donor_name || '',
    age: initialData.age || '',
    blood_group: initialData.blood_group || '',
    organ: initialData.organ || '',
    contact: initialData.contact || '',
    city: initialData.city || '',
    availability_date: initialData.availability_date || ''
  });

  // --- THIS useEffect IS NOW FIXED ---
  // It ONLY runs if the initialData prop *itself* changes
  // (e.g., you close a "Fulfill" form and open a new one).
  // It will NOT run on every // keystroke anymore.
  // useEffect(() => {
  //   setFormData({
  //     donor_name: initialData.donor_name || '',
  //     age: initialData.age || '',
  //     blood_group: initialData.blood_group || '',
  //     organ: initialData.organ || '',
  //     contact: initialData.contact || '',
  //     city: initialData.city || '',
  //     availability_date: initialData.availability_date || ''
  //   });
  // }, [initialData]); // The dependency array is correct. My original bug was in useState.

  // --- (The rest of your code is correct) ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitCheck = async (e) => {
    e.preventDefault();
    setIsChecking(true);

    if (initialData.requestId) {
      await handleFulfillRequest(initialData.requestId);
      setIsChecking(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/donations/check-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.matches?.length > 0) {
        setMatches(data.matches);
      } else {
        showToast('No immediate matches found. Creating your donation.', 'info');
        await handleCreateNewDonation();
      }
    } catch (error) {
      showToast('Error checking matches. Creating new donation anyway.', error);
      await handleCreateNewDonation();
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateNewDonation = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('New donation created successfully!', 'success');
        onComplete();
      } else {
        showToast(data.message || 'Failed to create donation', 'error');
      }
    } catch (error) {
      showToast('Network error while creating donation', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfillRequest = async (requestId) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${requestId}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Match fulfilled successfully!', 'success');
        onComplete();
      } else {
        showToast(data.message || 'Failed to fulfill request', 'error');
      }
    } catch (error) {
      showToast('Network error while fulfilling request', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- (RENDER LOGIC is the same) ---
  if (matches.length > 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-slideIn">
          {/* ... Modal content ... */}
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
               <CheckCircle size={24} /> {matches.length} Match(es) Found!
             </h3>
             <button onClick={() => setMatches([])} className="text-gray-400 hover:text-gray-600">
               <X size={24} />
             </button>
          </div>
          <p className="text-gray-700 mb-6">
            Your donation for a **{formData.organ}** matches {matches.length} pending request(s).
            Would you like to fulfill one directly?
          </p>
          <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
            {matches.map(req => (
              <div key={req.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{req.organ_needed} in {req.city}</p>
                  <p className="text-sm text-gray-500">Requester: {req.requester_name} | Blood: {req.blood_group}</p>
                </div>
                <button
                  onClick={() => handleFulfillRequest(req.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Fulfill'}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateNewDonation}
            disabled={isSubmitting}
            className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'No thanks, create a new public donation'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideIn">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {initialData.organ ? `Fulfill Request for ${initialData.organ}` : 'New Donation Form'}
      </h3>
      <form onSubmit={handleSubmitCheck} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ... Form inputs ... */}
        <input name="donor_name" type="text" placeholder="Donor Name" value={formData.donor_name} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="blood_group" type="text" placeholder="Blood Group" value={formData.blood_group} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="organ" type="text" placeholder="Organ" value={formData.organ} onChange={handleChange} className={`px-4 py-3 rounded-lg border ${initialData.organ ? 'bg-gray-100' : ''}`} required readOnly={!!initialData.organ} />
        <input name="contact" type="tel" placeholder="Contact" value={formData.contact} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="availability_date" type="date" placeholder="Availability Date" value={formData.availability_date} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={isSubmitting || isChecking} className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {(isSubmitting || isChecking) ? <Loader2 className="animate-spin" size={20} /> : (initialData.organ ? 'Fulfill Request' : 'Submit Donation')}
          </button>
        </div>
      </form>
    </div>
  );
};
