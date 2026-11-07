import React, { useEffect, useState } from 'react';
import {
  Clock,
  BookOpen,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const MyTransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const { error } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 100
      });
      setTransactions(res.transactions || []);
    } catch (err: any) {
      error('Failed to load transaction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Borrowing History</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete log of all past and active book loans, returned dates, and assessed fines.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['All', 'Issued', 'Returned', 'Overdue'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s} Records
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Total: {transactions.length}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading history...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No transactions recorded</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Tx ID</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Return Date</th>
                  <th className="px-4 py-3.5">Fine Amount</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{tx.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tx.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={tx.book_title}
                          className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 max-w-[200px] truncate">{tx.book_title}</p>
                          <p className="text-[11px] text-slate-400">{tx.book_author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{tx.issue_date}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{tx.due_date}</td>
                    <td className="px-4 py-3.5 text-slate-500">{tx.return_date || 'In possession'}</td>
                    <td className="px-4 py-3.5 font-bold">
                      {tx.fine_amount ? (
                        <span className={tx.fine_status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}>
                          ₹{tx.fine_amount} ({tx.fine_status})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <StatusBadge status={tx.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
