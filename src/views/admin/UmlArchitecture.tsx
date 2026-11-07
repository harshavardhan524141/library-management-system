import React, { useState } from 'react';
import {
  GitFork,
  Layers,
  Database,
  ArrowRight,
  Shield,
  FileText,
  Boxes,
  Workflow,
  Server,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export const UmlArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'usecase' | 'class' | 'sequence' | 'activity' | 'component' | 'deployment' | 'database'>('usecase');

  const tabs = [
    { id: 'usecase', label: 'Use Case Diagram', icon: Workflow },
    { id: 'class', label: 'Class Diagram', icon: Boxes },
    { id: 'sequence', label: 'Sequence Diagram', icon: ArrowRight },
    { id: 'activity', label: 'Activity Diagram', icon: Layers },
    { id: 'component', label: 'Component Diagram', icon: GitFork },
    { id: 'deployment', label: 'Deployment Diagram', icon: Server },
    { id: 'database', label: 'Database ER Schema', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-block mb-3">
          B.Tech CSE Project Evaluation & Viva Ready
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System UML Architecture & Diagrams</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Complete software engineering design diagrams modeling actors, entity relationships, issue/return sequence flows, module components, and database foreign key constraints.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Diagram Viewer Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {activeTab === 'usecase' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">1. Use Case Diagram (Actors & Functional Boundaries)</h3>
              <p className="text-xs text-slate-500">Models interactions between Admin/Librarian, Student/Member, and System Scheduler.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Actor 1: Admin */}
              <div className="w-full md:w-1/4 p-4 rounded-xl bg-white border border-indigo-200 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-bold text-lg">
                  A
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Librarian / Admin</h4>
                <div className="text-left text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Manage Catalog & Stock</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Approve / Reject Issues</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Confirm Physical Returns</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Collect & Mark Fines Paid</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Export System Analytics</div>
                </div>
              </div>

              {/* Use Cases Center Box */}
              <div className="w-full md:w-2/4 p-5 rounded-2xl bg-white border-2 border-dashed border-blue-300 space-y-2 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  System Boundary: Library Management System
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC1: Authenticate / Login</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC2: Search & Filter Books</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC3: Check Availability</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC4: Request Book Issue</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC5: Request Book Return</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC6: Calculate Overdue Fines</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC7: Member Management</span>
                  <span className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 font-semibold text-slate-800">UC8: Configure System Rules</span>
                </div>
              </div>

              {/* Actor 2: Student */}
              <div className="w-full md:w-1/4 p-4 rounded-xl bg-white border border-emerald-200 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-lg">
                  S
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Student / Member</h4>
                <div className="text-left text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Search Catalog & Inventory</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Submit Issue Requests</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Submit Return Requests</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> View Due Dates & History</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> View Overdue Fine Balance</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">2. Class Diagram (Object-Oriented Design)</h3>
              <p className="text-xs text-slate-500">Represents primary domain entities, attributes, methods, and multiplicities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class: User */}
              <div className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-xs text-xs font-mono">
                <div className="bg-blue-600 text-white font-bold p-2 text-center font-sans">User</div>
                <div className="p-3 bg-blue-50/30 border-b border-blue-100 space-y-1">
                  <div>- id: int</div>
                  <div>- name: string</div>
                  <div>- email: string</div>
                  <div>- role: 'admin' | 'user'</div>
                  <div>- status: 'active' | 'deactivated'</div>
                </div>
                <div className="p-3 space-y-1 font-mono text-[11px] text-slate-700">
                  <div>+ requestIssue(bookId)</div>
                  <div>+ requestReturn(txId)</div>
                  <div>+ viewTransactions()</div>
                </div>
              </div>

              {/* Class: Book */}
              <div className="rounded-xl border border-indigo-200 bg-white overflow-hidden shadow-xs text-xs font-mono">
                <div className="bg-indigo-600 text-white font-bold p-2 text-center font-sans">Book</div>
                <div className="p-3 bg-indigo-50/30 border-b border-indigo-100 space-y-1">
                  <div>- id: int</div>
                  <div>- title: string</div>
                  <div>- author: string</div>
                  <div>- isbn: string</div>
                  <div>- totalCopies: int</div>
                  <div>- availableCopies: int</div>
                </div>
                <div className="p-3 space-y-1 font-mono text-[11px] text-slate-700">
                  <div>+ decrementAvailable()</div>
                  <div>+ incrementAvailable()</div>
                  <div>+ isAvailable(): boolean</div>
                </div>
              </div>

              {/* Class: Transaction */}
              <div className="rounded-xl border border-emerald-200 bg-white overflow-hidden shadow-xs text-xs font-mono">
                <div className="bg-emerald-600 text-white font-bold p-2 text-center font-sans">Transaction</div>
                <div className="p-3 bg-emerald-50/30 border-b border-emerald-100 space-y-1">
                  <div>- id: int</div>
                  <div>- userId: int</div>
                  <div>- bookId: int</div>
                  <div>- issueDate: date</div>
                  <div>- dueDate: date</div>
                  <div>- status: TxStatus</div>
                </div>
                <div className="p-3 space-y-1 font-mono text-[11px] text-slate-700">
                  <div>+ markReturned(date)</div>
                  <div>+ calculateOverdue(): int</div>
                  <div>+ generateFine(): Fine</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sequence' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">3. Sequence Diagram (Book Issue & Return Workflow)</h3>
              <p className="text-xs text-slate-500">Chronological interaction between Student, UI Controller, Service, and SQLite Database.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-3">
              <div className="text-blue-400 font-bold">=== Book Issue Request Sequence ===</div>
              <div>Student -&gt; Frontend: Click "Request Issue" (book_id)</div>
              <div>Frontend -&gt; IssueController: POST /api/issue-requests</div>
              <div>IssueController -&gt; SQLite: Verify active user &amp; book available_copies &gt; 0</div>
              <div>SQLite --&gt; IssueController: Stock OK (e.g., 3 copies)</div>
              <div>IssueController -&gt; SQLite: INSERT issue_requests (status = 'Pending')</div>
              <div>Librarian -&gt; Frontend: Click "Approve Issue"</div>
              <div>Frontend -&gt; IssueController: PATCH /api/issue-requests/:id/approve</div>
              <div>IssueController -&gt; SQLite (Transaction):</div>
              <div className="pl-4 text-emerald-400">- UPDATE books SET available_copies = available_copies - 1</div>
              <div className="pl-4 text-emerald-400">- INSERT transactions (issue_date = today, due_date = today + 14, status = 'Issued')</div>
              <div className="pl-4 text-emerald-400">- UPDATE issue_requests SET status = 'Approved'</div>
              <div>SQLite --&gt; Frontend: 200 OK (Inventory Decremented &amp; Loan Created)</div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">4. Activity Diagram (Decision Branching & Fines)</h3>
              <p className="text-xs text-slate-500">Decision flow from physical book return to fine assessment.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center font-bold text-blue-900 w-full md:w-1/5">
                1. Student Returns Book Physical Copy
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 hidden md:block" />
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center font-bold text-purple-900 w-full md:w-1/5">
                2. Check (Return Date &gt; Due Date)?
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 hidden md:block" />
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center font-bold text-rose-900 w-full md:w-1/5">
                3. Overdue &gt; 0: Fine = Days × ₹5
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 hidden md:block" />
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-bold text-emerald-900 w-full md:w-1/5">
                4. Stock +1 &amp; Mark Transaction 'Returned'
              </div>
            </div>
          </div>
        )}

        {activeTab === 'component' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">5. Component Diagram (Software Architecture)</h3>
              <p className="text-xs text-slate-500">Tiered separation of presentation, business logic, and relational persistence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-blue-600 uppercase tracking-wider block">Presentation Layer (Client)</span>
                <p className="text-slate-600">React 19 + TypeScript SPA</p>
                <p className="text-slate-600">Tailwind CSS + Lucide Icons</p>
                <p className="text-slate-600">Recharts Interactive Analytics</p>
                <p className="text-slate-600">Auth &amp; Toast State Contexts</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-600 uppercase tracking-wider block">Application Service Layer</span>
                <p className="text-slate-600">Node.js + Express REST API</p>
                <p className="text-slate-600">Bcrypt Password Hashing</p>
                <p className="text-slate-600">Session Cookie &amp; Bearer Middleware</p>
                <p className="text-slate-600">Overdue Sync &amp; Fine Engine</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-600 uppercase tracking-wider block">Data Persistence Layer</span>
                <p className="text-slate-600">SQLite Relational Engine</p>
                <p className="text-slate-600">ACID Atomic DB Transactions</p>
                <p className="text-slate-600">Foreign Key Cascades &amp; Constraints</p>
                <p className="text-slate-600">WAL Concurrency Mode</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">6. Deployment Diagram (Physical Node Topology)</h3>
              <p className="text-xs text-slate-500">Hosting and network runtime configuration.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-center gap-8 text-xs text-center">
              <div className="p-4 rounded-xl bg-white border border-slate-300 shadow-xs w-48">
                <span className="font-bold text-slate-900 block">User Client Device</span>
                <span className="text-slate-500 block mt-1">Chrome, Safari, Firefox</span>
                <span className="text-[10px] text-blue-600 font-mono mt-2 block">HTTPS / TLS 1.3</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="p-4 rounded-xl bg-white border-2 border-blue-500 shadow-md w-56">
                <span className="font-bold text-blue-700 block">Cloud Run / Express Node</span>
                <span className="text-slate-500 block mt-1">Port 3000 (Express + Vite)</span>
                <span className="text-[10px] text-slate-400 mt-2 block">Linux Container</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="p-4 rounded-xl bg-white border border-emerald-400 shadow-xs w-48">
                <span className="font-bold text-emerald-700 block">Persistent SQLite DB</span>
                <span className="text-slate-500 block mt-1">/data/library.db</span>
                <span className="text-[10px] text-emerald-600 font-mono mt-2 block">WAL Journal Mode</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">7. Database Relational Schema (ER Diagram)</h3>
              <p className="text-xs text-slate-500">7 fully normalized SQLite tables with foreign key constraints and ACID transaction protection.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-blue-700 font-sans block mb-1">TABLE: users</span>
                <div>id (PK, int)</div>
                <div>name (text)</div>
                <div>email (text, UNIQUE)</div>
                <div>password_hash (text)</div>
                <div>role ('admin' | 'user')</div>
                <div>status ('active' | 'deactivated')</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-indigo-700 font-sans block mb-1">TABLE: books</span>
                <div>id (PK, int)</div>
                <div>title (text)</div>
                <div>author (text)</div>
                <div>isbn (text, UNIQUE)</div>
                <div>total_copies (int)</div>
                <div>available_copies (int)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-emerald-700 font-sans block mb-1">TABLE: transactions</span>
                <div>id (PK, int)</div>
                <div>user_id (FK -&gt; users.id)</div>
                <div>book_id (FK -&gt; books.id)</div>
                <div>issue_date (text)</div>
                <div>due_date (text)</div>
                <div>status (TxStatus)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-amber-700 font-sans block mb-1">TABLE: issue_requests</span>
                <div>id (PK, int)</div>
                <div>user_id (FK -&gt; users.id)</div>
                <div>book_id (FK -&gt; books.id)</div>
                <div>status ('Pending'|'Approved'|'Rejected')</div>
                <div>approved_by (FK -&gt; users.id)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-purple-700 font-sans block mb-1">TABLE: return_requests</span>
                <div>id (PK, int)</div>
                <div>transaction_id (FK -&gt; transactions.id)</div>
                <div>requested_date (text)</div>
                <div>status ('Pending'|'Approved')</div>
                <div>processed_by (FK -&gt; users.id)</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="font-bold text-rose-700 font-sans block mb-1">TABLE: fines</span>
                <div>id (PK, int)</div>
                <div>transaction_id (FK, UNIQUE)</div>
                <div>overdue_days (int)</div>
                <div>amount (real)</div>
                <div>payment_status ('Unpaid'|'Paid')</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
