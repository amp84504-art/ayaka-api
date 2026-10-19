const crypto = require('crypto');

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa I, O, 0, 1 agar tidak ambigu
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3;

function randomSegment() {
  const bytes = crypto.randomBytes(SEGMENT_LENGTH);
  let result = '';
  for (let i = 0; i < SEGMENT_LENGTH; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

function generateApiKey() {
  const segments = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    segments.push(randomSegment());
  }
  return `AM-${segments.join('-')}`;
}

module.exports = { generateApiKey };