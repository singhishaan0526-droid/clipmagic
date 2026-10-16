/**
 * Clip Magic — Professional Speed Ramping & Velocity Engine
 * frontend/src/features/speed.ts
 *
 * Implements monotonic cubic Hermite interpolation (PCHIP / Fritsch-Carlson),
 * numerical integration for accurate output duration (integral of 1/v(t) dt),
 * forward/inverse time mapping, CapCut-inspired velocity presets,
 * and FFmpeg filtergraph generation for video & audio export.
 */

import { BaseClip, SpeedCurveData, SpeedCurvePoint, SpeedPresetType } from '../types/clip';

export const MIN_SPEED = 0.25;
export const MAX_SPEED = 4.0;
export const NUM_INTEGRATION_STEPS = 200;

const clamp = (val: number, min: number, max: number): number => Math.min(max, Math.max(min, val));

export const SPEED_PRESET_CONFIGS: Record<SpeedPresetType, { name: string; icon: string; description: string; points: SpeedCurvePoint[] }> = {
    montage: {
        name: 'Montage',
        icon: '⚡',
        description: 'Alternating fast action and slow motion beats',
        points: [
            { t: 0.0, v: 1.0 },
            { t: 0.2, v: 2.8 },
            { t: 0.4, v: 0.5 },
            { t: 0.6, v: 3.0 },
            { t: 0.8, v: 0.5 },
            { t: 1.0, v: 1.0 }
        ]
    },
    hero: {
        name: 'Hero',
        icon: '🦸',
        description: 'Normal intro, cinematic slow-mo impact, smooth recovery',
        points: [
            { t: 0.0, v: 1.0 },
            { t: 0.28, v: 1.0 },
            { t: 0.5, v: 0.35 },
            { t: 0.72, v: 1.0 },
            { t: 1.0, v: 1.0 }
        ]
    },
    bullet: {
        name: 'Bullet',
        icon: '🎯',
        description: 'High-velocity rush with a dramatic freeze slow-down',
        points: [
            { t: 0.0, v: 3.2 },
            { t: 0.3, v: 3.0 },
            { t: 0.5, v: 0.3 },
            { t: 0.7, v: 3.0 },
            { t: 1.0, v: 3.2 }
        ]
    },
    'flash-in': {
        name: 'Flash In',
        icon: '🏎️',
        description: 'Gradual slow buildup accelerating into rapid hyper-speed',
        points: [
            { t: 0.0, v: 0.4 },
            { t: 0.3, v: 0.8 },
            { t: 0.7, v: 2.4 },
            { t: 1.0, v: 3.6 }
        ]
    },
    'flash-out': {
        name: 'Flash Out',
        icon: '🛑',
        description: 'Explosive fast opening decelerating into silky slow motion',
        points: [
            { t: 0.0, v: 3.6 },
            { t: 0.3, v: 2.4 },
            { t: 0.7, v: 0.8 },
            { t: 1.0, v: 0.4 }
        ]
    },
    'smooth-slow': {
        name: 'Smooth Slow',
        icon: '🌊',
        description: 'Gentle, seamless dip into slow motion and back',
        points: [
            { t: 0.0, v: 1.0 },
            { t: 0.25, v: 0.75 },
            { t: 0.5, v: 0.4 },
            { t: 0.75, v: 0.75 },
            { t: 1.0, v: 1.0 }
        ]
    },
    custom: {
        name: 'Custom',
        icon: '📈',
        description: 'Fully customizable multi-point velocity curve',
        points: [
            { t: 0.0, v: 1.0 },
            { t: 0.25, v: 1.0 },
            { t: 0.5, v: 1.0 },
            { t: 0.75, v: 1.0 },
            { t: 1.0, v: 1.0 }
        ]
    }
};

/**
 * Validates and normalizes curve data points to guarantee sorting, bounds,
 * and positive non-zero speeds.
 */
