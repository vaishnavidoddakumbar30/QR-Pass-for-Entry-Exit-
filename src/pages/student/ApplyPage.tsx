import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Navigation, FileText, Calendar, Clock, User, Phone, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { PassType } from '../../types';
import { toast } from 'sonner';

const PASS_TYPES: { type: PassType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { type: 'daily',   icon: <Calendar size={20} />, label: 'Daily Pass',  desc: 'Valid for 1 month, daily exit 6AM–9PM', color: 'border-blue-500 bg-blue-50' },
  { type: 'home',    icon: <Home size={20} />,     label: 'Home Pass',   desc: 'Extended leave to visit home',          color: 'border-[#22a447] bg-green-50' },
  { type: 'outing',  icon: <Navigation size={20} />,label: 'Outing Pass',desc: 'Short outing with warden approval',    color: 'border-purple-500 bg-purple-50' },
];

const ApplyPage: React.FC = () => {
  const { user } = useAuth();
  const { createRequest, addNotification, addAuditLog } = useData();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState<PassType>('home');
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    destination: '',
    reason: '',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
    expectedReturnDate: '',
    expectedReturnTime: '20:00',
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.destination.trim() && selectedType !== 'daily') return 'Destination is required';
    if (!form.reason.trim()) return 'Reason is required';
    if (!form.departureDate) return 'Departure date is required';
    if (!form.expectedReturnDate && selectedType !== 'daily') return 'Return date is required';
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;
    const err = validate();
    if (err) { toast.error(err); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    let calculatedReturnDate: Date;
    if (selectedType === 'daily') {
      calculatedReturnDate = new Date(`${form.departureDate}T21:00`);
      calculatedReturnDate.setMonth(calculatedReturnDate.getMonth() + 3);
    } else {
      calculatedReturnDate = new Date(`${form.expectedReturnDate || form.departureDate}T${form.expectedReturnTime}`);
    }

    const req = createRequest({
      studentId: user.uid,
      studentName: user.name,
      studentUsn: user.usn,
      studentDepartment: user.department,
      studentYear: user.year,
      studentPhone: user.phone,
      type: selectedType,
      status: 'pending',
      destination: form.destination,
      reason: form.reason,
      departureDate: new Date(`${form.departureDate}T${form.departureTime}`),
      departureTime: form.departureTime,
      expectedReturnDate: calculatedReturnDate,
      expectedReturnTime: selectedType === 'daily' ? '21:00' : form.expectedReturnTime,
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      emergencyContact: form.emergencyContact,
    });

    // Notify warden
    addNotification({
      recipientId: 'warden-001',
      senderId: user.uid,
      senderName: user.name,
      type: 'request_submitted',
      title: 'New Pass Request',
      message: `${user.name} (${user.usn}) has submitted a ${selectedType} pass request to ${form.destination}.`,
      isRead: false,
      relatedRequestId: req.requestId,
    });

    // Notify student
    addNotification({
      recipientId: user.uid,
      type: 'request_submitted',
      title: 'Request Submitted',
      message: `Your ${selectedType} pass request has been submitted and is pending warden approval.`,
      isRead: false,
      relatedRequestId: req.requestId,
    });

    addAuditLog({
      userId: user.uid,
      userName: user.name,
      userRole: 'student',
      action: 'CREATE_REQUEST',
      entity: 'requests',
      entityId: req.requestId,
      details: `Created ${selectedType} pass request to ${form.destination}`,
      result: 'success',
    });

    setIsLoading(false);
    setSubmitted(true);
    toast.success('Pass request submitted successfully!');
  };

  if (submitted) {
    return (
      <div className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-8 card-shadow border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your pass request has been submitted to the warden. You'll receive a notification once it's reviewed.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 text-left">
            <div className="text-xs text-amber-700 font-semibold mb-1">What happens next?</div>
            <div className="text-xs text-amber-600 space-y-1">
              <div>1. Warden reviews your request</div>
              <div>2. If approved, a QR pass is generated</div>
              <div>3. Show QR at gate for entry/exit</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm({ destination:'',reason:'',departureDate:new Date().toISOString().split('T')[0],departureTime:'08:00',expectedReturnDate:'',expectedReturnTime:'20:00',parentName:'',parentPhone:'',emergencyContact:'' }); }}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              New Request
            </button>
            <button
              onClick={() => navigate('/student/requests')}
              className="flex-1 bg-[#082b63] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0b326f]"
            >
              View Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-800">Apply for Pass</h1>
        <p className="text-gray-400 text-sm mt-0.5">Submit a leave or gate pass request</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-[#082b63] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[#082b63]' : 'bg-gray-200'} transition-colors`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
        {/* Step 1: Pass Type */}
        {step === 1 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-4">Select Pass Type</h2>
            <div className="space-y-3">
              {PASS_TYPES.map(pt => (
                <button
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedType === pt.type ? pt.color : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedType === pt.type ? 'bg-white shadow' : 'bg-gray-100'}`}>
                    {pt.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{pt.label}</div>
                    <div className="text-xs text-gray-500">{pt.desc}</div>
                  </div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedType === pt.type ? 'border-[#082b63] bg-[#082b63]' : 'border-gray-300'}`}>
                    {selectedType === pt.type && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-6 w-full bg-[#082b63] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b326f] transition-colors">
              Next
            </button>
          </div>
        )}

        {/* Step 2: Pass Details */}
        {step === 2 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-4">Pass Details</h2>
            <div className="space-y-4">
              {selectedType !== 'daily' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Destination *</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={e => update('destination', e.target.value)}
                    placeholder="e.g. Belgaum, KMC Hospital"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason *</label>
                <textarea
                  value={form.reason}
                  onChange={e => update('reason', e.target.value)}
                  placeholder="Explain the reason for this request…"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Departure Date *</label>
                  <input type="date" value={form.departureDate} onChange={e => update('departureDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Departure Time</label>
                  <input type="time" value={form.departureTime} onChange={e => update('departureTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
                </div>
                {selectedType !== 'daily' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Return Date *</label>
                      <input type="date" value={form.expectedReturnDate} onChange={e => update('expectedReturnDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Return Time</label>
                      <input type="time" value={form.expectedReturnTime} onChange={e => update('expectedReturnTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#082b63] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b326f]">Next</button>
            </div>
          </div>
        )}

        {/* Step 3: Guardian Info & Submit */}
        {step === 3 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-4">Guardian Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Parent/Guardian Name</label>
                <input type="text" value={form.parentName} onChange={e => update('parentName', e.target.value)}
                  placeholder="Parent or guardian full name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Parent Phone</label>
                <input type="tel" value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Emergency Contact</label>
                <input type="tel" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)}
                  placeholder="Additional emergency number"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]" />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-gray-600 mb-2">Request Summary</div>
                <SummaryRow label="Type" value={selectedType} />
                <SummaryRow label="Destination" value={form.destination || '—'} />
                <SummaryRow label="Reason" value={form.reason} />
                <SummaryRow label="Departure" value={`${form.departureDate} ${form.departureTime}`} />
                {form.expectedReturnDate && <SummaryRow label="Return" value={`${form.expectedReturnDate} ${form.expectedReturnTime}`} />}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back</button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#22a447] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1a7d37] disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-800 font-medium capitalize">{value}</span>
  </div>
);

export default ApplyPage;
