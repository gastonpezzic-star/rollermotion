// RollerMotion — Asistente IA (proxy autenticado a Claude / Anthropic).
// La API key de Anthropic vive SOLO como variable de entorno en Netlify (ANTHROPIC_API_KEY);
// nunca está en el código público. Esta función valida que quien llama sea un usuario
// logueado de RollerMotion (token de Supabase) antes de gastar saldo de IA.

const SUPA_URL  = 'https://ybqnmoqwaoecyodzgach.supabase.co';
// anon key (pública por diseño; igual que en index.html — sirve solo para validar el token)
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicW5tb3F3YW9lY3lvZHpnYWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MzQ5NDQsImV4cCI6MjA5MTAxMDk0NH0.0FPhl__EwKXZN0oTWnavt9Z3TkGpH_NWwjiYUGdxCkQ';

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'content-type': 'application/json' } });
}

export default async (req) => {
  if(req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const KEY = process.env.ANTHROPIC_API_KEY;
  if(!KEY) return json({ error: 'El asistente todavía no está configurado (falta la clave de IA en Netlify).' }, 503);

  let body;
  try { body = await req.json(); } catch(e){ return json({ error: 'Pedido inválido' }, 400); }

  // ── Autenticación: solo usuarios logueados de RollerMotion ──
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if(!token) return json({ error: 'No autenticado' }, 401);
  try {
    const u = await fetch(SUPA_URL + '/auth/v1/user', { headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + token } });
    if(!u.ok) return json({ error: 'Sesión inválida. Cerrá sesión y volvé a entrar.' }, 401);
  } catch(e){ return json({ error: 'No se pudo validar la sesión' }, 502); }

  // ── Llamada a Claude (Sonnet) ──
  const system   = typeof body.system === 'string' ? body.system : '';
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if(!messages.length) return json({ error: 'Sin mensaje' }, 400);
  const max_tokens = Math.min(parseInt(body.max_tokens) || 2000, 4000);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens, system, messages }),
    });
    const data = await r.json();
    if(!r.ok){
      const msg = (data && data.error && data.error.message) || 'Error de la IA';
      // 401 desde Anthropic = clave mal cargada → lo mostramos como problema de config (502), no como "no autenticado"
      return json({ error: msg }, r.status === 401 ? 502 : r.status);
    }
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return json({ text, usage: data.usage });
  } catch(e){
    return json({ error: 'No se pudo contactar a la IA' }, 502);
  }
};
