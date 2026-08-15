import React from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getPassTypeLabel, timeAgo } from '../../utils';

const AdminPasses: React.FC = () => {
  const { passes } = useData();
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">All Passes</h1>
        <p className="text-gray-400 text-sm">{passes.length} total passes</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Pass ID','Student','USN','Type','Valid From','Valid Until','Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {passes.map(p => (
                <tr key={p.passId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.passId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.studentName}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.studentUsn || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getPassTypeLabel(p.type)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.validFrom)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.validUntil)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminPasses;
