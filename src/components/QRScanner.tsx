import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Search, CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { cn, formatDateTime, getPassTypeLabel } from '../utils';
import type { QRVerificationResult } from '../types';

// ─── Verification Result Display ──────────────────────────────────────────────

interface VerificationDisplayProps {
  result: QRVerificationResult;
  onReset: () => void;
  onRecordEntry?: () => void;
  onRecordExit?: () => void;
}

export const VerificationDisplay: React.FC<VerificationDisplayProps> = ({
  result, onReset, onRecordEntry, onRecordExit
}) => {
  const { state, pass, message } = result;

  const config = {
    valid:       { bg: 'bg-green-50 border-green-200',  icon: <CheckCircle2 className="text-green-500" size={40} />, label: 'PASS VERIFIED',     text: 'text-green-700' },
    expired:     { bg: 'bg-red-50 border-red-200',      icon: <XCircle className="text-red-500" size={40} />,       label: 'PASS EXPIRED',      text: 'text-red-700' },
    invalid:     { bg: 'bg-red-50 border-red-200',      icon: <XCircle className="text-red-500" size={40} />,       label: 'INVALID PASS',      text: 'text-red-700' },
    already_used:{ bg: 'bg-amber-50 border-amber-200',  icon: <AlertCircle className="text-amber-500" size={40} />, label: 'PASS ALREADY USED', text: 'text-amber-700' },
    error:       { bg: 'bg-gray-50 border-gray-200',    icon: <AlertCircle className="text-gray-500" size={40} />,  label: 'SCAN ERROR',        text: 'text-gray-700' },
    verifying:   { bg: 'bg-blue-50 border-blue-200',    icon: <Loader2 className="text-blue-500 animate-spin" size={40} />, label: 'VERIFYING...', text: 'text-blue-700' },
    idle:        { bg: '', icon: null, label: '', text: '' },
    scanning:    { bg: '', icon: null, label: '', text: '' },
  };

  const c = config[state];

  return (
    <div className={cn('border-2 rounded-2xl p-6 text-center', c.bg)}>
      <div className="flex justify-center mb-3">{c.icon}</div>
      <h3 className={cn('text-xl font-black tracking-wide mb-4', c.text)}>{c.label}</h3>

      {pass && (
        <div className="bg-white/80 rounded-xl p-4 text-left space-y-2 mb-4">
          <Row label="Student"    value={pass.studentName} />
          <Row label="USN"        value={pass.studentUsn} />
          <Row label="Department" value={pass.studentDepartment} />
          <Row label="Pass Type"  value={getPassTypeLabel(pass.type)} />
          <Row label="Pass ID"    value={pass.passId} />
          <Row label="Valid From" value={formatDateTime(pass.validFrom)} />
          <Row label="Valid Until"value={formatDateTime(pass.validUntil)} />
          {pass.destination && <Row label="Destination" value={pass.destination} />}
          {pass.reason && <Row label="Reason" value={pass.reason} />}
          {pass.entryTime && <Row label="Entry Time" value={formatDateTime(pass.entryTime)} />}
          {pass.exitTime  && <Row label="Exit Time"  value={formatDateTime(pass.exitTime)} />}
        </div>
      )}

      {message && !pass && (
        <p className="text-sm text-gray-600 mb-4">{message}</p>
      )}

      {state === 'valid' && (
        <div className="flex gap-2 justify-center mb-3">
          {onRecordEntry && (pass?.type === 'daily' || pass?.status === 'used') && (
            <button
              onClick={onRecordEntry}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 size={16} />
              Record Entry
            </button>
          )}
          {onRecordExit && (pass?.type === 'daily' || pass?.status === 'approved') && (
            <button
              onClick={onRecordExit}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <CheckCircle2 size={16} />
              Record Exit
            </button>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
      >
        Scan Another
      </button>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value?: string | number }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between text-xs gap-2">
      <span className="text-gray-500 font-medium flex-shrink-0">{label}:</span>
      <span className="text-gray-800 font-semibold text-right">{value}</span>
    </div>
  );
};

// ─── QR Scanner ───────────────────────────────────────────────────────────────

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (err: string) => void;
}

export const QRScannerComponent: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    let isMounted = true;
    let isCleared = false;
    let scanner: Html5QrcodeScanner | null = null;

    // Use a short timeout to prevent StrictMode double-initialization issues
    const initTimer = setTimeout(() => {
      if (!isMounted) return;

      // Force clean any lingering DOM from previous instances
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';

      scanner = new Html5QrcodeScanner(
        containerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE],
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          if (!isCleared && isMounted) {
            isCleared = true;
            scanner?.clear().catch(() => {});
            onScan(decodedText);
          }
        },
        (error) => {
          if (error?.includes?.('permission') || error?.includes?.('denied')) {
            onError?.('Camera access denied, please use file upload.');
          }
        }
      );

      scannerRef.current = scanner;
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      if (scanner && !isCleared) {
        isCleared = true;
        scanner.clear().catch(() => {});
      }
    };
  }, [onScan, onError]);

  return (
    <div>
      <div id={containerId} className="rounded-xl overflow-hidden" />
    </div>
  );
};

// ─── Manual Token Entry ───────────────────────────────────────────────────────

interface ManualEntryProps {
  onSubmit: (passId: string) => void;
}

export const ManualPassEntry: React.FC<ManualEntryProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim().toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Enter Pass ID (e.g. PASS-2024-12345)"
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
      />
      <button
        type="submit"
        className="flex items-center gap-1.5 bg-[#082b63] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0b326f] transition-colors"
      >
        <Search size={14} />
        Verify
      </button>
    </form>
  );
};
