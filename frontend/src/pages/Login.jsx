import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'dispatcher' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (isRegister && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Account created successfully!');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      }
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-sm text-slate-500 mb-6">{isRegister ? 'Register to access the fleet system' : 'Sign in to your account'}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })); }}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition text-sm"
                  style={{ borderColor: errors.name ? '#EF4444' : '#D9DADF', '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}
                  onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.name ? '#EF4444' : '#D9DADF'; }}
                />
                {errors.name && <p className="text-xs text-red-400 mt-1 ml-1">{errors.name}</p>}
              </div>
            )}

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
                minLength={6}
                className={`w-full pl-10 pr-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500 ring-1 ring-red-500/50' : 'border-white/10'} rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition text-sm`}
              />
              {errors.password && <p className="text-xs text-red-400 mt-1 ml-1">{errors.password}</p>}
            </div>

            {isRegister && (
              <div className="relative">
                <BadgeCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 transition text-sm appearance-none"
                  style={{ borderColor: '#D9DADF', '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}
                  onFocus={(e) => { e.style.borderColor = '#DD700B'; }}
                  onBlur={(e) => { e.style.borderColor = '#D9DADF'; }}
                >
                  <option value="manager" className="bg-white text-slate-900">Fleet Manager</option>
                  <option value="dispatcher" className="bg-white text-slate-900">Dispatcher</option>
                  <option value="safety_officer" className="bg-white text-slate-900">Safety Officer</option>
                  <option value="analyst" className="bg-white text-slate-900">Financial Analyst</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#C25C07'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-slate-500 transition"
              onMouseEnter={(e) => { e.target.style.color = '#DD700B'; }}
              onMouseLeave={(e) => { e.target.style.color = '#64748b'; }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">FleetFlow &copy; 2026 &mdash; Hackathon Project</p>
      </div>
    </div>
  );
}
