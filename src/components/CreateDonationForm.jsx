// src/components/CreateDonationForm.jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

export const CreateDonationForm = ({ token, showToast, onComplete, initialData = {} }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the initialData prop to set the form's default state
  const [formData, setFormData] = useState({
    donor_name: initialData.donor_name || '',
    age: initialData.age || '',
    blood_group: initialData.blood_group || '',
    organ: initialData.organ || '',
    contact: initialData.contact || '',
    city: initialData.city || '',
    availability_date: initialData.availability_date || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, age: parseInt(formData.age) })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Donation created successfully!', 'success');
        onComplete(); // Call the onComplete function passed from the parent
      } else {
        showToast(data.message || 'Failed to create donation', 'error');
      }
    } catch (error) {
      showToast('Network error while creating donation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideIn">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {initialData.organ ? `Fulfill Request for ${initialData.organ}` : 'New Donation Form'}
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="donor_name" type="text" placeholder="Donor Name" value={formData.donor_name} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="blood_group" type="text" placeholder="Blood Group" value={formData.blood_group} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="organ" type="text" placeholder="Organ" value={formData.organ} onChange={handleChange} className={`px-4 py-3 rounded-lg border ${initialData.organ ? 'bg-gray-100' : ''}`} required readOnly={!!initialData.organ} />
        <input name="contact" type="tel" placeholder="Contact" value={formData.contact} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />
        <input name="availability_date" type="date" placeholder="Availability Date" value={formData.availability_date} onChange={handleChange} className="px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none" required />

        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Donation'}
          </button>
        </div>
      </form>
    </div>
  );
};
