import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, getPassTypeLabel, timeAgo } from '../../utils';

const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { getRequestsByStudent } = useData();
  if (!user) return null;
  const requests = getRequestsByStudent(user.uid);

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">Request History</h1>
        <p className="text-gray-400 text-sm">All your leave and gate pass requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">No requests found</p>
          <Link to="/student/apply" className="mt-2 inline-block text-sm text-[#082b63] font-semibold hover:underline">Create a request →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Request ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Destination</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Departure</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Submitted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => (
                  <tr key={req.requestId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{req.requestId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{getPassTypeLabel(req.type)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{req.destination || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(req.departureDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(req.createdAt)}</td>
                    <td className="px-4 py-3">
                      {req.passId && (
                        <Link to={`/student/pass/${req.passId}`} className="text-[#082b63] hover:underline text-xs font-semibold flex items-center gap-0.5">
                          QR <ChevronRight size={11} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsPage;
