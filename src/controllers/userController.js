import User from '../models/user';
import Right from '../models/right';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../helpers/oauth2Helpers';


async function createUser(req, res) {
  try {
    const { firstName, lastName, login, password, birthDate, rights } = req.body;

    // Vérifier si l'utilisateur avec le même nom d'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this login already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      firstName,
      lastName,
      login,
      password: hashedPassword,
      birthDate,
    });

    // Associer les droits spécifiés à l'utilisateur nouvellement créé
    if (Array.isArray(rights) && rights.length > 0) {
      const createdRights = await Right.findAll({ where: { name: rights } });
      await newUser.addRights(createdRights);
    }

    // Générer le jeton d'accès pour le nouvel utilisateur créé
    const accessToken = generateAccessToken(newUser.id);

    res.json({ user: newUser, access_token: accessToken });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}

export async function register(req, res) {
  try {
    const { firstName, lastName, login, password, birthDate } = req.body;

    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(409).json({ error: "A user with this username already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      firstName,
      lastName,
      login,
      password: hashedPassword,
      birthDate,
    });

    // Fetch the necessary rights
    const readRights = await Right.findAll({
      where: {
        name: {
          [Op.like]: '%:read',
          [Op.notLike]: 'logs:read',
        },
      },
    });

    const manipulateRights = await Right.findAll({
      where: {
        name: {
          [Op.in]: [
            'users:update:self',
            'users:delete:self',
            'pokemons:create:self',
            'pokemons:update:self',
            'pokemons:delete:self',
            'trade:create:self',
            'trade:update:self',
          ],
        },
      },
    });

    // Associate the rights with the new user
    await newUser.addRights(readRights);
    await newUser.addRights(manipulateRights);

    res.json({ user: newUser });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}

async function getUsers(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize, 10);

    const { count, rows: users } = await User.findAndCountAll({
      offset,
      limit,
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }, // Exclure les champs spécifiés
    });

    res.json({
      total: count,
      page: parseInt(page, 10),
      pageSize: limit,
      users,
    });
  } catch (error) {
    console.error('Error retrieving users', error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
}


async function getUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user', error);
    res.status(500).json({ error: 'Error retrieving user' });
  }
}


async function updateUserSelf(req, res) {
  try {
    const { firstName, lastName, birthDate } = req.body;
    const userId = req.user.userId;


    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = birthDate;
    await user.save();

    const updatedUser = await User.findByPk(userId);

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function updateUserAll(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, birthDate } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = birthDate;
    await user.save();

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function deleteUserSelf(req, res) {
  try {
    const userId = req.user.userId;

    const deletedUser = await User.destroy({ where: { id: userId } });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
}

async function deleteUserAll(req, res) {
  try {
    const { userId } = req.params;

    const deletedUser = await User.destroy({ where: { id: userId } });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
}


const UserController = {
  createUser,
  register,
  getUsers,
  getUser,
  updateUserSelf,
  updateUserAll,
  deleteUserSelf,
  deleteUserAll,
};


export default UserController;
