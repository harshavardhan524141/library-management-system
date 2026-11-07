import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { getLibrarySettings } from '../services/fineService.ts';

export function getSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const settings = getLibrarySettings();
    return res.json({ settings });
  } catch (err: any) {
    console.error('getSettings error:', err);
    return res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
}

export function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const { borrowing_duration_days, max_active_books, fine_per_day } = req.body;

    const upsert = db.prepare(`
      INSERT INTO settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = excluded.updated_at
    `);

    const updateTx = db.transaction(() => {
      if (borrowing_duration_days !== undefined) {
        const val = Math.max(1, parseInt(borrowing_duration_days, 10));
        upsert.run('borrowing_duration_days', val.toString());
      }
      if (max_active_books !== undefined) {
        const val = Math.max(1, parseInt(max_active_books, 10));
        upsert.run('max_active_books', val.toString());
      }
      if (fine_per_day !== undefined) {
        const val = Math.max(0, parseFloat(fine_per_day));
        upsert.run('fine_per_day', val.toString());
      }
    });

    updateTx();

    const updated = getLibrarySettings();
    return res.json({ message: 'Library settings saved successfully!', settings: updated });
  } catch (err: any) {
    console.error('updateSettings error:', err);
    return res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
}
