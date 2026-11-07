import React, { useEffect, useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Fine } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const MyFinesView: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [summary, setSummary] = useState<{ totalUnpaid: number; totalPaid: number; totalFines: number }>({
    totalUnpaid: 0,
    totalPaid: 0,
    totalFines: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error } = useToast();

  const fetchFines = async () => {
    try {
      setIsLoading(true);
      const res = await api.getFines();
      setFines(res.fines || []);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (err: any) {
      error('Failed to load your fine details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Overdue Fines</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Review penalty fees assessed for late book returns at the rate of ₹5 per overdue day.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Outstanding Unpaid</span>
          <p className="text-3xl font-bold text-rose-600 mt-2">₹{summary.totalUnpaid}</p>
          <p className="text-xs text-slate-400 mt-1">Please pay at the library circulation desk</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Fines Cleared</span>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹{summary.totalPaid}</p>
          <p className="text-xs text-slate-400 mt-1">Historically settled penalties</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Daily Penalty Rate</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">₹5 / day</p>
          <p className="text-xs text-slate-400 mt-1">Standard university overdue policy</p>
        </div>
      </div>

      {/* Fine Notice */}
      {summary.totalUnpaid > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Fine Payment Instructions</h4>
            <p className="mt-1 text-amber-700 leading-relaxed">
              Fines must be cleared physically in cash or campus card at the Central Library Front Desk. Once paid, the librarian will mark your balance as Paid in the system, restoring full borrowing privileges.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading fine history...
            </div>
          ) : fines.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-800">No overdue fines on your account!</p>
              <p className="text-xs text-slate-400 mt-1">Keep returning books on or before their due dates.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Fine ID</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Return Date</th>
                  <th className="px-4 py-3.5 text-center">Overdue Days</th>
                  <th className="px-4 py-3.5">Calculation</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5 text-right">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{f.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{f.book_title}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{f.due_date}</td>
                    <td className="px-4 py-3.5 text-slate-500">{f.return_date || 'Still overdue'}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-rose-600">{f.overdue_days} days</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {f.overdue_days} × ₹5 = ₹{f.amount}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={f.payment_status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">
                      {f.paid_date || 'Pending Payment'}
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
