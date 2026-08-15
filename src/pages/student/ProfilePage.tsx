import React, { useState } from 'react';
import { User, Mail, Phone, Book, Building2, Hash, Lock, X, Edit3, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { getInitials, formatDate } from '../../utils';
import { toast } from 'sonner';
import type { User as UserType } from '../../types';

const ProfilePage: React.FC = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const { getPassesByStudent, getRequestsByStudent, updateUser: updateDataUser } = useData();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  if (!user) return null;

  const passes = getPassesByStudent(user.uid);
  const requests = getRequestsByStudent(user.uid);

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-800">My Profile</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <Lock size={14} />
            Change Password
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#082b63] flex items-center justify-center text-white text-2xl font-black overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-800">{user.name}</h2>
            <div className="text-sm text-gray-400">{user.usn || 'No USN set'}</div>
            <span className="inline-block mt-1 bg-[#082b63]/10 text-[#082b63] text-xs font-bold px-2 py-0.5 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={<Mail size={14} />}     label="Email"      value={user.email} />
          <InfoRow icon={<Phone size={14} />}    label="Phone"      value={user.phone || '—'} />
          <InfoRow icon={<Building2 size={14} />}label="Department" value={user.department || '—'} />
          <InfoRow icon={<Hash size={14} />}     label="Year"       value={user.year ? `${user.year} Year` : '—'} />
          {user.hostelBlock && <InfoRow icon={<Building2 size={14} />} label="Hostel Block" value={user.hostelBlock} />}
          {user.roomNumber  && <InfoRow icon={<Hash size={14} />}      label="Room"         value={user.roomNumber} />}
          {user.parentName  && <InfoRow icon={<User size={14} />}      label="Parent"       value={user.parentName} />}
          {user.parentPhone && <InfoRow icon={<Phone size={14} />}     label="Parent Phone" value={user.parentPhone} />}
          <InfoRow icon={<Book size={14} />} label="Member Since" value={formatDate(user.createdAt)} />
        </div>
      </div>

      {/* Stats */}
      {user.role === 'student' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Requests', value: requests.length },
            { label: 'Approved',       value: requests.filter(r => r.status === 'approved').length },
            { label: 'Active Passes',  value: passes.filter(p => p.status === 'active' || p.status === 'approved').length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 text-center card-shadow border border-gray-100">
              <div className="text-2xl font-black text-[#082b63]">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal 
          onClose={() => setIsPasswordModalOpen(false)} 
          userId={user.uid}
          onSuccess={(newPassword) => {
            updateDataUser(user.uid, { password: newPassword });
            updateAuthUser({ password: newPassword });
            setIsPasswordModalOpen(false);
            toast.success('Password updated successfully');
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updates) => {
            updateDataUser(user.uid, updates);
            updateAuthUser(updates);
            setIsEditModalOpen(false);
            toast.success('Profile updated successfully');
          }}
        />
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
    <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div>
      <div className="text-[10px] text-gray-400 font-medium">{label}</div>
      <div className="text-sm text-gray-700 font-semibold">{value}</div>
    </div>
  </div>
);

const EditProfileModal = ({ user, onClose, onSuccess }: { user: UserType, onClose: () => void, onSuccess: (updates: Partial<UserType>) => void }) => {
  const [formData, setFormData] = useState({
    phone: user.phone || '',
    year: user.year || '',
    hostelBlock: user.hostelBlock || '',
    roomNumber: user.roomNumber || '',
    parentName: user.parentName || '',
    parentPhone: user.parentPhone || '',
    photoURL: user.photoURL || '',
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 250;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, photoURL: compressedBase64 }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      phone: formData.phone,
      year: formData.year ? parseInt(formData.year as string) : undefined,
      hostelBlock: formData.hostelBlock,
      roomNumber: formData.roomNumber,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      photoURL: formData.photoURL,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Edit Profile</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full bg-[#082b63] flex items-center justify-center text-white text-3xl font-black overflow-hidden relative border-2 border-gray-100">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="flex gap-4 mt-3">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Change Photo
              </button>
              {formData.photoURL && (
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, photoURL: '' }))}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="Your phone number"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Year of Study</label>
              <input 
                type="number" 
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="e.g. 3"
                min="1" max="5"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hostel Block</label>
              <input 
                type="text" 
                value={formData.hostelBlock}
                onChange={e => setFormData({ ...formData, hostelBlock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="e.g. Block A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Room Number</label>
              <input 
                type="text" 
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="e.g. 204"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Name</label>
              <input 
                type="text" 
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="Parent's full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Phone</label>
              <input 
                type="tel" 
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
                placeholder="Parent's phone number"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-[#082b63] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0b326f] transition-colors mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose, onSuccess, userId }: { onClose: () => void, onSuccess: (pwd: string) => void, userId: string }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    onSuccess(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63]"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[#082b63] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#0b326f] transition-colors mt-2"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
