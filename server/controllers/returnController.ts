import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getLibrarySettings, syncOverdueTransactionsAndFines } from '../services/fineService.ts';

export function getReturnRequests(req: AuthenticatedRequest, res: Response) {
  try {
    syncOverdueTransactionsAndFines();

    const { status } = req.query;
    let sql = `
      SELECT rr.*, t.user_id, t.book_id, t.issue_date, t.due_date, t.status as transaction_status,
             u.name as user_name, u.email as user_email,
             b.title as book_title, b.author as book_author, b.cover_image as book_cover,
             admin.name as processed_by_name,
             CAST(MAX(0, julianday('now') - julianday(t.due_date)) AS INTEGER) as calculated_overdue_days
      FROM return_requests rr
      JOIN transactions t ON rr.transaction_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      LEFT JOIN users admin ON rr.processed_by = admin.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role !== 'admin') {
      sql += ` AND t.user_id = ?`;
      params.push(req.user?.id);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      sql += ` AND rr.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY rr.id DESC`;

    const requests = db.prepare(sql).all(...params);
    return res.json({ requests });
  } catch (err: any) {
    console.error('getReturnRequests error:', err);
    return res.status(500).json({ error: 'Failed to retrieve return requests.' });
  }
}

export function requestReturn(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const { transactionId } = req.body;
    const txId = parseInt(transactionId, 10);
    if (isNaN(txId)) {
      return res.status(400).json({ error: 'Valid Transaction ID is required.' });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId) as any;
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction record not found.' });
    }

    // Security check: verify this transaction belongs to logged in user (unless admin)
    if (req.user.role !== 'admin' && transaction.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to return this transaction.' });
    }

    if (transaction.status === 'Returned') {
      return res.status(400).json({ error: 'This book has already been marked as returned.' });
    }

    if (transaction.status === 'Return Requested') {
      return res.status(400).json({ error: 'A return request is already pending review for this book.' });
    }

    // Check if there is an active pending return request
    const existingPending = db.prepare(`
      SELECT id FROM return_requests WHERE transaction_id = ? AND status = 'Pending'
    `).get(txId);

    if (existingPending) {
      return res.status(400).json({ error: 'A return request is already pending approval.' });
    }

    const returnTx = db.transaction(() => {
      // Mark transaction status
      db.prepare(`
        UPDATE transactions
        SET status = 'Return Requested', updated_at = datetime('now')
        WHERE id = ?
      `).run(txId);

      // Create return request record
      db.prepare(`
        INSERT INTO return_requests (transaction_id, status)
        VALUES (?, 'Pending')
      `).run(txId);
    });

    returnTx();

    return res.json({ message: 'Book return request submitted! The librarian will verify the physical copy and complete the return.' });
  } catch (err: any) {
    console.error('requestReturn error:', err);
    return res.status(500).json({ error: 'Failed to submit return request: ' + err.message });
  }
}

export function approveReturnRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid return request ID.' });
    }

    const request = db.prepare('SELECT * FROM return_requests WHERE id = ?').get(id) as any;
    if (!request) {
      return res.status(404).json({ error: 'Return request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: `Return request already ${request.status.toLowerCase()}.` });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(request.transaction_id) as any;
    if (!transaction) {
      return res.status(404).json({ error: 'Associated transaction record not found.' });
    }

    const settings = getLibrarySettings();
    const today = new Date().toISOString().split('T')[0];

    // Check overdue
    const dueDate = new Date(transaction.due_date);
    const returnDate = new Date(today);
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const fineAmount = overdueDays > 0 ? overdueDays * settings.fine_per_day : 0;

    const processTx = db.transaction(() => {
      // 1. Update return request
      db.prepare(`
        UPDATE return_requests
        SET status = 'Approved', processed_by = ?, processed_at = datetime('now')
        WHERE id = ?
      `).run(req.user?.id || 1, id);

      // 2. Update transaction
      db.prepare(`
        UPDATE transactions
        SET status = 'Returned', return_date = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(today, transaction.id);

      // 3. Increase available copies
      db.prepare(`
        UPDATE books
        SET available_copies = available_copies + 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(transaction.book_id);

      // 4. Handle fine if overdue
      if (overdueDays > 0) {
        db.prepare(`
          INSERT INTO fines (transaction_id, overdue_days, amount, payment_status, created_at)
          VALUES (?, ?, ?, 'Unpaid', datetime('now'))
          ON CONFLICT(transaction_id) DO UPDATE SET
            overdue_days = excluded.overdue_days,
            amount = excluded.amount
        `).run(transaction.id, overdueDays, fineAmount);
      }
    });

    processTx();

    const msg = overdueDays > 0
      ? `Return approved! Book was ${overdueDays} day(s) overdue. Fine of ₹${fineAmount} recorded.`
      : 'Book return confirmed successfully! Inventory updated.';

    return res.json({ message: msg, fineAmount, overdueDays });
  } catch (err: any) {
    console.error('approveReturnRequest error:', err);
    return res.status(500).json({ error: 'Failed to process return: ' + err.message });
  }
}

/**
 * Direct return confirmation by Admin
 */
export function directReturn(req: AuthenticatedRequest, res: Response) {
  try {
    const { transactionId } = req.body;
    const txId = parseInt(transactionId, 10);
    if (isNaN(txId)) {
      return res.status(400).json({ error: 'Valid Transaction ID is required.' });
    }

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId) as any;
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (transaction.status === 'Returned') {
      return res.status(400).json({ error: 'This transaction is already completed and returned.' });
    }

    const settings = getLibrarySettings();
    const today = new Date().toISOString().split('T')[0];

    const dueDate = new Date(transaction.due_date);
    const returnDate = new Date(today);
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const fineAmount = overdueDays > 0 ? overdueDays * settings.fine_per_day : 0;

    const returnTx = db.transaction(() => {
      // 1. Mark transaction returned
      db.prepare(`
        UPDATE transactions
        SET status = 'Returned', return_date = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(today, txId);

      // 2. Increase book stock
      db.prepare(`
        UPDATE books
        SET available_copies = available_copies + 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(transaction.book_id);

      // 3. Mark any pending return requests as Approved
      db.prepare(`
        UPDATE return_requests
        SET status = 'Approved', processed_by = ?, processed_at = datetime('now')
        WHERE transaction_id = ? AND status = 'Pending'
      `).run(req.user?.id || 1, txId);

      // 4. Record fine if overdue
      if (overdueDays > 0) {
        db.prepare(`
          INSERT INTO fines (transaction_id, overdue_days, amount, payment_status, created_at)
          VALUES (?, ?, ?, 'Unpaid', datetime('now'))
          ON CONFLICT(transaction_id) DO UPDATE SET
            overdue_days = excluded.overdue_days,
            amount = excluded.amount
        `).run(txId, overdueDays, fineAmount);
      }
    });

    returnTx();

    const msg = overdueDays > 0
      ? `Book returned! Returned ${overdueDays} day(s) overdue. Fine of ₹${fineAmount} recorded.`
      : 'Book returned successfully! Available copies updated.';

    return res.json({ message: msg, fineAmount, overdueDays });
  } catch (err: any) {
    console.error('directReturn error:', err);
    return res.status(500).json({ error: 'Failed to process return: ' + err.message });
  }
}
