import express from 'express';
import TradeController from '../controllers/tradeController';

const router = express.Router();

// // Route: Créer un échange entre le Dresseur authentifié et un autre Dresseur
// router.post('/trade', checkAuthorization(['trade:create:self']), TradeController.createTrade);

// // Route: Créer un échange entre n'importe quel Dresseur
// router.post('/trade', checkAuthorization(['trade:create:all']), TradeController.createTradeAll);

// // Route: Récupérer la liste des échanges liés à un Dresseur
// router.get('/users/:userId/trade', checkAuthorization(['trade:read']), TradeController.getUserTrades);

// // Route: Récupérer les informations d'un échange lié à un Dresseur
// router.get('/users/:userId/trade/:tradeId', checkAuthorization(['trade:read']), TradeController.getUserTrade);

// // Route: Accepter ou refuser un échange reçu par le Dresseur authentifié
// router.patch('/trade/:tradeId', checkAuthorization(['trade:update:self']), TradeController.updateTrade);

// // Route: Accepter ou refuser un échange reçu par n'importe quel Dresseur
// router.patch('/trade/:tradeId', checkAuthorization(['trade:update:all']), TradeController.updateTradeAll);

export default router;
