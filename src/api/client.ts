const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('lib_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // send cookies
  });

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred.';
    let errData = null;
    try {
      errData = await res.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      errorMsg = `Server error: ${res.statusText || res.status}`;
    }
    throw new ApiError(errorMsg, res.status, errData);
  }

  // Check if response is empty
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }

  return (await res.text()) as any;
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<{ user: any }>('/auth/me'),
  changePassword: (data: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Books
  getBooks: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/books?${query.toString()}`);
  },
  getBookById: (id: number) => request<any>(`/books/${id}`),
  createBook: (data: any) => request<any>('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id: number, data: any) => request<any>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id: number) => request<any>(`/books/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/users?${query.toString()}`);
  },
  getUserById: (id: number) => request<any>(`/users/${id}`),
  createUser: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleUserStatus: (id: number) => request<any>(`/users/${id}/status`, { method: 'PATCH' }),

  // Issue Requests & Issues
  getIssueRequests: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/issue-requests?${query.toString()}`);
  },
  requestIssue: (bookId: number) => request<any>('/issue-requests', { method: 'POST', body: JSON.stringify({ bookId }) }),
  directIssue: (data: { userId: number; bookId: number; durationDays?: number }) =>
    request<any>('/issue-requests/direct', { method: 'POST', body: JSON.stringify(data) }),
  approveIssueRequest: (id: number) => request<any>(`/issue-requests/${id}/approve`, { method: 'PATCH' }),
  rejectIssueRequest: (id: number, rejectionReason?: string) =>
    request<any>(`/issue-requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejectionReason }) }),

  // Returns
  getReturnRequests: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/return-requests?${query.toString()}`);
  },
  requestReturn: (transactionId: number) => request<any>('/return-requests', { method: 'POST', body: JSON.stringify({ transactionId }) }),
  directReturn: (transactionId: number) => request<any>('/return-requests/direct', { method: 'POST', body: JSON.stringify({ transactionId }) }),
  approveReturnRequest: (id: number) => request<any>(`/return-requests/${id}/approve`, { method: 'PATCH' }),

  // Transactions
  getTransactions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/transactions?${query.toString()}`);
  },
  getTransactionById: (id: number) => request<any>(`/transactions/${id}`),

  // Fines
  getFines: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/fines?${query.toString()}`);
  },
  getFineById: (id: number) => request<any>(`/fines/${id}`),
  markFinePaid: (id: number) => request<any>(`/fines/${id}/mark-paid`, { method: 'PATCH' }),

  // Dashboards
  getAdminDashboard: () => request<any>('/dashboard/admin'),
  getUserDashboard: () => request<any>('/dashboard/user'),

  // Settings
  getSettings: () => request<any>('/settings'),
  updateSettings: (data: any) => request<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Reports
  getReportsData: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/reports/analytics?${query.toString()}`);
  },
  exportCsvUrl: (type: 'books' | 'transactions' | 'fines' | 'users') => `/api/reports/export/${type}`,
};
