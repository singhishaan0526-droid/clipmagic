const MAX_TRANSCRIPT_LENGTH = 50000;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function normalizeSubtitles(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => item && typeof item.text === 'string')
    .map(item => ({
      text: item.text.trim().slice(0, 500),
      start: Math.max(0, Number(item.start) || 0),
      end: Math.max(0.1, Number(item.end) || 0.1)
    }))
    .filter(item => item.text && item.end > item.start)
    .slice(0, 1000);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
  if (!process.env.GEMINI_API_KEY) return json(res, 503, { error: 'Gemini is not configured on this deployment.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (body.action !== 'subtitles') return json(res, 400, { error: 'Unsupported Gemini action.' });
    const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';
    if (!transcript) return json(res, 400, { error: 'A transcript is required.' });
    if (transcript.length > MAX_TRANSCRIPT_LENGTH) return json(res, 413, { error: 'Transcript is too large.' });

    const prompt = [
      'Convert this transcript into subtitle segments for a video editor.',
      'Return JSON only in this exact shape: {"subtitles":[{"text":"...","start":0,"end":2.5}]}.',
      'Use seconds, preserve the original wording, split naturally into short readable segments, and make each end greater than start.',
      `Transcript:\n${transcript}`
    ].join('\n\n');

    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(process.env.GEMINI_API_KEY),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      }
    );
    const payload = await upstream.json();
    if (!upstream.ok) return json(res, 502, { error: 'Gemini request failed.' });
    const raw = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim());
    return json(res, 200, { subtitles: normalizeSubtitles(parsed.subtitles) });
  } catch (error) {
    console.error('[Gemini]', error.message);
    return json(res, 500, { error: 'Unable to generate subtitles.' });
  }
};
