const { createOrGetApiKey, validateApiKey, getApiKeyByEmail } = require('../services/apiKeyService');
const { sendResponse } = require('../utils/response');

/**
 * POST /api/generate-key
 * Body: { email }
 */
async function generateKey(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return sendResponse(res, {
      success: false,
      http_code: 400,
      firebase_code: 'invalid-argument',
      message: 'Email wajib diisi',
    });
  }

  try {
    const { apiKey, isNew } = await createOrGetApiKey(email);
    const httpCode = isNew ? 201 : 200;

    return sendResponse(res, {
      success: true,
      http_code: httpCode,
      firebase_code: 'ok',
      message: isNew
        ? 'API Key berhasil dibuat dari Firebase Server'
        : 'API Key sudah ada, mengembalikan key lama',
      api_key: apiKey,
    });
  } catch (error) {
    console.error('generateKey error:', error);
    return sendResponse(res, {
      success: false,
      http_code: 500,
      firebase_code: 'internal',
      message: 'Gagal membuat API Key',
    });
  }
}

/**
 * GET /api/validate-key
 * Header: x-api-key
 */
async function validateKey(req, res) {
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

    return sendResponse(res, {
      success: true,
      http_code: 200,
      firebase_code: 'ok',
      message: 'API Key Valid, dari Firebase Server',
      valid: true,
    });
  } catch (error) {
    console.error('validateKey error:', error);
    return sendResponse(res, {
      success: false,
      http_code: 500,
      firebase_code: 'internal',
      message: 'Gagal memvalidasi API Key',
    });
  }
}

/**
 * GET /api/my-key?email=...
 */
async function getMyKey(req, res) {
  const { email } = req.query;

  if (!email) {
    return sendResponse(res, {
      success: false,
      http_code: 400,
      firebase_code: 'invalid-argument',
      message: 'Email wajib diisi',
    });
  }

  try {
    const { exists, apiKey } = await getApiKeyByEmail(email);

    if (!exists || !apiKey) {
      return sendResponse(res, {
        success: false,
        http_code: 404,
        firebase_code: 'not-found',
        message: 'API Key tidak ditemukan untuk email tersebut',
      });
    }

    return sendResponse(res, {
      success: true,
      http_code: 200,
      firebase_code: 'ok',
      message: 'API Key ditemukan',
      api_key: apiKey,
    });
  } catch (error) {
    console.error('getMyKey error:', error);
    return sendResponse(res, {
      success: false,
      http_code: 500,
      firebase_code: 'internal',
      message: 'Gagal mengambil API Key',
    });
  }
}

module.exports = {
  generateKey,
  validateKey,
  getMyKey,
};