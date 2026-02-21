import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-28 relative overflow-hidden">
      {/* ──────── Navbar ──────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/95 backdrop-blur-2xl shadow-xl shadow-black/[.05] border-slate-300/70' : 'bg-white/80 backdrop-blur-md border-slate-200/40'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-xl shadow-black/[0.05] border border-slate-100 flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
              <img src="/Images/FleetFlow.webp" alt="FleetFlow" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">FleetFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#DD700B] transition uppercase tracking-widest">
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(221, 112, 11, 0.05)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(252, 248, 216, 0.1)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.2)' }}>
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">FleetFlow</h1>
          <p className="text-slate-500 mt-1 text-sm">Modular Fleet & Logistics Management</p>
        </div>

        {/* Card */}
        <div className="bg-white border rounded-3xl p-8 shadow-xl" style={{ borderColor: '#D9DADF' }}>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition text-sm"
                style={{ borderColor: errors.email ? '#EF4444' : '#D9DADF', '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}
                onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.email ? '#EF4444' : '#D9DADF'; }}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1 ml-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors(prev => ({ ...prev, password: '' })); }}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition text-sm"
                style={{ borderColor: errors.password ? '#EF4444' : '#D9DADF', '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}
                onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }}
                onBlur={(e) => { e.target.style.borderColor = errors.password ? '#EF4444' : '#D9DADF'; }}
              />
              {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#C25C07'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">Contact your administrator for account access</p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">FleetFlow &copy; 2026 &mdash; Hackathon Project</p>
      </div>
    </div>
  );
}
