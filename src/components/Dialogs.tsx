import React, { useState } from 'react';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';

// ─── Approval Dialog ──────────────────────────────────────────────────────────

interface ApprovalDialogProps {
  isOpen: boolean;
  studentName: string;
  requestType: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen, studentName, requestType, onConfirm, onCancel, isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h3 className="text-center font-bold text-gray-800 text-lg mb-2">Approve Request?</h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          Approve <strong>{requestType}</strong> for <strong>{studentName}</strong>?
          A QR pass will be generated and the student will be notified.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Rejection Dialog ─────────────────────────────────────────────────────────

interface RejectionDialogProps {
  isOpen: boolean;
  studentName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen, studentName, onConfirm, onCancel, isLoading
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (reason.trim().length < 10) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
          <X size={28} className="text-red-600" />
        </div>
        <h3 className="text-center font-bold text-gray-800 text-lg mb-2">Reject Request?</h3>
        <p className="text-center text-gray-500 text-sm mb-4">
          Rejecting request for <strong>{studentName}</strong>. Please provide a reason.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter rejection reason (min 10 characters)…"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 mb-4"
        />
        {reason.length > 0 && reason.length < 10 && (
          <p className="text-xs text-red-500 mb-3">Please provide at least 10 characters</p>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={reason.length < 10 || isLoading}
            className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {isLoading ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Confirmation Dialog ──────────────────────────────────────────────────────

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', onConfirm, onCancel, isLoading
}) => {
  if (!isOpen) return null;

  const btnClass = variant === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                   variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                   'bg-[#082b63] hover:bg-[#0b326f]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle size={20} className={
            variant === 'danger' ? 'text-red-500' :
            variant === 'warning' ? 'text-amber-500' :
            'text-[#082b63]'
          } />
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {isLoading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Emergency Alert ─────────────────────────────────────────────────────────

interface EmergencyAlertProps {
  studentName: string;
  studentUsn?: string;
  location?: string;
  time: Date;
  onAcknowledge: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertProps> = ({
  studentName, studentUsn, location, time, onAcknowledge
}) => (
  <div className="bg-red-600 text-white rounded-xl p-4 border-2 border-red-700 shadow-lg animate-pulse-soft">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <AlertTriangle size={18} />
      </div>
      <div className="flex-1">
        <div className="font-black text-sm uppercase tracking-wider mb-1">🚨 URGENT EMERGENCY ALERT</div>
        <div className="text-sm font-medium">{studentName} {studentUsn && `(${studentUsn})`} has triggered an emergency alert.</div>
        {location && <div className="text-xs text-red-100 mt-1">Location: {location}</div>}
        <div className="text-xs text-red-200 mt-0.5">Time: {time.toLocaleTimeString()}</div>
      </div>
      <button
        onClick={onAcknowledge}
        className="flex-shrink-0 bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
      >
        Acknowledge
      </button>
    </div>
  </div>
);
