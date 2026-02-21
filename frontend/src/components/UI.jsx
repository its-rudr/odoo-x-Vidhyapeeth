export function StatusPill({ status }) {
  const colors = {
    'Available': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'On Trip': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'In Shop': 'bg-amber-100 text-amber-700 ring-amber-600/20',
    'Out of Service': 'bg-red-100 text-red-700 ring-red-600/20',
    'On Duty': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'Off Duty': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Suspended': 'bg-red-100 text-red-700 ring-red-600/20',
    'Draft': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Dispatched': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'Completed': 'bg-orange-100 text-orange-700 ring-orange-600/20',
    'Cancelled': 'bg-red-100 text-red-700 ring-red-600/20',
    'Scheduled': 'bg-violet-100 text-violet-700 ring-violet-600/20',
    'In Progress': 'bg-amber-100 text-amber-700 ring-amber-600/20',
    'Preventive': 'bg-orange-100 text-orange-700 ring-orange-600/20',
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

export function Card({ children, className = '', noHover }) {
  return (
    <div
<<<<<<< Updated upstream
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300 transform overflow-hidden will-change-transform ${className} ${noHover ? '' : 'hover:shadow-[0_4px_16px_0_rgba(221,112,11,0.15)] hover:border-[#DD700B] hover:scale-105'}`}
=======
      className={`bg-white rounded-2xl border border-slate-200/60 shadow-sm transition-all duration-300 transform overflow-hidden will-change-transform ${className} ${noHover ? '' : 'hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.65)] hover:border-[#2563EB] hover:scale-105'}`}
>>>>>>> Stashed changes
    >
      {children}
    </div>
  );
}

export function KPICard({ icon: Icon, label, value, sublabel, color = 'orange' }) {
  const colors = {
    orange: { grad: '#DD700B', bg: '#FCF8D8' },
    slate: { grad: '#7C7D75', bg: '#F1F5F9' },
    gray: { grad: '#ADACA7', bg: '#E2E8F0' },
    muted: { grad: '#D9DADF', bg: '#F8FAFC' },
    red: { grad: '#DC2626', bg: '#FEE2E2' },
  };

  const colorMap = colors[color] || colors.orange;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate-500">{label}</p>
          <p className="text-4xl font-extrabold text-slate-900 mt-2">{value}</p>
          {sublabel && <p className="text-sm text-slate-400 mt-2">{sublabel}</p>}
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: colorMap.bg }}>
          <Icon size={28} style={{ color: colorMap.grad }} strokeWidth={2} />
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
      <div className="p-4 rounded-2xl mb-4" style={{ backgroundColor: '#FCF8D8' }}>
        <Icon size={32} style={{ color: '#DD700B' }} />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}
