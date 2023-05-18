import User from '../models/user';
import Pokemon from '../models/pokemon';


// Récupérer la liste des Pokémon liés à un Dresseur
async function getPokemons(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur des Pokémon
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer la liste des Pokémon liés à un Dresseur
    const userPokemons = await Pokemon.findAll({ where: { UserId: userId } });

    // Retourner la liste des Pokémon
    res.json(userPokemons);
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des Pokémon' });
  }
}

// Créer un Pokémon lié au Dresseur authentifié
async function createPokemon(req, res) {
  try {
    const { userId } = req.params;
    const { species, name, level, gender, height, weight, isShiny } = req.body;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur du Pokémon
    if (req.user.id !== parseInt(userId)) {
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
      UserId: userId,
    });

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

    // Vérifier si l'utilisateur authentifié a les droits requis
    if (!req.user.rights.includes('pokemons:create:all')) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Créer le Pokémon lié à n'importe quel Dresseur
    const newPokemon = await Pokemon.create({
      species,
      name,
      level,
      gender,
      height,
      weight,
      isShiny,
      UserId: userId,
    });

    // Retourner les informations du Pokémon créé
    res.json(newPokemon);
  } catch (error) {
    console.error('Erreur lors de la création du Pokémon', error);
    res.status(500).json({ error: 'Erreur lors de la création du Pokémon' });
  }
}

// Récupérer la liste des Pokémons liés à un Dresseur
async function getUserPokemons(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur des Pokémons
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer la liste des Pokémons liés à un Dresseur
    const userPokemons = await Pokemon.findAll({ where: { UserId: userId } });

    // Retourner la liste des Pokémons
    res.json(userPokemons);
  } catch (error) {
    console.error('Erreur lors de la récupération des Pokémons', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des Pokémons' });
  }
}

// Récupérer les informations d'un Pokémon lié à un Dresseur
async function getUserPokemon(req, res) {
  try {
    const { userId, pokemonId } = req.params;

    // Vérifier si l'utilisateur authentifié correspond à l'utilisateur du Pokémon
    if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
  
      // Récupérer les informations du Pokémon lié à un Dresseur
      const userPokemon = await Pokemon.findOne({ where: { id: pokemonId, UserId: userId } });
  
      if (!userPokemon) {
        return res.status(404).json({ error: 'Pokémon non trouvé' });
      }
  
      // Retourner les informations du Pokémon
      res.json(userPokemon);
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
      if (req.user.id !== parseInt(userId)) {
        return res.status(403).json({ error: "Accès non autorisé" });
      }
  
      // Récupérer le Pokémon lié au Dresseur authentifié
      const userPokemon = await Pokemon.findOne({ where: { id: pokemonId, UserId: userId } });
  
      if (!userPokemon) {
        return res.status(404).json({ error: 'Pokémon non trouvé' });
      }
  
      // Mettre à jour les informations du Pokémon
      userPokemon.species = species;
      userPokemon.name = name;
      userPokemon.level = level;
      userPokemon.gender = gender;
      userPokemon.height = height;
      userPokemon.weight = weight;
      userPokemon.isShiny = isShiny;
      await userPokemon.save();
  
      // Retourner les informations du Pokémon mis à jour
      res.json(userPokemon);
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
      if (req.user.id !== parseInt(userId)) {
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
    getUserPokemons,
    getUserPokemon,
    updateUserPokemon,
    deleteUserPokemon,
    deleteUserPokemonAll,
    getPokemons,
    
  }
  export default PokemonController;