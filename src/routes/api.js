const express = require('express');
const router = express.Router();

const {
  generateKey,
  validateKey,
  getMyKey,
} = require('../controllers/apiKeyController');

const { requireApiKey } = require('../middlewares/requireApiKey');

// Endpoint publik
router.post('/generate-key', generateKey);
router.get('/validate-key', validateKey);
router.get('/my-key', getMyKey);

// Endpoint terproteksi (wajib x-api-key valid)
router.get('/protected/data', requireApiKey, (req, res) => {
  res.json({
    success: true,
    http_code: 200,
    firebase_code: 'ok',
    message: 'Protected data accessible',
    data: {
      message: 'Hello from protected endpoint',
      apiKey: req.apiKey.key,
    },
  });
});

module.exports = router;