import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getPassTypeLabel, timeAgo } from '../../utils';
import type { RequestStatus } from '../../types';

const WardenRequests: React.FC = () => {
  const { requests } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');

  const filtered = requests.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (r.studentUsn?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (r.destination?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">All Requests</h1>
        <p className="text-gray-400 text-sm">{filtered.length} requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student, USN, destination…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as RequestStatus | 'all')}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Student', 'USN', 'Type', 'Destination', 'Departure', 'Status', 'Submitted', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No requests found</td></tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.requestId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{req.studentName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{req.studentUsn}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getPassTypeLabel(req.type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.destination || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(req.departureDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(req.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/warden/request/${req.requestId}`} className="text-xs text-[#082b63] font-semibold hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WardenRequests;
