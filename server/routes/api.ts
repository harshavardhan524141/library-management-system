import { Router } from 'express';
import { authMiddleware, requireAuth, requireAdmin } from '../middleware/auth.ts';
import * as authController from '../controllers/authController.ts';
import * as bookController from '../controllers/bookController.ts';
import * as userController from '../controllers/userController.ts';
import * as issueController from '../controllers/issueController.ts';
import * as returnController from '../controllers/returnController.ts';
import * as transactionController from '../controllers/transactionController.ts';
import * as fineController from '../controllers/fineController.ts';
import * as dashboardController from '../controllers/dashboardController.ts';
import * as settingsController from '../controllers/settingsController.ts';
import * as reportsController from '../controllers/reportsController.ts';

const router = Router();

// Apply auth middleware to all api routes
router.use(authMiddleware);

// 1. Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.getMe);
router.post('/auth/change-password', requireAuth, authController.changePassword);
router.put('/auth/profile', requireAuth, authController.updateProfile);

// 2. Books routes
router.get('/books', bookController.getBooks);
router.get('/books/:id', bookController.getBookById);
router.post('/books', requireAdmin, bookController.createBook);
router.put('/books/:id', requireAdmin, bookController.updateBook);
router.delete('/books/:id', requireAdmin, bookController.deleteBook);

// 3. User management routes
router.get('/users', requireAdmin, userController.getUsers);
router.get('/users/:id', requireAdmin, userController.getUserById);
router.post('/users', requireAdmin, userController.createUser);
router.put('/users/:id', requireAdmin, userController.updateUser);
router.patch('/users/:id/status', requireAdmin, userController.toggleUserStatus);

// 4. Issue requests & issues
router.get('/issue-requests', requireAuth, issueController.getIssueRequests);
router.post('/issue-requests', requireAuth, issueController.requestIssue);
router.post('/issue-requests/direct', requireAdmin, issueController.directIssueBook);
router.patch('/issue-requests/:id/approve', requireAdmin, issueController.approveIssueRequest);
router.patch('/issue-requests/:id/reject', requireAdmin, issueController.rejectIssueRequest);

// 5. Return requests & returns
router.get('/return-requests', requireAuth, returnController.getReturnRequests);
router.post('/return-requests', requireAuth, returnController.requestReturn);
router.post('/return-requests/direct', requireAdmin, returnController.directReturn);
router.patch('/return-requests/:id/approve', requireAdmin, returnController.approveReturnRequest);

// 6. Transactions
router.get('/transactions', requireAuth, transactionController.getTransactions);
router.get('/transactions/:id', requireAuth, transactionController.getTransactionById);

// 7. Fines
router.get('/fines', requireAuth, fineController.getFines);
router.get('/fines/:id', requireAuth, fineController.getFineById);
router.patch('/fines/:id/mark-paid', requireAdmin, fineController.markFinePaid);

// 8. Dashboards
router.get('/dashboard/admin', requireAdmin, dashboardController.getAdminDashboard);
router.get('/dashboard/user', requireAuth, dashboardController.getUserDashboard);

// 9. Settings
router.get('/settings', requireAuth, settingsController.getSettings);
router.put('/settings', requireAdmin, settingsController.updateSettings);

// 10. Reports & Export
router.get('/reports/analytics', requireAdmin, reportsController.getReportsData);
router.get('/reports/export/:type', requireAdmin, reportsController.exportCsvReport);

export default router;
