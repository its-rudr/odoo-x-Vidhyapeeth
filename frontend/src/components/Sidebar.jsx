import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getRoleLabel, ROUTE_MODULE_MAP } from '../config/rolePermissions';
import {
  LayoutDashboard, Truck, Route, Wrench, Fuel, Users, BarChart3, LogOut, Menu, X, Zap, ChevronRight, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';

const allLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview', module: 'dashboard' },
  { to: '/vehicles', icon: Truck, label: 'Vehicles', desc: 'Fleet assets', module: 'vehicles' },
  { to: '/trips', icon: Route, label: 'Trips', desc: 'Dispatches', module: 'trips' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance', desc: 'Service logs', module: 'maintenance' },
  { to: '/expenses', icon: Fuel, label: 'Expenses', desc: 'Cost tracking', module: 'expenses' },
  { to: '/drivers', icon: Users, label: 'Drivers', desc: 'Profiles', module: 'drivers' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'Reports', module: 'analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Filter links based on user role
  const links = allLinks.filter(link => hasPermission(user?.role, link.module, 'view'));

  // Close mobile sidebar on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#DD700B] flex items-center justify-center shadow">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-slate-900 font-bold text-sm">FleetFlow</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white text-slate-900 border-r border-slate-200 transition-transform duration-300 ease-in-out w-64 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-[#DD700B] flex items-center justify-center shadow-lg shadow-[#DD700B]/25">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">FleetFlow</h1>
            <p className="text-sm text-slate-500 uppercase tracking-widest">Fleet Management</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#FCF8D8] text-[#DD700B]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex-1 min-w-0">
                <span className="block leading-tight text-xl">{label}</span>
                <span className="block text-sm opacity-60 leading-tight">{desc}</span>
              </div>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#DD700B] flex items-center justify-center text-sm font-bold shadow text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold truncate text-slate-900">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-[#DD700B]" />
                <p className="text-base text-[#DD700B] font-medium">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-14" />
    </>
  );
}
