// ============================================================================
// auth.js — PBKDF2 password hashing + D1 session cookies (admin only)
// ============================================================================
// Pattern adapted from ~/workspace/aria-agent/src/auth/auth.js (Lawrence's
// house playbook): PBKDF2-SHA256 100k iterations, opaque session tokens in
// D1, HttpOnly SameSite=Lax cookie. First registered account becomes admin;
// registration closes once any user exists.
// ============================================================================

const SESSION_DAYS = 14;
export const COOKIE_NAME = 'vibe_session';

function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))); }
function unb64(s) { return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return 'pbkdf2$100000$' + b64(salt) + '$' + b64(bits);
}

export async function verifyPassword(password, stored) {
  try {
    const [, iter, saltB64, hashB64] = String(stored).split('$');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: unb64(saltB64), iterations: parseInt(iter, 10), hash: 'SHA-256' }, key, 256);
    const a = unb64(hashB64), b = new Uint8Array(bits);
    if (a.length !== b.length) return false;
    let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch { return false; }
}

export function newSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function nowISO() { return new Date().toISOString(); }

export function sessionCookie(token, secure) {
  return COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (SESSION_DAYS * 86400) + (secure ? '; Secure' : '');
}
export function clearCookie() { return COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'; }

export function parseCookies(request) {
  const out = {};
  for (const part of (request.headers.get('Cookie') || '').split(';')) {
    const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export async function createSession(db, request, userId) {
  const token = newSessionToken();
  const exp = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await db.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, userId, nowISO(), exp).run();
  const secure = new URL(request.url).protocol === 'https:';
  return sessionCookie(token, secure);
}

export async function currentUser(db, request) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (!token) return null;
  const row = await db.prepare(
    'SELECT u.id, u.email, u.is_admin FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > ?'
  ).bind(token, nowISO()).first();
  return row || null;
}

export async function destroySession(db, request) {
  const token = parseCookies(request)[COOKIE_NAME];
  if (token) await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export function adminEmails(env) {
  return String((env && env.ADMIN_EMAILS) || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}
export function isAdminUser(env, user) {
  return !!user && (user.is_admin === 1 || adminEmails(env).includes(String(user.email || '').toLowerCase()));
}
