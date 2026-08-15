import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, QrCode, Bell, Users, AlertTriangle, BookOpen,
  ArrowRight, CheckCircle2, Smartphone, Lock
} from 'lucide-react';

const FEATURES = [
  { icon: <QrCode size={22} className="text-[#22a447]" />, title: 'QR-Based Verification', desc: 'Instant, tamper-proof verification at every gate using secure QR codes.' },
  { icon: <Bell size={22} className="text-blue-500" />,     title: 'Real-Time Tracking',   desc: 'Live notifications for students, wardens, and parents on entry/exit.' },
  { icon: <Users size={22} className="text-purple-500" />,  title: 'Role-Based Access',    desc: 'Dedicated dashboards for Students, Wardens, Security, and Admins.' },
  { icon: <BookOpen size={22} className="text-orange-500" />,title: 'Digital Leave Mgmt',  desc: 'Paperless leave requests with instant warden approval workflow.' },
  { icon: <AlertTriangle size={22} className="text-red-500" />, title: 'Emergency Support', desc: 'One-tap emergency alerts with instant notification to wardens.' },
  { icon: <Lock size={22} className="text-[#082b63]" />,    title: 'Transparent Audit',   desc: 'Every action is logged — full accountability and compliance.' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#082b63] flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="font-black text-[#082b63] text-base leading-tight">Zero Paper</div>
              <div className="text-[10px] text-gray-400">KLS Gogte Institute of Technology</div>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 bg-[#082b63] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0b326f] transition-colors shadow"
          >
            Login <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#082b63] via-[#0b326f] to-[#123f7a]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-[#22a447]/10" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Left text */}
          <div className="flex-1 text-center lg:text-left">

            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              Zero Paper
            </h1>
            <h2 className="text-xl lg:text-2xl font-semibold text-white/70 mb-4">
              Digital Gate Pass & Leave System
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              A secure, transparent and smart campus ecosystem. Replace paperwork with QR codes, 
              real-time tracking, and role-based dashboards for KLS Gogte Institute of Technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-[#22a447] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#1a7d37] transition-colors shadow-lg"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>

            {/* Key stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10">
              {[
                { val: '100%', label: 'Paperless' },
                { val: '4',    label: 'User Roles' },
                { val: 'Real-time', label: 'Notifications' },
              ].map(s => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Digital Pass Preview */}
          <div className="flex-shrink-0">
            <div className="relative w-72">
              {/* Floating card */}
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#22a447] flex items-center justify-center">
                    <QrCode size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Daily Student Pass</div>
                    <div className="text-white/50 text-xs">PASS-2024-00123</div>
                  </div>
                </div>
                {/* Fake QR */}
                <div className="bg-white rounded-xl p-3 mb-3 flex items-center justify-center">
                  <div className="w-24 h-24 grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`rounded-sm ${[0,1,4,5,6,7,8,9,12,15,16,17,18,19,20,24].includes(i) ? 'bg-[#082b63]' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-white/50 text-[10px]">Student</div>
                    <div className="text-white font-semibold">Rahul Patil</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-white/50 text-[10px]">Status</div>
                    <div className="text-[#22a447] font-bold">● Active</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-white/50 text-[10px]">Valid until 15 Sep 2024</div>
                  <div className="bg-[#22a447]/20 rounded-full px-2 py-0.5">
                    <span className="text-[#22a447] text-[10px] font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl px-3 py-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#22a447]" />
                <span className="text-xs font-bold text-gray-700">Gate Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-[#082b63] mb-3">Everything You Need</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A complete campus management ecosystem designed for safety, efficiency, and transparency.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 card-shadow hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-[#082b63] mb-10">How It Works</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {[
              { step: '1', label: 'Student Applies', desc: 'Submit leave/gate-pass request online' },
              { step: '2', label: 'Warden Reviews',  desc: 'Approve or reject with one click' },
              { step: '3', label: 'QR Generated',    desc: 'Secure digital pass is created' },
              { step: '4', label: 'Gate Scanned',    desc: 'Security verifies and logs entry/exit' },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center gap-2 w-32">
                  <div className="w-12 h-12 rounded-full bg-[#082b63] text-white font-black text-lg flex items-center justify-center">
                    {s.step}
                  </div>
                  <div className="font-semibold text-gray-800 text-sm">{s.label}</div>
                  <div className="text-gray-400 text-xs text-center">{s.desc}</div>
                </div>
                {i < 3 && <ArrowRight size={18} className="text-gray-300 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#082b63] to-[#123f7a] py-12 text-center">
        <h2 className="text-2xl font-black text-white mb-3">Ready to go paperless?</h2>
        <p className="text-white/60 mb-6 text-sm">Join KLS Gogte Institute of Technology's digital campus initiative.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-[#22a447] text-white px-7 py-3 rounded-xl font-semibold hover:bg-[#1a7d37] transition-colors shadow-lg"
        >
          Login Now <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#051d45] py-6 text-center">
        <div className="text-white/40 text-xs">
          © 2024 Zero Paper — KLS Gogte Institute of Technology, Belagavi
          <br />
          Powered by Rotaract Club of District 3170
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
