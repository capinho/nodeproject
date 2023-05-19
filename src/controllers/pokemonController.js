import User from '../models/user';
import Pokemon from '../models/pokemon';
import { Op } from 'sequelize';


async function getPokemons(req, res) {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 20, species, name, levelMin, levelMax } = req.query;

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const filterOptions = {
      id: userId,
    };

    if (species) {
      filterOptions['$pokemons.species$'] = { [Op.like]: `%${species}%` };
    }

    if (name) {
      filterOptions['$pokemons.name$'] = { [Op.like]: `%${name}%` };
    }

    if (levelMin && levelMax) {
      filterOptions['$pokemons.level$'] = {
        [Op.between]: [parseInt(levelMin), parseInt(levelMax)],
      };
    } else if (levelMin) {
      filterOptions['$pokemons.level$'] = { [Op.gte]: parseInt(levelMin) };
    } else if (levelMax) {
      filterOptions['$pokemons.level$'] = { [Op.lte]: parseInt(levelMax) };
    }

    const userPokemons = await User.findAll({
      where: filterOptions,
      include: [
        {
          model: Pokemon,
          as: 'pokemons',
          through: {
            attributes: [],
          },
        },
      ],
      limit,
      offset,
    });

    if (userPokemons.length === 0 || !userPokemons[0].pokemons) {
      return res.json([]);
    }

    res.json(userPokemons[0].pokemons);
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des Pokémon' });
  }
}


// Créer un Pokémon lié au Dresseur authentifié
async function createPokemon(req, res) {
  try {
    const { userId } = req.user.userId;
    const { species, name, level, gender, height, weight, isShiny } = req.body;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur du Pokémon
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Créer le Pokémon lié au Dresseur authentifié
    const newPokemon = await Pokemon.create({
      species,
      name,
      level,
      gender,
      height,
      weight,
      isShiny,
    });

    // Associer le Pokémon à l'utilisateur
    const user = await User.findByPk(userId);
    await user.addPokemon(newPokemon);

    // Retourner les informations du Pokémon créé
    res.json(newPokemon);
  } catch (error) {
    console.error('Erreur lors de la création du Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la création du Pokémon' });
  }
}

// Créer un Pokémon lié à n'importe quel Dresseur
async function createPokemonAll(req, res) {
  try {
    const { userId } = req.params;
    const { species, name, level, gender, height, weight, isShiny } = req.body;

    // Créer le Pokémon lié au Dresseur authentifié
    const newPokemon = await Pokemon.create({
      species,
      name,
      level,
      gender,
      height,
      weight,
      isShiny,
    });

    // Associer le Pokémon à l'utilisateur
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.addPokemon(newPokemon);

    // Retourner les informations du Pokémon créé
    res.json(newPokemon);
  } catch (error) {
    console.error('Erreur lors de la création du Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la création du Pokémon' });
  }
}


// Récupérer les informations d'un Pokémon lié à un Dresseur
async function getUserPokemon(req, res) {
  try {
    const { userId, pokemonId } = req.params;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const pokemon = await user.getPokemons({
      where: { id: pokemonId },
    });

    if (pokemon.length === 0) {
      return res.status(404).json({ error: 'Pokémon non trouvé' });
    }

    res.json(pokemon[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du Pokémon' });
  }
}
  
// Mettre à jour les informations d'un Pokémon lié au Dresseur authentifié
async function updateUserPokemon(req, res) {
  try {
    const { userId, pokemonId } = req.params;
    const { species, name, level, gender, height, weight, isShiny } = req.body;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur du Pokémon
    if (req.user.userId !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userPokemon = await user.getPokemons({
      where: { id: pokemonId },
    });

    if (userPokemon.length === 0) {
      return res.status(404).json({ error: 'Pokémon non trouvé' });
    }

    // Mettre à jour les informations du Pokémon
    const pokemonToUpdate = userPokemon[0];
    pokemonToUpdate.species = species;
    pokemonToUpdate.name = name;
    pokemonToUpdate.level = level;
    pokemonToUpdate.gender = gender;
    pokemonToUpdate.height = height;
    pokemonToUpdate.weight = weight;
    pokemonToUpdate.isShiny = isShiny;
    await pokemonToUpdate.save();

    // Retourner les informations du Pokémon mis à jour
    res.json(pokemonToUpdate);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du Pokémon' });
  }
}
  
  // Supprimer un Pokémon lié au Dresseur authentifié
  async function deleteUserPokemon(req, res) {
    try {
      const { userId, pokemonId } = req.params;
  
      // Vérifier si l'utilisateur authentifié correspond à l'utilisateur du Pokémon
      if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
  
      // Supprimer le Pokémon lié au Dresseur authentifié
      const deletedPokemon = await Pokemon.destroy({ where: { id: pokemonId, UserId: userId } });
  
      if (!deletedPokemon) {
        return res.status(404).json({ error: 'Pokémon non trouvé' });
      }
  
      res.json({ message: 'Pokémon supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du Pokémon', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du Pokémon' });
    }
  }
  
  // Supprimer un Pokémon lié à n'importe quel Dresseur
  async function deleteUserPokemonAll(req, res) {
    try {
      const { userId, pokemonId
      } = req.params;

      // Supprimer le Pokémon par son ID
      const deletedPokemon = await Pokemon.destroy({ where: { id: pokemonId } });
  
      if (!deletedPokemon) {
        return res.status(404).json({ error: 'Pokémon non trouvé' });
      }
  
      res.json({ message: 'Pokémon supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du Pokémon', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du Pokémon' });
    }
  }
  
  const PokemonController = {
    createPokemon,
    createPokemonAll,
    getUserPokemon,
    updateUserPokemon,
    deleteUserPokemon,
    deleteUserPokemonAll,
    getPokemons,
    
  }
  export default PokemonController;