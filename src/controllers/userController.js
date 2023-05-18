import User from '../models/user';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../helpers/oauth2Helpers';


async function createUser(req, res) {
  try {
    const { firstName, lastName, login, password, birthDate, rights } = req.body;

    // Vérifier si l'utilisateur actuel a le droit "users:create"
    const currentUser = req.user;
    if (!currentUser || !currentUser.rights.includes('users:create')) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

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
      rights,
    });

    // Générer le jeton d'accès pour le nouvel utilisateur créé
    const accessToken = generateAccessToken(newUser);

    res.json({ user: newUser, access_token: accessToken });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ error: 'Error creating user' });
  }
}

async function register(req, res) {
  try {
    const { firstName, lastName, login, password, birthDate, rights } = req.body;

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
      rights,
    });

    // Generate access token for the newly registered user
    const accessToken = generateAccessToken(newUser);

    res.json({ user: newUser, access_token: accessToken });
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
      include: 'pokemons', // Include the associated pokemons
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

// Update the updateUser method to handle the association with pokemons
async function updateUser(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, birthDate, pokemons } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = birthDate;
    await user.save();

    // Associate the selected pokemons with the user
    await user.setPokemons(pokemons);

    // Fetch the updated user including the associated pokemons
    const updatedUser = await User.findByPk(userId, {
      include: 'pokemons',
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function deleteUser(req, res) {
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

async function updateUserSelf(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, birthDate, pokemons } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({
        error: 'Unauthorized access'
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = birthDate;
    await user.save();

    // Associate the selected pokemons with the user
    await user.setPokemons(pokemons);

    // Fetch the updated user including the associated pokemons
    const updatedUser = await User.findByPk(userId, {
      include: 'pokemons',
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function updateUserAll(req, res) {
  try {
    const { userId } = req.params;
    const { firstName, lastName, birthDate, rights, pokemons } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = birthDate;
    user.rights = rights;
    await user.save();

    // Associate the selected pokemons with the user
    await user.setPokemons(pokemons);

    // Fetch the updated user including the associated pokemons
    const updatedUser = await User.findByPk(userId, {
      include: 'pokemons',
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user', error);
    res.status(500).json({ error: 'Error updating user' });
  }
}

async function deleteUserSelf(req, res) {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "You are not authorized to delete this user" });
    }

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
  updateUser,
  deleteUser,
  updateUserSelf,
  updateUserAll,
  deleteUserSelf,
  deleteUserAll,
};


export default UserController;
