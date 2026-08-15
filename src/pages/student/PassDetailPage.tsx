import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import DigitalPassCard from '../../components/DigitalPassCard';

const PassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPassById } = useData();
  const navigate = useNavigate();

  const pass = getPassById(id || '');

  if (!pass) {
    return (
      <div className="p-4 lg:p-6 max-w-lg mx-auto text-center py-16">
        <AlertCircle size={40} className="mx-auto text-gray-200 mb-3" />
        <h2 className="font-bold text-gray-600 mb-2">Pass Not Found</h2>
        <p className="text-gray-400 text-sm mb-4">The pass you're looking for doesn't exist.</p>
        <Link to="/student/passes" className="text-[#082b63] text-sm font-semibold hover:underline">← Back to My Passes</Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-5 text-sm font-medium">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-black text-gray-800 mb-5">Pass Details</h1>
      <DigitalPassCard pass={pass} showQR />
    </div>
  );
};

export default PassDetailPage;
