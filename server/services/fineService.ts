import { db } from '../db/database.ts';

export function getLibrarySettings(): { borrowing_duration_days: number; max_active_books: number; fine_per_day: number } {
  const rows = db.prepare('SELECT setting_key, setting_value FROM settings').all() as { setting_key: string; setting_value: string }[];
  const map: Record<string, number> = {
    borrowing_duration_days: 14,
    max_active_books: 3,
    fine_per_day: 5
  };

  for (const row of rows) {
    if (row.setting_key in map) {
      map[row.setting_key] = parseFloat(row.setting_value) || map[row.setting_key];
    }
  }

  return {
    borrowing_duration_days: map.borrowing_duration_days,
    max_active_books: map.max_active_books,
    fine_per_day: map.fine_per_day
  };
}

/**
 * Scans active issued transactions, updates status to 'Overdue' if due_date < current date,
 * and creates or updates corresponding fine records.
 */
export function syncOverdueTransactionsAndFines() {
  const settings = getLibrarySettings();
  const finePerDay = settings.fine_per_day;

  // Find all transactions that are Issued or Return Requested but due_date < date('now')
  const overdueTxList = db.prepare(`
    SELECT id, user_id, book_id, issue_date, due_date, status,
      CAST(julianday('now') - julianday(due_date) AS INTEGER) AS calculated_overdue_days
    FROM transactions
    WHERE status IN ('Issued', 'Return Requested', 'Overdue')
      AND date(due_date) < date('now')
  `).all() as { id: number; user_id: number; book_id: number; issue_date: string; due_date: string; status: string; calculated_overdue_days: number }[];

  const updateTxStatus = db.prepare(`
    UPDATE transactions SET status = 'Overdue', updated_at = datetime('now') WHERE id = ?
  `);

  const upsertFine = db.prepare(`
    INSERT INTO fines (transaction_id, overdue_days, amount, payment_status, created_at)
    VALUES (?, ?, ?, 'Unpaid', datetime('now'))
    ON CONFLICT(transaction_id) DO UPDATE SET
      overdue_days = excluded.overdue_days,
      amount = excluded.amount
    WHERE payment_status = 'Unpaid'
  `);

  const tx = db.transaction(() => {
    for (const item of overdueTxList) {
      const overdueDays = Math.max(1, item.calculated_overdue_days);
      const fineAmount = overdueDays * finePerDay;

      // Update tx status if not already Return Requested (we preserve return requested flag visually if pending)
      if (item.status === 'Issued') {
        updateTxStatus.run(item.id);
      }

      // Upsert fine
      upsertFine.run(item.id, overdueDays, fineAmount);
    }
  });

  tx();
}
