function sendResponse(res, { success, http_code, firebase_code = null, message, data = null, api_key = null, ...extra }) {
  return res.status(http_code).json({
    success,
    http_code,
    firebase_code,
    message,
    data,
    api_key,
    ...extra, // untuk field tambahan seperti `valid`
  });
}

module.exports = { sendResponse };