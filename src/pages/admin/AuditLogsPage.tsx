import React from 'react';
import { BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDateTime, getRoleLabel } from '../../utils';

const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useData();

  const ACTION_COLOR: Record<string, string> = {
    APPROVE_PASS:      'bg-green-100 text-green-700',
    REJECT_PASS:       'bg-red-100 text-red-700',
    CREATE_REQUEST:    'bg-blue-100 text-blue-700',
    GATE_ENTRY:        'bg-[#082b63]/10 text-[#082b63]',
    GATE_EXIT:         'bg-purple-100 text-purple-700',
    GATE_ENTRY_LATE:   'bg-orange-100 text-orange-700',
    QR_SCAN_VALID:     'bg-green-100 text-green-700',
    QR_SCAN_INVALID:   'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">Audit Logs</h1>
        <p className="text-gray-400 text-sm">{auditLogs.length} records</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Details', 'Result'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditLogs.map(log => (
                <tr key={log.logId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{log.userName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize text-gray-500">{getRoleLabel(log.userRole)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${ACTION_COLOR[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${log.result === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
