import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Eye,
  X,
  Save,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { User, Transaction } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { ConfirmModal } from '../../components/common/ConfirmModal.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<{ user: User; transactions: Transaction[] } | null>(null);

  // Forms
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  };
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(res.users || []);
    } catch (err: any) {
      error(err.message || 'Failed to fetch members.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (user: User) => {
    setSelectedUser(user);
    try {
      const res = await api.getUserById(user.id);
      setUserDetails(res);
      setIsViewModalOpen(true);
    } catch (err: any) {
      error(err.message || 'Failed to fetch user history.');
    }
  };

  const handleOpenToggle = (user: User) => {
    setSelectedUser(user);
    setIsToggleModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.createUser(formData);
      success(`Member "${formData.name}" registered successfully!`);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to register member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (formData.password && formData.password !== formData.confirmPassword) {
      error('Passwords do not match.');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.updateUser(selectedUser.id, formData);
      success(`Member "${formData.name}" updated successfully!`);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to update member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleConfirm = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const res = await api.toggleUserStatus(selectedUser.id);
      success(res.message || 'Member status updated.');
      setIsToggleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to update user status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Library Member Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage student registrations, staff accounts, active borrowing privileges, and status.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member by full name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-44">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="All">All Roles</option>
            <option value="user">Students (User)</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading member records...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No member accounts found</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">User ID</th>
                  <th className="px-4 py-3.5">Member Name</th>
                  <th className="px-4 py-3.5">Email & Phone</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Active Loans</th>
                  <th className="px-4 py-3.5 text-center">Pending Req</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400 font-semibold">#{u.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                          {u.unpaid_fines_total && u.unpaid_fines_total > 0 ? (
                            <span className="text-[10px] text-rose-600 font-bold">Unpaid Fines: ₹{u.unpaid_fines_total}</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.phone || 'No phone recorded'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-blue-600">
                      {u.active_transactions_count || 0}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-amber-600">
                      {u.pending_requests_count || 0}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {u.created_at ? u.created_at.split(' ')[0] : 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenView(u)}
                          title="View user details and loan history"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Edit user details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenToggle(u)}
                          title={u.status === 'active' ? 'Deactivate user' : 'Reactivate user'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isAddModalOpen ? 'Register New Member' : 'Edit Member Details'}
                  </h3>
                  <p className="text-xs text-slate-500">Enter account credentials and contact details.</p>
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

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Jane Cooper"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane.cooper@university.edu"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">System Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">Library Member / Student</option>
                  <option value="admin">Administrator / Librarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isEditModalOpen ? 'New Password (leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={isAddModalOpen}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {(isAddModalOpen || formData.password) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required={isAddModalOpen || !!formData.password}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

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
                  <span>{isAddModalOpen ? 'Create Member' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User History Modal */}
      {isViewModalOpen && userDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={userDetails.user.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={userDetails.user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{userDetails.user.name}</h3>
                  <p className="text-xs text-slate-500">{userDetails.user.email} • {userDetails.user.phone || 'No phone'}</p>
                </div>
              </div>
              <StatusBadge status={userDetails.user.status} />
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Transaction History ({userDetails.transactions.length})
              </h4>
              {userDetails.transactions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No transaction records found for this user.</p>
              ) : (
                <div className="space-y-2">
                  {userDetails.transactions.map((tx) => (
                    <div key={tx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{tx.book_title}</p>
                        <p className="text-[11px] text-slate-500">Issued: {tx.issue_date} | Due: {tx.due_date} {tx.return_date ? `| Returned: ${tx.return_date}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={tx.status} size="sm" />
                        {tx.fine_amount ? (
                          <p className="text-[10px] text-rose-600 font-bold mt-1">Fine: ₹{tx.fine_amount} ({tx.fine_status})</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        isOpen={isToggleModalOpen}
        title={`${selectedUser?.status === 'active' ? 'Deactivate' : 'Reactivate'} Account: ${selectedUser?.name}?`}
        message={
          selectedUser?.status === 'active'
            ? 'Deactivating this user will terminate any active login sessions and prevent them from borrowing or requesting books.'
            : 'Reactivating this user will restore their ability to log in and request library materials.'
        }
        confirmLabel={selectedUser?.status === 'active' ? 'Deactivate Member' : 'Reactivate Member'}
        isDestructive={selectedUser?.status === 'active'}
        isLoading={isSubmitting}
        onConfirm={handleToggleConfirm}
        onCancel={() => setIsToggleModalOpen(false)}
      />
    </div>
  );
};
