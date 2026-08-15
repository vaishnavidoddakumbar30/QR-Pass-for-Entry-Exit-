import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, QrCode, Bell, User,
  ClipboardList, Scan, Activity, AlertTriangle, Users,
  BarChart3, Settings, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cn } from '../utils';
import type { UserRole } from '../types';

interface MobileNavItem { label: string; path: string; icon: React.ReactNode; }

const MOBILE_NAV: Record<UserRole, MobileNavItem[]> = {
  student: [
    { label: 'Home',    path: '/student/dashboard',    icon: <LayoutDashboard size={20} /> },
    { label: 'Apply',   path: '/student/apply',         icon: <FileText size={20} /> },
    { label: 'Passes',  path: '/student/passes',        icon: <QrCode size={20} /> },
    { label: 'Notifs',  path: '/student/notifications', icon: <Bell size={20} /> },
    { label: 'Profile', path: '/student/profile',       icon: <User size={20} /> },
  ],
  warden: [
    { label: 'Home',     path: '/warden/dashboard',    icon: <LayoutDashboard size={20} /> },
    { label: 'Requests', path: '/warden/requests',     icon: <ClipboardList size={20} /> },
    { label: 'Late',     path: '/warden/late-entry',   icon: <Clock size={20} /> },
    { label: 'Notifs',   path: '/warden/notifications',icon: <Bell size={20} /> },
  ],
  security: [
    { label: 'Home',     path: '/security/dashboard',  icon: <LayoutDashboard size={20} /> },
    { label: 'Scanner',  path: '/security/scanner',    icon: <Scan size={20} /> },
    { label: 'Entry',    path: '/security/entry-exit', icon: <Activity size={20} /> },
    { label: 'Alerts',   path: '/security/alerts',     icon: <AlertTriangle size={20} /> },
  ],
  admin: [
    { label: 'Home',     path: '/admin/dashboard',     icon: <LayoutDashboard size={20} /> },
    { label: 'Users',    path: '/admin/users',          icon: <Users size={20} /> },
    { label: 'Analytics',path: '/admin/analytics',     icon: <BarChart3 size={20} /> },
    { label: 'Settings', path: '/admin/settings',      icon: <Settings size={20} /> },
  ],
};

const MobileNavigation: React.FC = () => {
  const { user } = useAuth();
  const { getUnreadCount } = useData();
  if (!user) return null;

  const items = MOBILE_NAV[user.role];
  const unread = getUnreadCount(user.uid);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex">
        {items.map(item => {
          const isNotif = item.label === 'Notifs';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors relative',
                isActive ? 'text-[#082b63]' : 'text-gray-400'
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isActive ? 'bg-[#082b63]/10' : ''
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isNotif && unread > 0 && (
                    <span className="absolute top-1.5 left-1/2 ml-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
