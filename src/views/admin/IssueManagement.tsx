import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  X,
  Search,
  BookOpen,
  User,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { IssueRequest, Book, User as MemberType } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const IssueManagement: React.FC = () => {
  const [requests, setRequests] = useState<IssueRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Direct Issue Desk Modal state
  const [isDirectModalOpen, setIsDirectModalOpen] = useState<boolean>(false);
  const [membersList, setMembersList] = useState<MemberType[]>([]);
  const [availableBooksList, setAvailableBooksList] = useState<Book[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [customDays, setCustomDays] = useState<number>(14);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reject modal state
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { success, error } = useToast();

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.getIssueRequests({
        status: statusFilter,
      });
      setRequests(res.requests || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch issue requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      const res = await api.approveIssueRequest(id);
      success(res.message || 'Issue request approved!');
      fetchRequests();
    } catch (err: any) {
      error(err.message || 'Failed to approve issue request.');
    }
  };

  const handleOpenReject = (id: number) => {
    setRejectRequestId(id);
    setRejectionReason('Book currently reserved or unavailable for lending.');
  };

  const handleConfirmReject = async () => {
    if (!rejectRequestId) return;
    try {
      await api.rejectIssueRequest(rejectRequestId, rejectionReason);
      success('Issue request rejected.');
      setRejectRequestId(null);
      fetchRequests();
    } catch (err: any) {
      error(err.message || 'Failed to reject issue request.');
    }
  };

  const handleOpenDirectIssue = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
        api.getUsers({ role: 'user', status: 'active' }),
        api.getBooks({ availability: 'available', limit: 100 })
      ]);
      setMembersList(uRes.users || []);
      setAvailableBooksList(bRes.books || []);
      if (uRes.users?.length > 0) setSelectedUserId(String(uRes.users[0].id));
      if (bRes.books?.length > 0) setSelectedBookId(String(bRes.books[0].id));
      setIsDirectModalOpen(true);
    } catch (err: any) {
      error('Failed to load member or book lists for counter issue.');
    }
  };

  const handleSaveDirectIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedBookId) {
      error('Please select both a student member and a book.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.directIssue({
        userId: parseInt(selectedUserId, 10),
        bookId: parseInt(selectedBookId, 10),
        durationDays: customDays
      });
      success(res.message || 'Book issued successfully at counter!');
      setIsDirectModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      error(err.message || 'Failed to issue book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Book Issue Requests</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Review student borrowing requests, decrease available stock upon approval, or issue directly at the counter.
          </p>
        </div>
        <button
          onClick={handleOpenDirectIssue}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Counter Issue (Direct)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status} Requests
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          Total: {requests.length} records
        </span>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No issue requests found</p>
              <p className="text-xs text-slate-400 mt-1">There are no {statusFilter.toLowerCase()} requests.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Req ID</th>
                  <th className="px-4 py-3.5">Student Member</th>
                  <th className="px-4 py-3.5">Requested Book</th>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5 text-center">Available Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Decision Details</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => {
                  const isStockAvailable = (r.available_copies ?? 0) > 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{r.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{r.user_name}</div>
                        <div className="text-[11px] text-slate-400">{r.user_email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.book_cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80'}
                            alt={r.book_title}
                            className="w-8 h-11 object-cover rounded shadow-xs shrink-0"
                          />
                          <div className="min-w-0 max-w-[180px]">
                            <p className="font-semibold text-slate-900 truncate" title={r.book_title}>{r.book_title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{r.book_author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {r.request_date ? r.request_date.split(' ')[0] : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold ${isStockAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {r.available_copies ?? 0} left
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {r.status === 'Approved' ? (
                          <span className="text-emerald-700">Approved by {r.approved_by_name || 'Admin'}</span>
                        ) : r.status === 'Rejected' ? (
                          <span className="text-rose-600 italic">"{r.rejection_reason}"</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Awaiting Librarian</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {r.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={!isStockAvailable}
                              title={isStockAvailable ? 'Approve request' : 'Cannot approve: 0 copies available'}
                              className={`p-1.5 rounded-lg text-white font-medium flex items-center gap-1 text-xs px-2.5 ${
                                isStockAvailable
                                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs'
                                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenReject(r.id)}
                              title="Reject request"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium flex items-center gap-1 text-xs px-2.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
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

      {/* Direct Counter Issue Modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Counter Book Issue</h3>
                  <p className="text-xs text-slate-500">Directly issue a physical book to a student at the desk.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDirectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectIssue} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student Member *</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                >
                  {membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Available Book *</label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                >
                  {availableBooksList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.available_copies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Borrowing Duration (Days) *</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value, 10) || 14)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Due date will automatically be set {customDays} days from today.</p>
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
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Confirm Issue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectRequestId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Issue Request #{rejectRequestId}</h3>
            <p className="text-xs text-slate-500">Provide an explanation for rejecting this borrowing request.</p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectRequestId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
