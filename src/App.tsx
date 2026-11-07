/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';

// Public views
import { LandingPage } from './views/public/LandingPage.tsx';
import { LoginPage } from './views/public/LoginPage.tsx';
import { RegisterPage } from './views/public/RegisterPage.tsx';

// Admin views
import { AdminDashboard } from './views/admin/AdminDashboard.tsx';
import { BookManagement } from './views/admin/BookManagement.tsx';
import { UserManagement } from './views/admin/UserManagement.tsx';
import { IssueManagement } from './views/admin/IssueManagement.tsx';
import { ReturnManagement } from './views/admin/ReturnManagement.tsx';
import { TransactionManagement } from './views/admin/TransactionManagement.tsx';
import { FineManagement } from './views/admin/FineManagement.tsx';
import { ReportsAnalytics } from './views/admin/ReportsAnalytics.tsx';
import { UmlArchitecture } from './views/admin/UmlArchitecture.tsx';

// User views
import { UserDashboard } from './views/user/UserDashboard.tsx';
import { SearchBooksView } from './views/user/SearchBooksView.tsx';
import { MyIssuedBooksView } from './views/user/MyIssuedBooksView.tsx';
import { MyReturnsView } from './views/user/MyReturnsView.tsx';
import { MyTransactionsView } from './views/user/MyTransactionsView.tsx';
import { MyFinesView } from './views/user/MyFinesView.tsx';

// Common views
import { BookAvailabilityView } from './views/common/BookAvailabilityView.tsx';
import { UserProfileView } from './views/common/UserProfileView.tsx';
import { SettingsPage } from './views/common/SettingsPage.tsx';
import { ChangePasswordView } from './views/common/ChangePasswordView.tsx';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Sync tab with login state
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (currentTab === 'landing' || currentTab === 'login' || currentTab === 'register') {
          setCurrentTab(user.role === 'admin' ? 'dashboard' : 'user-dashboard');
        }
      } else {
        if (currentTab !== 'login' && currentTab !== 'register') {
          setCurrentTab('landing');
        }
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Initializing Library Management System...</p>
      </div>
    );
  }

  // Public unauthenticated screens
  if (!user) {
    if (currentTab === 'login') {
      return (
        <LoginPage
          onGoRegister={() => setCurrentTab('register')}
          onGoHome={() => setCurrentTab('landing')}
        />
      );
    }
    if (currentTab === 'register') {
      return (
        <RegisterPage
          onGoLogin={() => setCurrentTab('login')}
          onGoHome={() => setCurrentTab('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoLogin={() => setCurrentTab('login')}
        onGoRegister={() => setCurrentTab('register')}
      />
    );
  }

  // Authenticated Application Shell with Dark Navy Sidebar & Navbar
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={(tab) => setCurrentTab(tab)}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
        />

        {/* Dashboard Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Admin Routes */}
          {isAdmin && (
            <>
              {currentTab === 'dashboard' && <AdminDashboard onNavigate={setCurrentTab} />}
              {currentTab === 'books' && <BookManagement />}
              {currentTab === 'availability' && <BookAvailabilityView onNavigate={setCurrentTab} />}
              {currentTab === 'users' && <UserManagement />}
              {currentTab === 'issues' && <IssueManagement />}
              {currentTab === 'returns' && <ReturnManagement />}
              {currentTab === 'transactions' && <TransactionManagement />}
              {currentTab === 'fines' && <FineManagement />}
              {currentTab === 'reports' && <ReportsAnalytics />}
              {currentTab === 'architecture' && <UmlArchitecture />}
              {currentTab === 'profile' && <UserProfileView />}
              {currentTab === 'change-password' && <ChangePasswordView />}
              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}

          {/* User / Student Routes */}
          {!isAdmin && (
            <>
              {currentTab === 'user-dashboard' && <UserDashboard onNavigate={setCurrentTab} />}
              {currentTab === 'search-books' && <SearchBooksView />}
              {currentTab === 'availability' && <BookAvailabilityView onNavigate={setCurrentTab} />}
              {currentTab === 'my-issued' && <MyIssuedBooksView />}
              {currentTab === 'my-returns' && <MyReturnsView />}
              {currentTab === 'my-transactions' && <MyTransactionsView />}
              {currentTab === 'my-fines' && <MyFinesView />}
              {currentTab === 'profile' && <UserProfileView />}
              {currentTab === 'change-password' && <ChangePasswordView />}
              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
