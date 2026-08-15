import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Pass, LeaveRequest, Notification, GateLog, Alert, AuditLog, User
} from '../types';
import type { UserRole, PassStatus, RequestStatus, PassType } from '../types';
import {
  MOCK_PASSES, MOCK_REQUESTS, MOCK_NOTIFICATIONS, MOCK_GATE_LOGS,
  MOCK_ALERTS, MOCK_AUDIT_LOGS, MOCK_USERS
} from '../data/mockData';
import { generatePassId, generateRequestId, generateQRToken } from '../utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DataContextValue {
  passes: Pass[];
  requests: LeaveRequest[];
  notifications: Notification[];
  gateLogs: GateLog[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  users: User[];
  // Pass operations
  createPass: (data: Omit<Pass, 'passId' | 'qrToken' | 'createdAt' | 'updatedAt'>) => Pass;
  updatePassStatus: (passId: string, status: PassStatus, extra?: Partial<Pass>) => void;
  getPassById: (passId: string) => Pass | undefined;
  getPassesByStudent: (studentId: string) => Pass[];
  verifyQRToken: (token: string) => Pass | undefined;
  requestPassExtension: (passId: string, requestedUntil: Date, reason: string) => void;
  approvePassExtension: (passId: string, isApproved: boolean, wardenId: string, wardenName: string) => void;
  // Request operations
  createRequest: (data: Omit<LeaveRequest, 'requestId' | 'createdAt' | 'updatedAt'>) => LeaveRequest;
  updateRequestStatus: (requestId: string, status: RequestStatus, extra?: Partial<LeaveRequest>) => void;
  getRequestsByStudent: (studentId: string) => LeaveRequest[];
  getPendingRequests: () => LeaveRequest[];
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  addNotification: (n: Omit<Notification, 'notificationId' | 'createdAt'>) => void;
  getNotificationsByUser: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
  // Gate logs
  recordGateAction: (data: Omit<GateLog, 'logId'>) => void;
  // Alerts
  resolveAlert: (alertId: string, resolvedBy: string) => void;
  addAlert: (data: Omit<Alert, 'alertId' | 'createdAt' | 'updatedAt'>) => void;
  // Audit
  addAuditLog: (data: Omit<AuditLog, 'logId' | 'createdAt'>) => void;
  // Users
  addUser: (data: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>) => void;
  addMultipleUsers: (dataArray: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>[]) => void;
  updateUser: (uid: string, data: Partial<User>) => void;
  deleteUser: (uid: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const DataContext = createContext<DataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [passes, setPasses] = useState<Pass[]>(() => {
    const saved = localStorage.getItem('zp_passes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({
          ...p,
          validFrom: new Date(p.validFrom),
          validUntil: new Date(p.validUntil),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          extensionRequest: p.extensionRequest ? {
            ...p.extensionRequest,
            requestedUntil: new Date(p.extensionRequest.requestedUntil)
          } : undefined
        }));
      } catch (e) { return MOCK_PASSES; }
    }
    return MOCK_PASSES;
  });

  const [requests, setRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('zp_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          ...r,
          departureDate: new Date(r.departureDate),
          expectedReturnDate: new Date(r.expectedReturnDate),
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        }));
      } catch (e) { return MOCK_REQUESTS; }
    }
    return MOCK_REQUESTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('zp_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
      } catch (e) { return MOCK_NOTIFICATIONS; }
    }
    return MOCK_NOTIFICATIONS;
  });
  
  const [gateLogs, setGateLogs] = useState<GateLog[]>(() => {
    const saved = localStorage.getItem('zp_gatelogs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }));
      } catch (e) { return MOCK_GATE_LOGS; }
    }
    return MOCK_GATE_LOGS;
  });
  
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('zp_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
          resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : undefined
        }));
      } catch (e) { return MOCK_ALERTS; }
    }
    return MOCK_ALERTS;
  });
  
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('zp_auditlogs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt)
        }));
      } catch (e) { return MOCK_AUDIT_LOGS; }
    }
    return MOCK_AUDIT_LOGS;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('zp_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
      } catch (e) {
        return MOCK_USERS;
      }
    }
    return MOCK_USERS;
  });

  useEffect(() => {
    localStorage.setItem('zp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('zp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('zp_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('zp_passes', JSON.stringify(passes));
  }, [passes]);

  useEffect(() => {
    localStorage.setItem('zp_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('zp_gatelogs', JSON.stringify(gateLogs));
  }, [gateLogs]);

  useEffect(() => {
    localStorage.setItem('zp_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // ── Passes ────────────────────────────────────────────────────────────────

  const createPass = useCallback((data: Omit<Pass, 'passId' | 'qrToken' | 'createdAt' | 'updatedAt'>): Pass => {
    const newPass: Pass = {
      ...data,
      passId: generatePassId(data.type),
      qrToken: generateQRToken(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPasses(prev => [newPass, ...prev]);
    return newPass;
  }, []);

  const updatePassStatus = useCallback((passId: string, status: PassStatus, extra?: Partial<Pass>) => {
    setPasses(prev => prev.map(p =>
      p.passId === passId ? { ...p, status, ...extra, updatedAt: new Date() } : p
    ));
  }, []);

  const getPassById = useCallback((passId: string) => {
    return passes.find(p => p.passId === passId);
  }, [passes]);

  const getPassesByStudent = useCallback((studentId: string) => {
    return passes.filter(p => p.studentId === studentId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [passes]);

  const verifyQRToken = useCallback((token: string) => {
    return passes.find(p => p.qrToken === token);
  }, [passes]);

  const requestPassExtension = useCallback((passId: string, requestedUntil: Date, reason: string) => {
    setPasses(prev => prev.map(p =>
      p.passId === passId
        ? {
            ...p,
            extensionRequest: { requestedUntil, reason, status: 'pending' as const },
            updatedAt: new Date()
          }
        : p
    ));
    
    // Notify warden about the extension request
    const pass = passes.find(p => p.passId === passId);
    if (pass) {
      addNotification({
        recipientId: 'warden-001', // Use the mock warden's UID
        type: 'warden_approval',
        title: 'Pass Extension Request',
        message: `${pass.studentName} requested an extension for pass ${passId} until ${requestedUntil.toLocaleString()}`,
        relatedPassId: passId,
        isRead: false
      });
    }
  }, [passes]);

  const approvePassExtension = useCallback((passId: string, isApproved: boolean, wardenId: string, wardenName: string) => {
    setPasses(prev => prev.map(p => {
      if (p.passId !== passId || !p.extensionRequest) return p;
      
      const newStatus = isApproved ? 'approved' : 'rejected';
      const updatedPass = {
        ...p,
        extensionRequest: { ...p.extensionRequest, status: newStatus as 'approved' | 'rejected' },
        updatedAt: new Date()
      };

      if (isApproved) {
        updatedPass.validUntil = p.extensionRequest.requestedUntil;
      }

      // Notify student
      addNotification({
        recipientId: p.studentId,
        type: 'system',
        title: `Extension ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your pass extension request for ${passId} was ${isApproved ? 'approved' : 'rejected'}.`,
        relatedPassId: passId,
        isRead: false
      });

      return updatedPass;
    }));
  }, []);

  // ── Requests ──────────────────────────────────────────────────────────────

  const createRequest = useCallback((data: Omit<LeaveRequest, 'requestId' | 'createdAt' | 'updatedAt'>): LeaveRequest => {
    const newReq: LeaveRequest = {
      ...data,
      requestId: generateRequestId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRequests(prev => [newReq, ...prev]);
    return newReq;
  }, []);

  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus, extra?: Partial<LeaveRequest>) => {
    setRequests(prev => prev.map(r =>
      r.requestId === requestId ? { ...r, status, ...extra, updatedAt: new Date() } : r
    ));
  }, []);

  const getRequestsByStudent = useCallback((studentId: string) => {
    return requests.filter(r => r.studentId === studentId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests]);

  const getPendingRequests = useCallback(() => {
    return requests.filter(r => r.status === 'pending').sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests]);

  // ── Notifications ─────────────────────────────────────────────────────────

  const addNotification = useCallback((data: Omit<Notification, 'notificationId' | 'createdAt'>) => {
    const n: Notification = {
      ...data,
      notificationId: `NOTIF-${Date.now()}`,
      createdAt: new Date(),
    };
    setNotifications(prev => [n, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => n.recipientId === userId ? { ...n, isRead: true } : n));
  }, []);

  const getNotificationsByUser = useCallback((userId: string) => {
    return notifications.filter(n => n.recipientId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  const getUnreadCount = useCallback((userId: string) => {
    return notifications.filter(n => n.recipientId === userId && !n.isRead).length;
  }, [notifications]);

  // ── Gate Logs ─────────────────────────────────────────────────────────────

  const recordGateAction = useCallback((data: Omit<GateLog, 'logId'>) => {
    const log: GateLog = { ...data, logId: `GATE-${Date.now()}` };
    setGateLogs(prev => [log, ...prev]);
  }, []);

  // ── Alerts ────────────────────────────────────────────────────────────────

  const addAlert = useCallback((data: Omit<Alert, 'alertId' | 'createdAt' | 'updatedAt'>) => {
    const alert: Alert = {
      ...data,
      alertId: `ALERT-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAlerts(prev => [alert, ...prev]);
  }, []);

  const resolveAlert = useCallback((alertId: string, resolvedBy: string) => {
    setAlerts(prev => prev.map(a =>
      a.alertId === alertId
        ? { ...a, isResolved: true, resolvedBy, resolvedAt: new Date(), updatedAt: new Date() }
        : a
    ));
  }, []);

  // ── Audit ─────────────────────────────────────────────────────────────────

  const addAuditLog = useCallback((data: Omit<AuditLog, 'logId' | 'createdAt'>) => {
    const log: AuditLog = { ...data, logId: `AUDIT-${Date.now()}`, createdAt: new Date() };
    setAuditLogs(prev => [log, ...prev]);
  }, []);

  // ── Users ─────────────────────────────────────────────────────────────────

  const addUser = useCallback((data: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...data,
      uid: `USER-${Date.now()}`,
      password: data.password || data.usn || data.email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setUsers(prev => [newUser, ...prev]);
  }, []);

  const addMultipleUsers = useCallback((dataArray: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>[]) => {
    const now = Date.now();
    const newUsers: User[] = dataArray.map((data, index) => ({
      ...data,
      uid: `USER-${now}-${index}`,
      password: data.password || data.usn || data.email.split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    setUsers(prev => [...newUsers, ...prev]);
  }, []);

  const updateUser = useCallback((uid: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...data, updatedAt: new Date() } : u));
  }, []);

  const deleteUser = useCallback((uid: string) => {
    setUsers(prev => prev.filter(u => u.uid !== uid));
  }, []);

  return (
    <DataContext.Provider value={{
      passes, requests, notifications, gateLogs, alerts, auditLogs, users,
      createPass, updatePassStatus, getPassById, getPassesByStudent, verifyQRToken, requestPassExtension, approvePassExtension,
      createRequest, updateRequestStatus, getRequestsByStudent, getPendingRequests,
      addNotification, markNotificationRead, markAllNotificationsRead,
      getNotificationsByUser, getUnreadCount,
      recordGateAction,
      addAlert, resolveAlert,
      addAuditLog,
      addUser,
      addMultipleUsers,
      updateUser,
      deleteUser,
    }}>
      {children}
    </DataContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
