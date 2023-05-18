import { DataTypes } from 'sequelize';
import database from '../config/database';

const AuthorizationCode = database.define('AuthorizationCode', {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    redirectUri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

export default AuthorizationCode;