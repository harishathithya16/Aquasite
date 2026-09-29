const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/stats', async (req, res) => {
  try {
    const [verifiedResult] = await pool.query("SELECT COUNT(*) as count FROM interventions WHERE status = 'Verified'");
    const [flaggedResult] = await pool.query("SELECT COUNT(*) as count FROM interventions WHERE status = 'Flagged'");
    
    res.json({
      verifiedAssets: verifiedResult[0].count,
      flaggedAnomalies: flaggedResult[0].count,
      avgNdviGrowth: '+14.2%' 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;