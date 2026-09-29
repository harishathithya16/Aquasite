const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `drishti_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { type, lat, lng } = req.body;
    const imageUrl = `http://https://aquasite-6jer.vercel.app/uploads/${req.file.filename}`;

    const mockIntegrityScore = Math.floor(Math.random() * (100 - 40 + 1) + 40); 
    const mockStatus = mockIntegrityScore > 75 ? 'Verified' : 'Flagged';
    const mockNdvi = `+${Math.floor(Math.random() * 15)}%`;

    // MySQL uses ? for parameterized queries
    const [result] = await pool.query(
      `INSERT INTO interventions (type, status, lat, lng, ndvi_change, integrity_score, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type, mockStatus, lat, lng, mockNdvi, mockIntegrityScore, imageUrl]
    );

    res.json({
      message: 'Image uploaded successfully',
      data: { id: result.insertId, type, status: mockStatus, lat, lng, ndvi_change: mockNdvi, integrity_score: mockIntegrityScore, image_url: imageUrl }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;