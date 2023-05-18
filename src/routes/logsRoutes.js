import express from 'express';
import LogController from '../controllers/logController';
import checkAuthorization from '../middlewares/checkAuthorization';

const router = express.Router();

// Route: Récupérer un CSV des logs de l'application
router.get('/logs', checkAuthorization(['logs:read']), LogController.getLogs);

export default router;
