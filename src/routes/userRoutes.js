import express from 'express';
import UserController from '../controllers/userController';
import authenticateAccessToken from '../middlewares/authMiddleware';

const router = express.Router();

// Route: Create an account without authentication
router.post('/register', UserController.register);

// Route: Create another Trainer
router.post('/users', authenticateAccessToken(['users:create']), UserController.createUser);

// Route: Get the list of Trainers (and their information)
router.get('/users', authenticateAccessToken(['users:read']), UserController.getUsers);

// Route: Get information of a specific Trainer
router.get('/users/:userId', authenticateAccessToken(['users:read']), UserController.getUser);

// Route: Update information of the authenticated Trainer
router.put('/users/self', authenticateAccessToken(['users:update:self']), UserController.updateUserSelf);

// Route: Update information of any Trainer
router.put('/users/:userId', authenticateAccessToken(['users:update:all']), UserController.updateUserAll);

// Route: Partially update information of any Trainer
router.patch('/users/:userId', authenticateAccessToken(['users:update:all']), UserController.updateUserAll);

// Route: Delete the authenticated Trainer
router.delete('/users/self', authenticateAccessToken(['users:delete:self']), UserController.deleteUserSelf);

// Route: Delete any Trainer
router.delete('/users/:userId', authenticateAccessToken(['users:delete:all']), UserController.deleteUserAll);

export default router;
