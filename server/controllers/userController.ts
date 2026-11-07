import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, role, status } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.profile_image, u.created_at,
        (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id AND t.status IN ('Issued', 'Return Requested', 'Overdue')) AS active_transactions_count,
        (SELECT COUNT(*) FROM issue_requests ir WHERE ir.user_id = u.id AND ir.status = 'Pending') AS pending_requests_count,
        (SELECT COALESCE(SUM(f.amount), 0) FROM fines f JOIN transactions t ON f.transaction_id = t.id WHERE t.user_id = u.id AND f.payment_status = 'Unpaid') AS unpaid_fines_total
      FROM users u
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role && typeof role === 'string' && role !== 'All') {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY u.id DESC`;

    const users = db.prepare(sql).all(...params);
    return res.json({ users });
  } catch (err: any) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Failed to retrieve users: ' + err.message });
  }
}

export function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const user = db.prepare(`
      SELECT id, name, email, phone, role, status, profile_image, created_at
      FROM users WHERE id = ?
    `).get(id) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const transactions = db.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author, b.cover_image as book_cover,
             f.amount as fine_amount, f.payment_status as fine_status
      FROM transactions t
      JOIN books b ON t.book_id = b.id
      LEFT JOIN fines f ON f.transaction_id = t.id
      WHERE t.user_id = ?
      ORDER BY t.id DESC
    `).all(id);

    return res.json({ user, transactions });
  } catch (err: any) {
    console.error('getUserById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user details.' });
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'A member with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role, status, profile_image)
      VALUES (?, ?, ?, ?, ?, 'active', ?)
    `).run(
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      phone?.trim() || null,
      role === 'admin' ? 'admin' : 'user',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    );

    const newUser = db.prepare('SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    return res.status(201).json({ message: 'User created successfully!', user: newUser });
  } catch (err: any) {
    console.error('createUser error:', err);
    return res.status(500).json({ error: 'Failed to create user: ' + err.message });
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, email, phone, role, status, password } = req.body;

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase().trim(), id);
      if (existing) {
        return res.status(400).json({ error: 'Another member with this email address already exists.' });
      }
    }

    let passwordHash = user.password_hash;
    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    db.prepare(`
      UPDATE users
      SET name = ?, email = ?, password_hash = ?, phone = ?, role = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name ? name.trim() : user.name,
      email ? email.toLowerCase().trim() : user.email,
      passwordHash,
      phone !== undefined ? phone?.trim() : user.phone,
      role ? (role === 'admin' ? 'admin' : 'user') : user.role,
      status ? (status === 'deactivated' ? 'deactivated' : 'active') : user.status,
      id
    );

    const updated = db.prepare('SELECT id, name, email, phone, role, status, profile_image, updated_at FROM users WHERE id = ?').get(id);
    return res.json({ message: 'User updated successfully!', user: updated });
  } catch (err: any) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Failed to update user: ' + err.message });
  }
}

export function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    if (req.user && req.user.id === id) {
      return res.status(400).json({ error: 'You cannot deactivate your own administrative account.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newStatus = user.status === 'active' ? 'deactivated' : 'active';
    db.prepare('UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?').run(newStatus, id);

    // If deactivating, invalidate their sessions
    if (newStatus === 'deactivated') {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
    }

    return res.json({
      message: `User account has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      status: newStatus
    });
  } catch (err: any) {
    console.error('toggleUserStatus error:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
}