export function sanitizeCurveData(curve?: Partial<SpeedCurveData> | null): SpeedCurveData {
    if (!curve || !Array.isArray(curve.points) || curve.points.length < 2) {
        return createPresetCurve('custom');
    }

    const preset = (curve.preset && SPEED_PRESET_CONFIGS[curve.preset]) ? curve.preset : 'custom';
    const smoothSlowMotion = !!curve.smoothSlowMotion;

    // Filter, clamp, and sort points
    const rawPoints = curve.points
        .filter(p => Number.isFinite(p.t) && Number.isFinite(p.v))
        .map(p => ({
            t: Math.min(1.0, Math.max(0.0, Number(p.t))),
            v: Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(p.v)))
        }))
        .sort((a, b) => a.t - b.t);

    if (rawPoints.length < 2) {
        return createPresetCurve('custom');
    }

    // Ensure boundary points at t=0 and t=1
    if (rawPoints[0].t > 0.001) {
        rawPoints.unshift({ t: 0.0, v: rawPoints[0].v });
    } else {
        rawPoints[0].t = 0.0;
    }

    const lastIdx = rawPoints.length - 1;
    if (rawPoints[lastIdx].t < 0.999) {
        rawPoints.push({ t: 1.0, v: rawPoints[lastIdx].v });
    } else {
        rawPoints[lastIdx].t = 1.0;
    }

    // Deduplicate any points with nearly identical t coordinates
    const uniquePoints: SpeedCurvePoint[] = [rawPoints[0]];
    for (let i = 1; i < rawPoints.length; i++) {
        const prev = uniquePoints[uniquePoints.length - 1];
        const curr = rawPoints[i];
        if (curr.t - prev.t > 0.005 || i === rawPoints.length - 1) {
            uniquePoints.push(curr);
        }
    }

    return {
        preset,
        points: uniquePoints,
        smoothSlowMotion
    };
}

/**
 * Creates a fresh clone of a speed ramp preset curve.
 */
export function createPresetCurve(preset: SpeedPresetType): SpeedCurveData {
    const config = SPEED_PRESET_CONFIGS[preset] || SPEED_PRESET_CONFIGS.custom;
    return {
        preset,
        points: config.points.map(p => ({ ...p })),
        smoothSlowMotion: false
    };
}

/**
 * Prepares monotonic cubic Hermite derivatives (Fritsch-Carlson algorithm)
 * ensuring that the curve never overshoots control point bounds and has zero
 * oscillations or negative values.
 */
export function computeMonotonicCubicDerivatives(points: SpeedCurvePoint[]): number[] {
    const n = points.length;
    if (n < 2) return [0];

    const deltas: number[] = [];
    const slopes: number[] = [];

    for (let i = 0; i < n - 1; i++) {
        const dt = points[i + 1].t - points[i].t;
        const dv = points[i + 1].v - points[i].v;
        deltas.push(dt <= 0.00001 ? 0 : dv / dt);
    }

    // Endpoint derivatives
    slopes.push(deltas[0]);

    // Internal derivatives
    for (let i = 1; i < n - 1; i++) {
        const d0 = deltas[i - 1];
        const d1 = deltas[i];

        if (d0 * d1 <= 0) {
            slopes.push(0);
        } else {
            // Harmonic mean preserves shape
            slopes.push((2 * d0 * d1) / (d0 + d1));
        }
    }

    slopes.push(deltas[deltas.length - 1]);

    // Fritsch-Carlson monotonicity check & adjustment
    for (let i = 0; i < n - 1; i++) {
        const delta = deltas[i];
        if (Math.abs(delta) < 0.000001) {
            slopes[i] = 0;
            slopes[i + 1] = 0;
            continue;
        }

        const alpha = slopes[i] / delta;
        const beta = slopes[i + 1] / delta;
        const distSq = alpha * alpha + beta * beta;

        if (distSq > 9.0) {
            const tau = 3.0 / Math.sqrt(distSq);
            slopes[i] = tau * alpha * delta;
            slopes[i + 1] = tau * beta * delta;
        }
    }

    return slopes;
}

