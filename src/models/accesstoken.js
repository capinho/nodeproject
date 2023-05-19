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

AccessToken.associate = (models) => {
  AccessToken.belongsTo(models.User, {
    foreignKey: 'userId', 
  });
};
export default AccessToken;
