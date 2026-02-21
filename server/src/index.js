const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetflow';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'FleetFlow API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message || err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Kill any existing process on the port, then start
const { execSync } = require('child_process');

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      const pids = [...new Set(lines.map(l => l.trim().split(/\s+/).pop()))];
      for (const pid of pids) {
        if (pid && pid !== '0' && pid !== String(process.pid)) {
          try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }); console.log(`Killed old process on port ${port} (PID ${pid})`); } catch {}
        }
      }
    } else {
      try { execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: 'ignore' }); } catch {}
    }
  } catch {}
}

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    killPort(PORT);
    // Small delay to let OS release the port
    await new Promise(r => setTimeout(r, 1000));
    const server = app.listen(PORT, () => {
      console.log(`FleetFlow server running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is still in use. Run: taskkill /F /IM node.exe`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
