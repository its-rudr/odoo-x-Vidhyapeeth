import { useEffect, useState } from 'react';
import { getMaintenanceAPI, createMaintenanceAPI, updateMaintenanceAPI, deleteMaintenanceAPI, getVehiclesAPI } from '../api';
import { PageHeader, Card, StatusPill, Modal, EmptyState } from '../components/UI';
import { Wrench, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/rolePermissions';
import toast from 'react-hot-toast';

export default function MaintenanceLogs() {
  const { user } = useAuth();
  const canCreate = hasPermission(user?.role, 'maintenance', 'create');
  const canEdit = hasPermission(user?.role, 'maintenance', 'edit');
  const canDelete = hasPermission(user?.role, 'maintenance', 'delete');
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ vehicle: '', type: 'Preventive', description: '', cost: '', scheduledDate: new Date().toISOString().split('T')[0], mechanic: '', notes: '' });

  const load = () => {
    Promise.all([getMaintenanceAPI(), getVehiclesAPI()])
      .then(([m, v]) => { setLogs(m.data); setVehicles(v.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceAPI({ ...form, cost: Number(form.cost) });
      toast.success('Maintenance log created! Vehicle set to "In Shop"');
      setModal(false); setForm({ vehicle: '', type: 'Preventive', description: '', cost: '', scheduledDate: new Date().toISOString().split('T')[0], mechanic: '', notes: '' }); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const markComplete = async (id) => {
    try {
      await updateMaintenanceAPI(id, { status: 'Completed' });
      toast.success('Maintenance completed! Vehicle back to Available');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const markInProgress = async (id) => {
    try {
      await updateMaintenanceAPI(id, { status: 'In Progress' });
      toast.success('Maintenance in progress');
      load();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this maintenance log?')) return;
    try { await deleteMaintenanceAPI(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <PageHeader title="Maintenance & Service Logs" subtitle="Track preventative and reactive vehicle maintenance">
        {canCreate && <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
          <Plus size={16} /> New Log
        </button>}
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : logs.length === 0 ? (
        <Card><EmptyState icon={Wrench} title="No maintenance logs" description="Create your first service log" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Cost</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{log.vehicle?.name} <span className="text-xs text-slate-400">({log.vehicle?.licensePlate})</span></td>
                    <td className="px-5 py-3.5"><StatusPill status={log.type} /></td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{log.description}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">₹{log.cost.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(log.scheduledDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5"><StatusPill status={log.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && log.status === 'Scheduled' && (
                          <button onClick={() => markInProgress(log._id)} className="px-2 py-1 text-xs bg-amber-50 text-amber-600 font-semibold rounded-lg hover:bg-amber-100 transition">Start</button>
                        )}
                        {canEdit && (log.status === 'In Progress' || log.status === 'Scheduled') && (
                          <button onClick={() => markComplete(log._id)} className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-100 transition">
                            <CheckCircle2 size={12} /> Done
                          </button>
                        )}
                        {canDelete && <button onClick={() => handleDelete(log._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} className="text-red-400" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Maintenance Log">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle</label>
            <select required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option>Preventive</option><option>Reactive</option><option>Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (₹)</label>
              <input required type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="e.g. Oil Change, Brake Repair" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Date</label>
              <input required type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mechanic</label>
              <input value={form.mechanic} onChange={(e) => setForm({ ...form, mechanic: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-sm">
            Create Log
          </button>
        </form>
      </Modal>
    </div>
  );
}
