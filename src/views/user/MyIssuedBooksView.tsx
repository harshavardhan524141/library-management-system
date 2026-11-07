import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Search
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const MyIssuedBooksView: React.FC = () => {
  const [issuedBooks, setIssuedBooks] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchIssuedBooks = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions({
        limit: 100
      });
      // Filter for active borrowings (Issued, Return Requested, Overdue)
      const active = (res.transactions || []).filter(
        (t: Transaction) => t.status === 'Issued' || t.status === 'Return Requested' || t.status === 'Overdue'
      );
      setIssuedBooks(active);
    } catch (err: any) {
      error('Failed to load your issued books.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, []);

  const handleReturn = async (txId: number, title?: string) => {
    try {
      const res = await api.requestReturn(txId);
      success(res.message || `Return request submitted for "${title || 'book'}"!`);
      fetchIssuedBooks();
    } catch (err: any) {
      error(err.message || 'Failed to submit return request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Active Issued Books</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Track books currently checked out in your name, view scheduled return due dates, and initiate return requests.
        </p>
      </div>

      {/* Books List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading active loans...
          </div>
        ) : issuedBooks.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No active books currently borrowed</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You don't have any books checked out right now. Head over to the catalog to find study materials and textbooks.
            </p>
          </div>
        ) : (
          issuedBooks.map((item) => {
            const dueDateObj = new Date(item.due_date);
            const now = new Date();
            const diffTime = dueDateObj.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;
            const isReturnPending = item.status === 'Return Requested';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                    alt={item.book_title}
                    className="w-16 h-24 object-cover rounded-xl shadow-xs border border-slate-100 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                      {item.book_category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{item.book_title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">by {item.book_author}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">ISBN: {item.book_isbn}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Issued: <strong>{item.issue_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due Date: <strong>{item.due_date}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    {isOverdue && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {Math.abs(daysLeft)}d Overdue
                      </span>
                    )}
                    {!isOverdue && daysLeft >= 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {daysLeft}d remaining
                      </span>
                    )}
                  </div>

                  {item.fine_amount ? (
                    <p className="text-xs font-bold text-rose-600">
                      Accumulated Fine: ₹{item.fine_amount} ({item.fine_status})
                    </p>
                  ) : null}

                  {isReturnPending ? (
                    <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Return Request Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReturn(item.id, item.book_title)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Submit Return Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
