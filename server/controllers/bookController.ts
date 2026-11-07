import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export function getBooks(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, category, availability, sort, page = '1', limit = '50' } = req.query;

    let baseQuery = `
      SELECT b.*,
        (b.total_copies - b.available_copies) AS issued_copies,
        CASE
          WHEN b.available_copies = 0 THEN 'Currently Unavailable'
          WHEN b.available_copies <= 2 THEN 'Limited Availability'
          ELSE 'Available'
        END AS availability_status
      FROM books b
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      baseQuery += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR b.publisher LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (category && typeof category === 'string' && category !== 'All' && category.trim() !== '') {
      baseQuery += ` AND b.category = ?`;
      params.push(category.trim());
    }

    if (availability && typeof availability === 'string') {
      if (availability === 'available') {
        baseQuery += ` AND b.available_copies > 0`;
      } else if (availability === 'limited') {
        baseQuery += ` AND b.available_copies > 0 AND b.available_copies <= 2`;
      } else if (availability === 'unavailable') {
        baseQuery += ` AND b.available_copies = 0`;
      }
    }

    // Sorting
    switch (sort) {
      case 'title_asc':
        baseQuery += ` ORDER BY b.title ASC`;
        break;
      case 'title_desc':
        baseQuery += ` ORDER BY b.title DESC`;
        break;
      case 'available_desc':
        baseQuery += ` ORDER BY b.available_copies DESC`;
        break;
      case 'year_desc':
        baseQuery += ` ORDER BY b.publication_year DESC`;
        break;
      case 'newest':
      default:
        baseQuery += ` ORDER BY b.id DESC`;
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM (${baseQuery})`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const total = countResult ? countResult.total : 0;

    baseQuery += ` LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const books = db.prepare(baseQuery).all(...params);

    // Get categories list
    const categories = (db.prepare('SELECT DISTINCT category FROM books ORDER BY category ASC').all() as { category: string }[])
      .map(r => r.category);

    return res.json({
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      categories
    });
  } catch (err: any) {
    console.error('getBooks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve books: ' + err.message });
  }
}

export function getBookById(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    const book = db.prepare(`
      SELECT b.*,
        (b.total_copies - b.available_copies) AS issued_copies,
        CASE
          WHEN b.available_copies = 0 THEN 'Currently Unavailable'
          WHEN b.available_copies <= 2 THEN 'Limited Availability'
          ELSE 'Available'
        END AS availability_status
      FROM books b
      WHERE b.id = ?
    `).get(id) as any;

    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    // If user is logged in, check if they currently have an active issue or pending request for this book
    let userActiveIssue = null;
    let userPendingRequest = null;
    if (req.user) {
      userActiveIssue = db.prepare(`
        SELECT id, issue_date, due_date, status
        FROM transactions
        WHERE user_id = ? AND book_id = ? AND status IN ('Issued', 'Return Requested', 'Overdue')
      `).get(req.user.id, id);

      userPendingRequest = db.prepare(`
        SELECT id, request_date, status
        FROM issue_requests
        WHERE user_id = ? AND book_id = ? AND status = 'Pending'
      `).get(req.user.id, id);
    }

    return res.json({
      book,
      userStatus: {
        activeIssue: userActiveIssue || null,
        pendingRequest: userPendingRequest || null,
      }
    });
  } catch (err: any) {
    console.error('getBookById error:', err);
    return res.status(500).json({ error: 'Failed to retrieve book.' });
  }
}

export function createBook(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title, author, isbn, category, publisher, publication_year,
      description, total_copies, cover_image
    } = req.body;

    if (!title || !author || !isbn || !category) {
      return res.status(400).json({ error: 'Title, Author, ISBN, and Category are required.' });
    }

    // Check duplicate ISBN
    const existing = db.prepare('SELECT id FROM books WHERE isbn = ?').get(isbn.trim());
    if (existing) {
      return res.status(400).json({ error: 'A book with this ISBN already exists in the catalog.' });
    }

    const totalCopiesNum = Math.max(1, parseInt(total_copies, 10) || 1);
    const yearNum = publication_year ? parseInt(publication_year, 10) : null;
    const coverUrl = cover_image?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

    const result = db.prepare(`
      INSERT INTO books (title, author, isbn, category, publisher, publication_year, description, total_copies, available_copies, cover_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(),
      author.trim(),
      isbn.trim(),
      category.trim(),
      publisher?.trim() || null,
      yearNum,
      description?.trim() || null,
      totalCopiesNum,
      totalCopiesNum,
      coverUrl
    );

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ message: 'Book added successfully!', book: newBook });
  } catch (err: any) {
    console.error('createBook error:', err);
    return res.status(500).json({ error: 'Failed to add book: ' + err.message });
  }
}

