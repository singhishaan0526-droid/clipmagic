/**
 * Clip Magic — Keyframe Animation & Interpolation Feature
 * frontend/src/features/keyframes.ts
 */

import { Clip, ClipTransform, EasingType, KeyframeData } from '../types/clip';
import { clamp } from '../core/timeline-engine';

/**
 * Calculates easing progress between 0 and 1.
 */
export function applyEasing(ratio: number, easing: EasingType = 'linear'): number {
    const r = clamp(ratio, 0, 1);
    switch (easing) {
        case 'ease-in':
            return r * r;
        case 'ease-out':
            return r * (2 - r);
        case 'ease-in-out':
            return r < 0.5 ? 2 * r * r : -1 + (4 - 2 * r) * r;
        case 'linear':
        default:
            return r;
    }
}

/**
 * Evaluates the animated value of a property at a specific local time offset.
 */
export function valueAt(
    keyframes: KeyframeData[] | undefined,
    property: string,
    time: number,
    defaultValue: number
): number {
    if (!keyframes || keyframes.length === 0) return defaultValue;

    const propKfs = keyframes
        .filter(k => k.property === property)
        .sort((a, b) => a.time - b.time);

    if (propKfs.length === 0) return defaultValue;
    if (time <= propKfs[0].time) return propKfs[0].value;
    if (time >= propKfs[propKfs.length - 1].time) return propKfs[propKfs.length - 1].value;

    for (let i = 0; i < propKfs.length - 1; i++) {
        const kfA = propKfs[i];
        const kfB = propKfs[i + 1];

        if (time >= kfA.time && time <= kfB.time) {
            const timeSpan = kfB.time - kfA.time;
            if (timeSpan <= 0.0001) return kfA.value;
            const rawRatio = (time - kfA.time) / timeSpan;
            const easedRatio = applyEasing(rawRatio, kfB.easing || 'linear');
            return kfA.value + (kfB.value - kfA.value) * easedRatio;
        }
    }

    return defaultValue;
}

/**
 * Evaluates full animated transform of a clip at a local timestamp.
 */
export function evaluateClipAnimation(clip: Clip, localTime: number): ClipTransform {
    const kfs = clip.keyframes || [];

    return {
        x: valueAt(kfs, 'x', localTime, 50),
        y: valueAt(kfs, 'y', localTime, 50),
        scale: valueAt(kfs, 'scale', localTime, 100),
        rotation: valueAt(kfs, 'rotation', localTime, 0),
        opacity: valueAt(kfs, 'opacity', localTime, 100)
    };
}

/**
 * Returns sorted unique keyframe timestamps for a clip.
 */
export function getClipKeyframeTimes(clip: Clip): number[] {
    const kfs = clip.keyframes || [];
    const set = new Set<number>();
    kfs.forEach(k => {
        if (typeof k.time === 'number') {
            set.add(Number(k.time.toFixed(2)));
        }
    });
    return Array.from(set).sort((a, b) => a - b);
}

/**
 * Adds or updates a keyframe at a specified local time.
 */
export function upsertKeyframe(
    clip: Clip,
    time: number,
    property: string,
    value: number,
    easing: EasingType = 'linear'
): void {
    if (!clip.keyframes) clip.keyframes = [];
    const t = Number(time.toFixed(2));
    const idx = clip.keyframes.findIndex(k => k.property === property && Math.abs(k.time - t) < 0.04);

    if (idx !== -1) {
        clip.keyframes[idx].value = value;
        clip.keyframes[idx].easing = easing;
    } else {
        clip.keyframes.push({ time: t, property, value, easing });
    }
}

/**
 * Deletes keyframe(s) at a specified local time.
 */
export function removeKeyframeAtTime(clip: Clip, time: number, property?: string): boolean {
    if (!clip.keyframes || clip.keyframes.length === 0) return false;
    const initialLen = clip.keyframes.length;

    clip.keyframes = clip.keyframes.filter(k => {
        const timeMatch = Math.abs(k.time - time) < 0.05;
        if (!timeMatch) return true;
        if (property) return k.property !== property;
        return false;
    });

    return clip.keyframes.length < initialLen;
}

export const KeyframeEngine = {
    applyEasing,
    valueAt,
    evaluateClipAnimation,
    getClipKeyframeTimes,
    upsertKeyframe,
    removeKeyframeAtTime
};

