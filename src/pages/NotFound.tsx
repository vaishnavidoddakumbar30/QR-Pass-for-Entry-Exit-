import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
    <div className="text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#082b63] flex items-center justify-center mx-auto mb-6">
        <Shield size={36} className="text-white" />
      </div>
      <h1 className="text-6xl font-black text-[#082b63] mb-3">404</h1>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 bg-[#082b63] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#0b326f] transition-colors">
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
