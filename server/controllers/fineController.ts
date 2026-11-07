import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { syncOverdueTransactionsAndFines } from '../services/fineService.ts';

export function getFines(req: AuthenticatedRequest, res: Response) {
  try {
    syncOverdueTransactionsAndFines();

    const { status, search } = req.query;

    let sql = `
      SELECT f.id, f.transaction_id, f.overdue_days, f.amount, f.payment_status, f.paid_date, f.created_at,
             t.issue_date, t.due_date, t.return_date, t.status as transaction_status,
             u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone,
             b.id as book_id, b.title as book_title, b.author as book_author, b.cover_image as book_cover
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user?.role !== 'admin') {
      sql += ` AND t.user_id = ?`;
      params.push(req.user?.id);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      sql += ` AND f.payment_status = ?`;
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR b.title LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY f.payment_status ASC, f.id DESC`;

    const fines = db.prepare(sql).all(...params);

    // Summary calculation
    let totalUnpaid = 0;
    let totalPaid = 0;
    for (const f of fines as any[]) {
      if (f.payment_status === 'Paid') {
        totalPaid += f.amount;
      } else {
        totalUnpaid += f.amount;
      }
    }

    return res.json({
      fines,
      summary: {
        totalUnpaid,
        totalPaid,
        totalFines: totalUnpaid + totalPaid,
        count: fines.length
      }
    });
  } catch (err: any) {
    console.error('getFines error:', err);
    return res.status(500).json({ error: 'Failed to retrieve fines: ' + err.message });
  }
}

export function getFineById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fine ID.' });
    }

    const fine = db.prepare(`
      SELECT f.*,
             t.issue_date, t.due_date, t.return_date,
             u.id as user_id, u.name as user_name, u.email as user_email,
             b.title as book_title, b.author as book_author
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN books b ON t.book_id = b.id
      WHERE f.id = ?
    `).get(id) as any;

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found.' });
    }

    if (req.user?.role !== 'admin' && fine.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json({ fine });
  } catch (err: any) {
    console.error('getFineById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve fine.' });
  }
}

export function markFinePaid(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid fine ID.' });
    }

    const fine = db.prepare('SELECT * FROM fines WHERE id = ?').get(id) as any;
    if (!fine) {
      return res.status(404).json({ error: 'Fine record not found.' });
    }

    if (fine.payment_status === 'Paid') {
      return res.status(400).json({ error: 'This fine has already been marked as Paid.' });
    }

    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE fines
      SET payment_status = 'Paid', paid_date = ?
      WHERE id = ?
    `).run(today, id);

    return res.json({ message: `Fine of ₹${fine.amount} has been marked as Paid!` });
  } catch (err: any) {
    console.error('markFinePaid error:', err);
    return res.status(500).json({ error: 'Failed to update fine payment: ' + err.message });
  }
}
