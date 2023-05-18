import { DataTypes } from 'sequelize';
import database from '../config/database';

const RefreshToken = database.define('RefreshToken', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  
export default RefreshToken;