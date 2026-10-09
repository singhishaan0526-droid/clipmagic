//! clip-magic-music — Rust/WASM Music Processing Engine
//!
//! Build with: wasm-pack build --target web
//! Then import in JS: import init, { analyze_bpm, detect_beats, generate_waveform, sync_cuts } from './pkg/clip_magic_music.js';

use wasm_bindgen::prelude::*;

// ── BPM Analysis ─────────────────────────────────────────────────────────────

/// Analyze audio samples and return BPM using energy-based onset detection
/// and autocorrelation. Mirrors `MusicEngine.analyze_bpm()` in music-engine.js.
///
/// # Parameters
/// - `samples`: raw f32 PCM samples (mono)  
/// - `sample_rate`: audio sample rate (e.g. 44100)
///
/// # Returns
/// Estimated BPM as f32, clamped to [60, 200]
#[wasm_bindgen]
pub fn analyze_bpm(samples: &[f32], sample_rate: u32) -> f32 {
    let frame_size = (sample_rate as usize) / 100; // 10ms frames
    if frame_size == 0 || samples.len() < frame_size * 2 {
        return 120.0;
    }

    // Compute RMS energy per frame
    let energies: Vec<f32> = samples
        .chunks(frame_size)
        .map(|frame| {
            let sum: f32 = frame.iter().map(|s| s * s).sum();
            (sum / frame.len() as f32).sqrt()
        })
        .collect();

    // Onset threshold: 1.5× mean energy
    let mean_energy: f32 = energies.iter().sum::<f32>() / energies.len() as f32;
    let threshold = mean_energy * 1.5;

    // Collect onset times (seconds)
    let frame_dur = 0.01f32; // 10ms
    let mut onsets: Vec<f32> = Vec::new();
    for (i, &e) in energies.iter().enumerate().skip(1) {
        if e > threshold && e > energies[i - 1] {
            onsets.push(i as f32 * frame_dur);
        }
    }

    if onsets.len() < 4 {
        return 120.0;
    }

    // Compute inter-onset intervals and average
    let iois: Vec<f32> = onsets
        .windows(2)
        .take(64)
        .map(|w| w[1] - w[0])
        .collect();

    let avg_ioi: f32 = iois.iter().sum::<f32>() / iois.len() as f32;
    if avg_ioi <= 0.0 {
        return 120.0;
    }

    let bpm = 60.0 / avg_ioi;
    bpm.clamp(60.0, 200.0)
}

// ── Beat Detection ────────────────────────────────────────────────────────────

/// Detect beat timestamps from audio samples at the given BPM.
/// Returns a Vec<f32> of beat times in seconds.
///
/// # Parameters
/// - `samples`: raw f32 PCM samples (mono)
/// - `sample_rate`: audio sample rate
/// - `bpm`: beats per minute (from analyze_bpm)
#[wasm_bindgen]
pub fn detect_beats(samples: &[f32], sample_rate: u32, bpm: f32) -> Vec<f32> {
    // M5 FIX: reject non-finite, zero, negative, or implausible BPM
    // Previously only `bpm <= 0.0` was rejected; NaN/Infinity slipped through.
    if !bpm.is_finite() || bpm <= 0.0 || bpm > 400.0 || sample_rate == 0 {
        return vec![];
    }

    let duration      = samples.len() as f32 / sample_rate as f32;
    let beat_interval = 60.0 / bpm;

    // beat_interval is finite & > 0 here; this guard is a safety net
    if !beat_interval.is_finite() || beat_interval <= 0.0 {
        return vec![];
    }

    let mut beats = Vec::new();
    let mut t     = 0.0f32;

    while t < duration {
        beats.push((t * 1000.0).round() / 1000.0); // round to ms
        t += beat_interval;
    }

    beats
}


// ── Waveform Generation ───────────────────────────────────────────────────────

/// Generate a normalized waveform for UI visualization.
/// Returns `resolution` amplitude values in range [0, 1].
///
/// # Parameters
/// - `samples`: raw f32 PCM samples (mono)
/// - `resolution`: number of output data points (e.g. 200 for a typical canvas)
#[wasm_bindgen]
pub fn generate_waveform(samples: &[f32], resolution: usize) -> Vec<f32> {
    if resolution == 0 || samples.is_empty() {
        return vec![];
    }

    let block = samples.len() / resolution;
    if block == 0 {
        return samples.iter().map(|s| s.abs()).collect();
    }

    let mut waveform = Vec::with_capacity(resolution);

    for i in 0..resolution {
        let start = i * block;
        let end   = (start + block).min(samples.len());
        let peak  = samples[start..end]
            .iter()
            .map(|s| s.abs())
            .fold(0.0f32, f32::max);
        waveform.push(peak);
    }

    // Normalize to [0, 1]
    let max_val = waveform.iter().cloned().fold(0.0f32, f32::max);
    if max_val > 0.0 {
        waveform.iter_mut().for_each(|v| *v /= max_val);
    }

    waveform
}

// ── Beat-Sync Cut Points ─────────────────────────────────────────────────────

/// Snap edit cut points to the nearest beat timestamp.
///
/// # Parameters
/// - `beat_times`: Vec of beat timestamps (from detect_beats)
/// - `cuts`: Vec of cut timestamps to snap
///
/// # Returns
/// Vec of snapped cut times (same length as `cuts`)
#[wasm_bindgen]
pub fn sync_cuts(beat_times: &[f32], cuts: &[f32]) -> Vec<f32> {
    cuts.iter()
        .map(|&cut| {
            beat_times
                .iter()
                .copied()
                .min_by(|a, b| {
                    (a - cut).abs().partial_cmp(&(b - cut).abs()).unwrap()
                })
                .unwrap_or(cut)
        })
        .collect()
}

// ── RMS Level Meter ──────────────────────────────────────────────────────────

/// Compute RMS (Root Mean Square) volume level of a sample window.
/// Useful for drawing a live level meter in the editor.
#[wasm_bindgen]
pub fn rms_level(samples: &[f32]) -> f32 {
    if samples.is_empty() {
        return 0.0;
    }
    let sum: f32 = samples.iter().map(|s| s * s).sum();
    (sum / samples.len() as f32).sqrt()
}

// ── Startup / Version ────────────────────────────────────────────────────────

/// Return engine version string.
#[wasm_bindgen]
pub fn version() -> String {
    format!("clip-magic-music v{}", env!("CARGO_PKG_VERSION"))
}
