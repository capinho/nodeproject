import { Sequelize } from 'sequelize';

// Configuration de la base de données
const database = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'test',
  database: 'nodejs-pokemon1',
});

export default database;
