import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';
import emailjs from '@emailjs/browser';

const ForgotPasswordPage: React.FC = () => {
  const { users, updateUser } = useData();
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      toast.error('Email not found in the system');
      return;
    }

    const generatedPassword = 'temp' + Math.floor(Math.random() * 9000 + 1000);
    console.log("Temporary Password (Fallback):", generatedPassword);
    
    toast.promise(
      emailjs.send(
        'service_bs4xwrh',
        'template_15f1egf',
        {
          to_name: user.name,
          user_email: user.email,
          temp_password: generatedPassword,
        },
        'puSBtGAs946Nn8RpV'
      ),
      {
        loading: 'Sending reset email...',
        success: () => {
          updateUser(user.uid, { password: generatedPassword });
          setSent(true);
          return 'Password reset email sent!';
        },
        error: (err) => {
          console.error("EmailJS Error:", err);
          return 'Failed to send email. Check your EmailJS service connection.';
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#082b63] flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <div className="font-black text-[#082b63]">Zero Paper</div>
            <div className="text-xs text-gray-400">KLS Gogte Institute of Technology</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 card-shadow border border-gray-100">
          {!sent ? (
            <>
              <h1 className="text-xl font-black text-gray-800 mb-1">Reset Password</h1>
              <p className="text-gray-400 text-sm mb-5">Enter your registered email to receive a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@email.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#082b63]/20"
                />
                <button type="submit" className="w-full bg-[#082b63] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0b326f]">
                  Reset Password
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="font-bold text-gray-800 mb-2">Email Sent!</h2>
              <p className="text-gray-400 text-sm">Check {email} for your temporary password.</p>
            </div>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1.5 mt-4 text-sm text-gray-500 hover:text-[#082b63] transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
