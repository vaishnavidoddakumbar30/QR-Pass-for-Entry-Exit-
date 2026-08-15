import React from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getPassTypeLabel, timeAgo } from '../../utils';

const AdminRequests: React.FC = () => {
  const { requests } = useData();
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">All Requests</h1>
        <p className="text-gray-400 text-sm">{requests.length} total requests</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Request ID','Student','Type','Destination','Status','Submitted'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map(r => (
                <tr key={r.requestId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{r.requestId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.studentName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getPassTypeLabel(r.type)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.destination || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminRequests;
