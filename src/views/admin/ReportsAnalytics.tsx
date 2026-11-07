import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../../api/client.ts';
import { useToast } from '../../context/ToastContext.tsx';

export const ReportsAnalytics: React.FC = () => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const { error } = useToast();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await api.getReportsData({
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setReportsData(res);
    } catch (err: any) {
      error(err.message || 'Failed to fetch reports analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading || !reportsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Compiling library intelligence reports...</p>
      </div>
    );
  }

  const { summary, categoryStats, fineStats, topBorrowers, overdueAging } = reportsData;

  const finePieData = [
    { name: 'Collected Fines', value: fineStats.total_collected || 0, color: '#10B981' },
    { name: 'Pending Unpaid', value: fineStats.total_pending || 0, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Quick CSV Exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Library Reports & Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Circulation performance, collection usage metrics, student borrowing rankings, and fine audit reports.
          </p>
        </div>

        {/* CSV Export Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.exportCsvUrl('books')}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Books CSV</span>
          </a>
          <a
            href={api.exportCsvUrl('transactions')}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transactions CSV</span>
          </a>
          <a
            href={api.exportCsvUrl('fines')}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>Fines CSV</span>
          </a>
          <a
            href={api.exportCsvUrl('users')}
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Users CSV</span>
          </a>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Analytics Date Range
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            placeholder="From Date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            placeholder="To Date"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Copies</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{summary.totalBooks}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Available</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{summary.availableBooks}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Active Loans</span>
          <span className="text-2xl font-bold text-blue-600 mt-1 block">{summary.issuedBooks}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Returned</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">{summary.returnedBooks}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Overdue</span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{summary.overdueBooks}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs text-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block">Members</span>
          <span className="text-2xl font-bold text-purple-600 mt-1 block">{summary.totalUsers}</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Circulation Volume */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Category Circulation Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Historical book loans across subject domains</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total_circulations" name="Total Loans" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fine Collection Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Fine Recovery Ratio</h3>
          <p className="text-xs text-slate-500 mb-4">Collected penalty revenue vs unpaid outstanding fees</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Borrowing Students Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Most Active Library Members</h3>
              <p className="text-xs text-slate-500">Member reading engagement and lifetime borrow volume</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Rank</th>
                <th className="px-4 py-3.5">Member Name</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5 text-center">Total Borrowed</th>
                <th className="px-4 py-3.5 text-center">Currently Held</th>
                <th className="px-4 py-3.5 text-center">Returned</th>
                <th className="px-4 py-3.5 text-right">Fines Incurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topBorrowers.map((user: any, idx: number) => (
                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-400">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{user.name}</td>
                  <td className="px-4 py-3.5 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-blue-600">{user.total_borrowed}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{user.active_loans}</td>
                  <td className="px-4 py-3.5 text-center font-semibold text-emerald-600">{user.returned_count}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-700">₹{user.total_fines_incurred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
