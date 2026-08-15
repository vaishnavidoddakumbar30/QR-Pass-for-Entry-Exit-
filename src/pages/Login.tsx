import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Users, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils';
import type { UserRole } from '../types';
import { toast } from 'sonner';

const DEMO_ROLES: { role: UserRole; label: string; color: string; email: string }[] = [
  { role: 'student',  label: 'Student',  color: 'bg-blue-600',   email: 'rahul.patil@git.edu' },
  { role: 'warden',   label: 'Warden',   color: 'bg-green-600',  email: 'meena.sharma@git.edu' },
  { role: 'security', label: 'Security', color: 'bg-orange-600', email: 'ramesh.kumar@git.edu' },
  { role: 'admin',    label: 'Admin',    color: 'bg-purple-600', email: 'suresh.hegde@git.edu' },
];

const LoginPage: React.FC = () => {
  const { login, loginAsDemo, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'demo'>('demo');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    try {
      await login(email, password);
      const { user } = await import('../context/AuthContext').then(m => ({ user: null }));
      // After login, redirect happens via useEffect below
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = (role: UserRole, email: string) => {
    loginAsDemo(role);
    toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    navigate(getRoleDashboardPath(role));
  };

  // Watch auth state changes
  const { user } = useAuth();
  React.useEffect(() => {
    if (user) navigate(getRoleDashboardPath(user.role), { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#082b63] via-[#0b326f] to-[#123f7a] flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute bottom-10 -left-10 w-56 h-56 rounded-full bg-[#22a447]/10" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22a447] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="font-black text-white text-lg leading-tight">Zero Paper</div>
            <div className="text-white/50 text-xs">Digital Gate Pass & Leave System</div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Empowering a secure,<br />
            transparent and smart<br />
            <span className="text-[#22a447]">campus ecosystem.</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            KLS Gogte Institute of Technology's digital campus management system. 
            Paperless. Real-time. Secure.
          </p>
        </div>

        <div></div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-6 py-10">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-[#082b63] flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <div className="font-black text-[#082b63] text-base">Zero Paper</div>
            <div className="text-gray-400 text-xs">KLS Gogte Institute of Technology</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-7">
          <h1 className="text-2xl font-black text-gray-800 mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to your campus account</p>

          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {[
              { id: 'demo', label: 'Demo Mode', icon: <Users size={14} /> },
              { id: 'login', label: 'Email Login', icon: <Mail size={14} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'login' | 'demo')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-white text-[#082b63] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Demo Mode */}
          {activeTab === 'demo' && (
            <div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-2">
                <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Demo mode — explore all features with realistic data. No Firebase credentials needed.
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-3 font-medium">Select a role to explore:</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ROLES.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleDemoLogin(r.role, r.email)}
                    className={`${r.color} text-white rounded-xl py-3 px-4 text-sm font-bold hover:opacity-90 transition-opacity shadow flex flex-col items-center gap-1`}
                  >
                    <span className="text-base">
                      {r.role === 'student' ? '🎓' : r.role === 'warden' ? '👨‍🏫' : r.role === 'security' ? '🛡️' : '⚙️'}
                    </span>
                    {r.label}
                    <span className="text-xs opacity-75 font-normal">{r.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63] transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Use your registered email address</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20 focus:border-[#082b63] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#082b63]"
                  />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-[#082b63] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#082b63] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b326f] transition-colors shadow disabled:opacity-50"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Having trouble? Contact{' '}
          <a href="mailto:admin@git.edu" className="text-[#082b63] hover:underline">admin@git.edu</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
