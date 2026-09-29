const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const dashboardRoutes = require('./routes/dashboardRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Imported here

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes); // Mounted here! This makes the endpoint accessible

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Jal-Drishti backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;