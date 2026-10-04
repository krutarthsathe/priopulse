import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { CallError } from './call-config.js';

const COOKIE = 'priopulse-call-access';
const digest = value => createHash('sha256').update(value).digest();
const signature = (value, secret) => createHmac('sha256', secret).update(`priopulse-calls:${value}`).digest('hex');
export const isPasscode = (value, secret) => typeof secret === 'string' && secret.length > 0 && typeof value === 'string' && value.length <= 256 && timingSafeEqual(digest(value), digest(secret));

export function accessCookie(secret, production, now = Date.now()) {
  const expires = String(Math.floor(now / 1000) + 8 * 60 * 60);
  return `${COOKIE}=${expires}.${signature(expires, secret)}; Path=/api/calls; HttpOnly; SameSite=Strict; Max-Age=28800${production ? '; Secure' : ''}`;
}
export const clearAccessCookie = production => `${COOKIE}=; Path=/api/calls; HttpOnly; SameSite=Strict; Max-Age=0${production ? '; Secure' : ''}`;

export function requireAccess(request, env, now = Date.now()) {
  if (!env.ELEVENLABS_API_KEY) throw new CallError(503, 'Phone follow-ups need server configuration.');
  const token = (request.headers.get('cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  const [expires, sig] = (token || '').split('.');
  if (!env.ELEVENLABS_API_KEY || !/^\d+$/.test(expires || '') || !/^[a-f0-9]{64}$/.test(sig || '') || Number(expires) <= Math.floor(now / 1000) || Number(expires) > Math.floor(now / 1000) + 28800 || !timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(signature(expires, env.ELEVENLABS_API_KEY), 'hex'))) throw new CallError(401, 'Refresh the page to initialize demo phone follow-ups.');
}
export function requireSameOrigin(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new CallError(403, 'Open phone follow-ups from this app to continue.');
}

export function verifyWebhook(raw, header, secret, now = Date.now()) {
  if (!secret || !header) return false;
  const parts = header.split(',').map(part => part.trim());
  const timestamp = parts.find(part => part.startsWith('t='))?.slice(2);
  const signatures = parts.filter(part => part.startsWith('v0=')).map(part => part.slice(3));
  if (!/^\d+$/.test(timestamp || '') || Number(timestamp) * 1000 < now - 30 * 60 * 1000 || Number(timestamp) * 1000 > now + 5 * 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest();
  return signatures.some(sig => /^[a-f0-9]{64}$/.test(sig) && timingSafeEqual(Buffer.from(sig, 'hex'), expected));
}
