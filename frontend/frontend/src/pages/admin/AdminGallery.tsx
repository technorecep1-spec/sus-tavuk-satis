import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

const AdminGallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Admin Paneline Dön
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Galeri Yönetimi</h1>
          <button className="btn-primary">
            <Plus className="inline mr-2" size={20} />
            Resim Yükle
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Gallery management interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
