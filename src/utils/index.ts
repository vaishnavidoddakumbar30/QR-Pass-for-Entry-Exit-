import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import type { PassStatus, RequestStatus, UserRole, PassType } from '../types';

// ─── Class Name Utility ───────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatters ──────────────────────────────────────────────────────────

export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return '—';
  }
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMM yyyy, hh:mm a');
  } catch {
    return '—';
  }
};

export const formatTime = (date: Date | string | undefined): string => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'hh:mm a');
  } catch {
    return '—';
  }
};

export const timeAgo = (date: Date | string | undefined): string => {
  if (!date) return '—';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '—';
  }
};

// ─── Pass/Status Helpers ─────────────────────────────────────────────────────

export const isPassExpired = (validUntil: Date): boolean =>
  isBefore(new Date(validUntil), new Date());

export const isPassValid = (pass: { validFrom: Date; validUntil: Date; status: string }): boolean => {
  const now = new Date();
  return (
    pass.status === 'active' || pass.status === 'approved'
    && isAfter(now, new Date(pass.validFrom))
    && isBefore(now, new Date(pass.validUntil))
  );
};

export const getStatusClass = (status: PassStatus | RequestStatus): string => {
  switch (status) {
    case 'pending':   return 'status-pending';
    case 'approved':  return 'status-approved';
    case 'active':    return 'status-active';
    case 'rejected':  return 'status-rejected';
    case 'expired':   return 'status-expired';
    case 'used':      return 'status-used';
    case 'cancelled': return 'status-cancelled';
    default:          return 'status-expired';
  }
};

export const getStatusLabel = (status: PassStatus | RequestStatus): string => {
  switch (status) {
    case 'pending':   return 'Pending';
    case 'approved':  return 'Approved';
    case 'active':    return 'Active';
    case 'rejected':  return 'Rejected';
    case 'expired':   return 'Expired';
    case 'used':      return 'Used';
    case 'cancelled': return 'Cancelled';
    default:          return status;
  }
};

export const getPassTypeLabel = (type: PassType): string => {
  switch (type) {
    case 'daily':     return 'Daily Pass';
    case 'home':      return 'Home Pass';
    case 'outing':    return 'Outing Pass';
    case 'emergency': return 'Emergency Pass';
    default:          return type;
  }
};

export const getPassTypeIcon = (type: PassType): string => {
  switch (type) {
    case 'daily':     return '📅';
    case 'home':      return '🏠';
    case 'outing':    return '🚪';
    case 'emergency': return '🚨';
    default:          return '📋';
  }
};

// ─── Role Helpers ────────────────────────────────────────────────────────────

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'student':  return 'Student';
    case 'warden':   return 'Warden';
    case 'security': return 'Security';
    case 'admin':    return 'Admin';
  }
};

export const getRoleDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'student':  return '/student/dashboard';
    case 'warden':   return '/warden/dashboard';
    case 'security': return '/security/dashboard';
    case 'admin':    return '/admin/dashboard';
  }
};

// ─── QR Token Generator ───────────────────────────────────────────────────────

export const generateQRToken = (): string => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const generatePassId = (type?: PassType): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  
  let prefix = 'PASS';
  if (type === 'daily') prefix = 'DP';
  else if (type === 'home') prefix = 'HP';
  else if (type === 'outing') prefix = 'OP';
  else if (type === 'emergency') prefix = 'EP';

  return `${prefix}-${year}-${random}`;
};

export const generateRequestId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `REQ-${year}-${random}`;
};

// ─── Email Validator ─────────────────────────────────────────────────────────

export const isInstitutionalEmail = (email: string): boolean =>
  email.endsWith('@git.edu') || email.endsWith('@gmail.com');

// ─── Greeting ────────────────────────────────────────────────────────────────

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Truncate ────────────────────────────────────────────────────────────────

export const truncate = (str: string, len: number): string =>
  str.length > len ? str.slice(0, len) + '…' : str;

// ─── Avatar Fallback ─────────────────────────────────────────────────────────

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
