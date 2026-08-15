import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Shield } from 'lucide-react';
import { cn } from '../utils';
import type { Pass } from '../types';
import { formatDate, formatDateTime, getPassTypeLabel } from '../utils';
import StatusBadge from './StatusBadge';

interface DigitalPassCardProps {
  pass: Pass;
  showQR?: boolean;
  compact?: boolean;
}

const DigitalPassCard: React.FC<DigitalPassCardProps> = ({ pass, showQR = true, compact = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // QR payload: only the token + passId, no PII
  const qrPayload = JSON.stringify({
    passId: pass.passId,
    token: pass.qrToken,
    type: pass.type,
    ts: pass.createdAt ? new Date(pass.createdAt).getTime() : Date.now(),
  });

  useEffect(() => {
    if (!showQR || !pass.qrToken) return;
    QRCode.toDataURL(qrPayload, {
      width: 250,
      margin: 4,
      color: { dark: '#082b63', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(url => setQrDataUrl(url)).catch(() => {});
  }, [qrPayload, showQR, pass.qrToken]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${pass.passId}-qr.png`;
    a.click();
  };

  const isValidPass = pass.status === 'active' || pass.status === 'approved';

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden shadow-lg border-0',
      compact ? 'max-w-sm' : 'max-w-md'
    )}>
      {/* Card Header */}
      <div className="qr-pass-card px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#22a447]" />
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
                Zero Paper – KLS GIT
              </span>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">
              {getPassTypeLabel(pass.type)}
            </h3>
            <p className="text-white/50 text-xs mt-0.5">{pass.passId}</p>
          </div>
          <StatusBadge status={pass.status} />
        </div>

        {/* Student Info */}
        <div className="bg-white/10 rounded-xl p-3 mb-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-white/50 text-[10px]">Student</div>
              <div className="text-white font-semibold">{pass.studentName}</div>
            </div>
            {pass.studentUsn && (
              <div>
                <div className="text-white/50 text-[10px]">USN</div>
                <div className="text-white font-semibold">{pass.studentUsn}</div>
              </div>
            )}
            {pass.studentDepartment && (
              <div>
                <div className="text-white/50 text-[10px]">Department</div>
                <div className="text-white font-semibold">{pass.studentDepartment}</div>
              </div>
            )}
            {pass.studentYear && (
              <div>
                <div className="text-white/50 text-[10px]">Year</div>
                <div className="text-white font-semibold">{pass.studentYear}{['st','nd','rd','th'][Math.min(pass.studentYear-1,3)]}</div>
              </div>
            )}
          </div>
        </div>

        {/* Validity */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-white/50 text-[10px]">Valid From</div>
            <div className="text-white font-semibold">{formatDate(pass.validFrom)}</div>
          </div>
          <div className="text-white/30 text-lg font-light">→</div>
          <div className="text-right">
            <div className="text-white/50 text-[10px]">Valid Until</div>
            <div className="text-white font-semibold">{formatDate(pass.validUntil)}</div>
          </div>
        </div>

        {/* Destination */}
        {pass.destination && (
          <div className="mt-2">
            <div className="text-white/50 text-[10px]">Destination</div>
            <div className="text-white text-xs font-medium">{pass.destination}</div>
          </div>
        )}
      </div>

      {/* Divider (dashed ticket style) */}
      <div className="relative flex items-center bg-[#082b63]">
        <div className="w-5 h-5 rounded-full bg-[#f5f7fa] -ml-2.5" />
        <div className="flex-1 border-t-2 border-dashed border-white/20" />
        <div className="w-5 h-5 rounded-full bg-[#f5f7fa] -mr-2.5" />
      </div>

      {/* QR Section */}
      {showQR && (
        <div className="bg-white px-5 py-4">
          {isValidPass && pass.qrToken ? (
            <div className="flex flex-col items-center gap-3">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Shield size={10} className="text-[#22a447]" />
                Scan to Verify
              </div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-36 h-36 rounded-xl border-4 border-gray-50 shadow-inner"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-100 rounded-xl animate-pulse" />
              )}
              <div className="text-[10px] text-gray-400 font-mono text-center break-all px-2">
                {pass.passId}
              </div>
              {qrDataUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs text-[#082b63] font-semibold hover:text-[#22a447] transition-colors"
                >
                  <Download size={12} />
                  Download QR
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">
                {pass.status === 'pending'
                  ? 'QR will be generated after warden approval'
                  : pass.status === 'rejected'
                  ? 'Request was rejected — no QR available'
                  : 'QR not available'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
        <div className="text-[10px] text-gray-400">
          {pass.approverName ? `Approved by ${pass.approverName}` : 'Pending approval'}
        </div>
        {pass.entryTime && (
          <div className="text-[10px] text-green-600 font-medium">
            Entry: {formatDateTime(pass.entryTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalPassCard;
