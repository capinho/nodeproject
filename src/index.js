import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import pokemonRoutes from './routes/pokemonRoutes';
import tradeRoutes from './routes/tradeRoutes';
import logsRoutes from './routes/logsRoutes';
import oauth2Routes from './routes/oauth2Routes';
import { initializeDatabase } from './config/initialisation';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use(userRoutes);
app.use(pokemonRoutes);
app.use(tradeRoutes);
app.use(logsRoutes);
app.use(oauth2Routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initializeDatabase();
