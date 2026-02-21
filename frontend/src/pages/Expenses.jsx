import { useEffect, useState } from 'react';
import { getExpensesAPI, createExpenseAPI, deleteExpenseAPI, getVehiclesAPI, getTripsAPI } from '../api';
import { PageHeader, Card, StatusPill, Modal, EmptyState } from '../components/UI';
import { Fuel, Plus, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({ vehicle: '', trip: '', category: 'Fuel', amount: '', liters: '', date: new Date().toISOString().split('T')[0], description: '' });

  const load = () => {
    const params = {};
    if (filterCategory) params.category = filterCategory;
    Promise.all([getExpensesAPI(params), getVehiclesAPI(), getTripsAPI()])
      .then(([e, v, t]) => { setExpenses(e.data); setVehicles(v.data); setTrips(t.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterCategory]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: Number(form.amount), liters: Number(form.liters || 0) };
      if (!data.trip) delete data.trip;
      await createExpenseAPI(data);
      toast.success('Expense recorded');
      setModal(false); setForm({ vehicle: '', trip: '', category: 'Fuel', amount: '', liters: '', date: new Date().toISOString().split('T')[0], description: '' }); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await deleteExpenseAPI(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  // Calculate totals
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelTotal = expenses.filter(e => e.category === 'Fuel').reduce((s, e) => s + e.amount, 0);
  const maintenanceTotal = expenses.filter(e => e.category === 'Maintenance').reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title="Expenses & Fuel Logging" subtitle="Track operational costs per vehicle">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
          <Plus size={16} /> Record Expense
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">Fuel Costs</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₹{fuelTotal.toLocaleString()}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">Maintenance Costs</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{maintenanceTotal.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
          <option value="">All Categories</option>
          <option>Fuel</option><option>Maintenance</option><option>Insurance</option><option>Toll</option><option>Other</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : expenses.length === 0 ? (
        <Card><EmptyState icon={DollarSign} title="No expenses recorded" description="Start logging fuel and maintenance costs" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Liters</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{exp.vehicle?.name} <span className="text-xs text-slate-400">({exp.vehicle?.licensePlate})</span></td>
                    <td className="px-5 py-3.5"><StatusPill status={exp.category} /></td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-500">{exp.liters > 0 ? `${exp.liters} L` : '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{exp.description || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleDelete(exp._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} className="text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Record Expense">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle</label>
              <select required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option>Fuel</option><option>Maintenance</option><option>Insurance</option><option>Toll</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
              <input required type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Liters</label>
              <input type="number" min="0" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="For fuel only" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Trip (optional)</label>
            <select value={form.trip} onChange={(e) => setForm({ ...form, trip: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="">No trip linked</option>
              {trips.map((t) => <option key={t._id} value={t._id}>{t.origin} → {t.destination} ({t.status})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="e.g. Diesel refill at highway station" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-sm">
            Record Expense
          </button>
        </form>
      </Modal>
    </div>
  );
}