export function evaluateSpeedAtNormalizedTime(
    points: SpeedCurvePoint[],
    arg2?: number[] | number | string,
    arg3?: number
): number {
    if (!Array.isArray(points) || points.length === 0) return 1.0;
    if (points.length === 1) return clamp(points[0].v, MIN_SPEED, MAX_SPEED);

    let derivatives: number[];
    let u: number;

    if (typeof arg2 === 'number') {
        u = arg2;
        derivatives = computeMonotonicCubicDerivatives(points);
    } else if (Array.isArray(arg2)) {
        derivatives = arg2;
        u = typeof arg3 === 'number' ? arg3 : 0;
    } else {
        u = typeof arg3 === 'number' ? arg3 : 0;
        derivatives = computeMonotonicCubicDerivatives(points);
    }

    const clampedU = Math.min(1.0, Math.max(0.0, u));
    const n = points.length;

    if (clampedU <= points[0].t) return clamp(points[0].v, MIN_SPEED, MAX_SPEED);
    if (clampedU >= points[n - 1].t) return clamp(points[n - 1].v, MIN_SPEED, MAX_SPEED);

    // Locate the segment
    let i = 0;
    for (let k = 0; k < n - 1; k++) {
        if (clampedU >= points[k].t && clampedU <= points[k + 1].t) {
            i = k;
            break;
        }
    }

    const p0 = points[i];
    const p1 = points[i + 1];
    const h = p1.t - p0.t;
    if (h <= 0.00001) return p0.v;

    const t = (clampedU - p0.t) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const d0 = derivatives[i];
    const d1 = derivatives[i + 1];

    const val = h00 * p0.v + h10 * h * d0 + h01 * p1.v + h11 * h * d1;
    return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(val.toFixed(4))));
}

/**
 * Numerical Integration Table Cache:
 * Maps normalized source time u -> cumulative output time ratio.
 */
export interface SpeedIntegrationTable {
    points: SpeedCurvePoint[];
    derivatives: number[];
    steps: number;
    uSamples: Float64Array;
    speedSamples: Float64Array;
    cumulativeOutputRatios: Float64Array; // Integral from 0 to u of (1/v) du
    totalOutputRatio: number;             // Integral from 0 to 1 of (1/v) du
}

export function buildSpeedIntegrationTable(
    curveData: SpeedCurveData,
    steps = NUM_INTEGRATION_STEPS
): SpeedIntegrationTable {
    const clean = sanitizeCurveData(curveData);
    const points = clean.points;
    const derivatives = computeMonotonicCubicDerivatives(points);

    const uSamples = new Float64Array(steps + 1);
    const speedSamples = new Float64Array(steps + 1);
    const cumulativeOutputRatios = new Float64Array(steps + 1);

    const dt = 1.0 / steps;
    let accumulated = 0.0;
    cumulativeOutputRatios[0] = 0.0;

    for (let i = 0; i <= steps; i++) {
        const u = i * dt;
        uSamples[i] = u;
        const v = evaluateSpeedAtNormalizedTime(points, derivatives, u);
        speedSamples[i] = v;

        if (i > 0) {
            // Trapezoidal rule integration step of (1 / v)
            const prevInv = 1.0 / speedSamples[i - 1];
            const currInv = 1.0 / v;
            accumulated += 0.5 * (prevInv + currInv) * dt;
            cumulativeOutputRatios[i] = accumulated;
        }
    }

    return {
        points,
        derivatives,
        steps,
        uSamples,
        speedSamples,
        cumulativeOutputRatios,
        totalOutputRatio: accumulated
    };
}

/**
 * Calculates the exact active output duration of a clip accounting for its
 * speed settings (constant speed or variable speed curve).
 */
export function calculateOutputDuration(clip?: BaseClip | null): number {
    if (!clip) return 0.05;
    const trimStart = Math.max(0, Number(clip.trimStart) || 0);
    const srcDurFallback = Math.max(0.1, (Number(clip.duration) || 10.0));
    const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + srcDurFallback));
    const sourceDuration = Math.max(0.1, trimEnd - trimStart);

    if (clip.speedMode === 'curve' && clip.speedCurve && Array.isArray(clip.speedCurve.points)) {
        const table = buildSpeedIntegrationTable(clip.speedCurve);
        const outputDuration = sourceDuration * table.totalOutputRatio;
        return Math.max(0.1, Number(outputDuration.toFixed(3)));
    }

    const constantSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
    return Math.max(0.1, Number((sourceDuration / constantSpeed).toFixed(3)));
}

/**
 * Converts local timeline output seconds (0 <= t_out <= outputDuration)
 * to local source seconds (0 <= t_src <= sourceDuration) within the clip.
 */
