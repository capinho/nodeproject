import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import database from '../config/database';
import Right from './right';
import Pokemon from './pokemon';
import AccessToken from './accesstoken';

const User = database.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, 
{
  sequelize: database,
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;
    },
  },
});

User.hasMany(AccessToken, { foreignKey: 'userId' });

// Define the association between User and Right
User.belongsToMany(Right, { through: 'UserRight' });
Right.belongsToMany(User, { through: 'UserRight' });

// Define the many-to-many association between User and Pokemon
User.belongsToMany(Pokemon, { through: 'UserPokemon', as: 'pokemons' });
Pokemon.belongsToMany(User, { through: 'UserPokemon', as: 'users' });

export default User;
