const MAX_TRANSCRIPT_LENGTH = 50000;

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

function normalizeSubtitles(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => item && typeof item.text === 'string')
    .map(item => {
      const start = Math.max(0, Number(item.start) || 0);
      const end = Math.max(start + 0.1, Number(item.end) || start + 1.5);
      const normalized = {
        text: item.text.trim().slice(0, 500),
        start,
        end
      };
      if (Array.isArray(item.words)) {
        normalized.words = item.words
          .filter(w => w && (typeof w.word === 'string' || typeof w.text === 'string'))
          .map(w => ({
            word: (w.word || w.text).trim(),
            start: Math.max(start, Number(w.start) || start),
            end: Math.max(start + 0.05, Number(w.end) || end)
          }))
          .filter(w => w.word);
      }
      return normalized;
    })
    .filter(item => item.text && item.end > item.start)
    .slice(0, 1000);
}

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview'
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

      const targetLang = String(body.language || 'hinglish').toLowerCase();
      let langInstruction = '';
      if (targetLang === 'hinglish') {
        langInstruction = 'CRITICAL LANGUAGE RULE: Transcribe the sung lyrics / vocals in HINGLISH (Roman Hindi / Urdu written using English letters/alphabet script, e.g. "Tum hi ho ab tum hi ho", "Kesariya tera ishq hai piya", "Apna bana le piya", "Dil diyan gallan", "Channa ve ghar aa jaa ve"). Use clean, readable Latin English spelling for Indian/Bollywood lyrics so they are easy for everyone to sing along to.';
      } else if (targetLang === 'hindi') {
        langInstruction = 'CRITICAL LANGUAGE RULE: Transcribe the sung lyrics in pure HINDI using Devanagari script (e.g. "तुम ही हो अब तुम ही हो", "केसरिया तेरा इश्क़ है पिया", "अपना बना ले पिया", "दिल दियां गल्लां").';
      } else if (targetLang === 'english') {
        langInstruction = 'CRITICAL LANGUAGE RULE: Transcribe the sung lyrics in ENGLISH. If the song is in English, transcribe verbatim. If in another language, transcribe and translate the sung lines into clean English lyric phrases.';
      } else {
        langInstruction = 'Transcribe in the original spoken/sung language and script of the audio.';
      }

      const prompt = [
        'You are an expert audio, vocal, and song lyric transcriber with word-level synchronization for animated karaoke captions.',
        'Listen closely to this audio recording (custom added music or video audio).',
        'Accurately transcribe the exact sung lyrics or spoken words with precise start and end timestamps in seconds.',
        langInstruction,
        'Break long sentences into natural, short phrases (3 to 6 words per line) ideal for karaoke video subtitle overlays.',
        'Return ONLY valid JSON in this exact structure:',
        '{"lyrics":[{"text":"transcribed lyric line","start":0.0,"end":3.2,"words":[{"word":"word1","start":0.0,"end":0.6},{"word":"word2","start":0.6,"end":1.2}]}]}',
        'Requirements:',
        '- Do not hallucinate or make up lyrics. Only transcribe what is actually sung or spoken.',
        '- Timestamps must be in chronological seconds (e.g., 0.5, 2.3).',
        '- Make sure every segment has a valid "text", "start", and "end" where end > start.'
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

