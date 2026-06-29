export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Request body received:', JSON.stringify(body).substring(0, 100));

    if (!body || !body.messages) {
      return res.status(400).json({ error: 'Missing messages in request body' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-6',
        max_tokens: body.max_tokens || 4000,
        system: body.system || '',
        messages: body.messages,
      })
    });

    const text = await response.text();
    console.log('Anthropic status:', response.status);
    console.log('Anthropic response:', text.substring(0, 300));

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      return res.status(200).json({ error: 'Parse error', raw: text.substring(0, 500) });
    }

  } catch (err) {
    console.error('Function error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
