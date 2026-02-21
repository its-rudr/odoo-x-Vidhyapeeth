import { useEffect, useState } from 'react';
import { getVehiclesAPI, createVehicleAPI, updateVehicleAPI, deleteVehicleAPI } from '../api';
import { PageHeader, Card, StatusPill, Modal, EmptyState } from '../components/UI';
import { Truck, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/rolePermissions';
import toast from 'react-hot-toast';

const emptyForm = { name: '', model: '', licensePlate: '', type: 'Van', maxCapacity: '', odometer: 0, acquisitionCost: 0, region: 'Default' };

export default function Vehicles() {
  const { user } = useAuth();
  const canCreate = hasPermission(user?.role, 'vehicles', 'create');
  const canEdit = hasPermission(user?.role, 'vehicles', 'edit');
  const canDelete = hasPermission(user?.role, 'vehicles', 'delete');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    const params = {};
    if (search) params.search = search;
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;
    getVehiclesAPI(params)
      .then((res) => setVehicles(res.data))
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateVehicleAPI(editing, { ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) });
        toast.success('Vehicle updated');
      } else {
        await createVehicleAPI({ ...form, maxCapacity: Number(form.maxCapacity), odometer: Number(form.odometer), acquisitionCost: Number(form.acquisitionCost) });
        toast.success('Vehicle added');
      }
      setModal(false); setEditing(null); setForm(emptyForm); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleEdit = (v) => {
    setEditing(v._id);
    setForm({ name: v.name, model: v.model, licensePlate: v.licensePlate, type: v.type, maxCapacity: v.maxCapacity, odometer: v.odometer, acquisitionCost: v.acquisitionCost || 0, region: v.region || 'Default' });
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await deleteVehicleAPI(id); toast.success('Vehicle deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggleOOS = async (v) => {
    const newStatus = v.status === 'Out of Service' ? 'Available' : 'Out of Service';
    try { await updateVehicleAPI(v._id, { status: newStatus }); toast.success(`Vehicle marked ${newStatus}`); load(); }
    catch { toast.error('Failed to update status'); }
  };

  return (
    <div>
      <PageHeader title="Vehicle Registry" subtitle="Manage your fleet assets">
        {canCreate && <button onClick={() => { setEditing(null); setForm(emptyForm); setModal(true); }} className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
          <Plus size={16} /> Add Vehicle
        </button>}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search name or plate..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }} onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }} />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }} onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}>
          <option value="">All Types</option>
          <option>Truck</option><option>Van</option><option>Bike</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }} onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}>
          <option value="">All Status</option>
          <option>Available</option><option>On Trip</option><option>In Shop</option><option>Out of Service</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : vehicles.length === 0 ? (
        <Card><EmptyState icon={Truck} title="No vehicles found" description="Add your first fleet vehicle to get started" /></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Odometer</th>
                  <th className="px-5 py-3">Status</th>
                  {(canEdit || canDelete) && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-400">{v.model}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{v.licensePlate}</td>
                    <td className="px-5 py-3.5"><StatusPill status={v.type} /></td>
                    <td className="px-5 py-3.5 text-slate-700">{v.maxCapacity} kg</td>
                    <td className="px-5 py-3.5 text-slate-700">{v.odometer.toLocaleString()} km</td>
                    <td className="px-5 py-3.5"><StatusPill status={v.status} /></td>
                    {(canEdit || canDelete) && <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && <button onClick={() => handleEdit(v)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit2 size={15} className="text-slate-500" /></button>}
                        {canEdit && <button onClick={() => handleToggleOOS(v)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-xs text-amber-600 font-medium" title="Toggle Out of Service">{v.status === 'Out of Service' ? 'Activate' : 'Retire'}</button>}
                        {canDelete && <button onClick={() => handleDelete(v._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} className="text-red-400" /></button>}
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? 'Edit Vehicle' : 'Add New Vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="e.g. Van-05" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Model</label>
              <input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="e.g. Tata Ace" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">License Plate</label>
              <input required value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="MH-12-AB-1234" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option>Truck</option><option>Van</option><option>Bike</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Max Capacity (kg)</label>
              <input required type="number" min="0" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Odometer (km)</label>
              <input type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cost (₹)</label>
              <input type="number" min="0" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Region</label>
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="Default">Default</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all text-sm" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
            {editing ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
