import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BookOpen,
  Filter,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Book } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

interface BookAvailabilityViewProps {
  onNavigate?: (tab: string) => void;
}

export const BookAvailabilityView: React.FC<BookAvailabilityViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>([]);
  const { success, error } = useToast();

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const res = await api.getBooks({
        search,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        limit: 100
      });
      setBooks(res.books || []);
      if (res.categories) setCategories(res.categories);
    } catch (err: any) {
      error(err.message || 'Failed to fetch book availability.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchAvailability, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleQuickRequest = async (book: Book) => {
    if (book.available_copies <= 0) {
      error('This book currently has 0 copies available for borrowing.');
      return;
    }
    try {
      await api.requestIssue(book.id);
      success(`Request submitted for "${book.title}". You can track status under "My Returns/Requests".`);
      fetchAvailability();
    } catch (err: any) {
      error(err.message || 'Failed to request book.');
    }
  };

  const filteredBooks = books.filter((b) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Available') return b.available_copies > 2;
    if (selectedStatus === 'Limited') return b.available_copies > 0 && b.available_copies <= 2;
    if (selectedStatus === 'Unavailable') return b.available_copies === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Real-Time Book Availability</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Check current shelf status, total copies in library inventory, and copies actively in circulation.
          </p>
        </div>
        {user?.role === 'user' && onNavigate && (
          <button
            onClick={() => onNavigate('search-books')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <span>Search & Request Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search book title, author, or ISBN to check stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-52">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700"
          >
            <option value="All">All Availability Statuses</option>
            <option value="Available">Available (3+ copies)</option>
            <option value="Limited">Limited Availability (1-2 copies)</option>
            <option value="Unavailable">Currently Unavailable (0 copies)</option>
          </select>
        </div>
      </div>

      {/* Availability Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading real-time availability...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No books found matching criteria</p>
          </div>
        ) : (
          filteredBooks.map((b) => {
            const issuedCopies = b.total_copies - b.available_copies;
            const percentAvailable = Math.round((b.available_copies / b.total_copies) * 100);
            const isZero = b.available_copies === 0;

            let statusLabel = 'Available';
            let barColor = 'bg-emerald-500';
            if (isZero) {
              statusLabel = 'Currently Unavailable';
              barColor = 'bg-rose-500';
            } else if (b.available_copies <= 2) {
              statusLabel = 'Limited Availability';
              barColor = 'bg-amber-500';
            }

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                      alt={b.title}
                      className="w-16 h-22 object-cover rounded-xl shadow-xs border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                        {b.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug truncate" title={b.title}>
                        {b.title}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{b.author}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">ISBN: {b.isbn}</p>
                    </div>
                  </div>

                  {/* Stock progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Availability Rate</span>
                      <span className="font-bold text-slate-800">{b.available_copies} of {b.total_copies} left</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-300 rounded-full`}
                        style={{ width: `${percentAvailable}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                      <span className="font-bold text-slate-800">{b.total_copies}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Available</span>
                      <span className="font-bold text-emerald-600">{b.available_copies}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Issued</span>
                      <span className="font-bold text-indigo-600">{issuedCopies}</span>
                    </div>
                  </div>
                </div>

                {/* Footer status and action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <StatusBadge status={statusLabel} size="sm" />

                  {user?.role === 'user' ? (
                    <button
                      onClick={() => handleQuickRequest(b)}
                      disabled={isZero}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isZero
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      {isZero ? 'Out of Stock' : 'Request Issue'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">ID #{b.id}</span>
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
