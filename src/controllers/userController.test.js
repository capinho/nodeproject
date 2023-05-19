import User from '../models/user';
import Right from '../models/right';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../helpers/oauth2Helpers';
import UserController from './userController';

jest.mock('../models/user');
jest.mock('../models/right');
jest.mock('bcrypt');
jest.mock('../helpers/oauth2Helpers');

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          login: 'johndoe',
          password: 'password',
          birthDate: '1990-01-01',
          rights: ['read', 'write'],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ id: 1 });
      Right.findAll.mockResolvedValue([{ name: 'read' }, { name: 'write' }]);
      User.prototype.addRights.mockResolvedValue();

      await UserController.createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'hashedPassword',
        birthDate: '1990-01-01',
      });
      expect(Right.findAll).toHaveBeenCalledWith({ where: { name: ['read', 'write'] } });
      expect(User.prototype.addRights).toHaveBeenCalledWith([{ name: 'read' }, { name: 'write' }]);
      expect(generateAccessToken).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1 },
        access_token: 'generatedAccessToken',
      });
    });

    it('should return an error if user with same login already exists', async () => {
      const req = {
        body: {
          login: 'johndoe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue({ login: 'johndoe' });

      await UserController.createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this login already exists' });
    });

    it('should return an error if an error occurs during user creation', async () => {
      const req = {
        body: {
          login: 'johndoe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

      await UserController.createUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
    });
  });

  describe('register', () => {
    it('should create a new user and associate necessary rights', async () => {
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          login: 'johndoe',
          password: 'password',
          birthDate: '1990-01-01',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ id: 1 });
      Right.findAll
        .mockResolvedValueOnce([{ name: 'read' }, { name: 'write' }])
        .mockResolvedValueOnce([{ name: 'update' }, { name: 'delete' }]);
      User.prototype.addRights.mockResolvedValue();

      await UserController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        login: 'johndoe',
        password: 'hashedPassword',
        birthDate: '1990-01-01',
      });
      expect(Right.findAll).toHaveBeenCalledTimes(2);
      expect(User.prototype.addRights).toHaveBeenCalledWith([{ name: 'read' }, { name: 'write' }]);
      expect(User.prototype.addRights).toHaveBeenCalledWith([{ name: 'update' }, { name: 'delete' }]);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: 1 },
      });
    });

    it('should return an error if user with same login already exists', async () => {
      const req = {
        body: {
          login: 'johndoe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue({ login: 'johndoe' });

      await UserController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'A user with this username already exists' });
    });

    it('should return an error if an error occurs during user creation', async () => {
      const req = {
        body: {
          login: 'johndoe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

      await UserController.register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { login: 'johndoe' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
    });
  });

  describe('getUsers', () => {
    it('should get the list of users with pagination', async () => {
      const req = {
        query: {
          page: 2,
          pageSize: 10,
        },
      };
      const res = {
        json: jest.fn(),
      };

      User.findAndCountAll.mockResolvedValue({
        count: 30,
        rows: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      });

      await UserController.getUsers(req, res);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        offset: 10,
        limit: 10,
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      expect(res.json).toHaveBeenCalledWith({
        total: 30,
        page: 2,
        pageSize: 10,
        users: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      });
    });

    it('should get the list of users with default pagination values', async () => {
      const req = {
        query: {},
      };
      const res = {
        json: jest.fn(),
      };

      User.findAndCountAll.mockResolvedValue({
        count: 30,
        rows: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      });

      await UserController.getUsers(req, res);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        offset: 0,
        limit: 20,
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      expect(res.json).toHaveBeenCalledWith({
        total: 30,
        page: 1,
        pageSize: 20,
        users: [
          { id: 1, firstName: 'John', lastName: 'Doe' },
          { id: 2, firstName: 'Jane', lastName: 'Smith' },
        ],
      });
    });

    it('should return an error if an error occurs during user retrieval', async () => {
      const req = {
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await UserController.getUsers(req, res);

      expect(User.findAndCountAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving users' });
    });
  });

  describe('getUser', () => {
    it('should get the user by userId', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });

      await UserController.getUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      expect(res.json).toHaveBeenCalledWith({ id: 1, firstName: 'John', lastName: 'Doe' });
    });

    it('should return an error if user is not found', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue(null);

      await UserController.getUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return an error if an error occurs during user retrieval', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockRejectedValue(new Error('Database error'));

      await UserController.getUser(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving user' });
    });
  });

  describe('updateUser', () => {
    it('should update the user', async () => {
      const req = {
        params: {
          userId: 1,
        },
        body: {
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01',
        },
      };
      const res = {
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Smith' });

      await UserController.updateUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.update).toHaveBeenCalledWith(
        { firstName: 'John', lastName: 'Doe', birthDate: '1990-01-01' },
        { where: { id: 1 } }
      );
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
    });

    it('should return an error if user is not found', async () => {
      const req = {
        params: {
          userId: 1,
        },
        body: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue(null);

      await UserController.updateUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return an error if an error occurs during user update', async () => {
      const req = {
        params: {
          userId: 1,
        },
        body: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Smith' });
      User.update.mockRejectedValue(new Error('Database error'));

      await UserController.updateUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.update).toHaveBeenCalledWith(
        { firstName: 'John', lastName: 'Doe' },
        { where: { id: 1 } }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error updating user' });
    });
  });

  describe('deleteUser', () => {
    it('should delete the user', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });

      await UserController.deleteUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return an error if user is not found', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue(null);

      await UserController.deleteUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return an error if an error occurs during user deletion', async () => {
      const req = {
        params: {
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John', lastName: 'Doe' });
      User.destroy.mockRejectedValue(new Error('Database error'));

      await UserController.deleteUserAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting user' });
    });
  });
});
