import { DataTypes } from 'sequelize';
import database from '../config/database';

const AccessToken = database.define('AccessToken', {
  token: {
    type: DataTypes.STRING(2048),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default AccessToken;
