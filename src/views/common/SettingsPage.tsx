import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Clock,
  BookOpen,
  DollarSign,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/client.ts';
import { LibrarySettings } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { success, error } = useToast();

  const [settings, setSettings] = useState<LibrarySettings>({
    borrowing_duration_days: 14,
    max_active_books: 3,
    fine_per_day: 5,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.settings) {
          setSettings(res.settings);
        }
      } catch (err: any) {
        error('Failed to load library settings.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.updateSettings(settings);
      success(res.message || 'Library system configuration updated!');
    } catch (err: any) {
      error(err.message || 'Failed to update settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }
    try {
      setIsChangingPass(true);
      const res = await api.changePassword({ currentPassword, newPassword });
      success(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Settings & Preferences</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure library borrowing policies, overdue fine parameters, and account security credentials.
        </p>
      </div>

      {/* Admin Library Policies */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Library Circulation Rules</h3>
                <p className="text-xs text-slate-500">Core operational thresholds enforced across borrowing workflows</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Borrowing Duration
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={settings.borrowing_duration_days}
                    onChange={(e) => setSettings({ ...settings, borrowing_duration_days: parseInt(e.target.value, 10) || 14 })}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-medium">Days</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Default loan period allocated when an issue request is approved.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Max Active Loans
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={settings.max_active_books}
                    onChange={(e) => setSettings({ ...settings, max_active_books: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-medium">Books</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Maximum simultaneous active borrowed books allowed per student.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-rose-600" />
                  Fine Per Overdue Day
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-slate-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    max="100"
                    required
                    value={settings.fine_per_day}
                    onChange={(e) => setSettings({ ...settings, fine_per_day: parseFloat(e.target.value) || 5 })}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-medium">/ Day</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Fine assessed per overdue calendar day until book return.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <Save className="w-4 h-4" />
                <span>Save Library Policies</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Change Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Security Password</h3>
              <p className="text-xs text-slate-500">Update your login authentication password</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              {isChangingPass && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
