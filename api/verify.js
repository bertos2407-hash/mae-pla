export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validCodes = (process.env.VALID_CODES || '')
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);

    const valid = validCodes.includes(code.trim().toUpperCase());

    return new Response(JSON.stringify({ valid }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ valid: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
