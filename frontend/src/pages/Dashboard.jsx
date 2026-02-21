import { useEffect, useState, useCallback } from 'react';
import { getDashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel } from '../config/rolePermissions';
import { PageHeader, Card, KPICard, StatusPill, EmptyState } from '../components/UI';
import { Truck, AlertTriangle, Gauge, Package, CheckCircle2, Users, DollarSign, Fuel, Activity, ShieldAlert, Clock, Star, Wrench, TrendingUp, FileWarning, UserX, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#DD700B', '#3B82F6', '#059669', '#7C3AED', '#DC2626', '#D97706'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', region: '' });

  const loadDashboard = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.region) params.region = filters.region;
    getDashboardAPI(params)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#DD700B', borderTopColor: 'transparent' }} /></div>;

  const kpis = data?.kpis || {};
  const role = user?.role || 'manager';

  // Role-specific subtitle & greeting
  const roleGreetings = {
    manager: 'Full operational overview — vehicles, drivers, trips, and costs at a glance.',
    dispatcher: 'Trip dispatch center — manage cargo, assignments, and route tracking.',
    safety_officer: 'Driver safety & compliance — licenses, safety scores, and maintenance.',
    analyst: 'Financial overview — expenses, fuel costs, and operational ROI.',
  };

  return (
    <div>
      <PageHeader
        title={`${getRoleLabel(role)} Dashboard`}
        subtitle={roleGreetings[role]}
      />

      {/* Role-specific greeting banner */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200/60" style={{ background: 'linear-gradient(135deg, #FCF8D8 0%, #FFF 50%, #DBEAFE 100%)' }}>
        <p className="text-sm text-slate-600">
          Welcome back, <span className="font-semibold text-slate-900">{user?.name}</span>!
          {role === 'manager' && ' You have full access to manage the entire fleet.'}
          {role === 'dispatcher' && ' Create trips, assign drivers, and track cargo loads.'}
          {role === 'safety_officer' && ' Monitor driver compliance, license status, and vehicle maintenance.'}
          {role === 'analyst' && ' Audit fuel spend, maintenance costs, and operational expenses.'}
        </p>
      </div>

      {/* Dashboard Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter size={14} /> Filters
        </div>
        <select value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}>
          <option value="">All Types</option>
          <option>Truck</option><option>Van</option><option>Bike</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}>
          <option value="">All Statuses</option>
          <option>Available</option><option>On Trip</option><option>In Shop</option><option>Out of Service</option>
        </select>
        <select value={filters.region} onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': 'rgba(221, 112, 11, 0.2)' }}>
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
          <option value="Central">Central</option>
          <option value="Default">Default</option>
        </select>
        {(filters.type || filters.status || filters.region) && (
          <button onClick={() => setFilters({ type: '', status: '', region: '' })} className="px-3 py-2 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition">Clear</button>
        )}
      </div>

      {/* === FLEET MANAGER DASHBOARD === */}
      {role === 'manager' && <ManagerDashboard data={data} kpis={kpis} />}

      {/* === DISPATCHER DASHBOARD === */}
      {role === 'dispatcher' && <DispatcherDashboard data={data} kpis={kpis} />}

      {/* === SAFETY OFFICER DASHBOARD === */}
      {role === 'safety_officer' && <SafetyOfficerDashboard data={data} kpis={kpis} />}

      {/* === FINANCIAL ANALYST DASHBOARD === */}
      {role === 'analyst' && <AnalystDashboard data={data} kpis={kpis} />}
    </div>
  );
}

/* ─── Fleet Manager: Full overview ─── */
function ManagerDashboard({ data, kpis }) {
  const statusData = data?.statusDistribution
    ? Object.entries(data.statusDistribution).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={Truck} label="Active Fleet" value={kpis.activeFleet || 0} sublabel="Vehicles on trip" color="blue" />
        <KPICard icon={AlertTriangle} label="Maintenance Alerts" value={kpis.maintenanceAlerts || 0} sublabel="Vehicles in shop" color="amber" />
        <KPICard icon={Gauge} label="Utilization Rate" value={`${kpis.utilizationRate || 0}%`} sublabel="Fleet assigned vs idle" color="emerald" />
        <KPICard icon={Package} label="Pending Cargo" value={kpis.pendingCargo || 0} sublabel="Shipments awaiting" color="violet" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={CheckCircle2} label="Completed Trips" value={kpis.completedTrips || 0} color="emerald" />
        <KPICard icon={Users} label="Active Drivers" value={kpis.activeDrivers || 0} sublabel={`of ${kpis.totalDrivers || 0} total`} color="blue" />
        <KPICard icon={DollarSign} label="Total Expenses" value={`₹${(kpis.totalExpenses || 0).toLocaleString()}`} color="red" />
        <KPICard icon={Fuel} label="Fuel Spend" value={`₹${(kpis.fuelExpenses || 0).toLocaleString()}`} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FleetStatusChart statusData={statusData} />
        <RecentTripsTable trips={data?.recentTrips} />
      </div>
    </>
  );
}

