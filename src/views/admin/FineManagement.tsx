import React, { useEffect, useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  Download,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Fine } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const FineManagement: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [summary, setSummary] = useState<{ totalUnpaid: number; totalPaid: number; totalFines: number; count: number }>({
    totalUnpaid: 0,
    totalPaid: 0,
    totalFines: 0,
    count: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mark as Paid Confirmation
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error } = useToast();

  const fetchFines = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFines({
        status: statusFilter,
        search,
      });
      setFines(res.fines || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch fine records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFines, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleOpenPayModal = (fine: Fine) => {
    setSelectedFine(fine);
    setIsPayModalOpen(true);
  };

  const handleConfirmPay = async () => {
    if (!selectedFine) return;
    try {
      setIsSubmitting(true);
      const res = await api.markFinePaid(selectedFine.id);
      success(res.message || 'Fine marked as Paid!');
      setIsPayModalOpen(false);
      fetchFines();
    } catch (err: any) {
      error(err.message || 'Failed to mark fine as paid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Fine & Penalty Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track overdue book penalties, review automatic calculations (Overdue Days × ₹5), and record physical cash/counter payments.
          </p>
        </div>
        <a
          href={api.exportCsvUrl('fines')}
          download
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Fines CSV</span>
        </a>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Unpaid</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600 mt-2">₹{summary.totalUnpaid}</p>
          <p className="text-xs text-slate-500 mt-1">Pending student clearance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Fines</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2">₹{summary.totalPaid}</p>
          <p className="text-xs text-slate-500 mt-1">Successfully cleared & verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fine Assessments</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">₹{summary.totalFines}</p>
          <p className="text-xs text-slate-500 mt-1">{summary.count} total penalty record(s)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or book title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Unpaid">Unpaid Only</option>
            <option value="Paid">Paid Only</option>
          </select>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading fine assessments...
            </div>
          ) : fines.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No fine records found</p>
              <p className="text-xs text-slate-400 mt-1">There are no {statusFilter.toLowerCase()} penalties matching criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Fine ID</th>
                  <th className="px-4 py-3.5">Tx ID</th>
                  <th className="px-4 py-3.5">Student Member</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Return Date</th>
                  <th className="px-4 py-3.5 text-center">Overdue Days</th>
                  <th className="px-4 py-3.5">Fine (₹5/day)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{f.id}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">TX #{f.transaction_id}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{f.user_name}</div>
                      <div className="text-[11px] text-slate-400">{f.user_email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={f.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={f.book_title}
                          className="w-7 h-10 object-cover rounded shadow-xs shrink-0"
                        />
                        <span className="font-semibold text-slate-900 max-w-[160px] truncate" title={f.book_title}>
                          {f.book_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{f.due_date}</td>
                    <td className="px-4 py-3.5 text-slate-500">{f.return_date || 'Pending Return'}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-rose-600">{f.overdue_days} days</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">₹{f.amount}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={f.payment_status} size="sm" />
                      {f.paid_date && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">Paid: {f.paid_date}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {f.payment_status === 'Unpaid' ? (
                        <button
                          onClick={() => handleOpenPayModal(f)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Mark Paid Confirmation Modal */}
      <ConfirmModal
        isOpen={isPayModalOpen}
        title={`Confirm Fine Payment: ₹${selectedFine?.amount}?`}
        message={`Confirm receiving physical payment of ₹${selectedFine?.amount} from ${selectedFine?.user_name} for overdue return of "${selectedFine?.book_title}". This will mark the fine status as Paid.`}
        confirmLabel="Confirm Payment Received"
        isLoading={isSubmitting}
        onConfirm={handleConfirmPay}
        onCancel={() => setIsPayModalOpen(false)}
      />
    </div>
  );
};