export function outputTimeToSourceLocal(
    clip?: BaseClip | null,
    outputLocalTime: number = 0
): number {
    if (!clip) return 0;
    const trimStart = Math.max(0, Number(clip.trimStart) || 0);
    const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + 10.0));
    const sourceDuration = Math.max(0.1, trimEnd - trimStart);
    const outputDuration = calculateOutputDuration(clip);

    if (outputLocalTime <= 0) return 0;
    if (outputLocalTime >= outputDuration) return sourceDuration;

    if (clip.speedMode === 'curve' && clip.speedCurve) {
        const table = buildSpeedIntegrationTable(clip.speedCurve);
        const targetOutputRatio = outputLocalTime / sourceDuration;

        // Binary search in monotonically increasing cumulative output ratios
        let low = 0;
        let high = table.steps;
        while (low <= high) {
            const mid = (low + high) >> 1;
            if (table.cumulativeOutputRatios[mid] < targetOutputRatio) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        const idx = Math.max(0, Math.min(table.steps - 1, high));
        const r0 = table.cumulativeOutputRatios[idx];
        const r1 = table.cumulativeOutputRatios[idx + 1];
        const dr = r1 - r0;

        let u = table.uSamples[idx];
        if (dr > 0.000001) {
            const frac = (targetOutputRatio - r0) / dr;
            u += frac * (table.uSamples[idx + 1] - table.uSamples[idx]);
        }

        return Math.min(sourceDuration, Math.max(0, u * sourceDuration));
    }

    const constantSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
    return Math.min(sourceDuration, Math.max(0, outputLocalTime * constantSpeed));
}

/**
 * Converts local source seconds (0 <= t_src <= sourceDuration)
 * to local timeline output seconds (0 <= t_out <= outputDuration).
 */
export function sourceTimeToOutputLocal(
    clip?: BaseClip | null,
    sourceLocalTime: number = 0
): number {
    if (!clip) return 0;
    const trimStart = Math.max(0, Number(clip.trimStart) || 0);
    const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + 10.0));
    const sourceDuration = Math.max(0.1, trimEnd - trimStart);

    if (sourceLocalTime <= 0) return 0;
    if (sourceLocalTime >= sourceDuration) return calculateOutputDuration(clip);

    if (clip.speedMode === 'curve' && clip.speedCurve) {
        const table = buildSpeedIntegrationTable(clip.speedCurve);
        const u = Math.min(1.0, Math.max(0.0, sourceLocalTime / sourceDuration));

        const exactIndex = u * table.steps;
        const idx = Math.min(table.steps - 1, Math.floor(exactIndex));
        const frac = exactIndex - idx;

        const r0 = table.cumulativeOutputRatios[idx];
        const r1 = table.cumulativeOutputRatios[idx + 1];
        const ratio = r0 + frac * (r1 - r0);

        return Number((ratio * sourceDuration).toFixed(3));
    }

    const constantSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
    return Number((sourceLocalTime / constantSpeed).toFixed(3));
}

/**
 * Returns instantaneous speed multiplier at a given source timestamp.
 */
export function speedAtSourceLocal(clip?: BaseClip | null, sourceLocalTime: number = 0): number {
    if (!clip) return 1.0;
    if (clip.speedMode === 'curve' && clip.speedCurve) {
        const trimStart = Math.max(0, Number(clip.trimStart) || 0);
        const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + 10.0));
        const sourceDuration = Math.max(0.1, trimEnd - trimStart);
        const u = Math.min(1.0, Math.max(0.0, sourceLocalTime / sourceDuration));

        const clean = sanitizeCurveData(clip.speedCurve);
        const derivatives = computeMonotonicCubicDerivatives(clean.points);
        return evaluateSpeedAtNormalizedTime(clean.points, derivatives, u);
    }

    return Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
}

/**
 * Generates the FFmpeg video filter for speed ramping.
 * Uses piecewise setpts expression for variable speed or constant setpts multiplier.
 */
