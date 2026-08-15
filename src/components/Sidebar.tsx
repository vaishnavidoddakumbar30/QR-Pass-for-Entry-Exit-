import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, QrCode, Bell, User, Shield,
  Users, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Scan, ClipboardList, AlertTriangle, Clock, Home, Menu, X,
  Activity, BookOpen, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { cn } from '../utils';
import type { UserRole } from '../types';

// ─── Nav Item Type ────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_CONFIG: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard',    path: '/student/dashboard',      icon: <LayoutDashboard size={18} /> },
    { label: 'Apply',        path: '/student/apply',          icon: <FileText size={18} /> },
    { label: 'My Passes',    path: '/student/passes',         icon: <QrCode size={18} /> },
    { label: 'Requests',     path: '/student/requests',       icon: <ClipboardList size={18} /> },
    { label: 'Notifications',path: '/student/notifications',  icon: <Bell size={18} /> },
    { label: 'Profile',      path: '/student/profile',        icon: <User size={18} /> },
  ],
  warden: [
    { label: 'Dashboard',    path: '/warden/dashboard',       icon: <LayoutDashboard size={18} /> },
    { label: 'Requests',     path: '/warden/requests',        icon: <ClipboardList size={18} /> },
    { label: 'Late Entry',   path: '/warden/late-entry',      icon: <Clock size={18} /> },
    { label: 'Notifications',path: '/warden/notifications',   icon: <Bell size={18} /> },
    { label: 'Profile',      path: '/warden/profile',         icon: <User size={18} /> },
  ],
  security: [
    { label: 'Dashboard',    path: '/security/dashboard',     icon: <LayoutDashboard size={18} /> },
    { label: 'Scanner',      path: '/security/scanner',       icon: <Scan size={18} /> },
    { label: 'Entry / Exit', path: '/security/entry-exit',    icon: <Activity size={18} /> },
    { label: 'Late Entry',   path: '/security/late-entry',    icon: <Clock size={18} /> },
    { label: 'Alerts',       path: '/security/alerts',        icon: <AlertTriangle size={18} /> },
    { label: 'Profile',      path: '/security/profile',       icon: <User size={18} /> },
  ],
  admin: [
    { label: 'Dashboard',    path: '/admin/dashboard',        icon: <LayoutDashboard size={18} /> },
    { label: 'Users',        path: '/admin/users',            icon: <Users size={18} /> },
    { label: 'Requests',     path: '/admin/requests',         icon: <ClipboardList size={18} /> },
    { label: 'Passes',       path: '/admin/passes',           icon: <QrCode size={18} /> },
    { label: 'Analytics',    path: '/admin/analytics',        icon: <BarChart3 size={18} /> },
    { label: 'Audit Logs',   path: '/admin/audit-logs',       icon: <BookOpen size={18} /> },
    { label: 'Settings',     path: '/admin/settings',         icon: <Settings size={18} /> },
    { label: 'Profile',      path: '/admin/profile',          icon: <User size={18} /> },
  ],
};

// ─── Role Colors ─────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<UserRole, string> = {
  student:  'bg-blue-500/20 text-blue-200',
  warden:   'bg-green-500/20 text-green-200',
  security: 'bg-orange-500/20 text-orange-200',
  admin:    'bg-purple-500/20 text-purple-200',
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const { getUnreadCount } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = NAV_CONFIG[user.role];
  const unread = getUnreadCount(user.uid);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-[#22a447] flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-sm leading-tight whitespace-nowrap">Zero Paper</div>
            <div className="text-white/50 text-[10px] whitespace-nowrap">KLS GIT</div>
          </div>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="ml-auto text-white/50 hover:text-white p-1 rounded hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        <button onClick={onMobileClose} className="ml-auto text-white/50 hover:text-white p-1 rounded lg:hidden">
          <X size={16} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.path);
          const isNotif = item.label === 'Notifications';
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                'sidebar-item',
                active ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {isNotif && unread > 0 && (
                <span className={cn(
                  'flex-shrink-0 text-[10px] font-bold rounded-full px-1.5 py-0.5 bg-red-500 text-white',
                  collapsed ? 'absolute top-1 right-1 text-[8px]' : ''
                )}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="border-t border-white/10 p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <button onClick={handleLogout} className="text-white/60 hover:text-red-300 transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-white text-xs font-semibold truncate">{user.name}</div>
                <div className="text-white/50 text-[10px] truncate">{user.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', ROLE_BADGE[user.role])}>
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-white/60 hover:text-red-300 flex items-center gap-1 text-[11px] transition-colors"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col bg-[#082b63] flex-shrink-0 transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-56'
      )}>
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#082b63]">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
