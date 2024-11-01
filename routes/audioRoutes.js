const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// POST /generate_audio route
router.post('/generate_audio', audioController.generateAudio);

// GET /get_audio route
router.get('/get_audio/:id', audioController.getAudio);

module.exports = router;