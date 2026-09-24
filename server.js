require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');

const sequelize = require('./src/config/db');
require('./src/models'); // registers associations

const authRoutes = require('./src/routes/authRoutes');
const agentRoutes = require('./src/routes/agentRoutes');
const listingRoutes = require('./src/routes/listingRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const commissionRoutes = require('./src/routes/commissionRoutes');
const exportRoutes = require('./src/routes/exportRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Reports service status, process uptime, and whether the database
// connection is actually reachable right now - useful for uptime monitors
// and load balancer health checks, not just "the process is running".
app.get('/api/health', async (req, res) => {
  let databaseStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    databaseStatus = 'connected';
  } catch (err) {
    databaseStatus = 'disconnected';
  }

  const healthy = databaseStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'estatehub-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: databaseStatus,
  });
});

// API reference: http://localhost:5000/api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/commissions', commissionRoutes);
app.use('/api/export', exportRoutes);

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
