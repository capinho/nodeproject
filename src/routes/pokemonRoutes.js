import express from 'express';
import PokemonController from '../controllers/pokemonController';
import checkAuthorization from '../middlewares/checkAuthorization';

const router = express.Router();

// Route: Create a Pokémon linked to the authenticated Trainer
router.post('/users/:userId/pokemons', checkAuthorization(['pokemons:create:self']), PokemonController.createPokemon);

// Route: Create a Pokémon linked to any Trainer
router.post('/users/:userId/pokemons', checkAuthorization(['pokemons:create:all']), PokemonController.createPokemon);

// Route: Get the list of Pokémon (and their information) linked to a Trainer
router.get('/users/:userId/pokemons', checkAuthorization(['pokemons:read']), PokemonController.getPokemons);

// Route: Get information about a Pokémon linked to a Trainer
router.get('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:read']), PokemonController.getUserPokemon);

// Route: Update information about a Pokémon linked to the authenticated Trainer
router.put('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:update:self']), PokemonController.updateUserPokemon);

// Route: Update information about a Pokémon linked to any Trainer
router.put('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:update:all']), PokemonController.updateUserPokemon);

// Route: Update information about a Pokémon linked to the authenticated Trainer
router.patch('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:update:self']), PokemonController.updateUserPokemon);

// Route: Update information about a Pokémon linked to any Trainer
router.patch('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:update:all']), PokemonController.updateUserPokemon);

// Route: Delete a Pokémon linked to the authenticated Trainer
router.delete('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:delete:self']), PokemonController.deleteUserPokemon);

// Route: Delete a Pokémon linked to any Trainer
router.delete('/users/:userId/pokemons/:pokemonId', checkAuthorization(['pokemons:delete:all']), PokemonController.deleteUserPokemon);

export default router;
