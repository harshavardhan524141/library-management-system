# University Library Management System

A production-grade, full-stack Academic Library Management System built with **React**, **TypeScript**, **Node.js / Express**, and **SQLite**.

Designed according to software engineering principles for university evaluations, academic administration, and B.Tech CSE project demonstrations.

---

## 🌟 Key Features

### 1. Multi-Role Authentication & Access Control
- **Admin / Librarian Role**: Full administrative authority over catalog, stock inventory, user memberships, issue approvals, physical return confirmations, and penalty fines.
- **User / Student Member Role**: Search catalog, inspect real-time shelf availability, submit book issue requests, initiate returns, monitor countdowns to due dates, and track fines.
- **Security Hardening**: Session cookie authentication with bearer token fallback, bcrypt password hashing, and role-based API route guards.

### 2. Live Inventory & Availability Tracking
- Real-time stock counters (`available_copies` = `total_copies` - active loans).
- Status indicators: `Available` (>2 copies), `Limited Availability` (1-2 copies), and `Currently Unavailable` (0 copies).
- Out-of-stock guard prevents issuing or borrowing books with 0 available copies.

### 3. Automated Circulation Workflow
1. **Student requests book** &rarr; System checks active member status, remaining borrow quota (max 3 books), and non-duplicate loan rule.
2. **Librarian reviews & approves** &rarr; ACID transaction automatically decreases book stock and calculates due date (14 days default).
3. **Desk Counter Direct Issue** &rarr; Librarian can directly issue any physical book to a student at the desk.
4. **Student requests return** &rarr; Librarian confirms physical condition at the desk &rarr; Stock increases by 1 &rarr; Overdue fines assessed automatically.

### 4. Overdue Fine Engine
- Formula: $\text{Fine Amount} = \text{Overdue Days} \times \text{Fine Per Day (₹5)}$.
- Automatic synchronization for active loans past due date.
- Admin cashier mark-as-paid settlement workflow.

### 5. Interactive Analytics & Reporting
- Recharts visualizations:
  - Monthly Book Circulation (Issued vs. Returned)
  - Book Category Distribution (Programming, CS, AI, Math, Science)
  - Transaction Status Overview (Donut chart)
  - 6-Month Library Circulation Activity Trend
- CSV Data Exports for Books, Transactions, Fines, and Users.

### 6. UML Software Engineering Architecture
Interactive architectural blueprints embedded inside the application under **UML & System Design**:
- Use Case Diagram
- Class Diagram
- Sequence Diagram
- Activity Diagram
- Component Diagram
- Deployment Topology
- Relational ER Database Schema

---

## 🔑 Demo Login Credentials

The system includes an automatically seeded database with pre-configured books, transactions, and user accounts.

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin / Librarian** | Dr. Evelyn Reed | `admin@university.edu` | `admin123` |
| **Student Member** | Aarav Sharma | `aarav.sharma@university.edu` | `password123` |
| **Student Member** | Sarah Jenkins | `sarah.j@university.edu` | `password123` |
| **Student Member** | Michael Chang | `m.chang@university.edu` | `password123` |
| **Student Member** | Ananya Iyer | `ananya.i@university.edu` | `password123` |
| **Student (Deactivated)**| David Miller | `david.m@university.edu` | `password123` |

*Note: You can also use the **Quick 1-Click Demo Login** buttons on the login and landing pages.*

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Recharts
- **Backend**: Node.js, Express.js REST API
- **Database**: SQLite (`better-sqlite3`) with WAL journal mode, relational foreign keys, and atomic transactions
- **Authentication**: BcryptJS, Session Cookies + Bearer Token Header

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The Express backend and Vite frontend will start unified on `http://localhost:3000`.*

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🗄️ Database Relational Design

The database is stored persistently in `/data/library.db` and initialized automatically on startup:
1. `users` &ndash; Account credentials, roles (`admin` / `user`), statuses (`active` / `deactivated`).
2. `books` &ndash; Metadata, ISBN, category, total copies, available copies.
3. `transactions` &ndash; Circulation records linking user and book with issue, due, and return dates.
4. `issue_requests` &ndash; Student loan requests with librarian approval status.
5. `return_requests` &ndash; Physical book return requests with librarian verification.
6. `fines` &ndash; Overdue penalty assessments with payment status (`Unpaid` / `Paid`).
7. `settings` &ndash; Configurable parameters: `borrowing_duration_days`, `max_active_books`, `fine_per_day`.
8. `sessions` &ndash; Persistent authentication tokens.

---

## 🧪 Testing Verification Checklist

- [x] Admin login & dashboard metrics verified
- [x] Student login & personal loan dashboard verified
- [x] Book search by title, author, and ISBN with category filtering
- [x] Real-time shelf availability stock counter
- [x] Issue request creation & loan quota limits
- [x] Librarian approval & automatic stock copy decrement
- [x] Physical return confirmation & automatic stock copy increment
- [x] Overdue penalty calculation ($\text{days} \times ₹5$)
- [x] Cashier fine payment marking
- [x] Member activation / deactivation toggling
- [x] Recharts interactive data visualization
- [x] CSV data export streams
