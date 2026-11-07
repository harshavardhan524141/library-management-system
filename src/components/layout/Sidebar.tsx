import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckCircle,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileSpreadsheet,
  Settings,
  User as UserIcon,
  LogOut,
  X,
  Sparkles,
  GitFork,
  Library,
  Clock,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
}) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const isAdmin = user?.role === 'admin';

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
  }

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'availability', label: 'Book Availability', icon: CheckCircle },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'issues', label: 'Issue Books', icon: ArrowUpRight },
    { id: 'returns', label: 'Return Books', icon: ArrowDownLeft },
    { id: 'transactions', label: 'Transactions', icon: Clock },
    { id: 'fines', label: 'Fine Management', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'architecture', label: 'UML & System Design', icon: GitFork, badge: 'B.Tech' },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'change-password', label: 'Change Password', icon: KeyRound },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const userNavItems: NavItem[] = [
    { id: 'user-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search-books', label: 'Search Books', icon: BookOpen },
    { id: 'availability', label: 'Book Availability', icon: CheckCircle },
    { id: 'my-issued', label: 'My Issued Books', icon: ArrowUpRight },
    { id: 'my-returns', label: 'My Returns', icon: ArrowDownLeft },
    { id: 'my-transactions', label: 'My Transactions', icon: Clock },
    { id: 'my-fines', label: 'My Fines', icon: Receipt },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'change-password', label: 'Change Password', icon: KeyRound },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0c1427] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80 bg-[#090f1d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight leading-tight text-base">UniLibrary</h1>
              <p className="text-[11px] text-blue-400 font-medium tracking-wide">MANAGEMENT SYSTEM</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card info in sidebar */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
          <img
            src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest User'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {isAdmin ? 'Admin / Librarian' : 'Student Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isAdmin ? 'Administration' : 'Library Portal'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Role Switcher Banner */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-blue-950/40 border border-blue-900/40 text-xs">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Role Switcher
            </span>
            <span className="text-[10px] text-slate-400">Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                quickDemoLogin('admin');
                setCurrentTab('dashboard');
              }}
              className={`px-2 py-1.5 rounded-lg text-center font-medium transition-colors ${
                isAdmin
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => {
                quickDemoLogin('user');
                setCurrentTab('user-dashboard');
              }}
              className={`px-2 py-1.5 rounded-lg text-center font-medium transition-colors ${
                !isAdmin
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* Logout button */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090f1d]">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
