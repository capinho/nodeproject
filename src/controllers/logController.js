import csvWriter from 'csv-writer';
import Log from '../models/log';

// Récupérer un CSV des logs de l'application
async function getLogs(req, res) {
  try {
    // Vérifier si l'utilisateur a les droits requis
    if (!req.user.rights.includes('logs:read')) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les logs de la base de données selon les critères spécifiés
    const { startDate, endDate } = req.query;
    const logs = await Log.findAll({ where: { createdAt: { $gte: startDate, $lte: endDate } } });

    // Créer un fichier CSV des logs
    const csvData = logs.map(log => {
      // Formater les données des logs selon votre structure
      return {
        id: log.id,
        action: log.action,
        timestamp: log.timestamp,
        userId: log.userId,
        // Ajouter d'autres propriétés de log selon vos besoins
      };
    });

    // Définir les en-têtes de la réponse pour indiquer un téléchargement de fichier CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');

    // Créer le writer CSV
    const csvFile = csvWriter.createObjectCsvWriter({
      header: [
        // Définir les en-têtes de colonne du fichier CSV
        { id: 'id', title: 'ID' },
        { id: 'action', title: 'Action' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'userId', title: 'User ID' },
      ],
      path: 'logs.csv', // Chemin où le fichier CSV sera temporairement stocké
    });

    // Écrire les données CSV dans le fichier
    await csvFile.writeRecords(csvData);

    // Envoyer le fichier CSV en réponse
    res.sendFile('logs.csv');
  } catch (error) {
    console.error('Erreur lors de la récupération des logs', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
  }
}

export default {
  getLogs,
};
