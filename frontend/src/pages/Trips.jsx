import { useEffect, useState } from 'react';
import { getTripsAPI, createTripAPI, updateTripAPI, deleteTripAPI, getVehiclesAPI, getDriversAPI } from '../api';
import { PageHeader, Card, StatusPill, Modal, EmptyState } from '../components/UI';
import { Route, Plus, Trash2, Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/rolePermissions';
import toast from 'react-hot-toast';

export default function Trips() {
  const { user } = useAuth();
  const canCreate = hasPermission(user?.role, 'trips', 'create');
  const canEdit = hasPermission(user?.role, 'trips', 'edit');
  const canDelete = hasPermission(user?.role, 'trips', 'delete');
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ vehicle: '', driver: '', origin: '', destination: '', cargoWeight: '', cargoDescription: '', scheduledDate: new Date().toISOString().split('T')[0], notes: '' });

  const load = () => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    Promise.all([getTripsAPI(params), getVehiclesAPI({ status: 'Available' }), getDriversAPI()])
      .then(([t, v, d]) => { setTrips(t.data); setVehicles(v.data); setDrivers(d.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTripAPI({ ...form, cargoWeight: Number(form.cargoWeight) });
      toast.success('Trip created!');
      setModal(false); setForm({ vehicle: '', driver: '', origin: '', destination: '', cargoWeight: '', cargoDescription: '', scheduledDate: new Date().toISOString().split('T')[0], notes: '' }); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const data = { status };
      if (status === 'Completed' && endOdometer) data.endOdometer = Number(endOdometer);
      await updateTripAPI(id, data);
      toast.success(`Trip ${status.toLowerCase()}`);
      setCompleteModal(null); setEndOdometer(''); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try { await deleteTripAPI(id); toast.success('Trip deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const availableDrivers = drivers.filter(d => (d.status === 'On Duty' || d.status === 'Off Duty') && d.isLicenseValid);

  return (
    <div>
      <PageHeader title="Trip Dispatcher" subtitle="Create and manage cargo trips">
        {canCreate && <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
          <Plus size={16} /> New Trip
        </button>}
      </PageHeader>

      <div className="flex gap-3 mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }} onFocus={(e) => { e.target.style.borderColor = '#DD700B'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}>
          <option value="">All Status</option>
          <option>Draft</option><option>Dispatched</option><option>Completed</option><option>Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#DD700B', borderTopColor: 'transparent' }} /></div>
      ) : trips.length === 0 ? (
        <Card><EmptyState icon={Route} title="No trips found" description="Create a new trip to dispatch cargo" /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {trips.map((trip) => (
            <Card key={trip._id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusPill status={trip.status} />
                    <span className="text-xs text-slate-400">{new Date(trip.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    {trip.origin} <ArrowRight size={18} style={{ color: '#DD700B' }} /> {trip.destination}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span>🚛 {trip.vehicle?.name || 'N/A'} ({trip.vehicle?.licensePlate})</span>
                    <span>👤 {trip.driver?.name || 'N/A'}</span>
                    <span>📦 {trip.cargoWeight} kg</span>
                    {trip.cargoDescription && <span className="text-slate-400">• {trip.cargoDescription}</span>}
                  </div>
                </div>
                {(canEdit || canDelete) && <div className="flex items-center gap-2">
                  {canEdit && trip.status === 'Draft' && (
                    <button onClick={() => updateStatus(trip._id, 'Dispatched')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition text-white" style={{ backgroundColor: '#DD700B' }}>
                      <Play size={13} /> Dispatch
                    </button>
                  )}
                  {canEdit && trip.status === 'Dispatched' && (
                    <>
                      <button onClick={() => setCompleteModal(trip._id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition" style={{ backgroundColor: '#FCF8D8', color: '#DD700B' }} onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(252, 248, 216, 0.7)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#FCF8D8'; }}>
                        <CheckCircle2 size={13} /> Complete
                      </button>
                      <button onClick={() => updateStatus(trip._id, 'Cancelled')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition">
                        <XCircle size={13} /> Cancel
                      </button>
                    </>
                  )}
                  {canDelete && (trip.status === 'Draft' || trip.status === 'Completed' || trip.status === 'Cancelled') && (
                    <button onClick={() => handleDelete(trip._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} className="text-red-400" /></button>
                  )}
                </div>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New Trip">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle</label>
              <select required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.licensePlate}) - {v.maxCapacity}kg</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Driver</label>
              <select required value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <option value="">Select driver</option>
                {availableDrivers.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.licenseCategory.join(', ')})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Origin</label>
              <input required value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Destination</label>
              <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Pune" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo Weight (kg)</label>
              <input required type="number" min="1" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Scheduled Date</label>
              <input required type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo Description</label>
            <input value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="e.g. Electronics, Furniture" />
          </div>
          <button type="submit" className="w-full py-2.5 text-white font-semibold rounded-xl shadow-lg transition-all text-sm" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
            Create Trip
          </button>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal open={!!completeModal} onClose={() => { setCompleteModal(null); setEndOdometer(''); }} title="Complete Trip">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Final Odometer Reading (km)</label>
            <input type="number" min="0" value={endOdometer} onChange={(e) => setEndOdometer(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Enter final odometer" />
          </div>
          <button onClick={() => updateStatus(completeModal, 'Completed')} className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-sm">
            Mark Completed
          </button>
        </div>
      </Modal>
    </div>
  );
}
