import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DigitalPassCard from '../../components/DigitalPassCard';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getPassTypeLabel } from '../../utils';

const TABS = ['active', 'pending', 'expired', 'history'] as const;
type Tab = typeof TABS[number];

const MyPassesPage: React.FC = () => {
  const { user } = useAuth();
  const { getPassesByStudent } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('active');

  if (!user) return null;
  const allPasses = getPassesByStudent(user.uid);

  const filtered = allPasses.filter(p => {
    if (activeTab === 'active')  return p.status === 'active' || p.status === 'approved';
    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'expired') return p.status === 'expired' || p.status === 'used';
    return true;
  });

  const counts: Record<Tab, number> = {
    active:  allPasses.filter(p => p.status === 'active' || p.status === 'approved').length,
    pending: allPasses.filter(p => p.status === 'pending').length,
    expired: allPasses.filter(p => p.status === 'expired' || p.status === 'used').length,
    history: allPasses.length,
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">My Passes</h1>
        <p className="text-gray-400 text-sm">Your digital gate passes and leave records</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-[#082b63] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="capitalize">{tab}</span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab ? 'bg-[#082b63] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Pass Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <QrCode size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-medium">No {activeTab} passes</p>
          {activeTab === 'active' && (
            <Link to="/student/apply" className="mt-2 inline-block text-sm text-[#082b63] font-semibold hover:underline">
              Apply for a pass →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(pass => (
            <div key={pass.passId} className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
              {/* Pass header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-sm">{getPassTypeLabel(pass.type)}</div>
                  <div className="text-xs text-gray-400">{pass.passId}</div>
                </div>
                <StatusBadge status={pass.status} />
              </div>
              {/* Mini pass info */}
              <div className="px-4 py-3 space-y-1.5">
                <Row label="Valid From" value={formatDate(pass.validFrom)} />
                <Row label="Valid Until" value={formatDate(pass.validUntil)} />
                {pass.destination && <Row label="Destination" value={pass.destination} />}
                {pass.entryTime && <Row label="Entry" value={formatDate(pass.entryTime)} />}
                {pass.exitTime  && <Row label="Exit"  value={formatDate(pass.exitTime)} />}
              </div>
              {/* Action */}
              <div className="px-4 pb-4">
                <Link
                  to={`/student/pass/${pass.passId}`}
                  className="flex items-center justify-center gap-1.5 w-full border border-[#082b63]/20 text-[#082b63] py-2 rounded-xl text-xs font-semibold hover:bg-[#082b63]/5 transition-colors"
                >
                  <QrCode size={13} />
                  View QR & Details
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-xs">
    <span className="text-gray-400">{label}</span>
    <span className="text-gray-700 font-medium">{value}</span>
  </div>
);

export default MyPassesPage;
