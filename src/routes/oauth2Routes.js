import express from 'express';
import oauth2Controller from '../controllers/oauth2Controller';

const router = express.Router();

router.get('/oauth2/authorize', oauth2Controller.authorize);
router.post('/oauth2/token', oauth2Controller.token);

export default router;
