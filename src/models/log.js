import { DataTypes } from 'sequelize';
import database from '../config/database';

const Log = database.define('Log', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'logs', 
  timestamps: true, 
  paranoid: true, // Active la suppression logique (soft delete)
});

export default Log;
