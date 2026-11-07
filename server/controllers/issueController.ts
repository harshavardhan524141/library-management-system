import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getLibrarySettings, syncOverdueTransactionsAndFines } from '../services/fineService.ts';

export function getIssueRequests(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    let sql = `
      SELECT ir.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             b.title as book_title, b.author as book_author, b.isbn as book_isbn, b.cover_image as book_cover,
             b.available_copies, b.total_copies,
             admin.name as approved_by_name
      FROM issue_requests ir
      JOIN users u ON ir.user_id = u.id
      JOIN books b ON ir.book_id = b.id
      LEFT JOIN users admin ON ir.approved_by = admin.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // If not admin, restrict to logged-in user
    if (req.user?.role !== 'admin') {
      sql += ` AND ir.user_id = ?`;
      params.push(req.user?.id);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      sql += ` AND ir.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY ir.id DESC`;

    const requests = db.prepare(sql).all(...params);
    return res.json({ requests });
  } catch (err: any) {
    console.error('getIssueRequests error:', err);
    return res.status(500).json({ error: 'Failed to retrieve issue requests.' });
  }
}

export function requestIssue(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (req.user.status === 'deactivated') {
      return res.status(403).json({ error: 'Your account is deactivated. You cannot request books.' });
    }

    const { bookId } = req.body;
    const book_id = parseInt(bookId, 10);
    if (isNaN(book_id)) {
      return res.status(400).json({ error: 'Valid Book ID is required.' });
    }

    const book = db.prepare('SELECT id, title, available_copies, total_copies FROM books WHERE id = ?').get(book_id) as any;
    if (!book) {
      return res.status(404).json({ error: 'Book not found in library catalog.' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'This book currently has 0 available copies in stock.' });
    }

    // Check duplicate active issue
    const existingActiveIssue = db.prepare(`
      SELECT id FROM transactions
      WHERE user_id = ? AND book_id = ? AND status IN ('Issued', 'Return Requested', 'Overdue')
    `).get(req.user.id, book_id);

    if (existingActiveIssue) {
      return res.status(400).json({ error: 'You already have an active borrowed copy of this book.' });
    }

    // Check duplicate pending request
    const existingPending = db.prepare(`
      SELECT id FROM issue_requests
      WHERE user_id = ? AND book_id = ? AND status = 'Pending'
    `).get(req.user.id, book_id);

    if (existingPending) {
      return res.status(400).json({ error: 'You already have a pending request for this book awaiting approval.' });
    }

    // Check max borrowing limit
    const settings = getLibrarySettings();
    const activeBorrowCount = (db.prepare(`
      SELECT COUNT(*) as count FROM transactions
      WHERE user_id = ? AND status IN ('Issued', 'Return Requested', 'Overdue')
    `).get(req.user.id) as { count: number }).count;

    if (activeBorrowCount >= settings.max_active_books) {
      return res.status(400).json({
        error: `Borrowing limit reached. You can borrow a maximum of ${settings.max_active_books} books at a time. Please return an existing book before requesting a new one.`
      });
    }

    // Check unpaid fines: if user has unpaid fines > 100, suggest payment
    const unpaidFine = (db.prepare(`
      SELECT COALESCE(SUM(f.amount), 0) as total
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.id
      WHERE t.user_id = ? AND f.payment_status = 'Unpaid'
    `).get(req.user.id) as { total: number }).total;

    if (unpaidFine > 200) {
      return res.status(400).json({
        error: `You have overdue unpaid fines totaling ₹${unpaidFine}. Please clear outstanding fines before borrowing more books.`
      });
    }

    // Insert issue request with status Pending
    const result = db.prepare(`
      INSERT INTO issue_requests (user_id, book_id, status)
      VALUES (?, ?, 'Pending')
    `).run(req.user.id, book_id);

    return res.status(201).json({
      message: `Issue request submitted successfully for "${book.title}". The librarian will review and approve your request shortly.`,
      requestId: result.lastInsertRowid
    });
  } catch (err: any) {
    console.error('requestIssue error:', err);
    return res.status(500).json({ error: 'Failed to submit issue request: ' + err.message });
  }
}

export function approveIssueRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const request = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(id) as any;
    if (!request) {
      return res.status(404).json({ error: 'Issue request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}.` });
    }

    const book = db.prepare('SELECT id, title, available_copies FROM books WHERE id = ?').get(request.book_id) as any;
    if (!book) {
      return res.status(404).json({ error: 'Associated book not found.' });
    }

    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'Cannot approve request: Book has 0 available copies.' });
    }

    const settings = getLibrarySettings();
    const durationDays = settings.borrowing_duration_days || 14;

    // Database transaction to update book copies, request status, and create transaction
    const approveTx = db.transaction(() => {
      // 1. Decrease book available copies
      db.prepare(`
        UPDATE books
        SET available_copies = available_copies - 1, updated_at = datetime('now')
        WHERE id = ? AND available_copies > 0
      `).run(request.book_id);

      // 2. Mark request approved
      db.prepare(`
        UPDATE issue_requests
        SET status = 'Approved', approved_by = ?, approved_at = datetime('now')
        WHERE id = ?
      `).run(req.user?.id || 1, id);

      // 3. Create active transaction
      // Issue date = today (YYYY-MM-DD), due date = today + durationDays
      const today = new Date().toISOString().split('T')[0];
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + durationDays);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO transactions (user_id, book_id, issue_date, due_date, status)
        VALUES (?, ?, ?, ?, 'Issued')
      `).run(request.user_id, request.book_id, today, dueDate);
    });

    approveTx();

    return res.json({ message: `Issue request approved! Book has been issued for ${durationDays} days.` });
  } catch (err: any) {
    console.error('approveIssueRequest error:', err);
    return res.status(500).json({ error: 'Failed to approve request: ' + err.message });
  }
}

export function rejectIssueRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID.' });
    }

    const { rejectionReason } = req.body;

    const request = db.prepare('SELECT * FROM issue_requests WHERE id = ?').get(id) as any;
    if (!request) {
      return res.status(404).json({ error: 'Issue request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: `Request has already been ${request.status.toLowerCase()}.` });
    }

    db.prepare(`
      UPDATE issue_requests
      SET status = 'Rejected', rejection_reason = ?, approved_by = ?, approved_at = datetime('now')
      WHERE id = ?
    `).run(rejectionReason?.trim() || 'Request declined by library administrator', req.user?.id || 1, id);

    return res.json({ message: 'Issue request rejected.' });
  } catch (err: any) {
    console.error('rejectIssueRequest error:', err);
    return res.status(500).json({ error: 'Failed to reject request: ' + err.message });
  }
}

/**
 * Direct issue by Admin counter
 */
export function directIssueBook(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, bookId, durationDays } = req.body;
    const uId = parseInt(userId, 10);
    const bId = parseInt(bookId, 10);

    if (isNaN(uId) || isNaN(bId)) {
      return res.status(400).json({ error: 'Valid User ID and Book ID are required.' });
    }

    const user = db.prepare('SELECT id, name, status FROM users WHERE id = ?').get(uId) as any;
    if (!user) {
      return res.status(404).json({ error: 'Member not found.' });
    }
    if (user.status === 'deactivated') {
      return res.status(400).json({ error: 'Cannot issue book to a deactivated user account.' });
    }

    const book = db.prepare('SELECT id, title, available_copies FROM books WHERE id = ?').get(bId) as any;
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'No copies available for this book.' });
    }

    // Check duplicate active issue
    const existingActive = db.prepare(`
      SELECT id FROM transactions
      WHERE user_id = ? AND book_id = ? AND status IN ('Issued', 'Return Requested', 'Overdue')
    `).get(uId, bId);

    if (existingActive) {
      return res.status(400).json({ error: 'User already has an active issue of this book.' });
    }

    const settings = getLibrarySettings();
    const days = parseInt(durationDays, 10) || settings.borrowing_duration_days || 14;

    const issueTx = db.transaction(() => {
      db.prepare(`
        UPDATE books
        SET available_copies = available_copies - 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(bId);

      const today = new Date().toISOString().split('T')[0];
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + days);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      db.prepare(`
        INSERT INTO transactions (user_id, book_id, issue_date, due_date, status)
        VALUES (?, ?, ?, ?, 'Issued')
      `).run(uId, bId, today, dueDate);
    });

    issueTx();
    return res.status(201).json({ message: `Book "${book.title}" successfully issued to ${user.name} for ${days} days!` });
  } catch (err: any) {
    console.error('directIssueBook error:', err);
    return res.status(500).json({ error: 'Failed to issue book: ' + err.message });
  }
}
