import { useEffect, useState } from 'react';
import { getDashboardAPI } from '../api';
import { PageHeader, Card, KPICard, StatusPill, EmptyState } from '../components/UI';
import { Truck, AlertTriangle, Gauge, Package, CheckCircle2, Users, DollarSign, Fuel, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAPI()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const kpis = data?.kpis || {};
  const statusData = data?.statusDistribution
    ? Object.entries(data.statusDistribution).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
    : [];

  return (
    <div>
      <PageHeader title="Command Center" subtitle="Real-time fleet overview and key performance indicators" />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Truck} label="Active Fleet" value={kpis.activeFleet || 0} sublabel="Vehicles on trip" color="blue" />
        <KPICard icon={AlertTriangle} label="Maintenance Alerts" value={kpis.maintenanceAlerts || 0} sublabel="Vehicles in shop" color="amber" />
        <KPICard icon={Gauge} label="Utilization Rate" value={`${kpis.utilizationRate || 0}%`} sublabel="Fleet assigned vs idle" color="emerald" />
        <KPICard icon={Package} label="Pending Cargo" value={kpis.pendingCargo || 0} sublabel="Shipments awaiting" color="violet" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={CheckCircle2} label="Completed Trips" value={kpis.completedTrips || 0} color="emerald" />
        <KPICard icon={Users} label="Active Drivers" value={kpis.activeDrivers || 0} color="blue" />
        <KPICard icon={DollarSign} label="Total Expenses" value={`₹${(kpis.totalExpenses || 0).toLocaleString()}`} color="red" />
        <KPICard icon={Fuel} label="Fuel Spend" value={`₹${(kpis.fuelExpenses || 0).toLocaleString()}`} color="amber" />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status Pie Chart */}
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

        {/* Recent Trips */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Trips</h3>
          {data?.recentTrips?.length > 0 ? (
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
                  {data.recentTrips.map((trip) => (
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
            <EmptyState icon={Truck} title="No trips yet" description="Create your first trip in the dispatcher" />
          )}
        </Card>
      </div>
    </div>
  );
}
