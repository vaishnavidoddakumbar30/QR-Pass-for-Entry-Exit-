import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  User, MapPin, Phone, Calendar, Home, Navigation, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardCard from '../../components/DashboardCard';
import StatusBadge from '../../components/StatusBadge';
import { ApprovalDialog, RejectionDialog } from '../../components/Dialogs';
import { formatDate, formatDateTime, getPassTypeLabel, timeAgo, generatePassId, generateQRToken } from '../../utils';
import type { LeaveRequest, Pass } from '../../types';
import { toast } from 'sonner';

const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPendingRequests, requests, passes, updateRequestStatus, createPass, addNotification, addAuditLog, approvePassExtension } = useData();
  const [approving, setApproving] = useState<LeaveRequest | null>(null);
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const pendingRequests = getPendingRequests();
  const approvedToday = requests.filter(r => {
    const today = new Date();
    return r.status === 'approved' && new Date(r.updatedAt).toDateString() === today.toDateString();
  }).length;
  const activePasses = passes.filter(p => p.status === 'active' || p.status === 'approved').length;
  const lateEntries = passes.filter(p => p.isLateEntry && p.lateEntryStatus === 'pending').length;
  const pendingExtensions = passes.filter(p => p.extensionRequest?.status === 'pending');

  const handleApproveExtension = (passId: string) => {
    approvePassExtension(passId, true, user.uid, user.name);
    toast.success('Pass extension approved');
  };

  const handleRejectExtension = (passId: string) => {
    approvePassExtension(passId, false, user.uid, user.name);
    toast.success('Pass extension rejected');
  };

  const handleApprove = async (req: LeaveRequest) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Create the pass
    const newPass = createPass({
      studentId: req.studentId,
      studentName: req.studentName,
      studentUsn: req.studentUsn,
      studentDepartment: req.studentDepartment,
      studentYear: req.studentYear,
      type: req.type,
      status: req.type === 'daily' ? 'active' : 'approved',
      destination: req.destination,
      reason: req.reason,
      validFrom: req.departureDate,
      validUntil: req.expectedReturnDate,
      approvedBy: user.uid,
      approverName: user.name,
      parentName: req.parentName,
      parentPhone: req.parentPhone,
      emergencyContact: req.emergencyContact,
      departureTime: req.departureDate,
      expectedReturnTime: req.expectedReturnDate,
    });

    updateRequestStatus(req.requestId, 'approved', {
      wardenId: user.uid,
      wardenName: user.name,
      passId: newPass.passId,
    });

    addNotification({
      recipientId: req.studentId,
      senderId: user.uid,
      senderName: user.name,
      type: 'request_approved',
      title: 'Pass Request Approved ✅',
      message: `Your ${getPassTypeLabel(req.type)} to ${req.destination || 'campus'} has been approved. Your QR pass is ready.`,
      isRead: false,
      relatedPassId: newPass.passId,
      relatedRequestId: req.requestId,
    });

    addAuditLog({
      userId: user.uid,
      userName: user.name,
      userRole: 'warden',
      action: 'APPROVE_PASS',
      entity: 'passes',
      entityId: newPass.passId,
      details: `Approved ${req.type} pass for ${req.studentName}`,
      result: 'success',
    });

    setIsLoading(false);
    setApproving(null);
    toast.success(`Approved pass for ${req.studentName}`);
  };

  const handleReject = async (req: LeaveRequest, reason: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    updateRequestStatus(req.requestId, 'rejected', {
      wardenId: user.uid,
      wardenName: user.name,
      rejectionReason: reason,
    });

    addNotification({
      recipientId: req.studentId,
      type: 'request_rejected',
      title: 'Pass Request Rejected',
      message: `Your ${getPassTypeLabel(req.type)} request was rejected. Reason: ${reason}`,
      isRead: false,
      relatedRequestId: req.requestId,
    });

    addAuditLog({
      userId: user.uid,
      userName: user.name,
      userRole: 'warden',
      action: 'REJECT_PASS',
      entity: 'requests',
      entityId: req.requestId,
      details: `Rejected ${req.type} pass for ${req.studentName}. Reason: ${reason}`,
      result: 'success',
    });

    setIsLoading(false);
    setRejecting(null);
    toast.error(`Rejected request from ${req.studentName}`);
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Approval/Rejection Dialogs */}
      {approving && (
        <ApprovalDialog
          isOpen
          studentName={approving.studentName}
          requestType={getPassTypeLabel(approving.type)}
          onConfirm={() => handleApprove(approving)}
          onCancel={() => setApproving(null)}
          isLoading={isLoading}
        />
      )}
      {rejecting && (
        <RejectionDialog
          isOpen
          studentName={rejecting.studentName}
          onConfirm={reason => handleReject(rejecting, reason)}
          onCancel={() => setRejecting(null)}
          isLoading={isLoading}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard title="Pending Requests" value={pendingRequests.length} icon={<Clock size={20} className="text-amber-600" />} iconBg="bg-amber-100" subtitle="Awaiting review" />
        <DashboardCard title="Approved Today"   value={approvedToday}          icon={<CheckCircle2 size={20} className="text-green-600" />} iconBg="bg-green-100" />
        <DashboardCard title="Active Passes"    value={activePasses}            icon={<ClipboardList size={20} className="text-blue-600" />} iconBg="bg-blue-100" />
        <DashboardCard title="Late Entries"     value={lateEntries}             icon={<AlertTriangle size={20} className="text-red-600" />} iconBg="bg-red-100" />
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={16} className="text-[#082b63]" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{pendingRequests.length}</span>
            )}
          </h2>
          <Link to="/warden/requests" className="text-xs text-[#082b63] font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30 text-green-500" />
            <p className="text-sm font-medium text-green-600">All requests reviewed!</p>
            <p className="text-xs text-gray-400 mt-0.5">No pending requests at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map(req => (
              <RequestCard
                key={req.requestId}
                req={req}
                onApprove={() => setApproving(req)}
                onReject={() => setRejecting(req)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Extension Requests */}
      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={16} className="text-[#082b63]" />
            Extension Requests
            {pendingExtensions.length > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{pendingExtensions.length}</span>
            )}
          </h2>
        </div>

        {pendingExtensions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30 text-green-500" />
            <p className="text-sm font-medium text-green-600">No extension requests!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingExtensions.map(pass => (
              <ExtensionCard
                key={pass.passId}
                pass={pass}
                onApprove={() => handleApproveExtension(pass.passId)}
                onReject={() => handleRejectExtension(pass.passId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Request Card ─────────────────────────────────────────────────────────────

interface ExtensionCardProps {
  pass: Pass;
  onApprove: () => void;
  onReject: () => void;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({ pass, onApprove, onReject }) => (
  <div className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {pass.studentName.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-gray-800 text-sm">{pass.studentName}</div>
            <div className="text-xs text-gray-400">{pass.studentUsn} · {pass.studentDepartment}</div>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-full uppercase">
            Extension Request
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded-lg">
          <div><span className="font-semibold text-gray-700">Original valid until:</span> {formatDateTime(pass.validUntil)}</div>
          {pass.extensionRequest && (
            <>
              <div><span className="font-semibold text-gray-700">Requested until:</span> {formatDateTime(pass.extensionRequest.requestedUntil)}</div>
              <div><span className="font-semibold text-gray-700">Reason:</span> {pass.extensionRequest.reason}</div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="mt-4 flex gap-2">
      <button onClick={onReject} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
        Reject
      </button>
      <button onClick={onApprove} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors shadow-sm">
        Approve Extension
      </button>
    </div>
  </div>
);

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  req: LeaveRequest;
  onApprove: () => void;
  onReject: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ req, onApprove, onReject }) => (
  <div className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#082b63] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {req.studentName.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-gray-800 text-sm">{req.studentName}</div>
            <div className="text-xs text-gray-400">{req.studentUsn} · {req.studentDepartment} · {req.studentYear} Year</div>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            {req.type === 'home' ? <Home size={12} /> : <Navigation size={12} />}
            {getPassTypeLabel(req.type)}
          </div>
          {req.destination && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} /> {req.destination}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} /> {formatDate(req.departureDate)}
          </div>
          {req.parentPhone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone size={12} /> {req.parentPhone}
            </div>
          )}
        </div>

        {req.reason && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5 leading-relaxed">
            "{req.reason}"
          </div>
        )}

        <div className="mt-2 text-[10px] text-gray-400">{timeAgo(req.createdAt)}</div>
      </div>
    </div>

    <div className="flex gap-2 mt-3">
      <button
        onClick={onReject}
        className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
      >
        Reject
      </button>
      <button
        onClick={onApprove}
        className="flex-1 bg-[#22a447] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#1a7d37] transition-colors"
      >
        Approve
      </button>
    </div>
  </div>
);

export default WardenDashboard;
