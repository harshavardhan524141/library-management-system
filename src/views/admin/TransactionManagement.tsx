import React, { useEffect, useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const { success, error } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions({
        search,
        status: statusFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 100
      });
      setTransactions(res.transactions || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Library Transactions Log</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive audit trail of book issues, returns, overdue periods, and associated penalty statuses.
          </p>
        </div>
        <a
          href={api.exportCsvUrl('transactions')}
          download
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by book title, student name, email, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Issued">Active (Issued)</option>
            <option value="Return Requested">Return Requested</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
            title="Issued From"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
            title="Issued To"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No transactions recorded</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing date ranges or search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Tx ID</th>
                  <th className="px-4 py-3.5">Student Member</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Return Date</th>
                  <th className="px-4 py-3.5">Fine Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{tx.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{tx.user_name}</div>
                      <div className="text-[11px] text-slate-400">{tx.user_email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tx.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={tx.book_title}
                          className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                        />
                        <span className="font-semibold text-slate-900 max-w-[170px] truncate" title={tx.book_title}>
                          {tx.book_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{tx.issue_date}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{tx.due_date}</td>
                    <td className="px-4 py-3.5 text-slate-500">{tx.return_date || '—'}</td>
                    <td className="px-4 py-3.5 font-bold">
                      {tx.fine_amount ? (
                        <span className={tx.fine_status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{tx.fine_amount} ({tx.fine_status})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Transaction #{selectedTx.id} Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTx.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                  alt={selectedTx.book_title}
                  className="w-14 h-20 object-cover rounded-xl shadow-xs border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedTx.book_title}</h4>
                  <p className="text-slate-500">by {selectedTx.book_author}</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedTx.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block font-medium">Borrower Name:</span>
                  <span className="font-semibold text-slate-900">{selectedTx.user_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact:</span>
                  <span className="text-slate-700">{selectedTx.user_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Issue Date:</span>
                  <span className="text-slate-800">{selectedTx.issue_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Scheduled Due Date:</span>
                  <span className="text-slate-800 font-semibold">{selectedTx.due_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Actual Return Date:</span>
                  <span className="text-slate-800">{selectedTx.return_date || 'Pending Return'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fine Assessment:</span>
                  <span className={`font-bold ${selectedTx.fine_amount ? 'text-rose-600' : 'text-slate-600'}`}>
                    {selectedTx.fine_amount ? `₹${selectedTx.fine_amount} (${selectedTx.fine_status})` : 'No fine incurred'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
