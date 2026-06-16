const DB_NAME = 'trendvibe-keys'
const DB_VERSION = 1
const STORE_NAME = 'keyPairs'
const ALGORITHM = 'RSA-OAEP'
const HASH = 'SHA-256'

interface StoredKeyPair {
  userId: string
  publicKey: CryptoKey
  privateKey: CryptoKey
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' })
      }
    }
  })
}

async function storeKeyPair(userId: string, keyPair: CryptoKeyPair): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const entry: StoredKeyPair = {
      userId,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    }
    const request = store.put(entry)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function getKeyPair(userId: string): Promise<CryptoKeyPair | null> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(userId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const entry: StoredKeyPair | undefined = request.result
      if (!entry) {
        resolve(null)
        return
      }
      resolve({ publicKey: entry.publicKey, privateKey: entry.privateKey })
    }
  })
}

export async function generateKeyPair(userId: string): Promise<CryptoKey> {
  const existing = await getKeyPair(userId)
  if (existing) {
    return existing.publicKey
  }
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: HASH,
    },
    false,
    ['encrypt', 'decrypt']
  )
  await storeKeyPair(userId, keyPair)
  return keyPair.publicKey
}

export async function exportPublicKey(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key)
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: ALGORITHM,
      hash: HASH,
    },
    true,
    ['encrypt']
  )
}

export async function encryptMessage(plainText: string, publicKey: CryptoKey): Promise<{ encryptedContent: string; iv: string }> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    data
  )
  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey)
  const encryptedAesKey = await window.crypto.subtle.encrypt(
    { name: ALGORITHM },
    publicKey,
    rawAesKey
  )
  const combined = new Uint8Array(encryptedAesKey.byteLength + encryptedData.byteLength)
  const aesKeyBytes = new Uint8Array(encryptedAesKey)
  const dataBytes = new Uint8Array(encryptedData)
  for (let i = 0; i < aesKeyBytes.length; i++) {
    combined[i] = aesKeyBytes[i]
  }
  for (let i = 0; i < dataBytes.length; i++) {
    combined[aesKeyBytes.length + i] = dataBytes[i]
  }
  return {
    encryptedContent: arrayBufferToBase64(combined),
    iv: arrayBufferToBase64(iv),
  }
}

export async function decryptMessage(encryptedContent: string, iv: string, userId: string): Promise<string> {
  const keyPair = await getKeyPair(userId)
  if (!keyPair) {
    throw new Error('Private key not found for current user')
  }
  const combined = base64ToArrayBuffer(encryptedContent)
  const ivArray = base64ToArrayBuffer(iv)
  const encryptedAesKeyLength = 256
  const encryptedAesKey = combined.slice(0, encryptedAesKeyLength)
  const encryptedData = combined.slice(encryptedAesKeyLength)
  const aesKeyRaw = await window.crypto.subtle.decrypt(
    { name: ALGORITHM },
    keyPair.privateKey,
    encryptedAesKey as ArrayBuffer
  )
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    aesKeyRaw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray as ArrayBuffer },
    aesKey,
    encryptedData as ArrayBuffer
  )
  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