export function updateBook(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id) as any;
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    const {
      title, author, isbn, category, publisher, publication_year,
      description, total_copies, cover_image
    } = req.body;

    // Check ISBN uniqueness if changed
    if (isbn && isbn.trim() !== book.isbn) {
      const existing = db.prepare('SELECT id FROM books WHERE isbn = ? AND id != ?').get(isbn.trim(), id);
      if (existing) {
        return res.status(400).json({ error: 'Another book with this ISBN already exists.' });
      }
    }

    const issuedCopies = book.total_copies - book.available_copies;
    const newTotalCopies = total_copies !== undefined ? Math.max(1, parseInt(total_copies, 10)) : book.total_copies;

    if (newTotalCopies < issuedCopies) {
      return res.status(400).json({
        error: `Cannot reduce total copies below currently issued copies (${issuedCopies}).`
      });
    }

    // Available copies adjust by difference in total copies
    const copiesDifference = newTotalCopies - book.total_copies;
    const newAvailableCopies = Math.max(0, book.available_copies + copiesDifference);

    db.prepare(`
      UPDATE books
      SET title = ?, author = ?, isbn = ?, category = ?, publisher = ?,
          publication_year = ?, description = ?, total_copies = ?, available_copies = ?,
          cover_image = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title ? title.trim() : book.title,
      author ? author.trim() : book.author,
      isbn ? isbn.trim() : book.isbn,
      category ? category.trim() : book.category,
      publisher !== undefined ? publisher?.trim() : book.publisher,
      publication_year !== undefined ? parseInt(publication_year, 10) : book.publication_year,
      description !== undefined ? description?.trim() : book.description,
      newTotalCopies,
      newAvailableCopies,
      cover_image !== undefined ? cover_image?.trim() : book.cover_image,
      id
    );

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    return res.json({ message: 'Book updated successfully!', book: updatedBook });
  } catch (err: any) {
    console.error('updateBook error:', err);
    return res.status(500).json({ error: 'Failed to update book: ' + err.message });
  }
}

export function deleteBook(req: AuthenticatedRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    // Check if there are active transactions (Issued, Return Requested, Overdue)
    const activeTransactions = db.prepare(`
      SELECT COUNT(*) as count FROM transactions
      WHERE book_id = ? AND status IN ('Issued', 'Return Requested', 'Overdue')
    `).get(id) as { count: number };

    if (activeTransactions.count > 0) {
      return res.status(400).json({
        error: `Cannot delete book. There are ${activeTransactions.count} active issued transaction(s) for this book. Ensure all copies are returned first.`
      });
    }

    // Check if there are pending issue requests
    const pendingRequests = db.prepare(`
      SELECT COUNT(*) as count FROM issue_requests
      WHERE book_id = ? AND status = 'Pending'
    `).get(id) as { count: number };

    if (pendingRequests.count > 0) {
      return res.status(400).json({
        error: `Cannot delete book. There are ${pendingRequests.count} pending issue request(s) for this book.`
      });
    }

    // Delete related historical records or safely delete book
    const deleteTx = db.transaction(() => {
      // Remove any historical returned transactions fines/records or set null
      // Let's check historical transactions
      const txRows = db.prepare('SELECT id FROM transactions WHERE book_id = ?').all(id) as { id: number }[];
      for (const t of txRows) {
        db.prepare('DELETE FROM fines WHERE transaction_id = ?').run(t.id);
        db.prepare('DELETE FROM return_requests WHERE transaction_id = ?').run(t.id);
      }
      db.prepare('DELETE FROM transactions WHERE book_id = ?').run(id);
      db.prepare('DELETE FROM issue_requests WHERE book_id = ?').run(id);
      db.prepare('DELETE FROM books WHERE id = ?').run(id);
    });

    deleteTx();
    return res.json({ message: 'Book deleted successfully!' });
  } catch (err: any) {
    console.error('deleteBook error:', err);
    return res.status(500).json({ error: 'Failed to delete book: ' + err.message });
  }
}
