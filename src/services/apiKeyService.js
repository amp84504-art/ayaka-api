const { db, admin } = require('../config/firebase');
const { generateApiKey } = require('../utils/generateKey');

const API_KEYS_COLLECTION = 'api_keys';
const USERS_COLLECTION = 'users';

/**
 * Generate key unik (retry jika collision).
 */
async function generateUniqueKey() {
  let key;
  let exists = true;
  while (exists) {
    key = generateApiKey();
    const doc = await db.collection(API_KEYS_COLLECTION).doc(key).get();
    exists = doc.exists;
  }
  return key;
}

/**
 * Buat key baru atau kembalikan key lama jika email sudah terdaftar.
 * @returns {Promise<{ apiKey: string, isNew: boolean }>}
 */
async function createOrGetApiKey(email) {
  const userRef = db.collection(USERS_COLLECTION).doc(email);
  const userDoc = await userRef.get();

  // Jika user sudah punya key, kembalikan key lama
  if (userDoc.exists && userDoc.data().apiKey) {
    const existingKey = userDoc.data().apiKey;
    const keyDoc = await db.collection(API_KEYS_COLLECTION).doc(existingKey).get();
    if (keyDoc.exists) {
      return { apiKey: existingKey, isNew: false };
    }
  }

  // Generate key baru
  const newKey = await generateUniqueKey();

  const batch = db.batch();

  // Dokumen di api_keys: ID = key itu sendiri (memudahkan validasi O(1))
  const keyRef = db.collection(API_KEYS_COLLECTION).doc(newKey);
  batch.set(keyRef, {
    key: newKey,
    userId: email,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    usageCount: 0,
  });

  // Dokumen di users: ID = email
  batch.set(userRef, {
    email: email,
    apiKey: newKey,
  }, { merge: true });

  await batch.commit();

  return { apiKey: newKey, isNew: true };
}

/**
 * Validasi key. Jika valid & aktif, increment usageCount.
 */
async function validateApiKey(key) {
  const keyDoc = await db.collection(API_KEYS_COLLECTION).doc(key).get();
  if (!keyDoc.exists) {
    return { valid: false, reason: 'not_found' };
  }

  const data = keyDoc.data();
  if (!data.isActive) {
    return { valid: false, reason: 'inactive' };
  }

  // Increment usageCount
  await keyDoc.ref.update({
    usageCount: admin.firestore.FieldValue.increment(1),
  });

  return { valid: true, data };
}

/**
 * Ambil API key berdasarkan email.
 */
async function getApiKeyByEmail(email) {
  const userDoc = await db.collection(USERS_COLLECTION).doc(email).get();
  if (!userDoc.exists) {
    return { exists: false };
  }
  const data = userDoc.data();
  return { exists: true, apiKey: data.apiKey };
}

module.exports = {
  createOrGetApiKey,
  validateApiKey,
  getApiKeyByEmail,
};