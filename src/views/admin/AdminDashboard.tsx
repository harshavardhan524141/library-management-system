import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Plus,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { api } from '../../api/client.ts';
import { AdminDashboardData } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err: any) {
      error(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (requestId: number) => {
    try {
      await api.approveIssueRequest(requestId);
      success('Issue request approved! Book inventory updated.');
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to approve request.');
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await api.rejectIssueRequest(requestId, 'Rejected via quick dashboard action');
      success('Issue request rejected.');
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to reject request.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading library analytics...</p>
      </div>
    );
  }

  const { metrics, charts, tables } = data;
  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-900/10">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs inline-block mb-2">
            Library Administration Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, Admin!</h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Real-time library catalog analytics, active student loans, inventory tracking, and overdue fine management.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/15 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => onNavigate('books')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition-all shadow-md shadow-black/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>
        </div>
      </div>

      {/* 8 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Books */}
        <div
          onClick={() => onNavigate('books')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Books</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.totalBooks}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{metrics.totalTitles} unique catalog titles</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 2: Available Books */}
        <div
          onClick={() => onNavigate('availability')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Books</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.availableBooks}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Ready for circulation on shelves</p>
        </div>

        {/* Card 3: Issued Books */}
        <div
          onClick={() => onNavigate('transactions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issued Copies</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.issuedBooks}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">Currently in student possession</p>
        </div>

        {/* Card 4: Total Members */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Members</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.totalMembers}</p>
          <p className="text-xs text-slate-500 mt-1">Active student cardholders</p>
        </div>

        {/* Card 5: Pending Issue Requests */}
        <div
          onClick={() => onNavigate('issues')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Requests</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{metrics.pendingRequests}</p>
          <p className="text-xs text-amber-700 font-medium mt-1">Require librarian review & approval</p>
        </div>

        {/* Card 6: Overdue Books */}
        <div
          onClick={() => onNavigate('transactions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Books</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2">{metrics.overdueBooks}</p>
          <p className="text-xs text-rose-600 font-medium mt-1">Past scheduled return deadline</p>
        </div>

        {/* Card 7: Unpaid Fines */}
        <div
          onClick={() => onNavigate('fines')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Fines</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">₹{metrics.unpaidFinesAmount}</p>
          <p className="text-xs text-slate-500 mt-1">{metrics.unpaidFinesCount} outstanding penalty fee(s)</p>
        </div>

        {/* Card 8: Total Transactions */}
        <div
          onClick={() => onNavigate('transactions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transactions</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{metrics.totalTransactions}</p>
          <p className="text-xs text-teal-600 font-medium mt-1">Lifetime issue & return records</p>
        </div>
      </div>

      {/* 4 Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Book Issue Statistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Book Issue Statistics</h3>
              <p className="text-xs text-slate-500">Comparison of books issued versus returned</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">Circulation Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="issued" name="Issued Books" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="returned" name="Returned Books" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Book Category Distribution</h3>
              <p className="text-xs text-slate-500">Library inventory copies breakdown across subjects</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">Inventory</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.categoryDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total_copies" name="Total Copies" fill="#6366F1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Transaction Status Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transaction Status Breakdown</h3>
              <p className="text-xs text-slate-500">Ratio of issued, returned, overdue, and pending requests</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">Distribution</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.transactionOverview}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {charts.transactionOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Library Activity Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Library Activity</h3>
              <p className="text-xs text-slate-500">Total overall circulation transactions per month</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">6-Month Trend</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" name="Total Activity" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dashboard Tables (Real DB Records) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Pending Issue Requests */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Issue Requests</h3>
              <p className="text-xs text-slate-500">Student requests awaiting approval</p>
            </div>
            <button
              onClick={() => onNavigate('issues')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All ({metrics.pendingRequests})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {tables.pendingIssueRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No pending issue requests at this time.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tables.pendingIssueRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{req.user_name}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{req.book_title}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${req.available_copies && req.available_copies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {req.available_copies} avail
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            title="Approve Issue Request"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            title="Reject Issue Request"
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Table 2: Overdue Books Warning */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Overdue Books</h3>
              <p className="text-xs text-slate-500">Active loans that exceeded return due date</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              View Overdue ({metrics.overdueBooks})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            {tables.overdueTransactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No overdue books at this time. All loans up to date!</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Overdue</th>
                    <th className="px-4 py-3">Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tables.overdueTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-[160px] truncate">{tx.book_title}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium text-slate-900">{tx.user_name}</div>
                        <div className="text-[10px] text-slate-400">{tx.user_phone || 'No phone'}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-600">{tx.overdue_days} days</td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{tx.fine_amount || (tx.overdue_days || 1) * 5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Table 3: Recently Added Books */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recently Added Books</h3>
              <p className="text-xs text-slate-500">Latest acquisitions to library inventory</p>
            </div>
            <button
              onClick={() => onNavigate('books')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Catalog
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Title & Author</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">ISBN</th>
                  <th className="px-4 py-3 text-right">Copies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.recentlyAddedBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={b.title}
                          className="w-7 h-10 object-cover rounded shadow-xs shrink-0"
                        />
                        <div className="min-w-0 max-w-[160px]">
                          <p className="font-semibold text-slate-900 truncate">{b.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.category}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{b.isbn}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {b.available_copies} / {b.total_copies}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4: Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Live circulation audit trail</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              All Transactions
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{tx.user_name}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[150px] truncate">{tx.book_title}</td>
                    <td className="px-4 py-3 text-slate-500">{tx.issue_date}</td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
