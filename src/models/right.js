import { DataTypes, Model } from 'sequelize';
import database from '../config/database';

class Right extends Model {}

Right.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: database,
    modelName: 'Right',
  }
);

export default Right;
