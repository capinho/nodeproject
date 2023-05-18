function checkAuthorization(requiredRights) {
    return (req, res, next) => {
      // Vérifier les droits de l'utilisateur actuellement authentifié
      const userRights = req.user.rights;
      // Vérifier si l'utilisateur possède les droits requis
      const hasSufficientRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
  
      if (!hasSufficientRights) {
        return res.status(403).json({ error: 'Accès refusé' });
      }
  
      // Passer au prochain middleware ou au contrôleur
      next();
    };
  }
  
  module.exports = checkAuthorization;
  