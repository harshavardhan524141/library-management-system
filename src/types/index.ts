export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'deactivated';
  profile_image: string | null;
  created_at?: string;
  updated_at?: string;
  active_transactions_count?: number;
  pending_requests_count?: number;
  unpaid_fines_total?: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string | null;
  publication_year?: number | null;
  description?: string | null;
  total_copies: number;
  available_copies: number;
  issued_copies?: number;
  cover_image?: string | null;
  availability_status?: 'Available' | 'Limited Availability' | 'Currently Unavailable';
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: number;
  transaction_id?: number;
  user_id: number;
  book_id: number;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'Pending' | 'Issued' | 'Return Requested' | 'Returned' | 'Rejected' | 'Overdue';
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  book_title?: string;
  book_author?: string;
  book_isbn?: string;
  book_cover?: string;
  book_category?: string;
  fine_id?: number | null;
  fine_amount?: number | null;
  fine_status?: 'Unpaid' | 'Paid' | null;
  fine_paid_date?: string | null;
  overdue_days?: number;
  live_overdue_days?: number;
  days_remaining?: number;
  has_pending_return?: number;
}

export interface IssueRequest {
  id: number;
  user_id: number;
  book_id: number;
  request_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: number | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  book_title?: string;
  book_author?: string;
  book_isbn?: string;
  book_cover?: string;
  available_copies?: number;
  total_copies?: number;
  approved_by_name?: string;
}

export interface ReturnRequest {
  id: number;
  transaction_id: number;
  requested_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processed_by?: number | null;
  processed_at?: string | null;
  user_id?: number;
  book_id?: number;
  issue_date?: string;
  due_date?: string;
  transaction_status?: string;
  user_name?: string;
  user_email?: string;
  book_title?: string;
  book_author?: string;
  book_cover?: string;
  processed_by_name?: string;
  calculated_overdue_days?: number;
}

export interface Fine {
  id: number;
  transaction_id: number;
  overdue_days: number;
  amount: number;
  payment_status: 'Unpaid' | 'Paid';
  paid_date?: string | null;
  created_at?: string;
  issue_date?: string;
  due_date?: string;
  return_date?: string | null;
  transaction_status?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  book_id?: number;
  book_title?: string;
  book_author?: string;
  book_cover?: string;
}

export interface LibrarySettings {
  borrowing_duration_days: number;
  max_active_books: number;
  fine_per_day: number;
}

export interface AdminDashboardData {
  metrics: {
    totalBooks: number;
    totalTitles: number;
    availableBooks: number;
    issuedBooks: number;
    totalMembers: number;
    pendingRequests: number;
    overdueBooks: number;
    unpaidFinesAmount: number;
    unpaidFinesCount: number;
    totalTransactions: number;
  };
  charts: {
    categoryDistribution: { category: string; count: number; total_copies: number }[];
    transactionOverview: { name: string; count: number; color: string }[];
    monthlyStats: { month: string; issued: number; returned: number; total: number }[];
  };
  tables: {
    recentlyAddedBooks: Book[];
    recentTransactions: Transaction[];
    pendingIssueRequests: IssueRequest[];
    overdueTransactions: Transaction[];
    recentMembers: User[];
  };
}

export interface UserDashboardData {
  metrics: {
    currentlyIssued: number;
    availableRequestsRemaining: number;
    maxAllowed: number;
    returnedBooks: number;
    pendingRequests: number;
    overdueBooks: number;
    unpaidFineAmount: number;
    unpaidFineCount: number;
  };
  activeBooks: Transaction[];
  upcomingDueDates: Transaction[];
  recentTransactions: Transaction[];
  userFines: Fine[];
  recommendedBooks: Book[];
}
