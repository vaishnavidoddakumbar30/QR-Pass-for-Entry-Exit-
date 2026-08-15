import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, CheckCheck, X, AlertCircle, CheckCircle2, Info, Clock, Settings, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cn, timeAgo, getInitials } from '../utils';
import { toast } from 'sonner';
import type { NotificationType } from '../types';

// ─── Notification Icon ────────────────────────────────────────────────────────

const NOTIF_ICON: Record<NotificationType, React.ReactNode> = {
  request_submitted: <Info size={14} className="text-blue-500" />,
  request_approved:  <CheckCircle2 size={14} className="text-green-500" />,
  request_rejected:  <AlertCircle size={14} className="text-red-500" />,
  pass_generated:    <CheckCircle2 size={14} className="text-green-500" />,
  pass_expiring:     <Clock size={14} className="text-amber-500" />,
  late_entry:        <AlertCircle size={14} className="text-orange-500" />,
  warden_approval:   <CheckCircle2 size={14} className="text-green-500" />,
  security_alert:    <AlertCircle size={14} className="text-red-500" />,
  emergency_alert:   <AlertCircle size={14} className="text-red-600" />,
  gate_entry:        <CheckCircle2 size={14} className="text-blue-500" />,
  gate_exit:         <CheckCircle2 size={14} className="text-purple-500" />,
  system:            <Info size={14} className="text-gray-500" />,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TopNavbarProps {
  onMenuClick: () => void;
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick, title }) => {
  const { user } = useAuth();
  const { getNotificationsByUser, getUnreadCount, markNotificationRead, markAllNotificationsRead, updateUser } = useData();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const notifications = getNotificationsByUser(user.uid).slice(0, 15);
  const unread = getUnreadCount(user.uid);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length > 0) {
      updateUser(user.uid, { password: newPassword });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      toast.success('Password changed successfully!');
    }
  };

  const handleNotifClick = (n: typeof notifications[0]) => {
    markNotificationRead(n.notificationId);
    setNotifOpen(false);
    if (n.relatedPassId) navigate(`/student/pass/${n.relatedPassId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            {title ? (
              <h1 className="text-base font-semibold text-gray-800">{title}</h1>
            ) : (
              <div>
                <div className="text-base font-semibold text-gray-800 leading-tight">{user.name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <Link
              to="/admin/settings"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </Link>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead(user.uid)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)}>
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.notificationId}
                        onClick={() => handleNotifClick(n)}
                        className={cn(
                          'flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors',
                          !n.isRead && 'bg-blue-50/60'
                        )}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {NOTIF_ICON[n.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 leading-tight">{n.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</div>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 px-4 py-2 text-center">
                  <Link
                    to={`/${user.role}/notifications`}
                    onClick={() => setNotifOpen(false)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="w-8 h-8 rounded-full bg-[#082b63] flex items-center justify-center text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </button>
            
            {avatarOpen && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                <button
                   onClick={() => { setAvatarOpen(false); setIsPasswordModalOpen(true); }}
                   className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                >
                  <Lock size={15} className="text-gray-400" /> Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                <input required type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder="Enter new password" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-[#082b63] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#0b326f] transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
