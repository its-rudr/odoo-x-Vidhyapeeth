import { useEffect, useState } from 'react';
import { getAnalyticsAPI } from '../api';
import { PageHeader, Card, EmptyState } from '../components/UI';
import { BarChart3, TrendingUp, Fuel, Wrench, DollarSign, Download, FileText } from 'lucide-react';
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
    const headers = ['Vehicle', 'Plate', 'Fuel Cost', 'Maintenance Cost', 'Total Cost', 'Distance (km)', 'Fuel Efficiency (km/L)', 'Cost/km', 'ROI (%)'];
    const rows = data.vehicleAnalytics.map(v => [v.name, v.plate, v.fuel, v.maintenance, v.totalCost, v.km, v.fuelEfficiency, v.costPerKm, v.roi]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fleetflow-analytics-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow pop-ups for PDF export'); return; }
    const va = data?.vehicleAnalytics || [];
    const s = data?.summary || {};
    printWindow.document.write(`
      <html><head><title>FleetFlow Analytics Report</title>
      <style>
        body{font-family:system-ui,-apple-system,sans-serif;padding:40px;color:#1e293b}
        h1{font-size:24px;margin-bottom:4px}
        .subtitle{color:#64748b;font-size:13px;margin-bottom:24px}
        .summary{display:flex;gap:24px;margin-bottom:32px}
        .summary-card{padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;min-width:140px}
        .summary-card .label{font-size:11px;color:#64748b;text-transform:uppercase}
        .summary-card .value{font-size:20px;font-weight:700;margin-top:4px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:10px 12px;background:#f1f5f9;border-bottom:2px solid #e2e8f0;font-size:11px;text-transform:uppercase;color:#64748b}
        td{padding:10px 12px;border-bottom:1px solid #f1f5f9}
        tr:hover{background:#f8fafc}
        .positive{color:#DD700B;font-weight:600}
        .negative{color:#7C7D75;font-weight:600}
        .footer{margin-top:40px;text-align:center;font-size:11px;color:#94a3b8}
      </style></head><body>
      <h1>FleetFlow Analytics Report</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <div class="summary">
        <div class="summary-card"><div class="label">Total Fuel Cost</div><div class="value">₹${(s.totalFuelCost || 0).toLocaleString()}</div></div>
        <div class="summary-card"><div class="label">Total Maintenance</div><div class="value">₹${(s.totalMaintenanceCost || 0).toLocaleString()}</div></div>
        <div class="summary-card"><div class="label">Total Distance</div><div class="value">${(s.totalKm || 0).toLocaleString()} km</div></div>
        <div class="summary-card"><div class="label">Total Fuel Used</div><div class="value">${(s.totalLiters || 0).toLocaleString()} L</div></div>
      </div>
      <table><thead><tr><th>Vehicle</th><th>Plate</th><th>Fuel Cost</th><th>Maintenance</th><th>Total Cost</th><th>Distance</th><th>Efficiency</th><th>Cost/km</th><th>ROI</th></tr></thead>
      <tbody>${va.map(v => `<tr><td>${v.name}</td><td>${v.plate}</td><td>₹${v.fuel.toLocaleString()}</td><td>₹${v.maintenance.toLocaleString()}</td><td><strong>₹${v.totalCost.toLocaleString()}</strong></td><td>${v.km.toLocaleString()} km</td><td>${v.fuelEfficiency !== 'N/A' ? v.fuelEfficiency + ' km/L' : 'N/A'}</td><td>${v.costPerKm !== 'N/A' ? '₹' + v.costPerKm : 'N/A'}</td><td class="${v.roi !== 'N/A' && parseFloat(v.roi) >= 0 ? 'positive' : 'negative'}">${v.roi !== 'N/A' ? v.roi + '%' : 'N/A'}</td></tr>`).join('')}</tbody></table>
      <div class="footer">FleetFlow &copy; 2026 &mdash; Modular Fleet & Logistics Management System</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
    toast.success('PDF print dialog opened!');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#DD700B', borderTopColor: 'transparent' }} /></div>;

  const summary = data?.summary || {};
  const vehicleAnalytics = data?.vehicleAnalytics || [];
  const expenseTrend = data?.expenseTrend || [];

  return (
    <div>
      <PageHeader title="Analytics & Reports" subtitle="Data-driven fleet performance insights">
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg hover:bg-slate-700 transition-all">
            <FileText size={16} /> Export PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: '#DD700B', boxShadow: '0 10px 25px rgba(221, 112, 11, 0.15)' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#C25C07'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#DD700B'; }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(252, 248, 216, 0.5)' }}><Fuel size={20} style={{ color: '#DD700B' }} /></div>
            <div>
              <p className="text-xs text-slate-500">Total Fuel Cost</p>
              <p className="text-xl font-bold text-slate-900">₹{(summary.totalFuelCost || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(252, 248, 216, 0.5)' }}><Wrench size={20} style={{ color: '#DD700B' }} /></div>
            <div>
              <p className="text-xs text-slate-500">Total Maintenance</p>
              <p className="text-xl font-bold text-slate-900">₹{(summary.totalMaintenanceCost || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(252, 248, 216, 0.5)' }}><TrendingUp size={20} style={{ color: '#DD700B' }} /></div>
            <div>
              <p className="text-xs text-slate-500">Total Distance</p>
              <p className="text-xl font-bold text-slate-900">{(summary.totalKm || 0).toLocaleString()} km</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(252, 248, 216, 0.5)' }}><DollarSign size={20} style={{ color: '#DD700B' }} /></div>
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
            <BarChart3 size={16} style={{ color: '#DD700B' }} /> Monthly Expense Trend
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
                  <Bar dataKey="fuel" name="Fuel" fill="#DD700B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maintenance" name="Maintenance" fill="#7C7D75" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="other" name="Other" fill="#ADACA7" radius={[4, 4, 0, 0]} />
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
            <TrendingUp size={16} style={{ color: '#DD700B' }} /> Total Cost Trend
          </h3>
          {expenseTrend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`]} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="total" name="Total Cost" stroke="#DD700B" strokeWidth={3} dot={{ r: 5 }} />
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
                  <th className="px-5 py-3">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicleAnalytics.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{v.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{v.plate}</td>
                    <td className="px-5 py-3.5" style={{ color: '#DD700B' }}>₹{v.fuel.toLocaleString()}</td>
                    <td className="px-5 py-3.5" style={{ color: '#DD700B' }}>₹{v.maintenance.toLocaleString()}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">₹{v.totalCost.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-slate-600">{v.km.toLocaleString()} km</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${v.fuelEfficiency !== 'N/A' ? 'text-white px-2 py-1 rounded' : 'text-slate-400'}`} style={v.fuelEfficiency !== 'N/A' ? { backgroundColor: '#DD700B' } : {}}>
                        {v.fuelEfficiency} {v.fuelEfficiency !== 'N/A' && 'km/L'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{v.costPerKm !== 'N/A' ? `₹${v.costPerKm}` : 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold ${v.roi !== 'N/A' ? (parseFloat(v.roi) >= 0 ? 'text-white px-2 py-1 rounded' : 'text-red-600') : 'text-slate-400'}`} style={v.roi !== 'N/A' && parseFloat(v.roi) >= 0 ? { backgroundColor: '#DD700B' } : {}}>
                        {v.roi !== 'N/A' ? `${v.roi}%` : 'N/A'}
                      </span>
                    </td>
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
