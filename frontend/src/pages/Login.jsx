import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Zap, ArrowRight, Shield, ShieldAlert, HardHat, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { id: 'manager', label: 'Fleet Manager', icon: Shield, color: '#DD700B' },
  { id: 'dispatcher', label: 'Dispatcher', icon: ShieldAlert, color: '#2563EB' },
  { id: 'safety', label: 'Safety Officer', icon: HardHat, color: '#059669' },
  { id: 'finance', label: 'Finance Analyst', icon: Banknote, color: '#7C3AED' },
];

export default function Login() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

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
    if (!role) { toast.error('Please select a role first'); return; }
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success(`Welcome back, ${roles.find(r => r.id === role)?.label || 'User'}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* ──────── Left Pane: Immersive Image ──────── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] h-full relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 opacity-60" 
             style={{ 
               backgroundImage: 'url("/Images/truck.webp")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
               filter: 'brightness(0.7)'
             }} />
        <div className="absolute inset-0 z-10 bg-black/20" />
        
        <div className="relative z-20 w-full h-full p-12 lg:p-16 flex flex-col justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl shadow-black/20 flex items-center justify-center">
              <img src="/Images/FleetFlow.webp" alt="FleetFlow" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">FleetFlow</span>
          </div>

          <div className="max-w-xl animate-fade-in-up">
            <div className="w-14 h-1.5 bg-[#DD700B] mb-6 rounded-full" />
            <h1 className="text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-4">
              The Hub of <br/> 
              <span className="text-[#DD700B]">Modern Logistics.</span>
            </h1>
            <p className="text-slate-300 text-lg lg:text-xl font-medium leading-tight mb-8 opacity-80">
              Secure, real-time fleet management. Powered by intelligent insights and built for professional-scale performance.
            </p>
            
            <div className="flex items-center gap-8 pt-8 border-t border-white/10 text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">
              <span>Next-Gen Architecture</span>
              <span>•</span>
              <span>Built for Scale 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────── Right Pane: Form ──────── */}
      <div className="flex-1 h-full flex items-center justify-center p-4 md:p-8 bg-white md:bg-transparent overflow-y-auto no-scrollbar">
        <div className="w-full max-w-[420px] flex flex-col justify-center py-2">
          <div className="mb-6">
            <div className="md:hidden flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-white p-1.5 shadow-lg border border-slate-100 flex items-center justify-center">
                <img src="/Images/FleetFlow.webp" alt="FleetFlow" className="w-full h-full object-contain rounded-md" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">FleetFlow</span>
            </div>
            <h2 className="font-black text-slate-900 tracking-tight leading-none text-4xl mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Select your operational role and sign in.
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setRole(r.id); setErrors({}); }}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  role === r.id 
                    ? 'border-[#DD700B] bg-[#DD700B]/5 shadow-lg scale-[1.02]' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform duration-500 ${role === r.id ? 'scale-110' : ''}`}
                  style={{ backgroundColor: `${r.color}15`, color: r.color }}
                >
                  <r.icon size={20} className={role === r.id ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${role === r.id ? 'text-[#DD700B]' : 'text-slate-500'}`}>
                  {r.label}
                </span>
                {role === r.id && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#DD700B]" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DD700B] transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
                className={`w-full pl-11 pr-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#DD700B]/5 transition-all text-sm font-medium ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-[#DD700B]'}`}
                required
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold italic">{errors.email}</p>}
            </div>

            <div className="group relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#DD700B] transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors(prev => ({ ...prev, password: '' })); }}
                className={`w-full pl-11 pr-5 py-3.5 bg-white border-2 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#DD700B]/5 transition-all text-sm font-medium ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-[#DD700B]'}`}
                required
                minLength={8}
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold italic">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-[#DD700B] focus:ring-[#DD700B]/20" />
                <span className="text-[12px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-[12px] font-bold text-[#DD700B] hover:text-[#DD700B]/80 transition-colors">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 py-4 text-white font-black rounded-xl shadow-xl shadow-[#DD700B]/20 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm"
              style={{ backgroundColor: '#DD700B' }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  Secure Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-[10px] font-medium uppercase tracking-widest opacity-60">
            Enterprise Security Core
          </p>
        </div>
      </div>
    </div>
  );
}
