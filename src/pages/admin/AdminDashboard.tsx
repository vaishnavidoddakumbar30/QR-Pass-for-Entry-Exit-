import React from 'react';
import {
  Users, QrCode, ClipboardList, TrendingUp, TrendingDown,
  BarChart3, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useData } from '../../context/DataContext';
import DashboardCard from '../../components/DashboardCard';
import {
  MOCK_WEEKLY_REQUESTS, MOCK_PASS_TYPE_DIST,
  MOCK_DEPT_REQUESTS, MOCK_ENTRY_EXIT_ACTIVITY
} from '../../data/mockData';

const PIE_COLORS = ['#082b63', '#22a447', '#f59e0b', '#ef4444'];
const CHART_COLORS = { requests: '#082b63', approved: '#22a447', rejected: '#ef4444' };

const AdminDashboard: React.FC = () => {
  const { users, passes, requests, gateLogs } = useData();

  const totalStudents  = users.filter(u => u.role === 'student').length;
  const totalWardens   = users.filter(u => u.role === 'warden').length;
  const totalSecurity  = users.filter(u => u.role === 'security').length;
  const activePasses   = passes.filter(p => p.status === 'active' || p.status === 'approved').length;

  const today = new Date().toDateString();
  const requestsToday  = requests.filter(r => new Date(r.createdAt).toDateString() === today).length;
  const approvedTotal  = requests.filter(r => r.status === 'approved').length;
  const rejectedTotal  = requests.filter(r => r.status === 'rejected').length;
  const approvalRate   = requests.length > 0 ? Math.round((approvedTotal / requests.length) * 100) : 0;
  const lateEntries    = gateLogs.filter(l => l.isLate).length;

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">System overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardCard title="Total Students" value={totalStudents} icon={<Users size={20} className="text-blue-600" />} iconBg="bg-blue-100" />
        <DashboardCard title="Wardens"        value={totalWardens}  icon={<Users size={20} className="text-green-600" />} iconBg="bg-green-100" />
        <DashboardCard title="Security Staff" value={totalSecurity} icon={<Users size={20} className="text-orange-600" />} iconBg="bg-orange-100" />
        <DashboardCard title="Active Passes"  value={activePasses}  icon={<QrCode size={20} className="text-purple-600" />} iconBg="bg-purple-100" />
        <DashboardCard title="Requests Today" value={requestsToday} icon={<ClipboardList size={20} className="text-gray-600" />} iconBg="bg-gray-100" />
        <DashboardCard title="Approval Rate"  value={`${approvalRate}%`} icon={<TrendingUp size={20} className="text-green-600" />} iconBg="bg-green-100" />
        <DashboardCard title="Rejections"     value={rejectedTotal} icon={<TrendingDown size={20} className="text-red-600" />} iconBg="bg-red-100" />
        <DashboardCard title="Late Entries"   value={lateEntries}   icon={<AlertTriangle size={20} className="text-amber-600" />} iconBg="bg-amber-100" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#082b63]" />
            Requests This Week
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_WEEKLY_REQUESTS}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#082b63" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#082b63" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22a447" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22a447" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="requests" stroke="#082b63" fill="url(#reqGrad)" strokeWidth={2} name="Total" />
              <Area type="monotone" dataKey="approved" stroke="#22a447" fill="url(#appGrad)" strokeWidth={2} name="Approved" />
              <Area type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} fill="none" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pass Type Distribution */}
        <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Pass Type Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={MOCK_PASS_TYPE_DIST}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_PASS_TYPE_DIST.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {MOCK_PASS_TYPE_DIST.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Requests */}
        <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Requests by Department</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_DEPT_REQUESTS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="requests" fill="#082b63" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Entry/Exit Activity */}
        <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Entry/Exit Activity (Today)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_ENTRY_EXIT_ACTIVITY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="entries" fill="#22a447" radius={[2,2,0,0]} name="Entries" />
              <Bar dataKey="exits"   fill="#082b63" radius={[2,2,0,0]} name="Exits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
