import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  X,
  Save,
  BookMarked
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { Book } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const BookManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Form state
  const initialForm = {
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    publication_year: new Date().getFullYear(),
    description: '',
    total_copies: 3,
    cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { success, error } = useToast();

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const res = await api.getBooks({
        search,
        category: selectedCategory,
        availability: availabilityFilter,
        sort: sortBy,
        limit: 100
      });
      setBooks(res.books || []);
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch books.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, availabilityFilter, sortBy]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publication_year: book.publication_year || new Date().getFullYear(),
      description: book.description || '',
      total_copies: book.total_copies,
      cover_image: book.cover_image || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (book: Book) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn) {
      error('Title, author, and ISBN are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.createBook(formData);
      success(`Book "${formData.title}" added to catalog successfully!`);
      setIsAddModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      error(err.message || 'Failed to add book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      setIsSubmitting(true);
      await api.updateBook(selectedBook.id, formData);
      success(`Book "${formData.title}" updated successfully!`);
      setIsEditModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      error(err.message || 'Failed to update book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;
    try {
      setIsSubmitting(true);
      await api.deleteBook(selectedBook.id);
      success(`Book "${selectedBook.title}" removed from catalog.`);
      setIsDeleteModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      error(err.message || 'Failed to delete book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Book Catalog Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            View, search, edit, and maintain university library books and stock inventory.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none text-slate-700"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="w-full md:w-44">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none text-slate-700"
            >
              <option value="all">All Availability</option>
              <option value="available">Available (&gt;0)</option>
              <option value="limited">Limited (1-2)</option>
              <option value="unavailable">Unavailable (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none text-slate-700"
            >
              <option value="newest">Newest First</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
              <option value="available_desc">Most Copies Available</option>
              <option value="year_desc">Publication Year</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Found {books.length} book titles</span>
          <span className="font-medium text-slate-700">
            Total Copies: {books.reduce((acc, b) => acc + b.total_copies, 0)} | Available: {books.reduce((acc, b) => acc + b.available_copies, 0)}
          </span>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading catalog...
            </div>
          ) : books.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No books found matching criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search keywords or clearing filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Book Details</th>
                  <th className="px-4 py-3.5">ISBN</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Publisher & Year</th>
                  <th className="px-4 py-3.5 text-center">Total</th>
                  <th className="px-4 py-3.5 text-center">Avail</th>
                  <th className="px-4 py-3.5 text-center">Issued</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => {
                  const issuedCount = b.total_copies - b.available_copies;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{b.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                            alt={b.title}
                            className="w-10 h-14 object-cover rounded-lg shadow-xs shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <p className="font-bold text-slate-900 truncate" title={b.title}>{b.title}</p>
                            <p className="text-xs text-slate-500 truncate">{b.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{b.isbn}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                          {b.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div>{b.publisher || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{b.publication_year || ''}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-800">{b.total_copies}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{b.available_copies}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-indigo-600">{issuedCount}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={b.availability_status || (b.available_copies > 0 ? 'Available' : 'Currently Unavailable')} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenView(b)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(b)}
                            title="Edit book"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(b)}
                            title="Delete book"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAddModalOpen ? 'Add New Book to Catalog' : 'Edit Book Information'}
                  </h3>
                  <p className="text-xs text-slate-500">Provide book metadata and inventory quantities.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Computer Networking: A Top-Down Approach"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author(s) *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g., James Kurose & Keith Ross"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="e.g., 978-0133594140"
                    className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Literature">Literature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="e.g., Pearson, MIT Press, O'Reilly"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2030"
                    value={formData.publication_year}
                    onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value, 10) || 2024 })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.total_copies}
                    onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Abstract</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary of topics covered in the book..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAddModalOpen ? 'Save Book' : 'Update Book'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Book Details Modal */}
      {isViewModalOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <img
                src={selectedBook.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                alt={selectedBook.title}
                className="w-32 h-44 object-cover rounded-xl shadow-md border border-slate-200 shrink-0 self-center sm:self-start"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs inline-block mb-1">
                    {selectedBook.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedBook.title}</h3>
                  <p className="text-sm text-slate-600">by <span className="font-medium text-slate-800">{selectedBook.author}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block">ISBN:</span>
                    <span className="font-mono font-medium text-slate-800">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Publisher:</span>
                    <span className="font-medium text-slate-800">{selectedBook.publisher || 'N/A'} ({selectedBook.publication_year || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Copies:</span>
                    <span className="font-bold text-slate-900">{selectedBook.total_copies}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Available Copies:</span>
                    <span className="font-bold text-emerald-600">{selectedBook.available_copies}</span>
                  </div>
                </div>

                {selectedBook.description && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{selectedBook.description}"
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={`Delete Book: ${selectedBook?.title}?`}
        message="Are you sure you want to delete this book? This will permanently remove it from the catalog. You cannot delete a book that currently has active borrowed copies."
        confirmLabel="Delete Book"
        isDestructive={true}
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
