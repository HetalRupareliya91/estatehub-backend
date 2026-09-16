require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const sequelize = require('./src/config/db');
require('./src/models'); // registers associations

const authRoutes = require('./src/routes/authRoutes');
const agentRoutes = require('./src/routes/agentRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'estatehub-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    app.listen(PORT, () => {
      console.log(`EstateHub backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
