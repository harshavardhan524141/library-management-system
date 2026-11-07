import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { syncOverdueTransactionsAndFines } from '../services/fineService.ts';

export function getReportsData(req: AuthenticatedRequest, res: Response) {
  try {
    syncOverdueTransactionsAndFines();

    const { from, to, category } = req.query;

    let txDateFilter = '';
    const txParams: any[] = [];
    if (from && typeof from === 'string') {
      txDateFilter += ` AND date(t.issue_date) >= date(?)`;
      txParams.push(from);
    }
    if (to && typeof to === 'string') {
      txDateFilter += ` AND date(t.issue_date) <= date(?)`;
      txParams.push(to);
    }

    // 1. Category performance
    const categoryStats = db.prepare(`
      SELECT b.category,
             COUNT(DISTINCT b.id) as titles_count,
             SUM(b.total_copies) as total_copies,
             SUM(b.available_copies) as available_copies,
             SUM(b.total_copies - b.available_copies) as currently_issued,
             (SELECT COUNT(*) FROM transactions t WHERE t.book_id = b.id ${txDateFilter}) as total_circulations
      FROM books b
      GROUP BY b.category
      ORDER BY total_circulations DESC
    `).all(...txParams);

    // 2. Fine collection analytics
    const fineStats = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN payment_status = 'Unpaid' THEN amount ELSE 0 END), 0) as total_pending,
        COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN payment_status = 'Unpaid' THEN 1 END) as unpaid_count
      FROM fines
    `).get() as any;

    // 3. User activity ranking (most active borrowers)
    const topBorrowers = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.status,
             COUNT(t.id) as total_borrowed,
             SUM(CASE WHEN t.status IN ('Issued', 'Return Requested', 'Overdue') THEN 1 ELSE 0 END) as active_loans,
             SUM(CASE WHEN t.status = 'Returned' THEN 1 ELSE 0 END) as returned_count,
             COALESCE(SUM(f.amount), 0) as total_fines_incurred
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      LEFT JOIN fines f ON f.transaction_id = t.id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY total_borrowed DESC
      LIMIT 10
    `).all();

    // 4. Overdue aging breakdown
    const overdueAging = db.prepare(`
      SELECT
        SUM(CASE WHEN live_overdue_days BETWEEN 1 AND 7 THEN 1 ELSE 0 END) as overdue_1_to_7_days,
        SUM(CASE WHEN live_overdue_days BETWEEN 8 AND 14 THEN 1 ELSE 0 END) as overdue_8_to_14_days,
        SUM(CASE WHEN live_overdue_days > 14 THEN 1 ELSE 0 END) as overdue_over_14_days
      FROM (
        SELECT CAST(MAX(0, julianday('now') - julianday(due_date)) AS INTEGER) as live_overdue_days
        FROM transactions
        WHERE status IN ('Issued', 'Return Requested', 'Overdue') AND date(due_date) < date('now')
      )
    `).get();

    // 5. Total counts summary
    const summary = {
      totalBooks: (db.prepare('SELECT SUM(total_copies) as c FROM books').get() as any).c || 0,
      availableBooks: (db.prepare('SELECT SUM(available_copies) as c FROM books').get() as any).c || 0,
      issuedBooks: (db.prepare("SELECT COUNT(*) as c FROM transactions WHERE status = 'Issued'").get() as any).c || 0,
      returnedBooks: (db.prepare("SELECT COUNT(*) as c FROM transactions WHERE status = 'Returned'").get() as any).c || 0,
      overdueBooks: (db.prepare("SELECT COUNT(*) as c FROM transactions WHERE status = 'Overdue'").get() as any).c || 0,
      totalUsers: (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get() as any).c || 0,
    };

    return res.json({
      summary,
      categoryStats,
      fineStats,
      topBorrowers,
      overdueAging
    });
  } catch (err: any) {
    console.error('getReportsData error:', err);
    return res.status(500).json({ error: 'Failed to retrieve reports data: ' + err.message });
  }
}

export function exportCsvReport(req: AuthenticatedRequest, res: Response) {
  try {
    const { type } = req.params;
    let filename = `library_${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
    let headers: string[] = [];
    let rows: any[] = [];

    if (type === 'books') {
      headers = ['ID', 'Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Year', 'Total Copies', 'Available Copies'];
      const data = db.prepare('SELECT id, title, author, isbn, category, publisher, publication_year, total_copies, available_copies FROM books').all() as any[];
      rows = data.map(d => [d.id, `"${d.title.replace(/"/g, '""')}"`, `"${d.author.replace(/"/g, '""')}"`, d.isbn, d.category, `"${(d.publisher || '').replace(/"/g, '""')}"`, d.publication_year || '', d.total_copies, d.available_copies]);
    } else if (type === 'transactions') {
      headers = ['Transaction ID', 'User Name', 'User Email', 'Book Title', 'ISBN', 'Issue Date', 'Due Date', 'Return Date', 'Status'];
      const data = db.prepare(`
        SELECT t.id, u.name as user_name, u.email as user_email, b.title as book_title, b.isbn, t.issue_date, t.due_date, t.return_date, t.status
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
        ORDER BY t.id DESC
      `).all() as any[];
      rows = data.map(d => [d.id, `"${d.user_name.replace(/"/g, '""')}"`, d.user_email, `"${d.book_title.replace(/"/g, '""')}"`, d.isbn, d.issue_date, d.due_date, d.return_date || 'N/A', d.status]);
    } else if (type === 'fines') {
      headers = ['Fine ID', 'Transaction ID', 'User Name', 'Book Title', 'Due Date', 'Return Date', 'Overdue Days', 'Fine Amount (INR)', 'Payment Status', 'Payment Date'];
      const data = db.prepare(`
        SELECT f.id, f.transaction_id, u.name as user_name, b.title as book_title, t.due_date, t.return_date, f.overdue_days, f.amount, f.payment_status, f.paid_date
        FROM fines f
        JOIN transactions t ON f.transaction_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN books b ON t.book_id = b.id
        ORDER BY f.id DESC
      `).all() as any[];
      rows = data.map(d => [d.id, d.transaction_id, `"${d.user_name.replace(/"/g, '""')}"`, `"${d.book_title.replace(/"/g, '""')}"`, d.due_date, d.return_date || 'N/A', d.overdue_days, d.amount, d.payment_status, d.paid_date || 'N/A']);
    } else if (type === 'users') {
      headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Registered Date'];
      const data = db.prepare('SELECT id, name, email, phone, role, status, created_at FROM users').all() as any[];
      rows = data.map(d => [d.id, `"${d.name.replace(/"/g, '""')}"`, d.email, d.phone || '', d.role, d.status, d.created_at]);
    } else {
      return res.status(400).json({ error: 'Invalid report type.' });
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (err: any) {
    console.error('exportCsvReport error:', err);
    return res.status(500).json({ error: 'Failed to export report: ' + err.message });
  }
}
