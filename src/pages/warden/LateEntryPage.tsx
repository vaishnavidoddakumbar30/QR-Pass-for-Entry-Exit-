import React from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

const LateEntryPage: React.FC = () => {
  const { passes } = useData();
  const latePasses = passes.filter(p => p.isLateEntry || (p.entryTime && (() => {
    const h = new Date(p.entryTime!).getHours();
    return h >= 21 || h < 6;
  })()));

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">Late Entry Management</h1>
        <p className="text-gray-400 text-sm">Students who returned after curfew (9:00 PM)</p>
      </div>

      {latePasses.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
          <p className="text-green-700 font-semibold">No late entries!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {latePasses.map(pass => (
            <div key={pass.passId} className="bg-white rounded-xl border border-orange-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{pass.studentName}</div>
                <div className="text-xs text-gray-400">{pass.studentUsn} · {pass.studentDepartment}</div>
                {pass.entryTime && (
                  <div className="text-xs text-orange-600 font-medium mt-0.5">
                    Returned at: {formatDateTime(pass.entryTime)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <StatusBadge status={pass.lateEntryStatus === 'approved' ? 'approved' : pass.lateEntryStatus === 'rejected' ? 'rejected' : 'pending'} />
                <div className="text-xs text-gray-400 mt-1">{pass.passId}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LateEntryPage;
