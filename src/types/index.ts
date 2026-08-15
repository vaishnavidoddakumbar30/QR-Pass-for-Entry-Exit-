// ─── Core Enums ───────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'warden' | 'security' | 'admin';

export type PassType = 'daily' | 'home' | 'outing' | 'emergency';

export type PassStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'used'
  | 'active';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export type NotificationType =
  | 'request_submitted'
  | 'request_approved'
  | 'request_rejected'
  | 'pass_generated'
  | 'pass_expiring'
  | 'late_entry'
  | 'warden_approval'
  | 'security_alert'
  | 'emergency_alert'
  | 'gate_entry'
  | 'gate_exit'
  | 'system';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type GateAction = 'entry' | 'exit';

export type LateEntryStatus = 'pending' | 'approved' | 'rejected';

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  name: string;
  email: string;
  password?: string;
  usn?: string;
  department?: string;
  year?: number;
  role: UserRole;
  phone?: string;
  photoURL?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parentName?: string;
  parentPhone?: string;
  hostelBlock?: string;
  roomNumber?: string;
}

// ─── Pass ─────────────────────────────────────────────────────────────────────

export interface Pass {
  passId: string;
  studentId: string;
  studentName: string;
  studentUsn?: string;
  studentDepartment?: string;
  studentYear?: number;
  type: PassType;
  status: PassStatus;
  destination?: string;
  reason: string;
  validFrom: Date;
  validUntil: Date;
  entryTime?: Date;
  exitTime?: Date;
  qrToken: string;
  approvedBy?: string;
  approverName?: string;
  rejectionReason?: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  documentUrl?: string;
  departureTime?: Date;
  expectedReturnTime?: Date;
  isLateEntry?: boolean;
  lateEntryStatus?: LateEntryStatus;
  extensionRequest?: {
    requestedUntil: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface LeaveRequest {
  requestId: string;
  studentId: string;
  studentName: string;
  studentUsn?: string;
  studentDepartment?: string;
  studentYear?: number;
  studentPhone?: string;
  type: PassType;
  status: RequestStatus;
  destination?: string;
  reason: string;
  departureDate: Date;
  departureTime: string;
  expectedReturnDate: Date;
  expectedReturnTime: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  documentUrl?: string;
  wardenId?: string;
  wardenName?: string;
  rejectionReason?: string;
  passId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Gate Log ─────────────────────────────────────────────────────────────────

export interface GateLog {
  logId: string;
  passId: string;
  studentId: string;
  studentName: string;
  studentUsn?: string;
  action: GateAction;
  timestamp: Date;
  recordedBy: string;
  securityName?: string;
  isLate?: boolean;
  notes?: string;
  deviceInfo?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  notificationId: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedPassId?: string;
  relatedRequestId?: string;
  createdAt: Date;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface Alert {
  alertId: string;
  type: 'late_entry' | 'emergency' | 'security' | 'system';
  severity: AlertSeverity;
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  passId?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  logId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  result: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ─── QR Verification ──────────────────────────────────────────────────────────

export type QRVerificationState =
  | 'idle'
  | 'scanning'
  | 'verifying'
  | 'valid'
  | 'expired'
  | 'invalid'
  | 'already_used'
  | 'error';

export interface QRVerificationResult {
  state: QRVerificationState;
  pass?: Pass;
  student?: User;
  message?: string;
  timestamp?: Date;
}

// ─── QR Payload (encoded in QR) ──────────────────────────────────────────────

export interface QRPayload {
  passId: string;
  token: string;
  type: PassType;
  ts: number; // created timestamp
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface StudentDashboardStats {
  activePasses: number;
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
}

export interface WardenDashboardStats {
  pendingRequests: number;
  approvedToday: number;
  activePasses: number;
  lateEntryRequests: number;
}

export interface SecurityDashboardStats {
  entriesToday: number;
  exitsToday: number;
  lateEntriesToday: number;
  invalidAttempts: number;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalWardens: number;
  totalSecurity: number;
  activePasses: number;
  requestsToday: number;
  approvalRate: number;
  rejections: number;
  lateEntries: number;
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface LeaveRequestFormData {
  type: PassType;
  destination: string;
  reason: string;
  departureDate: string;
  departureTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  parentName: string;
  parentPhone: string;
  emergencyContact: string;
  document?: File;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface SystemSettings {
  institutionName: string;
  allowedEmailDomain: string;
  maxPassDuration: number; // days
  dailyPassValidHours: { from: string; to: string };
  lateEntryGracePeriod: number; // minutes
  parentNotificationsEnabled: boolean;
  emergencyContactsEnabled: boolean;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}