export function generateFfmpegVideoSpeedFilter(
    clip: BaseClip,
    targetFps = 30
): { filterChain: string[]; outputDuration: number } {
    const trimStart = Math.max(0, Number(clip.trimStart) || 0);
    const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + 10.0));
    const sourceDuration = Math.max(0.1, trimEnd - trimStart);
    const outputDuration = calculateOutputDuration(clip);

    const filterChain: string[] = [];

    if (clip.speedMode === 'curve' && clip.speedCurve) {
        const table = buildSpeedIntegrationTable(clip.speedCurve);
        const numSegments = 16; // 16 piecewise segments provide frame-accurate sync
        const segStep = Math.floor(table.steps / numSegments);

        // Build nested if(lt(T, ...)) piecewise linear mapping of T (source seconds) -> outSec
        const pieces: { tSrc: number; tOut: number; rate: number }[] = [];
        for (let s = 0; s <= numSegments; s++) {
            const idx = Math.min(table.steps, s * segStep);
            const tSrc = table.uSamples[idx] * sourceDuration;
            const tOut = table.cumulativeOutputRatios[idx] * sourceDuration;
            pieces.push({ tSrc, tOut, rate: 1.0 });
        }

        // Calculate segment rates (dt_out / dt_src = 1 / v_avg)
        for (let s = 0; s < pieces.length - 1; s++) {
            const dtSrc = pieces[s + 1].tSrc - pieces[s].tSrc;
            const dtOut = pieces[s + 1].tOut - pieces[s].tOut;
            pieces[s].rate = dtSrc > 0.0001 ? dtOut / dtSrc : 1.0;
        }

        let ptsExpr = `${pieces[pieces.length - 1].tOut.toFixed(3)}/TB`;
        for (let s = pieces.length - 2; s >= 0; s--) {
            const p0 = pieces[s];
            const p1 = pieces[s + 1];
            const tBound = p1.tSrc.toFixed(3);
            const lerp = `(${p0.tOut.toFixed(3)}+${p0.rate.toFixed(4)}*(T-${p0.tSrc.toFixed(3)}))/TB`;
            ptsExpr = `if(lt(T,${tBound}),${lerp},${ptsExpr})`;
        }

        filterChain.push(`setpts='${ptsExpr}'`);

        // Frame rate normalization and optional smooth slow motion
        if (clip.speedCurve.smoothSlowMotion) {
            filterChain.push(`tblend=all_mode=average`);
        }
        filterChain.push(`fps=${targetFps}`);

        return { filterChain, outputDuration };
    }

    const constantSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
    const ptsMultiplier = (1.0 / constantSpeed).toFixed(4);
    filterChain.push(`setpts=${ptsMultiplier}*(PTS-STARTPTS)`);
    filterChain.push(`fps=${targetFps}`);

    return { filterChain, outputDuration };
}

/**
 * Builds FFmpeg audio filter for speed ramping.
 * Uses chained atempo filters (or silence if muted).
 */
export function generateFfmpegAudioSpeedFilter(
    clip: BaseClip
): { filterStr: string; isMuted: boolean; outputDuration: number } {
    const outputDuration = calculateOutputDuration(clip);

    if (clip.speedAudioMute) {
        return {
            filterStr: `aevalsrc=0:d=${outputDuration.toFixed(3)}`,
            isMuted: true,
            outputDuration
        };
    }

    let avgSpeed = 1.0;
    if (clip.speedMode === 'curve' && clip.speedCurve) {
        const trimStart = Math.max(0, Number(clip.trimStart) || 0);
        const trimEnd = Math.max(trimStart + 0.1, Number(clip.trimEnd) || (trimStart + 10.0));
        const srcDur = Math.max(0.1, trimEnd - trimStart);
        avgSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, srcDur / outputDuration));
    } else {
        avgSpeed = Math.min(MAX_SPEED, Math.max(MIN_SPEED, Number(clip.speed) || 1.0));
    }

    // atempo in FFmpeg supports [0.5, 2.0]. Chain filters for values outside this range.
    const filters: string[] = [];
    let rem = avgSpeed;

    while (rem > 2.0) {
        filters.push('atempo=2.0');
        rem /= 2.0;
    }
    while (rem < 0.5) {
        filters.push('atempo=0.5');
        rem /= 0.5;
    }
    filters.push(`atempo=${rem.toFixed(4)}`);

    return {
        filterStr: filters.join(','),
        isMuted: false,
        outputDuration
    };
}

export const SpeedEngine = {
    MIN_SPEED,
    MAX_SPEED,
    SPEED_PRESET_CONFIGS,
    sanitizeCurveData,
    createPresetCurve,
    computeMonotonicCubicDerivatives,
    evaluateSpeedAtNormalizedTime,
    buildSpeedIntegrationTable,
    calculateOutputDuration,
    outputTimeToSourceLocal,
    sourceTimeToOutputLocal,
    speedAtSourceLocal,
    generateFfmpegVideoSpeedFilter,
    generateFfmpegAudioSpeedFilter
};
