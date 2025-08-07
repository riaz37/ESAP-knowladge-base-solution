'use client';

import { useState } from 'react';
import { X, Building2 } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, contactDatabase: string) => void;
  title: string;
}

export function CompanyModal({ isOpen, onClose, onSubmit, title }: CompanyModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactDatabase, setContactDatabase] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && contactDatabase.trim()) {
      onSubmit(name.trim(), description.trim(), contactDatabase.trim());
      // Reset form
      setName('');
      setDescription('');
      setContactDatabase('');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setName('');
    setDescription('');
    setContactDatabase('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 border border-green-500/30 rounded-lg p-6 w-full max-w-md mx-4
        shadow-2xl shadow-green-500/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 
              hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                text-white placeholder-gray-400 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-500"
              placeholder="Enter company name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                text-white placeholder-gray-400 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-500 resize-none"
              placeholder="Enter company description"
            />
          </div>

          {/* Contact Database */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Database *
            </label>
            <input
              type="text"
              value={contactDatabase}
              onChange={(e) => setContactDatabase(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md
                text-white placeholder-gray-400 focus:outline-none focus:border-green-500
                focus:ring-1 focus:ring-green-500"
              placeholder="Enter database connection string"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-md
                hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md
                hover:bg-green-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}