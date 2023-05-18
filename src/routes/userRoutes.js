import express from 'express';
import UserController from '../controllers/userController';
import checkAuthorization from '../middlewares/checkAuthorization';


const router = express.Router();


// Route: Create an account without authentication
router.post('/register', UserController.register);

// Route: Create another Trainer
router.post('/users', checkAuthorization(['users:create']), UserController.createUser);

// Route: Get the list of Trainers (and their information)
router.get('/users', checkAuthorization(['users:read']), UserController.getUsers);

// Route: Get information of a specific Trainer
router.get('/users/:userId', checkAuthorization(['users:read']), UserController.getUser);

// Route: Update information of the authenticated Trainer
router.put('/users/self', checkAuthorization(['users:update:self']), UserController.updateUserSelf);

// Route: Update information of any Trainer
router.put('/users/:userId', checkAuthorization(['users:update:all']), UserController.updateUserAll);

// Route: Partially update information of any Trainer
router.patch('/users/:userId', checkAuthorization(['users:update:all']), UserController.updateUserAll);

// Route: Delete the authenticated Trainer
router.delete('/users/self', checkAuthorization(['users:delete:self']), UserController.deleteUserSelf);

// Route: Delete any Trainer
router.delete('/users/:userId', checkAuthorization(['users:delete:all']), UserController.deleteUserAll);

export default router;
