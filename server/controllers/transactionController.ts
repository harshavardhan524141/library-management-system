import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { syncOverdueTransactionsAndFines } from '../services/fineService.ts';

export function getTransactions(req: AuthenticatedRequest, res: Response) {
  try {
    syncOverdueTransactionsAndFines();

    const { status, search, from, to, page = '1', limit = '50', userId, bookId } = req.query;

    let baseSql = `
      SELECT t.id, t.user_id, t.book_id, t.issue_date, t.due_date, t.return_date, t.status, t.created_at,
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             b.title as book_title, b.author as book_author, b.isbn as book_isbn, b.cover_image as book_cover, b.category as book_category,
             f.id as fine_id, f.overdue_days, f.amount as fine_amount, f.payment_status as fine_status, f.paid_date as fine_paid_date,
             CAST(MAX(0, julianday('now') - julianday(t.due_date)) AS INTEGER) as live_overdue_days
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      LEFT JOIN fines f ON f.transaction_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Role check: non-admin can only see their own transactions
    if (req.user?.role !== 'admin') {
      baseSql += ` AND t.user_id = ?`;
      params.push(req.user?.id);
    } else if (userId && typeof userId === 'string' && userId !== 'All') {
      baseSql += ` AND t.user_id = ?`;
      params.push(parseInt(userId, 10));
    }

    if (bookId && typeof bookId === 'string' && bookId !== 'All') {
      baseSql += ` AND t.book_id = ?`;
      params.push(parseInt(bookId, 10));
    }

    if (status && typeof status === 'string' && status !== 'All') {
      baseSql += ` AND t.status = ?`;
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      baseSql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR u.name LIKE ? OR u.email LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (from && typeof from === 'string') {
      baseSql += ` AND date(t.issue_date) >= date(?)`;
      params.push(from);
    }

    if (to && typeof to === 'string') {
      baseSql += ` AND date(t.issue_date) <= date(?)`;
      params.push(to);
    }

    const countSql = `SELECT COUNT(*) as total FROM (${baseSql})`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const total = countResult ? countResult.total : 0;

    baseSql += ` ORDER BY t.id DESC`;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    baseSql += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const transactions = db.prepare(baseSql).all(...params);

    return res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ error: 'Failed to retrieve transactions: ' + err.message });
  }
}

export function getTransactionById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID.' });
    }

    const tx = db.prepare(`
      SELECT t.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             b.title as book_title, b.author as book_author, b.isbn as book_isbn, b.cover_image as book_cover,
             f.id as fine_id, f.overdue_days, f.amount as fine_amount, f.payment_status as fine_status, f.paid_date as fine_paid_date
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      LEFT JOIN fines f ON f.transaction_id = t.id
      WHERE t.id = ?
    `).get(id) as any;

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (req.user?.role !== 'admin' && tx.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json({ transaction: tx });
  } catch (err: any) {
    console.error('getTransactionById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve transaction.' });
  }
}
