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

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.5-flash'
];

async function callGemini(contents, generationConfig = {}) {
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig })
      });
      const data = await resp.json();
      if (resp.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      lastError = data?.error?.message || `Model ${model} failed`;
      console.warn(`[Gemini] ${model} attempt failed: ${lastError}. Trying next model...`);
    } catch (e) {
      lastError = e.message;
    }
  }
  throw new Error(lastError || 'All Gemini models were unavailable. Please try again.');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
  if (!process.env.GEMINI_API_KEY) return json(res, 503, { error: 'Gemini is not configured on this deployment.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (body.action === 'transcribe_audio') {
      const audioBase64 = body.audio;
      const mimeType = body.mimeType || 'audio/wav';
      if (!audioBase64) return json(res, 400, { error: 'Audio data is required.' });

      const prompt = [
        'You are an expert audio, vocal, and song lyric transcriber.',
        'Listen closely to this audio recording extracted from the video.',
        'Accurately transcribe the exact spoken words or sung lyrics with precise start and end timestamps in seconds.',
        'Break long sentences into natural, short phrases/lyric lines ideal for karaoke video subtitle overlays.',
        'Return ONLY valid JSON in this exact structure:',
        '{"lyrics":[{"text":"transcribed words here","start":0.0,"end":3.2}]}',
        'Requirements:',
        '- Do not hallucinate or make up lyrics. Only transcribe what is actually sung or spoken in the audio.',
        '- Ensure timestamps (start and end) are in seconds and in chronological order.'
      ].join('\n\n');

      const raw = await callGemini(
        [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: audioBase64 } }] }],
        { temperature: 0.1, responseMimeType: 'application/json' }
      );
      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim());
      const lyrics = normalizeSubtitles(parsed.lyrics || parsed.subtitles || []);
      return json(res, 200, { lyrics });
    } else if (body.action === 'subtitles') {
      const transcript = typeof body.transcript === 'string' ? body.transcript.trim() : '';
      if (!transcript) return json(res, 400, { error: 'A transcript is required.' });
      if (transcript.length > MAX_TRANSCRIPT_LENGTH) return json(res, 413, { error: 'Transcript is too large.' });

      const prompt = [
        'Convert this transcript into subtitle segments for a video editor.',
        'Return JSON only in this exact shape: {"subtitles":[{"text":"...","start":0,"end":2.5}]}.',
        'Use seconds, preserve the original wording, split naturally into short readable segments, and make each end greater than start.',
        `Transcript:\n${transcript}`
      ].join('\n\n');

      const raw = await callGemini(
        [{ parts: [{ text: prompt }] }],
        { temperature: 0.2, responseMimeType: 'application/json' }
      );
      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim());
      return json(res, 200, { subtitles: normalizeSubtitles(parsed.subtitles) });
    } else if (body.prompt) {
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (!prompt) return json(res, 400, { error: 'Prompt is required' });

      const text = await callGemini([{ parts: [{ text: prompt }] }]);
      return json(res, 200, { text });
    } else {
      return json(res, 400, { error: 'Unsupported Gemini action or missing prompt.' });
    }
  } catch (error) {
    console.error('[Gemini]', error.message);
    return json(res, 500, { error: error.message || 'Unable to process Gemini AI request.' });
  }
};

