import React, { useState, useRef } from 'react';
import { Search, UserCheck, UserX, Shield, Edit2, Upload } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ConfirmationDialog } from '../../components/Dialogs';
import { getInitials, getRoleLabel, formatDate } from '../../utils';
import type { UserRole, User } from '../../types';
import { toast } from 'sonner';

const UserManagement: React.FC = () => {
  const { users, updateUser, addUser, deleteUser, addMultipleUsers } = useData();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [confirmToggle, setConfirmToggle] = useState<{ uid: string; name: string; active: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ uid: string; name: string } | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as UserRole, department: '', usn: '', password: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.usn?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const ROLE_BADGE: Record<UserRole, string> = {
    student:  'bg-blue-100 text-blue-700',
    warden:   'bg-green-100 text-green-700',
    security: 'bg-orange-100 text-orange-700',
    admin:    'bg-purple-100 text-purple-700',
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...newUser };
    
    if (editingUser) {
      if (!dataToSave.password) {
        delete dataToSave.password; // Don't override with empty string if not changing
      }
      updateUser(editingUser.uid, dataToSave);
      toast.success(`User ${newUser.name} updated successfully!`);
    } else {
      // Set default password for new users if left blank
      if (!dataToSave.password) {
        if (dataToSave.role === 'student' && dataToSave.usn) {
          dataToSave.password = dataToSave.usn;
        } else {
          dataToSave.password = dataToSave.email.split('@')[0];
        }
      }
      addUser({ ...dataToSave, isActive: true });
      toast.success(`User ${newUser.name} added successfully!`);
    }
    
    setShowAddUser(false);
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'student', department: '', usn: '', password: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        toast.error('CSV file is empty or missing headers');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedUsers: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        // A simple split by comma. Note: won't handle commas inside quotes.
        const values = lines[i].split(',').map(v => v.trim());
        const userObj: any = { isActive: true };
        
        headers.forEach((header, index) => {
          if (values[index] && values[index] !== '') {
            userObj[header] = values[index];
          }
        });

        if (userObj.name && userObj.email && userObj.role) {
          if (userObj.year) userObj.year = parseInt(userObj.year, 10);
          
          if (!userObj.password) {
            if (userObj.role === 'student' && userObj.usn) {
                userObj.password = userObj.usn;
            } else {
                userObj.password = userObj.email.split('@')[0];
            }
          }

          parsedUsers.push(userObj as Omit<User, 'uid' | 'createdAt' | 'updatedAt'>);
        }
      }

      if (parsedUsers.length > 0) {
        addMultipleUsers(parsedUsers);
        toast.success(`Successfully uploaded ${parsedUsers.length} users!`);
      } else {
        toast.error('No valid users found in CSV');
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {confirmToggle && (
        <ConfirmationDialog
          isOpen
          title={confirmToggle.active ? 'Deactivate User' : 'Activate User'}
          message={`Are you sure you want to ${confirmToggle.active ? 'deactivate' : 'activate'} ${confirmToggle.name}?`}
          confirmLabel={confirmToggle.active ? 'Deactivate' : 'Activate'}
          variant={confirmToggle.active ? 'warning' : 'default'}
          onConfirm={() => {
            updateUser(confirmToggle.uid, { isActive: !confirmToggle.active });
            toast.success(`User ${confirmToggle.active ? 'deactivated' : 'activated'}`);
            setConfirmToggle(null);
          }}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmationDialog
          isOpen
          title="Delete User"
          message={`Are you sure you want to permanently delete ${confirmDelete.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => {
            deleteUser(confirmDelete.uid);
            toast.success(`User ${confirmDelete.name} deleted`);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddUser(false); setEditingUser(null); setNewUser({ name: '', email: '', role: 'student', department: '', usn: '', password: '' }); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input required value={newUser.name} onChange={e => setNewUser(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder="john@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20">
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="security">Security</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {newUser.role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">USN</label>
                  <input required value={newUser.usn} onChange={e => setNewUser(prev => ({ ...prev, usn: e.target.value.toUpperCase() }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder="2GI21CS001" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                <input type="text" value={newUser.password || ''} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder={editingUser ? "Unchanged" : newUser.role === 'student' ? "Defaults to USN if blank" : "Defaults to email prefix if blank"} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                <input value={newUser.department} onChange={e => setNewUser(prev => ({ ...prev, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20" placeholder="e.g. CSE" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddUser(false); setEditingUser(null); setNewUser({ name: '', email: '', role: 'student', department: '', usn: '', password: '' }); }} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-[#082b63] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#0b326f] transition-colors">{editingUser ? 'Save Changes' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800">User Management</h1>
          <p className="text-gray-400 text-sm">{filtered.length} users in system</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm border border-gray-200"
          >
            <Upload size={16} /> Bulk Upload CSV
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-[#082b63] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0b326f] transition-colors shadow-sm"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, USN…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value as UserRole | 'all')}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="warden">Wardens</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['User', 'Role', 'Department', 'USN', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#082b63] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(u.name)
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[u.role]}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.department || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{u.usn || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button
                        title="Edit User"
                        onClick={() => {
                          setEditingUser(u);
                          setNewUser({ name: u.name, email: u.email, role: u.role, department: u.department || '', usn: u.usn || '', password: '' });
                          setShowAddUser(true);
                        }}
                        className="text-gray-400 hover:text-[#082b63] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        title={u.isActive ? "Deactivate" : "Activate"}
                        onClick={() => setConfirmToggle({ uid: u.uid, name: u.name, active: u.isActive })}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          u.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirmDelete({ uid: u.uid, name: u.name })}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
