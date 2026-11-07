import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Sparkles,
  Calendar,
  ChevronRight,
  BookmarkPlus
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { UserDashboardData, Book, Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface UserDashboardProps {
  onNavigate: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUserDashboard();
      setData(res);
    } catch (err: any) {
      error(err.message || 'Failed to load member dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRequestReturn = async (txId: number, bookTitle?: string) => {
    try {
      const res = await api.requestReturn(txId);
      success(res.message || `Return request submitted for "${bookTitle || 'book'}"!`);
      fetchDashboard();
    } catch (err: any) {
      error(err.message || 'Failed to submit return request.');
    }
  };

  const handleRequestIssue = async (bookId: number, bookTitle: string) => {
    try {
      const res = await api.requestIssue(bookId);
      success(res.message || `Request submitted for "${bookTitle}"!`);
      fetchDashboard();
    } catch (err: any) {
      error(err.message || 'Failed to submit issue request.');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your library dashboard...</p>
      </div>
    );
  }

  const { metrics, activeBooks, upcomingDueDates, recentTransactions, userFines, recommendedBooks } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs inline-block mb-2">
            Student Member Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            You currently hold <span className="font-bold underline">{metrics.currentlyIssued} active books</span>. You have <span className="font-bold underline">{metrics.availableRequestsRemaining} borrowing slots</span> remaining under your student quota.
          </p>
        </div>

        <button
          onClick={() => onNavigate('search-books')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-md shadow-black/10 transition-all self-start sm:self-auto"
        >
          <Search className="w-4 h-4" />
          <span>Search & Borrow Books</span>
        </button>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Currently Issued */}
        <div
          onClick={() => onNavigate('my-issued')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Issued Books</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.currentlyIssued}</p>
          <p className="text-[11px] text-slate-400 mt-1">In your possession</p>
        </div>

        {/* Card 2: Available Requests */}
        <div
          onClick={() => onNavigate('search-books')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Quota Left</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.availableRequestsRemaining}</p>
          <p className="text-[11px] text-slate-400 mt-1">of {metrics.maxAllowed} allowed</p>
        </div>

        {/* Card 3: Returned Books */}
        <div
          onClick={() => onNavigate('my-transactions')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Returned</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{metrics.returnedBooks}</p>
          <p className="text-[11px] text-slate-400 mt-1">Completed loans</p>
        </div>

        {/* Card 4: Pending Requests */}
        <div
          onClick={() => onNavigate('my-returns')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pending</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.pendingRequests}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting approval</p>
        </div>

        {/* Card 5: Overdue */}
        <div
          onClick={() => onNavigate('my-issued')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Overdue</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{metrics.overdueBooks}</p>
          <p className="text-[11px] text-rose-500 mt-1">Action needed</p>
        </div>

        {/* Card 6: Unpaid Fines */}
        <div
          onClick={() => onNavigate('my-fines')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Unpaid Fines</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{metrics.unpaidFineAmount}</p>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.unpaidFineCount} assessment(s)</p>
        </div>
      </div>

      {/* Overdue Warning Alert if any */}
      {metrics.overdueBooks > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-800 text-sm">You have {metrics.overdueBooks} overdue book(s)!</h4>
            <p className="mt-0.5 text-rose-700">
              Please submit return requests or bring the physical copies to the library desk to prevent further overdue penalties of ₹5/day.
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-issued')}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Main Grid: Active Books + Due Dates & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Borrowed Books */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Currently Borrowed Books ({activeBooks.length})</h3>
                <p className="text-xs text-slate-500">Books currently in your active possession</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('my-issued')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {activeBooks.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">You have no borrowed books right now</p>
                <p className="text-xs text-slate-400 mt-1">Explore the library catalog to borrow textbooks or research papers.</p>
                <button
                  onClick={() => onNavigate('search-books')}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBooks.map((loan) => {
                  const daysLeft = loan.days_remaining ?? 0;
                  const isOverdue = daysLeft < 0;
                  const hasPendingReturn = !!loan.has_pending_return || loan.status === 'Return Requested';

                  return (
                    <div
                      key={loan.transaction_id || loan.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={loan.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={loan.book_title}
                          className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0 border border-slate-100"
                        />
                        <div>
                          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                            {loan.book_category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{loan.book_title}</h4>
                          <p className="text-xs text-slate-500">{loan.book_author}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-slate-500">Issued: {loan.issue_date}</span>
                            <span className="font-semibold text-slate-800">Due: {loan.due_date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        {isOverdue ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            Overdue by {Math.abs(daysLeft)} day(s)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {daysLeft} day(s) remaining
                          </span>
                        )}

                        {hasPendingReturn ? (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                            Return Pending Review
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRequestReturn(loan.transaction_id || loan.id, loan.book_title)}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
                            <span>Request Return</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Due Dates & Recent Transactions */}
        <div className="space-y-6">
          {/* Upcoming Due Dates */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Upcoming Due Dates
            </h3>
            <p className="text-xs text-slate-500 mb-4">Keep track of loan deadlines to avoid fines</p>

            {upcomingDueDates.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No upcoming due dates scheduled.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {upcomingDueDates.map((item) => (
                  <div key={item.id || item.transaction_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-slate-900 truncate">{item.book_title}</p>
                      <p className="text-[11px] text-slate-500">Return by: {item.due_date}</p>
                    </div>
                    <span className="font-bold text-blue-600 shrink-0">
                      {item.days_remaining}d left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Fine Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                Fine Account Summary
              </h3>
              <button
                onClick={() => onNavigate('my-fines')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Balance Due</span>
                <p className="text-xl font-bold text-slate-900">₹{metrics.unpaidFineAmount}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                metrics.unpaidFineAmount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {metrics.unpaidFineAmount === 0 ? 'No Overdues' : 'Payment Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended / Recently Added Books Carousel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Recommended & Recently Added Books
            </h3>
            <p className="text-xs text-slate-500">Popular materials ready for immediate lending</p>
          </div>
          <button
            onClick={() => onNavigate('search-books')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Explore All
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendedBooks.map((b) => (
            <div
              key={b.id}
              className="group p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                  alt={b.title}
                  className="w-full h-36 object-cover rounded-lg shadow-xs group-hover:scale-102 transition-transform"
                />
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block mt-2 truncate">
                  {b.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5" title={b.title}>
                  {b.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.author}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600">
                  {b.available_copies} avail
                </span>
                <button
                  onClick={() => handleRequestIssue(b.id, b.title)}
                  className="p-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                  title="Borrow this book"
                >
                  <BookmarkPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
