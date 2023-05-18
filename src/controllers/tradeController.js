import Trade from '../models/trade';
import Pokemon from '../models/pokemon';

// Créer un échange entre n'importe quel Dresseur
async function createTradeAll(req, res) {
  try {
    const { userId } = req.params;
    const { receiverId, offeredPokemons, requestedPokemons } = req.body;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur émetteur de la demande
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Créer l'échange entre les Dresseurs
    const newTrade = await Trade.create({
      senderId: userId,
      receiverId,
      offeredPokemons,
      requestedPokemons,
    });

    // Retourner les informations de l'échange créé
    res.json(newTrade);
  } catch (error) {
    console.error('Erreur lors de la création de l\'échange', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'échange' });
  }
}


// Créer un échange entre le Dresseur authentifié et un autre Dresseur
async function createTrade(req, res) {
  try {
    const { userId } = req.params;
    const { offeredPokemons, requestedPokemons } = req.body;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur émetteur de la demande
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Créer l'échange entre les Dresseurs
    const newTrade = await Trade.create({
      senderId: userId,
      receiverId: req.body.receiverId,
      offeredPokemons,
      requestedPokemons,
    });

    // Retourner les informations de l'échange créé
    res.json(newTrade);
  } catch (error) {
    console.error('Erreur lors de la création de l\'échange', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'échange' });
  }
}

// Récupérer la liste des échanges liés à un Dresseur
async function getUserTrades(req, res) {
  try {
    const { userId } = req.params;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur concerné
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer la liste des échanges liés au Dresseur
    const userTrades = await Trade.findAll({ where: { senderId: userId } });

    // Retourner la liste des échanges
    res.json(userTrades);
  } catch (error) {
    console.error('Erreur lors de la récupération des échanges', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des échanges' });
  }
}

// Récupérer les informations d'un échange lié à un Dresseur
async function getUserTrade(req, res) {
  try {
    const { userId, tradeId } = req.params;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur concerné
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer les informations de l'échange lié au Dresseur
    const userTrade = await Trade.findOne({ where: { id: tradeId, senderId: userId } });

    if (!userTrade) {
      return res.status(404).json({ error: 'Échange non trouvé' });
    }

    // Retourner les informations de l'échange
    res.json(userTrade);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'échange', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'échange' });
  }
}

// Accepter ou refuser un échange reçu par le Dresseur authentifié
async function updateTrade(req, res) {
  try {
    const { tradeId } = req.params;
    const { action } = req.body;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur concerné
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer l'échange
    const trade = await Trade.findOne({ where: { id: tradeId, receiverId: userId } });

    if (!trade) {
      return res.status(404).json({ error: 'Échange non trouvé' });
    }

    // Vérifier l'état de l'échange
    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Échange déjà traité' });
    }

    // Vérifier l'action demandée
    if (action === 'accept') {
      // Effectuer l'échange des Pokémons
      await performTrade(trade);

      // Mettre à jour l'état de l'échange
      trade.status = 'accepted';
      await trade.save();

      // Retourner les informations de l'échange mis à jour
      res.json(trade);
    } else if (action === 'refuse') {
      // Mettre à jour l'état de l'échange
      trade.status = 'refused';
      await trade.save();

      // Retourner les informations de l'échange mis à jour
      res.json(trade);
    } else {
      return res.status(400).json({ error: 'Action invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'échange', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'échange' });
  }
}

// Fonction interne pour effectuer l'échange des Pokémons
async function performTrade(trade) {
  try {
    const { offeredPokemons, requestedPokemons } = trade;

    // Vérifier si les Dresseurs possèdent les Pokémons à échanger
    const senderPokemons = await Pokemon.findAll({ where: { id: offeredPokemons, UserId: trade.senderId } });
    const receiverPokemons = await Pokemon.findAll({ where: { id: requestedPokemons, UserId: trade.receiverId } });

    if (senderPokemons.length !== offeredPokemons.length || receiverPokemons.length !== requestedPokemons.length) {
      throw new Error('Certains Pokémons à échanger n\'ont pas été trouvés');
    }

    // Mettre à jour les propriétaires des Pokémons
    await Promise.all([
      ...senderPokemons.map(pokemon => pokemon.update({ UserId: trade.receiverId })),
      ...receiverPokemons.map(pokemon => pokemon.update({ UserId: trade.senderId })),
    ]);
  } catch (error) {
    console.error('Erreur lors de l\'échange des Pokémons', error);
    throw error;
  }
}

// Accepter ou refuser un échange reçu par n'importe quel Dresseur
async function updateTradeAll(req, res) {
  try {
    const { tradeId } = req.params;
    const { action } = req.body;

    // Vérifier si l'utilisateur authentifié correspond au Dresseur concerné
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Récupérer l'échange
    const trade = await Trade.findOne({ where: { id: tradeId } });

    if (!trade) {
      return res.status(404).json({ error: 'Échange non trouvé' });
    }

    // Vérifier l'état de l'échange
    if (trade.status !== 'pending') {
      return res.status(400).json({ error: 'Échange déjà traité' });
    }

    // Vérifier l'action demandée
    if (action === 'accept') {
      // Effectuer l'échange des Pokémons
      await performTrade(trade);

      // Mettre à jour l'état de l'échange
      trade.status = 'accepted';
      await trade.save();

      // Retourner les informations de l'échange mis à jour
      res.json(trade);
    } else if (action === 'refuse') {
      // Mettre à jour l'état de l'échange
      trade.status = 'rejected';
      await trade.save();

      // Retourner les informations de l'échange mis à jour
      res.json(trade);
    } else {
      return res.status(400).json({ error: 'Action invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'échange', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'échange' });
  }
}

const TradeController = {
  createTrade,
  getUserTrades,
  getUserTrade,
  updateTrade,
  createTradeAll,
  updateTradeAll,
};

export default TradeController;