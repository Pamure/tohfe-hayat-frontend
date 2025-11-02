import React, { useState } from 'react';
import { Loader2, CheckCircle, X, HandHeart } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// This is a new "smart" component, just for requests.
export const CreateRequestForm = ({ token, showToast, onComplete }) => {
  // --- STATE ---
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matches, setMatches] = useState([]); // Holds matches for the modal
  const [formData, setFormData] = useState({
    requester_name: '', age: '', blood_group: '',
    organ_needed: '', contact: '', city: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: (The form's new onSubmit) ---
  // First, check for matches
  const handleSubmitCheck = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests/check-matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.matches?.length > 0) {
        setMatches(data.matches); // <-- SHOW THE MODAL!
      } else {
        // No matches found, so proceed to create a new one
        showToast('No immediate matches found. Creating your request.', 'info');
        await handleCreateNewRequest(); // <-- Call Step 2A
      }
    } catch (error) {
      showToast('Error checking matches. Creating new request anyway.', 'error');
      await handleCreateNewRequest(); // Fail-safe
    } finally {
      setIsChecking(false);
    }
  };

  // --- STEP 2 (Option A): Create a NEW request (the "dumb" route) ---
  const handleCreateNewRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/requests`, { // Calls the "dumb" create route
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('New request created successfully!', 'success');
        onComplete(); // Close form, refresh page
      } else {
        showToast(data.message || 'Failed to create request', 'error');
      }
    } catch (error) {
      showToast('Network error while creating request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STEP 2 (Option B): Accept a specific donation (from modal) ---
  const handleAcceptDonation = async (donationId) => {
    setIsSubmitting(true);
    try {
      // This is the manual "accept" route
      const res = await fetch(`${API_BASE_URL}/donations/${donationId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Donation accepted! A new request was not created.', 'success');
        onComplete(); // Close the form
      } else {
        showToast(data.message || 'Failed to accept donation', 'error');
      }
    } catch (error) {
      showToast('Network error while accepting donation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---

  // STAGE 2: If matches are found, show the modal
  if (matches.length > 0) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-slideIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <CheckCircle size={24} />
              {matches.length} Match(es) Found!
            </h3>
            <button onClick={() => setMatches([])} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <p className="text-gray-700 mb-6">
            Your request for a **{formData.organ_needed}** matches {matches.length} available donation(s).
            Would you like to accept one directly?
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
            {matches.map(don => (
              <div key={don.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{don.organ} in {don.city}</p>
                  <p className="text-sm text-gray-500">Donor: {don.donor_name} | Blood: {don.blood_group}</p>
                </div>
                <button
                  onClick={() => handleAcceptDonation(don.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Accept'}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateNewRequest} // Calls the "dumb" create route
            disabled={isSubmitting}
            className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'No thanks, create a new public request'}
          </button>
        </div>
      </div>
    );
  }

  // STAGE 1: Default view: The Form
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideIn">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">New Request Form</h3>
      <form onSubmit={handleSubmitCheck} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="requester_name" type="text" placeholder="Requester Name" value={formData.requester_name} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <input name="blood_group" type="text" placeholder="Blood Group" value={formData.blood_group} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <input name="organ_needed" type="text" placeholder="Organ Needed" value={formData.organ_needed} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <input name="contact" type="tel" placeholder="Contact" value={formData.contact} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" required />
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={isChecking || isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {(isChecking || isSubmitting) ? <Loader2 className="animate-spin" size={20} /> : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
