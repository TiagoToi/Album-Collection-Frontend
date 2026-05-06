const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Auth
export async function register(email, password, name) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

// Collections
export async function getCollections(token) {
  return request('/collections', {
    headers: authHeaders(token),
  })
}

export async function createCollection(token, name) {
  return request('/collections', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  })
}

export async function joinCollection(token, inviteCode) {
  return request('/collections/join', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ invite_code: inviteCode }),
  })
}

export async function getStickers(token, collectionId) {
  return request(`/collections/${collectionId}/stickers`, {
    headers: authHeaders(token),
  })
}

export async function patchSticker(token, collectionId, code, number, delta) {
  return request(`/collections/${collectionId}/stickers/${code}/${number}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ delta }),
  })
}
