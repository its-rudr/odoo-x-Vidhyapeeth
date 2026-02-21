import { useEffect, useState } from 'react';
import { getDriversAPI, createDriverAPI, updateDriverAPI, deleteDriverAPI } from '../api';
import { PageHeader, Card, StatusPill, Modal, EmptyState } from '../components/UI';
import { Users, Plus, Edit2, Trash2, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', licenseNumber: '', licenseCategory: ['Van'], licenseExpiry: '', safetyScore: 100 };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = () => {
    const params = {};
    if (search) params.search = search;
    getDriversAPI(params)
      .then((res) => setDrivers(res.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, safetyScore: Number(form.safetyScore) };
      if (editing) {
        await updateDriverAPI(editing, data);
        toast.success('Driver updated');
      } else {
        await createDriverAPI(data);
        toast.success('Driver added');
      }
      setModal(false); setEditing(null); setForm(emptyForm); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving driver');
    }
  };

  const handleEdit = (d) => {
    setEditing(d._id);
    setForm({
      name: d.name, email: d.email, phone: d.phone, licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory, licenseExpiry: new Date(d.licenseExpiry).toISOString().split('T')[0],
      safetyScore: d.safetyScore,
    });
    setModal(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateDriverAPI(id, { status });
      toast.success(`Driver set to ${status}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return;
    try { await deleteDriverAPI(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      licenseCategory: prev.licenseCategory.includes(cat)
        ? prev.licenseCategory.filter(c => c !== cat)
        : [...prev.licenseCategory, cat]
    }));
  };

  return (
    <div>
      <PageHeader title="Driver Profiles" subtitle="Manage drivers, compliance, and safety scores">
        <button onClick={() => { setEditing(null); setForm(emptyForm); setModal(true); }} className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
          <Plus size={16} /> Add Driver
        </button>
      </PageHeader>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : drivers.length === 0 ? (
        <Card><EmptyState icon={Users} title="No drivers found" description="Add your first driver" /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {drivers.map((d) => {
            const expired = new Date(d.licenseExpiry) < new Date();
            return (
              <Card key={d._id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{d.name}</h3>
                      <p className="text-xs text-slate-400">{d.email}</p>
                    </div>
                  </div>
                  <StatusPill status={d.status} />
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between"><span>License</span><span className="font-mono text-slate-800">{d.licenseNumber}</span></div>
                  <div className="flex justify-between"><span>Categories</span><span>{d.licenseCategory.join(', ')}</span></div>
                  <div className="flex justify-between items-center">
                    <span>License Expiry</span>
                    <span className={`flex items-center gap-1 ${expired ? 'text-red-600 font-semibold' : 'text-slate-800'}`}>
                      {expired && <AlertTriangle size={13} />}
                      {new Date(d.licenseExpiry).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Safety Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.safetyScore >= 80 ? 'bg-emerald-500' : d.safetyScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${d.safetyScore}%` }} />
                      </div>
                      <span className="font-bold text-slate-900">{d.safetyScore}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Trips</span>
                    <span><span className="text-emerald-600 font-semibold">{d.tripsCompleted}</span> completed, <span className="text-red-500">{d.tripsCancelled}</span> cancelled</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => handleEdit(d)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition"><Edit2 size={12} /> Edit</button>
                  {d.status !== 'Suspended' ? (
                    <button onClick={() => handleStatusChange(d._id, 'Suspended')} className="flex-1 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition">Suspend</button>
                  ) : (
                    <button onClick={() => handleStatusChange(d._id, 'On Duty')} className="flex-1 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Activate</button>
                  )}
                  <button onClick={() => handleDelete(d._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Driver' : 'Add New Driver'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">License Number</label>
              <input required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">License Categories</label>
            <div className="flex gap-3">
              {['Truck', 'Van', 'Bike'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.licenseCategory.includes(cat)} onChange={() => toggleCategory(cat)} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">License Expiry</label>
              <input required type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Safety Score</label>
              <input type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all text-sm" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.style.backgroundColor = '#DD700B'; }}>
            {editing ? 'Update Driver' : 'Add Driver'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
