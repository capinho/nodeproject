import User from '../models/user';
import Pokemon from '../models/pokemon';
import { Op } from 'sequelize';
import PokemonController from '../controllers/pokemonController';

jest.mock('../models/user');
jest.mock('../models/pokemon');

describe('PokemonController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPokemons', () => {
    it('should get the user\'s pokemons', async () => {
      const req = {
        params: {
          userId: 1,
        },
        query: {},
      };
      const res = {
        json: jest.fn(),
      };

      User.findAll.mockResolvedValue([{ id: 1, pokemons: [{ id: 1, name: 'Pikachu' }] }]);

      await PokemonController.getPokemons(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: Pokemon,
            as: 'pokemons',
            through: {
              attributes: [],
            },
          },
        ],
        limit: 20,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Pikachu' }]);
    });

    it('should apply filter options', async () => {
      const req = {
        params: {
          userId: 1,
        },
        query: {
          page: 2,
          pageSize: 10,
          species: 'Pikachu',
          name: 'Pika',
          levelMin: 10,
          levelMax: 20,
        },
      };
      const res = {
        json: jest.fn(),
      };

      User.findAll.mockResolvedValue([{ id: 1, pokemons: [{ id: 1, name: 'Pikachu', level: 15 }] }]);

      await PokemonController.getPokemons(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: {
          id: 1,
          '$pokemons.species$': { [Op.like]: '%Pikachu%' },
          '$pokemons.name$': { [Op.like]: '%Pika%' },
          '$pokemons.level$': { [Op.between]: [10, 20] },
        },
        include: [
          {
            model: Pokemon,
            as: 'pokemons',
            through: {
              attributes: [],
            },
          },
        ],
        limit: 10,
        offset: 10,
      });
      expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Pikachu', level: 15 }]);
    });

    it('should return an empty array if no user pokemons found', async () => {
      const req = {
        params: {
          userId: 1,
        },
        query: {},
      };
      const res = {
        json: jest.fn(),
      };

      User.findAll.mockResolvedValue([]);

      await PokemonController.getPokemons(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: Pokemon,
            as: 'pokemons',
            through: {
              attributes: [],
            },
          },
        ],
        limit: 20,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return an empty array if user has no pokemons', async () => {
      const req = {
        params: {
          userId: 1,
        },
        query: {},
      };
      const res = {
        json: jest.fn(),
      };

      User.findAll.mockResolvedValue([{ id: 1, pokemons: [] }]);

      await PokemonController.getPokemons(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: Pokemon,
            as: 'pokemons',
            through: {
              attributes: [],
            },
          },
        ],
        limit: 20,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors and return 500 status', async () => {
      const req = {
        params: {
          userId: 1,
        },
        query: {},
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      User.findAll.mockRejectedValue(new Error('Database error'));

      await PokemonController.getPokemons(req, res);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { id: 1 },
        include: [
          {
            model: Pokemon,
            as: 'pokemons',
            through: {
              attributes: [],
            },
          },
        ],
        limit: 20,
        offset: 0,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération des Pokémon' });
    });
  });

  describe('createPokemon', () => {
    it('should create a new Pokemon for authenticated user', async () => {
      const req = {
        user: { userId: 1 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        json: jest.fn(),
      };

      const createdPokemon = {
        id: 1,
        species: 'Pikachu',
        name: 'Pika',
        level: 10,
        gender: 'male',
        height: 0.5,
        weight: 5.0,
        isShiny: true,
      };

      User.findByPk.mockResolvedValue({ id: 1 });
      Pokemon.create.mockResolvedValue(createdPokemon);
      const userInstance = { addPokemon: jest.fn() };
      User.prototype.addPokemon.mockResolvedValue(userInstance);

      await PokemonController.createPokemon(req, res);

      expect(req.user.userId).toEqual(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Pokemon.create).toHaveBeenCalledWith({
        species: 'Pikachu',
        name: 'Pika',
        level: 10,
        gender: 'male',
        height: 0.5,
        weight: 5.0,
        isShiny: true,
      });
      expect(User.prototype.addPokemon).toHaveBeenCalledWith(createdPokemon);
      expect(res.json).toHaveBeenCalledWith(createdPokemon);
    });

    it('should return 403 if user id is not authorized', async () => {
      const req = {
        user: { userId: 2 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue({ id: 1 });

      await PokemonController.createPokemon(req, res);

      expect(req.user.userId).toEqual(2);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Accès non autorisé' });
    });

    it('should handle errors and return 500 status', async () => {
      const req = {
        user: { userId: 1 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      User.findByPk.mockRejectedValue(new Error('Database error'));

      await PokemonController.createPokemon(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors de la création du Pokémon' });
    });
  });

  describe('createPokemonAll', () => {
    it('should create a new Pokemon for any user', async () => {
      const req = {
        params: { userId: 1 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        json: jest.fn(),
      };

      const createdPokemon = {
        id: 1,
        species: 'Pikachu',
        name: 'Pika',
        level: 10,
        gender: 'male',
        height: 0.5,
        weight: 5.0,
        isShiny: true,
      };

      User.findByPk.mockResolvedValue({ id: 1 });
      Pokemon.create.mockResolvedValue(createdPokemon);
      const userInstance = { addPokemon: jest.fn() };
      User.prototype.addPokemon.mockResolvedValue(userInstance);

      await PokemonController.createPokemonAll(req, res);

      expect(req.params.userId).toEqual(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Pokemon.create).toHaveBeenCalledWith({
        species: 'Pikachu',
        name: 'Pika',
        level: 10,
        gender: 'male',
        height: 0.5,
        weight: 5.0,
        isShiny: true,
      });
      expect(User.prototype.addPokemon).toHaveBeenCalledWith(createdPokemon);
      expect(res.json).toHaveBeenCalledWith(createdPokemon);
    });

    it('should return 404 if user is not found', async () => {
      const req = {
        params: { userId: 1 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      User.findByPk.mockResolvedValue(null);

      await PokemonController.createPokemonAll(req, res);

      expect(req.params.userId).toEqual(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors and return 500 status', async () => {
      const req = {
        params: { userId: 1 },
        body: {
          species: 'Pikachu',
          name: 'Pika',
          level: 10,
          gender: 'male',
          height: 0.5,
          weight: 5.0,
          isShiny: true,
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      User.findByPk.mockRejectedValue(new Error('Database error'));

      await PokemonController.createPokemonAll(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors de la création du Pokémon' });
    });
  });
});
