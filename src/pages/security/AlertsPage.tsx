import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { timeAgo } from '../../utils';
import { toast } from 'sonner';

const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const { alerts, resolveAlert } = useData();
  if (!user) return null;

  const active   = alerts.filter(a => !a.isResolved);
  const resolved = alerts.filter(a => a.isResolved);

  const SEVERITY_COLOR: Record<string, string> = {
    critical: 'bg-red-100 border-red-300 text-red-800',
    high:     'bg-orange-100 border-orange-300 text-orange-800',
    medium:   'bg-amber-100 border-amber-300 text-amber-800',
    low:      'bg-gray-100 border-gray-300 text-gray-700',
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">Security Alerts</h1>
        <p className="text-gray-400 text-sm">{active.length} active alerts</p>
      </div>

      {active.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
          <p className="text-green-700 font-semibold">All clear! No active alerts.</p>
        </div>
      )}

      {active.map(a => (
        <div key={a.alertId} className={`border-2 rounded-xl p-4 ${SEVERITY_COLOR[a.severity]}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm">{a.title}</div>
              <div className="text-xs mt-0.5 opacity-80">{a.message}</div>
              {a.studentName && <div className="text-xs mt-1 opacity-60">Student: {a.studentName}</div>}
              <div className="text-xs mt-0.5 opacity-60">{timeAgo(a.createdAt)}</div>
            </div>
            <button
              onClick={() => { resolveAlert(a.alertId, user.uid); toast.success('Alert resolved'); }}
              className="flex-shrink-0 bg-white/80 px-3 py-1.5 rounded-lg text-xs font-bold border border-current hover:bg-white transition-colors"
            >
              Resolve
            </button>
          </div>
        </div>
      ))}

      {resolved.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-600 text-sm mb-3">Resolved Alerts</h2>
          <div className="space-y-2">
            {resolved.map(a => (
              <div key={a.alertId} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3 opacity-60">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.message}</div>
                </div>
                <span className="text-xs text-green-600 font-semibold">Resolved</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
