import { Sequelize } from 'sequelize';

//Configuration de la base de données
// const database = new Sequelize({
//   dialect: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'test',
//   database: 'nodejs-pokemon1',
// });

const database = new Sequelize({
  dialect: 'postgres',
  host: 'db',
  port: 5432,
  username: 'your_username',
  password: 'your_password',
  database: 'your_database_name',
});

export default database;
