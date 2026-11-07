import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  CheckCircle,
  Clock,
  Search,
  BookOpen,
  AlertTriangle,
  Receipt,
  User,
  Plus
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { ReturnRequest, Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const ReturnManagement: React.FC = () => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [activeLoans, setActiveLoans] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Direct return counter state
  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [selectedTxId, setSelectedTxId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error } = useToast();

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const [reqRes, txRes] = await Promise.all([
        api.getReturnRequests({ status: statusFilter }),
        api.getTransactions({ status: 'Issued', limit: 100 })
      ]);
      setReturnRequests(reqRes.requests || []);
      setActiveLoans(txRes.transactions || []);
      if (txRes.transactions?.length > 0) {
        setSelectedTxId(String(txRes.transactions[0].id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch returns data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const handleApproveReturn = async (requestId: number) => {
    try {
      const res = await api.approveReturnRequest(requestId);
      success(res.message || 'Book return confirmed! Stock increased.');
      fetchReturns();
    } catch (err: any) {
      error(err.message || 'Failed to confirm return.');
    }
  };

  const handleDirectReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxId) return;
    try {
      setIsSubmitting(true);
      const res = await api.directReturn(parseInt(selectedTxId, 10));
      success(res.message || 'Book returned successfully!');
      setIsDirectModalOpen(false);
      fetchReturns();
    } catch (err: any) {
      error(err.message || 'Failed to process return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Book Return Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Process student physical book returns, replenish inventory copies, and calculate overdue penalty fines.
          </p>
        </div>
        <button
          onClick={() => setIsDirectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Desk Return Counter</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['Pending', 'Approved', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s} Returns
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          Found {returnRequests.length} return requests
        </span>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading return requests...
            </div>
          ) : returnRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No {statusFilter.toLowerCase()} returns at this time</p>
              <p className="text-xs text-slate-400 mt-1">All requested book returns are currently processed.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Req ID</th>
                  <th className="px-4 py-3.5">Tx ID</th>
                  <th className="px-4 py-3.5">Member Name</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Issue Date</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5 text-center">Overdue Days</th>
                  <th className="px-4 py-3.5">Return Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returnRequests.map((rr) => {
                  const overdueDays = rr.calculated_overdue_days || 0;
                  return (
                    <tr key={rr.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{rr.id}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">TX #{rr.transaction_id}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{rr.user_name}</div>
                        <div className="text-[11px] text-slate-400">{rr.user_email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rr.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                            alt={rr.book_title}
                            className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                          />
                          <span className="font-semibold text-slate-900 max-w-[170px] truncate" title={rr.book_title}>
                            {rr.book_title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{rr.issue_date}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{rr.due_date}</td>
                      <td className="px-4 py-3.5 text-center">
                        {overdueDays > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            {overdueDays} days (₹{overdueDays * 5})
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium">On Time</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={rr.status === 'Approved' ? 'Returned' : 'Return Requested'} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {rr.status === 'Pending' ? (
                          <button
                            onClick={() => handleApproveReturn(rr.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                          >
                            Confirm Return
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Desk Direct Return Modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Desk Return Counter</h3>
                  <p className="text-xs text-slate-500">Directly accept a book copy returned by a student.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDirectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                X
              </button>
            </div>

            <form onSubmit={handleDirectReturn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Active Borrowed Book to Return *
                </label>
                {activeLoans.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No active borrowed transactions found in system.</p>
                ) : (
                  <select
                    required
                    value={selectedTxId}
                    onChange={(e) => setSelectedTxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  >
                    {activeLoans.map((tx) => (
                      <option key={tx.id} value={tx.id}>
                        TX #{tx.id}: {tx.user_name} — "{tx.book_title}" (Due: {tx.due_date})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                <p className="font-semibold">Automatic Fine Assessment</p>
                <p className="mt-0.5 text-blue-700">
                  If the book is past its due date, the system will automatically calculate ₹5 per overdue day and record it under Fine Management.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || activeLoans.length === 0}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Confirm Physical Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
