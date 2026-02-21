import { useEffect, useState } from 'react';
import { getAnalyticsAPI } from '../api';
import { PageHeader, Card, EmptyState } from '../components/UI';
import { BarChart3, TrendingUp, Fuel, Wrench, DollarSign, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsAPI()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    if (!data?.vehicleAnalytics?.length) return;
    const headers = ['Vehicle', 'Plate', 'Fuel Cost', 'Maintenance Cost', 'Total Cost', 'Distance (km)', 'Fuel Efficiency (km/L)', 'Cost/km'];
    const rows = data.vehicleAnalytics.map(v => [v.name, v.plate, v.fuel, v.maintenance, v.totalCost, v.km, v.fuelEfficiency, v.costPerKm]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fleetflow-analytics-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const summary = data?.summary || {};
  const vehicleAnalytics = data?.vehicleAnalytics || [];
  const expenseTrend = data?.expenseTrend || [];

  return (
    <div>
      <PageHeader title="Analytics & Reports" subtitle="Data-driven fleet performance insights">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
          <Download size={16} /> Export CSV
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50"><Fuel size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Fuel Cost</p>
              <p className="text-xl font-bold text-slate-900">₹{(summary.totalFuelCost || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50"><Wrench size={20} className="text-amber-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Maintenance</p>
              <p className="text-xl font-bold text-slate-900">₹{(summary.totalMaintenanceCost || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50"><TrendingUp size={20} className="text-emerald-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Distance</p>
              <p className="text-xl font-bold text-slate-900">{(summary.totalKm || 0).toLocaleString()} km</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50"><DollarSign size={20} className="text-violet-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Fuel Used</p>
              <p className="text-xl font-bold text-slate-900">{(summary.totalLiters || 0).toLocaleString()} L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Expense Trend */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-500" /> Monthly Expense Trend
          </h3>
          {expenseTrend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="fuel" name="Fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="other" name="Other" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-16">No expense data yet</p>
          )}
        </Card>

        {/* Cost Trend Line */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Total Cost Trend
          </h3>
          {expenseTrend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="total" name="Total Cost" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-16">No data available</p>
          )}
        </Card>
      </div>

      {/* Vehicle Analytics Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Vehicle Cost Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">Detailed breakdown per vehicle</p>
        </div>
        {vehicleAnalytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3">Plate</th>
                  <th className="px-5 py-3">Fuel Cost</th>
                  <th className="px-5 py-3">Maintenance</th>
                  <th className="px-5 py-3">Total Cost</th>
                  <th className="px-5 py-3">Distance</th>
                  <th className="px-5 py-3">Fuel Efficiency</th>
                  <th className="px-5 py-3">Cost/km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicleAnalytics.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{v.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{v.plate}</td>
                    <td className="px-5 py-3.5 text-blue-600">₹{v.fuel.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-amber-600">₹{v.maintenance.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">₹{v.totalCost.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{v.km.toLocaleString()} km</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${v.fuelEfficiency !== 'N/A' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {v.fuelEfficiency} {v.fuelEfficiency !== 'N/A' && 'km/L'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{v.costPerKm !== 'N/A' ? `₹${v.costPerKm}` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No analytics data" description="Add vehicles, trips, and expenses to see insights" />
        )}
      </Card>
    </div>
  );
}
