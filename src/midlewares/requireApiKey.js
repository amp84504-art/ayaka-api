const { validateApiKey } = require('../services/apiKeyService');
const { sendResponse } = require('../utils/response');

async function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');

  if (!key) {
    return sendResponse(res, {
      success: false,
      http_code: 401,
      firebase_code: 'unauthenticated',
      message: 'API Key tidak valid',
    });
  }

  try {
    const result = await validateApiKey(key);

    if (!result.valid) {
      if (result.reason === 'inactive') {
        return sendResponse(res, {
          success: false,
          http_code: 403,
          firebase_code: 'permission-denied',
          message: 'API Key nonaktif',
        });
      }
      return sendResponse(res, {
        success: false,
        http_code: 401,
        firebase_code: 'unauthenticated',
        message: 'API Key tidak valid',
      });
    }

    // Simpan informasi key di request untuk digunakan handler berikutnya
    req.apiKey = { key, data: result.data };
    next();
  } catch (error) {
    console.error('requireApiKey error:', error);
    return sendResponse(res, {
      success: false,
      http_code: 500,
      firebase_code: 'internal',
      message: 'Gagal memvalidasi API Key',
    });
  }
}

module.exports = { requireApiKey };