/* ─── Dispatcher: Trip-focused ─── */
function DispatcherDashboard({ data, kpis }) {
  const statusData = data?.statusDistribution
    ? Object.entries(data.statusDistribution).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={Package} label="Pending Cargo" value={kpis.pendingCargo || 0} sublabel="Drafts to dispatch" color="violet" />
        <KPICard icon={Truck} label="Dispatched" value={kpis.dispatchedTrips || 0} sublabel="Trips en route" color="blue" />
        <KPICard icon={CheckCircle2} label="Completed Trips" value={kpis.completedTrips || 0} sublabel="Delivered successfully" color="emerald" />
        <KPICard icon={Gauge} label="Fleet Available" value={kpis.totalVehicles ? (kpis.totalVehicles - kpis.activeFleet - kpis.maintenanceAlerts) : 0} sublabel="Ready to assign" color="orange" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Users} label="Active Drivers" value={kpis.activeDrivers || 0} sublabel="On duty / On trip" color="blue" />
        <KPICard icon={Truck} label="Active Fleet" value={kpis.activeFleet || 0} sublabel="Vehicles on trip" color="amber" />
        <KPICard icon={AlertTriangle} label="Cancelled" value={kpis.cancelledTrips || 0} sublabel="Trips cancelled" color="red" />
        <KPICard icon={Activity} label="Total Vehicles" value={kpis.totalVehicles || 0} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FleetStatusChart statusData={statusData} />
        <RecentTripsTable trips={data?.recentTrips} />
      </div>
    </>
  );
}

