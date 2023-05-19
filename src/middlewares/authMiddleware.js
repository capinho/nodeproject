import jwt from 'jsonwebtoken';
import AccessToken from '../models/accesstoken';
import User from '../models/user';
import Right from '../models/right';

const secretKey = '12456'; // Clé secrète utilisée pour signer les tokens d'accès

function authenticateAccessToken(requiredRights) {
  return async (req, res, next) => {
    // Récupérer le token d'authentification de l'en-tête de la requête
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Missing access token' });
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid access token format' });
    }

    try {
      // Vérifier et décoder le token
      const decodedToken = jwt.verify(token, secretKey);

      // Vérifier si le token est présent dans la base de données des tokens d'accès valides
      const validToken = await AccessToken.findOne({ where: { token } });

      if (!validToken) {
        return res.status(401).json({ error: 'Invalid access token' });
      }

      // Vérifier les droits du token
      const { userId, scopes } = decodedToken;
      console.log('scopes', scopes);

      req.user = {
        userId,
        scopes,
      };

    // Vérifier si le droit requis est présent dans les scopes
    let hasRequiredScope = false;

    for (let i = 0; i < scopes.length; i++) {
    console.log('scopes[i]', scopes[i], 'requiredRights', requiredRights);
    if (requiredRights.includes(scopes[i].trim())) {
        console.log('Match found! Scope:', scopes[i]);
        hasRequiredScope = true;
        break;
    }
    }

    if (!hasRequiredScope) {
    console.log('Required scope not found in scopes:', requiredRights);
    return res.status(403).json({ error: 'Droits token insuffisant' });
    }

      // Récupérer les droits de l'utilisateur à partir de la base de données
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid access token' });
      }

      const userRights = await user.getRights();

      // Vérifier si l'utilisateur possède au moins un des droits requis dans la base de données
      const hasAnyDatabaseRight = requiredRights.some((requiredRight) =>
        userRights.some((userRight) => userRight.name === requiredRight)
      );

      if (!hasAnyDatabaseRight) {
        return res.status(403).json({ error: 'Accès refusé vous navez pas le droit a cette ressource' });
      }

      // Passer au prochain middleware ou au contrôleur
      next();
    } catch (error) {
      console.error('Error authenticating access token', error);
      res.status(500).json({ error: 'Error authenticating access token' });
    }
  };
}

export default authenticateAccessToken;
