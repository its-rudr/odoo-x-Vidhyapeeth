export function StatusPill({ status }) {
  const colors = {
    'Available': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    'On Trip': 'bg-blue-100 text-blue-700 ring-blue-600/20',
    'In Shop': 'bg-amber-100 text-amber-700 ring-amber-600/20',
    'Out of Service': 'bg-red-100 text-red-700 ring-red-600/20',
    'On Duty': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    'Off Duty': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Suspended': 'bg-red-100 text-red-700 ring-red-600/20',
    'Draft': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Dispatched': 'bg-blue-100 text-blue-700 ring-blue-600/20',
    'Completed': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    'Cancelled': 'bg-red-100 text-red-700 ring-red-600/20',
    'Scheduled': 'bg-violet-100 text-violet-700 ring-violet-600/20',
    'In Progress': 'bg-amber-100 text-amber-700 ring-amber-600/20',
    'Preventive': 'bg-blue-100 text-blue-700 ring-blue-600/20',
    'Reactive': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'Inspection': 'bg-violet-100 text-violet-700 ring-violet-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${colors[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>
      {status}
    </span>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function KPICard({ icon: Icon, label, value, sublabel, color = 'emerald' }) {
  const gradients = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    violet: 'from-violet-500 to-purple-600',
    cyan: 'from-cyan-500 to-blue-600',
  };
  const bgs = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
    violet: 'bg-violet-50',
    cyan: 'bg-cyan-50',
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgs[color]}`}>
          <Icon size={22} className={`bg-gradient-to-br ${gradients[color]} bg-clip-text text-transparent`} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-slate-100 mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}
