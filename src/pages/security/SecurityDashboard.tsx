import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan, Activity, Clock, AlertTriangle, CheckCircle2,
  XCircle, Shield, Users, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardCard from '../../components/DashboardCard';
import { EmergencyAlertBanner } from '../../components/Dialogs';
import { timeAgo } from '../../utils';

const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { gateLogs, alerts, resolveAlert } = useData();
  const navigate = useNavigate();

  if (!user) return null;

  const today = new Date().toDateString();
  const todayLogs = gateLogs.filter(l => new Date(l.timestamp).toDateString() === today);
  const entries   = todayLogs.filter(l => l.action === 'entry').length;
  const exits     = todayLogs.filter(l => l.action === 'exit').length;
  const lateOnes  = todayLogs.filter(l => l.isLate).length;

  const activeAlerts = alerts.filter(a => !a.isResolved);
  const emergencies  = activeAlerts.filter(a => a.type === 'emergency');

  const ACTIONS = [
    { icon: <Scan size={28} />,         label: 'Scan QR',      sub: 'Verify student pass', path: '/security/scanner',    bg: 'bg-[#082b63]' },
    { icon: <Activity size={28} />,     label: 'Entry / Exit', sub: 'Record gate logs',    path: '/security/entry-exit', bg: 'bg-[#22a447]' },
    { icon: <Clock size={28} />,        label: 'Late Entry',   sub: 'Override requests',   path: '/security/late-entry', bg: 'bg-amber-600' },
    { icon: <AlertTriangle size={28} />,label: 'Alerts',       sub: 'View all alerts',     path: '/security/alerts',     bg: 'bg-red-600' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Emergency banners */}
      {emergencies.map(a => (
        <EmergencyAlertBanner
          key={a.alertId}
          studentName={a.studentName || 'Unknown'}
          time={new Date(a.createdAt)}
          onAcknowledge={() => resolveAlert(a.alertId, user.uid)}
        />
      ))}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard title="Entries Today"   value={entries}   icon={<CheckCircle2 size={18} className="text-green-600" />} iconBg="bg-green-100" />
        <DashboardCard title="Exits Today"     value={exits}     icon={<XCircle size={18} className="text-blue-600" />}      iconBg="bg-blue-100" />
        <DashboardCard title="Late Entries"    value={lateOnes}  icon={<Clock size={18} className="text-amber-600" />}       iconBg="bg-amber-100" />
        <DashboardCard title="Active Alerts"   value={activeAlerts.length} icon={<AlertTriangle size={18} className="text-red-600" />} iconBg="bg-red-100" />
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-[#082b63]" />
          Gate Operations
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className={`${a.bg} text-white rounded-xl p-5 flex flex-col items-start gap-3 hover:opacity-90 transition-opacity shadow text-left`}
            >
              {a.icon}
              <div>
                <div className="font-bold text-base">{a.label}</div>
                <div className="text-white/70 text-xs">{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Gate Activity */}
      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-[#082b63]" />
          Recent Gate Activity
        </h2>
        {gateLogs.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No gate activity yet</div>
        ) : (
          <div className="space-y-2">
            {gateLogs.slice(0, 8).map(log => (
              <div key={log.logId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${log.action === 'entry' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {log.action === 'entry'
                    ? <CheckCircle2 size={16} className="text-green-600" />
                    : <XCircle size={16} className="text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800">{log.studentName}</div>
                  <div className="text-xs text-gray-400">{log.studentUsn} · {log.action === 'entry' ? 'Gate Entry' : 'Gate Exit'} {log.isLate && '· 🔴 LATE'}</div>
                </div>
                <div className="text-xs text-gray-400">{timeAgo(log.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
