import database from './database';
import Right from '../models/right';
import User from '../models/user';

export async function initializeDatabase() {
  try {
    // Sync the models with the database
    await database.sync({ force: true });

    // Create the rights
    const rights = [
      { name: 'users:create', description: 'Créer un autre Dresseur' },
      { name: 'users:read', description: 'Récupérer les informations des Dresseurs' },
      { name: 'users:update:self', description: 'Modifier les informations du Dresseur authentifié' },
      { name: 'users:update:all', description: 'Modifier les informations de n’importe quel Dresseur ainsi que ses droits' },
      { name: 'users:delete:self', description: 'Supprimer le Dresseur authentifié' },
      { name: 'users:delete:all', description: 'Supprimer n’importe quel Dresseur' },
      { name: 'pokemons:create:self', description: 'Créer des Pokémons liés au Dresseur authentifié' },
      { name: 'pokemons:create:all', description: 'Créer des Pokémons liés à n’importe quel Dresseur' },
      { name: 'pokemons:read', description: 'Récupérer les informations des Pokémons' },
      { name: 'pokemons:update:self', description: 'Modifier les informations des Pokémons liés au Dresseur authentifié' },
      { name: 'pokemons:update:all', description: 'Modifier les informations des Pokémons liés à n’importe quel Dresseur' },
      { name: 'pokemons:delete:self', description: 'Supprimer des Pokémons liés au Dresseur authentifié' },
      { name: 'pokemons:delete:all', description: 'Supprimer des Pokémons liés à n’importe quel Dresseur' },
      { name: 'trade:create:self', description: 'Créer un échange de la part du Dresseur authentifié' },
      { name: 'trade:create:all', description: 'Créer un échange de la part de n’importe quel Dresseur' },
      { name: 'trade:read', description: 'Récupérer les informations des échanges' },
      { name: 'trade:update:self', description: 'Accepter ou refuser un échange que le Dresseur a reçu' },
      { name: 'trade:update:all', description: 'Accepter ou refuser un échange que n’importe quel Dresseur a reçu' },
      { name: 'logs:read', description: 'Récupérer les logs de l’application' },
    ];

    // Create the administrator user
    const adminUser = {
      firstName: 'Leo',
      lastName: 'Pokemaniac',
      login: 'leopkmn',
      password: 'cynthia',
      birthDate: new Date(1999, 9, 8), // 
    };
    
    // Find all rights and assign them to the administrator user    
    const findrights = await Right.findAll();
    adminUser.rights = findrights;

    await User.create(adminUser, { include: [Right] });

    // Create the rights in the database
    await Right.bulkCreate(rights);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database', error);
  }
}

