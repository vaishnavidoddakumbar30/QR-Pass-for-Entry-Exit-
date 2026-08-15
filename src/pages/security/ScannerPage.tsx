import React, { useState } from 'react';
import { Camera, Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { QRScannerComponent, ManualPassEntry, VerificationDisplay } from '../../components/QRScanner';
import type { QRVerificationResult, QRPayload } from '../../types';
import { isPassExpired, formatTime } from '../../utils';
import { toast } from 'sonner';

const ScannerPage: React.FC = () => {
  const { user } = useAuth();
  const { verifyQRToken, getPassById, updatePassStatus, recordGateAction, addAuditLog, addNotification } = useData();
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [result, setResult] = useState<QRVerificationResult>({ state: 'idle' });

  if (!user) return null;

  const verifyCode = (rawData: string) => {
    setResult({ state: 'verifying' });

    setTimeout(() => {
      try {
        // Try parsing as JSON QR payload
        let passId: string | undefined;
        let token: string | undefined;

        try {
          const payload: QRPayload = JSON.parse(rawData);
          passId = payload.passId;
          token = payload.token;
        } catch {
          // Treat as direct passId
          passId = rawData;
        }

        const pass = passId ? getPassById(passId) : undefined;

        if (!pass) {
          setResult({ state: 'invalid', message: 'No pass found with this ID or token.' });
          addAuditLog({ userId: user.uid, userName: user.name, userRole: 'security', action: 'QR_SCAN_INVALID', entity: 'passes', details: `Invalid QR scan attempt: ${rawData}`, result: 'failure' });
          return;
        }

        // Verify token if we have it
        if (token && pass.qrToken !== token) {
          setResult({ state: 'invalid', message: 'QR token mismatch. This pass may have been tampered with.' });
          return;
        }

        if (isPassExpired(pass.validUntil)) {
          setResult({ state: 'expired', pass, message: 'This pass has expired.' });
          return;
        }

        if (pass.status === 'completed') {
          setResult({ state: 'already_used', pass, message: 'This pass has been completed (entry + exit recorded).' });
          return;
        }

        if (pass.status === 'rejected' || pass.status === 'cancelled' || pass.status === 'pending') {
          setResult({ state: 'invalid', pass, message: `Pass is in '${pass.status}' status and cannot be used.` });
          return;
        }

        setResult({ state: 'valid', pass, timestamp: new Date() });
        toast.success('Pass verified successfully!');

        addAuditLog({
          userId: user.uid, userName: user.name, userRole: 'security',
          action: 'QR_SCAN_VALID', entity: 'passes', entityId: pass.passId,
          details: `Valid QR scan for ${pass.studentName}`, result: 'success',
        });
      } catch (e) {
        setResult({ state: 'error', message: 'Failed to process QR code. Please try again.' });
      }
    }, 600);
  };

  const recordEntry = () => {
    if (!result.pass) return;
    const now = new Date();
    
    let isLate = false;
    if (result.pass.type === 'daily') {
      isLate = now.getHours() >= 21 || now.getHours() < 6;
    } else if (result.pass.expectedReturnTime) {
      isLate = now > new Date(result.pass.expectedReturnTime);
    } else {
      isLate = now.getHours() >= 21 || now.getHours() < 6;
    }

    const nextStatus = result.pass.type === 'daily' ? 'active' : 'completed';
    
    const extraUpdates: any = { entryTime: now };
    if (isLate) {
      extraUpdates.isLateEntry = true;
      extraUpdates.lateEntryStatus = 'pending';
    }
    
    updatePassStatus(result.pass.passId, nextStatus, extraUpdates);
    
    recordGateAction({
      passId: result.pass.passId,
      studentId: result.pass.studentId,
      studentName: result.pass.studentName,
      studentUsn: result.pass.studentUsn,
      action: 'entry',
      timestamp: now,
      recordedBy: user.uid,
      securityName: user.name,
      isLate,
      notes: isLate ? 'Late entry recorded' : undefined,
    });

    if (isLate) {
      addNotification({
        recipientId: result.pass.approvedBy || 'warden-001',
        type: 'late_entry',
        title: 'Late Entry Detected',
        message: `${result.pass.studentName} entered late at ${formatTime(now)}. Pass ID: ${result.pass.passId}.`,
        isRead: false,
        relatedRequestId: result.pass.passId,
      });
    }

    setResult(prev => ({ ...prev, pass: prev.pass ? { ...prev.pass, ...extraUpdates } : prev.pass }));
    toast.success(`Gate Entry recorded for ${result.pass.studentName}${isLate ? ' — LATE ENTRY' : ''}`);
    if (isLate) toast.error('Late entry detected! Warden has been notified.');
  };

  const recordExit = () => {
    if (!result.pass) return;
    const now = new Date();
    updatePassStatus(result.pass.passId, 'used', { exitTime: now });
    recordGateAction({
      passId: result.pass.passId,
      studentId: result.pass.studentId,
      studentName: result.pass.studentName,
      studentUsn: result.pass.studentUsn,
      action: 'exit',
      timestamp: now,
      recordedBy: user.uid,
      securityName: user.name,
    });
    setResult(prev => ({ ...prev, pass: prev.pass ? { ...prev.pass, exitTime: now } : prev.pass }));
    toast.success(`Gate Exit recorded for ${result.pass.studentName}`);
  };

  const reset = () => setResult({ state: 'idle' });

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">QR Scanner</h1>
        <p className="text-gray-400 text-sm">Scan or enter pass ID to verify</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('camera')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'camera' ? 'bg-white text-[#082b63] shadow-sm' : 'text-gray-500'}`}
        >
          <Camera size={14} /> Camera Scan
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-white text-[#082b63] shadow-sm' : 'text-gray-500'}`}
        >
          <Search size={14} /> Manual Entry
        </button>
      </div>

      {/* Scanner Area */}
      {result.state === 'idle' || result.state === 'scanning' ? (
        <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          {mode === 'camera' ? (
            <QRScannerComponent onScan={verifyCode} />
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3 font-medium">Enter Pass ID manually:</p>
              <ManualPassEntry onSubmit={verifyCode} />
              <p className="text-xs text-gray-400 mt-3 text-center">Format: PASS-YYYY-NNNNN</p>

              {/* Quick verify demo passes */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Quick verify (Demo):</p>
                <div className="space-y-1.5">
                  {['PASS-2024-001', 'PASS-2024-002', 'PASS-2024-003'].map(id => (
                    <button
                      key={id}
                      onClick={() => verifyCode(id)}
                      className="w-full text-left text-xs px-3 py-2 bg-gray-50 rounded-lg font-mono text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <VerificationDisplay
          result={result}
          onReset={reset}
          onRecordEntry={result.state === 'valid' ? recordEntry : undefined}
          onRecordExit={result.state === 'valid' ? recordExit : undefined}
        />
      )}

      {result.state === 'verifying' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
          <Clock size={32} className="mx-auto text-blue-500 mb-2 animate-spin" />
          <p className="text-blue-700 font-semibold">Verifying pass…</p>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
