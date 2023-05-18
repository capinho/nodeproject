import { DataTypes } from 'sequelize';
import database from '../config/database';
import User from './user';
import Pokemon from './pokemon';

const Trade = database.define('Trade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
});

Trade.belongsTo(User, { as: 'User1', foreignKey: 'user1Id' });
Trade.belongsTo(User, { as: 'User2', foreignKey: 'user2Id' });

Trade.belongsToMany(Pokemon, { through: 'TradePokemons', as: 'User1Pokemons', foreignKey: 'tradeId' });
Trade.belongsToMany(Pokemon, { through: 'TradePokemons', as: 'User2Pokemons', foreignKey: 'tradeId' });

export default Trade;