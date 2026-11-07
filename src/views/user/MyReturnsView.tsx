import React, { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { ReturnRequest } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const MyReturnsView: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error } = useToast();

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const res = await api.getReturnRequests();
      setReturns(res.requests || []);
    } catch (err: any) {
      error('Failed to load return requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Return Requests</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Monitor your submitted physical book return requests and librarian review approvals.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading return records...
            </div>
          ) : returns.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No return requests on record</p>
              <p className="text-xs text-slate-400 mt-1">When you return a borrowed book, you can check its processing status here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Req ID</th>
                  <th className="px-4 py-3.5">Book Title</th>
                  <th className="px-4 py-3.5">Requested Date</th>
                  <th className="px-4 py-3.5">Issue & Due Date</th>
                  <th className="px-4 py-3.5 text-center">Overdue Days</th>
                  <th className="px-4 py-3.5">Request Status</th>
                  <th className="px-4 py-3.5">Librarian Processing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{r.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={r.book_title}
                          className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                        />
                        <span className="font-semibold text-slate-900 max-w-[190px] truncate" title={r.book_title}>
                          {r.book_title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{r.requested_date ? r.requested_date.split(' ')[0] : 'N/A'}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>Issued: {r.issue_date}</div>
                      <div className="text-[11px] text-slate-400">Due: {r.due_date}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {(r.calculated_overdue_days || 0) > 0 ? (
                        <span className="font-bold text-rose-600">{r.calculated_overdue_days}d overdue</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">On time</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status === 'Approved' ? 'Returned' : 'Return Requested'} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {r.status === 'Approved' ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmed by {r.processed_by_name || 'Librarian'}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Pending physical verification
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
    </div>
  );
};
