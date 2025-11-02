// src/components/MatchDetailModal.jsx
import React from 'react';
import { X, User, Phone, Mail, MapPin } from 'lucide-react';

export const MatchDetailModal = ({ isOpen, onClose, matchData }) => {
  if (!isOpen || !matchData) return null;

  // We determine if we're showing a Donor's or Recipient's info
  const isDonation = !!matchData.recipient_name; // This is a donation, so we show the recipient

  const title = isDonation ? 'Match Found: Recipient Details' : 'Match Found: Donor Details';
  const details = isDonation ? {
    name: matchData.recipient_name,
    email: matchData.recipient_email,
    phone: matchData.recipient_phone,
    city: matchData.recipient_city
  } : {
    name: matchData.donor_name || matchData.donor_user_name,
    email: matchData.donor_email,
    phone: matchData.donor_contact,
    city: matchData.donor_city
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-slideIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-600 mb-6">
          Congratulations! A match has been found. Please use the contact information below to coordinate.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <User size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg font-medium text-gray-900">{details.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Phone size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-lg font-medium text-gray-900">{details.phone || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Mail size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-medium text-gray-900">{details.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <MapPin size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="text-lg font-medium text-gray-900">{details.city || 'N/A'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all mt-8"
        >
          Close
        </button>
      </div>
    </div>
  );
};
