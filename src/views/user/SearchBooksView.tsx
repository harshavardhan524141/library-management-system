import React, { useEffect, useState } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle,
  AlertCircle,
  BookmarkPlus,
  Eye,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Book } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const SearchBooksView: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Book Details Modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookUserStatus, setBookUserStatus] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error } = useToast();

  const fetchBooks = async () => {
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
      error(err.message || 'Failed to fetch catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleOpenDetails = async (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
    try {
      const res = await api.getBookById(book.id);
      setBookUserStatus(res.userStatus);
    } catch (err) {
      // fallback
    }
  };

  const handleRequestIssue = async (book: Book) => {
    if (book.available_copies <= 0) {
      error('Sorry, this book is currently out of stock.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.requestIssue(book.id);
      success(res.message || `Issue request submitted for "${book.title}"!`);
      if (isDetailModalOpen) setIsDetailModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      error(err.message || 'Failed to submit issue request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">University Library Catalog</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Search research titles, textbooks, and check shelf availability to borrow materials.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Chips */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by book title, author, publisher, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading catalog...
            </div>
          ) : books.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No books found</p>
              <p className="text-xs text-slate-400 mt-1">Try another title keyword or select "All Categories".</p>
            </div>
          ) : (
            books.map((b) => {
              const isAvailable = b.available_copies > 0;
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg transition-all p-4 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 aspect-[3/4] mb-3">
                      <img
                        src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                        {b.available_copies} / {b.total_copies} left
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                      {b.category}
                    </span>
                    <h3
                      onClick={() => handleOpenDetails(b)}
                      className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-1 hover:text-blue-600 cursor-pointer"
                      title={b.title}
                    >
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{b.author}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">ISBN: {b.isbn}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDetails(b)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleRequestIssue(b)}
                      disabled={!isAvailable}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Request Book' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Book Details</th>
                  <th className="px-4 py-3.5">ISBN</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Available Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0"
                        />
                        <div className="min-w-0 max-w-[240px]">
                          <p
                            onClick={() => handleOpenDetails(b)}
                            className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                            title={b.title}
                          >
                            {b.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{b.isbn}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{b.category}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      <span className={b.available_copies > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {b.available_copies}
                      </span> / {b.total_copies}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.available_copies > 0 ? 'Available' : 'Currently Unavailable'} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleRequestIssue(b)}
                        disabled={b.available_copies <= 0}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          b.available_copies > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {b.available_copies > 0 ? 'Request' : 'Out of Stock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {isDetailModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <img
                src={selectedBook.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                alt={selectedBook.title}
                className="w-36 h-48 object-cover rounded-xl shadow-md border border-slate-200 shrink-0 self-center sm:self-start"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs inline-block mb-1">
                    {selectedBook.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedBook.title}</h3>
                  <p className="text-sm text-slate-600">by <span className="font-semibold text-slate-900">{selectedBook.author}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">ISBN:</span>
                    <span className="font-mono font-medium text-slate-800">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Publisher:</span>
                    <span className="text-slate-800 font-medium">{selectedBook.publisher || 'N/A'} ({selectedBook.publication_year || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Shelf Availability:</span>
                    <span className="font-bold text-emerald-600">{selectedBook.available_copies} copies ready</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total In Catalog:</span>
                    <span className="font-bold text-slate-900">{selectedBook.total_copies} physical copies</span>
                  </div>
                </div>

                {selectedBook.description && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{selectedBook.description}"
                  </p>
                )}

                {bookUserStatus?.activeIssue && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <p className="font-bold">You currently have this book checked out!</p>
                    <p className="text-[11px] text-blue-700">Due date: {bookUserStatus.activeIssue.due_date}</p>
                  </div>
                )}

                {bookUserStatus?.pendingRequest && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <p className="font-bold">Pending Request Submitted</p>
                    <p className="text-[11px] text-amber-700">Awaiting librarian review and issue approval.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={() => handleRequestIssue(selectedBook)}
                disabled={selectedBook.available_copies <= 0 || isSubmitting || !!bookUserStatus?.activeIssue || !!bookUserStatus?.pendingRequest}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  {bookUserStatus?.activeIssue
                    ? 'Already Borrowed'
                    : bookUserStatus?.pendingRequest
                    ? 'Request Pending'
                    : selectedBook.available_copies > 0
                    ? 'Request to Borrow'
                    : 'Out of Stock'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