/* ─── Safety Officer: Driver compliance & maintenance ─── */
function SafetyOfficerDashboard({ data, kpis }) {
  const compliance = data?.driverCompliance || {};
  const maint = data?.maintenanceSummary || {};

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={Users} label="Total Drivers" value={kpis.totalDrivers || 0} sublabel={`${kpis.activeDrivers || 0} active`} color="blue" />
        <KPICard icon={Star} label="Avg Safety Score" value={compliance.avgSafetyScore || 0} sublabel="Out of 100" color="emerald" />
        <KPICard icon={UserX} label="Suspended" value={compliance.suspendedDrivers || 0} sublabel="Drivers suspended" color="red" />
        <KPICard icon={AlertTriangle} label="Maintenance Alerts" value={kpis.maintenanceAlerts || 0} sublabel="Vehicles in shop" color="amber" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={FileWarning} label="Expiring Licenses" value={compliance.expiringLicenses?.length || 0} sublabel="Within 30 days" color="amber" />
        <KPICard icon={ShieldAlert} label="Expired Licenses" value={compliance.expiredLicenses?.length || 0} sublabel="Need renewal" color="red" />
        <KPICard icon={TrendingUp} label="Low Safety Scores" value={compliance.lowSafetyScores?.length || 0} sublabel="Below 70" color="orange" />
        <KPICard icon={Wrench} label="Maintenance Cost" value={`₹${(maint.totalCost || 0).toLocaleString()}`} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Compliance Alerts */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" /> Driver Compliance Alerts
          </h3>
          {(compliance.expiredLicenses?.length > 0 || compliance.expiringLicenses?.length > 0 || compliance.lowSafetyScores?.length > 0) ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {compliance.expiredLicenses?.map(d => (
                <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-900">{d.name}</p>
                    <p className="text-xs text-red-600">License #{d.licenseNumber}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">EXPIRED</span>
                </div>
              ))}
              {compliance.expiringLicenses?.map(d => (
                <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-amber-900">{d.name}</p>
                    <p className="text-xs text-amber-600">Expires {new Date(d.licenseExpiry).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">EXPIRING</span>
                </div>
              ))}
              {compliance.lowSafetyScores?.map(d => (
                <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <div>
                    <p className="text-sm font-medium text-orange-900">{d.name}</p>
                    <p className="text-xs text-orange-600">Safety Score: {d.safetyScore}/100</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">LOW SCORE</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CheckCircle2} title="All Clear" description="No compliance issues detected" />
          )}
        </Card>

        {/* Maintenance Summary */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench size={16} className="text-amber-500" /> Maintenance Overview
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-2xl font-bold text-violet-700">{maint.scheduled || 0}</p>
              <p className="text-xs text-violet-600 mt-1">Scheduled</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{maint.inProgress || 0}</p>
              <p className="text-xs text-amber-600 mt-1">In Progress</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{maint.completed || 0}</p>
              <p className="text-xs text-emerald-600 mt-1">Completed</p>
            </div>
          </div>
          {maint.recentLogs?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recent Logs</p>
              {maint.recentLogs.map(m => (
                <div key={m._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{m.vehicleName} <span className="text-slate-400">({m.vehiclePlate})</span></p>
                    <p className="text-xs text-slate-500">{m.type}</p>
                  </div>
                  <div className="text-right">
                    <StatusPill status={m.status} />
                    <p className="text-xs text-slate-500 mt-1">₹{m.cost.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No maintenance records yet</p>
          )}
        </Card>
      </div>
    </>
  );
}

/* ─── Financial Analyst: Expense-focused ─── */
function AnalystDashboard({ data, kpis }) {
  const breakdown = data?.expenseBreakdown || {};
  const categoryData = breakdown.byCategory
    ? Object.entries(breakdown.byCategory).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={DollarSign} label="Total Expenses" value={`₹${(kpis.totalExpenses || 0).toLocaleString()}`} sublabel="All categories" color="red" />
        <KPICard icon={Fuel} label="Fuel Spend" value={`₹${(kpis.fuelExpenses || 0).toLocaleString()}`} sublabel={`${kpis.totalExpenses ? Math.round((kpis.fuelExpenses / kpis.totalExpenses) * 100) : 0}% of total`} color="amber" />
        <KPICard icon={Wrench} label="Maintenance Cost" value={`₹${(kpis.maintenanceExpenses || 0).toLocaleString()}`} sublabel={`${kpis.totalExpenses ? Math.round((kpis.maintenanceExpenses / kpis.totalExpenses) * 100) : 0}% of total`} color="violet" />
        <KPICard icon={TrendingUp} label="Avg per Vehicle" value={`₹${(breakdown.avgPerVehicle || 0).toLocaleString()}`} sublabel={`Across ${kpis.totalVehicles || 0} vehicles`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Category Pie Chart */}
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> Expense Breakdown
          </h3>
          {categoryData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {categoryData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name} (₹{d.value.toLocaleString()})
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No expenses recorded yet</p>
          )}
        </Card>

        {/* Recent Expenses Table */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Expenses</h3>
          {breakdown.recentExpenses?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {breakdown.recentExpenses.map(exp => (
                    <tr key={exp._id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-4"><StatusPill status={exp.category} /></td>
                      <td className="py-3 pr-4 text-slate-600">{exp.description || '—'}</td>
                      <td className="py-3 pr-4 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">₹{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={DollarSign} title="No expenses yet" description="Log fuel costs, tolls, and other operational expenses" />
          )}
        </Card>
      </div>
    </>
  );
}

/* ─── Shared Sub-components ─── */
function FleetStatusChart({ statusData }) {
  return (
    <Card className="p-6 lg:col-span-1">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Activity size={16} className="text-emerald-500" /> Fleet Status
      </h3>
      {statusData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => [val, 'Vehicles']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-12">No vehicles registered yet</p>
      )}
    </Card>
  );
}

function RecentTripsTable({ trips }) {
  return (
    <Card className="p-6 lg:col-span-2">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Trips</h3>
      {trips?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 pr-4">Vehicle</th>
                <th className="pb-3 pr-4">Driver</th>
                <th className="pb-3 pr-4">Route</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trips.map((trip) => (
                <tr key={trip._id} className="hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-medium text-slate-900">{trip.vehicle?.name || 'N/A'}</td>
                  <td className="py-3 pr-4 text-slate-600">{trip.driver?.name || 'N/A'}</td>
                  <td className="py-3 pr-4 text-slate-600">{trip.origin} → {trip.destination}</td>
                  <td className="py-3"><StatusPill status={trip.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Truck} title="No trips yet" description="Create your first trip to get started" />
      )}
    </Card>
  );
}
