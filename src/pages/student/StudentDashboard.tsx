import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QrCode, FileText, ClipboardList, AlertTriangle, CheckCircle2,
  Clock, Plus, ChevronRight, Shield, TrendingUp, Home, Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import DigitalPassCard from '../../components/DigitalPassCard';
import { EmergencyAlertBanner } from '../../components/Dialogs';
import { formatDateTime, getPassTypeLabel, timeAgo } from '../../utils';
import { toast } from 'sonner';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPassesByStudent, getRequestsByStudent, addAlert, addNotification, users, requestPassExtension } = useData();
  const navigate = useNavigate();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionDate, setExtensionDate] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  if (!user) return null;

  const passes = getPassesByStudent(user.uid);
  const requests = getRequestsByStudent(user.uid);

  const activePasses    = passes.filter(p => p.status === 'active' || (p.status === 'approved' && p.qrToken));
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedTotal   = requests.filter(r => r.status === 'approved').length;

  const activePass = activePasses[0];

  const handleEmergency = () => {
    addAlert({
      type: 'emergency',
      severity: 'critical',
      title: '🚨 Emergency Alert',
      message: `${user.name} (${user.usn}) has triggered an emergency alert.`,
      studentId: user.uid,
      studentName: user.name,
      isResolved: false,
    });
    
    users.filter(u => u.role === 'warden').forEach(w => {
      addNotification({
        recipientId: w.uid,
        type: 'emergency_alert',
        title: '🚨 EMERGENCY ALERT',
        message: `${user.name} has triggered an emergency. Immediate attention required.`,
        isRead: false,
      });
    });
    
    users.filter(u => u.role === 'security').forEach(s => {
      addNotification({
        recipientId: s.uid,
        type: 'emergency_alert',
        title: '🚨 EMERGENCY ALERT',
        message: `${user.name} has triggered an emergency. Check the gate immediately.`,
        isRead: false,
      });
    });
    
    toast.success('Emergency alert sent!');
    setShowEmergency(false);
  };

  const handleRequestExtension = () => {
    if (!extensionDate || !extensionReason) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!activePass) return;
    
    // Create requested date at 9:00 PM
    const requestedDate = new Date(extensionDate);
    requestedDate.setHours(21, 0, 0, 0);

    requestPassExtension(activePass.passId, requestedDate, extensionReason);
    toast.success('Extension request submitted successfully');
    setShowExtensionModal(false);
    setExtensionDate('');
    setExtensionReason('');
  };

  const QUICK_ACTIONS = [
    { icon: <Plus size={18} />,         label: 'Create Gate Pass',  path: '/student/apply',  bg: 'bg-[#082b63] text-white' },
    { icon: <Home size={18} />,         label: 'Apply for Leave',   path: '/student/apply',  bg: 'bg-[#22a447] text-white' },
    { icon: <QrCode size={18} />,       label: 'My Passes',         path: '/student/passes', bg: 'bg-blue-600 text-white' },
    { icon: <ClipboardList size={18} />,label: 'Request History',   path: '/student/requests',bg: 'bg-gray-700 text-white' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Emergency Banner */}
      {showEmergency && (
        <EmergencyAlertBanner
          studentName={user.name}
          studentUsn={user.usn}
          time={new Date()}
          onAcknowledge={handleEmergency}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard
          title="Active Passes"
          value={activePasses.length}
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          iconBg="bg-green-100"
          subtitle="Currently valid"
        />
        <DashboardCard
          title="Pending"
          value={pendingRequests.length}
          icon={<Clock size={20} className="text-amber-600" />}
          iconBg="bg-amber-100"
          subtitle="Awaiting approval"
        />
        <DashboardCard
          title="Approved"
          value={approvedTotal}
          icon={<TrendingUp size={20} className="text-blue-600" />}
          iconBg="bg-blue-100"
          subtitle="Total approved"
        />
        <DashboardCard
          title="Total Requests"
          value={requests.length}
          icon={<FileText size={20} className="text-purple-600" />}
          iconBg="bg-purple-100"
          subtitle="All time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Navigation size={16} className="text-[#082b63]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className={`${a.bg} rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity text-left shadow-sm`}
                >
                  {a.icon}
                  <span className="text-sm font-semibold leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={16} className="text-[#082b63]" />
                Recent Requests
              </h2>
              <Link to="/student/requests" className="text-xs text-[#082b63] font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No requests yet</p>
                <Link to="/student/apply" className="text-xs text-[#082b63] font-medium mt-1 block hover:underline">
                  Create your first request
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.slice(0, 5).map(req => (
                  <div key={req.requestId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#082b63]/10 flex items-center justify-center flex-shrink-0">
                      {req.type === 'home' ? <Home size={14} className="text-[#082b63]" /> :
                       req.type === 'outing' ? <Navigation size={14} className="text-[#082b63]" /> :
                       <FileText size={14} className="text-[#082b63]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{getPassTypeLabel(req.type)}</div>
                      <div className="text-xs text-gray-400 truncate">{req.destination || req.reason}</div>
                      <div className="text-[10px] text-gray-300">{timeAgo(req.createdAt)}</div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column – Active Pass */}
        <div className="space-y-5">
          {activePass ? (
            <div>
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <QrCode size={16} className="text-[#082b63]" />
                Active Pass
              </h2>
              <DigitalPassCard pass={activePass} compact />
              <Link to={`/student/pass/${activePass.passId}`} className="mt-2 block text-center text-xs text-[#082b63] font-medium hover:underline">
                View full pass →
              </Link>
              {activePass.type !== 'daily' && activePass.type !== 'monthly' && (
                <div className="mt-3">
                  {activePass.extensionRequest ? (
                    <div className="text-center p-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                      Extension Request: {activePass.extensionRequest.status.toUpperCase()}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowExtensionModal(true)}
                      className="w-full bg-[#082b63] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0b326f] transition-colors"
                    >
                      Request Extension
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 text-center">
              <QrCode size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No active pass</p>
              <p className="text-xs text-gray-400 mt-1">Your approved QR pass will appear here</p>
              <Link
                to="/student/apply"
                className="mt-3 inline-block bg-[#082b63] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0b326f] transition-colors"
              >
                Apply Now
              </Link>
            </div>
          )}

          {/* Emergency Button */}
          <button
            onClick={() => setShowEmergency(true)}
            className="w-full bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">Emergency Assistance</div>
              <div className="text-xs text-red-400">Alert warden & security immediately</div>
            </div>
          </button>
        </div>
      </div>

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm card-shadow animate-scale-in">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Request Pass Extension</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Return Date</label>
                <input
                  type="date"
                  value={extensionDate}
                  onChange={e => setExtensionDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Return Time</label>
                <input type="time" value="21:00" disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-[10px] text-gray-500 mt-1">Fixed to 9:00 PM</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason for Extension</label>
                <textarea
                  value={extensionReason}
                  onChange={e => setExtensionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                  rows={3}
                  placeholder="Explain why you need an extension..."
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestExtension}
                className="flex-1 px-4 py-2 bg-[#082b63] text-white rounded-xl text-sm font-semibold hover:bg-[#0b326f] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
