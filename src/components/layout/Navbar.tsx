import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Settings,
  Shield,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNavigate,
  globalSearchQuery,
  setGlobalSearchQuery,
}) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all shadow-xs">
      {/* Left side: Hamburger button + Global search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isAdmin ? "Search catalog by title, author, or ISBN..." : "Search available books in the library..."}
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isAdmin) {
                  onNavigate('books');
                } else {
                  onNavigate('search-books');
                }
              }
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Right side: Role badge, Notifications, Profile dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Shield className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'System Administrator' : 'Student Account'}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                <span className="text-xs text-blue-600 font-medium">Real-time</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {isAdmin ? (
                  <>
                    <div
                      onClick={() => {
                        onNavigate('issues');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-blue-800">Pending Issue Requests</p>
                      <p className="text-blue-700 mt-0.5">Students submitted requests awaiting librarian approval.</p>
                    </div>
                    <div
                      onClick={() => {
                        onNavigate('returns');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-amber-800">Pending Returns</p>
                      <p className="text-amber-700 mt-0.5">Check returned books and verify condition before clearing.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => {
                        onNavigate('my-issued');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-blue-800">Library Loan Status</p>
                      <p className="text-blue-700 mt-0.5">Check your active books and upcoming due dates.</p>
                    </div>
                    <div
                      onClick={() => {
                        onNavigate('search-books');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-emerald-800">New Additions Available</p>
                      <p className="text-emerald-700 mt-0.5">22 new textbooks and research papers added to catalog.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  onNavigate('profile');
                  setProfileDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
