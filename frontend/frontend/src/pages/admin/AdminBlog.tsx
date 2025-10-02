import React from 'react';
import { Plus } from 'lucide-react';

const AdminBlog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog</h1>
          <button className="btn-primary">
            <Plus className="inline mr-2" size={20} />
            New Post
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600">Blog management interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
