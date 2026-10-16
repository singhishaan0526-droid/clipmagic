/**
 * Clip Magic — Core Timeline Calculation Engine
 * frontend/src/core/timeline-engine.ts
 */

import { Clip } from '../types/clip';
import { Track } from '../types/project';
import { ActiveClipInstance, SnappingResult, SnappingTarget } from '../types/timeline';
import { calculateOutputDuration, outputTimeToSourceLocal } from '../features/speed';

export const MIN_TRIM_SECONDS = 0.1;
export const DEFAULT_SNAP_THRESHOLD = 0.15; // 150ms snap attraction window

/**
 * Bounds a value between minimum and maximum constraints.
 */
export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

/**
 * Formats a time in seconds to a human-readable mm:ss or mm:ss.ms string.
 */
export function formatTimecode(seconds: number, includeFrames = false, fps = 30): string {
    const s = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(s / 60);
    const remSec = Math.floor(s % 60);
    const secStr = String(remSec).padStart(2, '0');
    const minStr = String(m).padStart(2, '0');

    if (includeFrames) {
        const frames = Math.floor((s - Math.floor(s)) * fps);
        return `${minStr}:${secStr}:${String(frames).padStart(2, '0')}`;
    }
    const ms = Math.floor((s - Math.floor(s)) * 10);
    return `${minStr}:${secStr}.${ms}`;
}

/**
 * Returns the effective source duration of a clip.
 */
export function getClipSourceDuration(clip: Clip, assetDuration?: number): number {
    if (typeof assetDuration === 'number' && assetDuration > 0) return assetDuration;
    if (typeof clip.duration === 'number' && clip.duration > 0) return clip.duration;
    if (typeof clip.trimEnd === 'number' && clip.trimEnd > 0) return clip.trimEnd;
    return 10.0;
}

/**
 * Computes active timeline duration of a clip accounting for trim points and speed (constant or velocity curve).
 */
export function calculateClipDuration(clip: Clip): number {
    return Math.max(MIN_TRIM_SECONDS, calculateOutputDuration(clip));
}

/**
 * Computes the maximum duration across all active tracks and clips.
 */
export function calculateTotalTimelineDuration(tracks: Track[]): number {
    let maxDuration = 0;
    (tracks || []).forEach(track => {
        (track.clips || []).forEach(clip => {
            const start = Number(clip.start) || 0;
            const dur = calculateClipDuration(clip);
            if (start + dur > maxDuration) {
                maxDuration = start + dur;
            }
        });
    });
    return Math.max(5.0, Number(maxDuration.toFixed(2)));
}

/**
 * Resolves all clips active at a specific timestamp, sorted by visual stack layer (zIndex).
 */
export function resolveActiveClipsAtTime(tracks: Track[], time: number): ActiveClipInstance[] {
    const active: ActiveClipInstance[] = [];
    (tracks || []).forEach((track, trackIdx) => {
        if (track.hidden) return;
        const zIndex = track.zIndex !== undefined ? track.zIndex : (track.isBase ? 10 : 20 + trackIdx * 10);
        
        (track.clips || []).forEach(clip => {
            const start = Number(clip.start) || 0;
            const activeDur = calculateClipDuration(clip);
            const trimStart = Number(clip.trimStart) || 0;
            const trimEnd = Number(clip.trimEnd) || (trimStart + (Number(clip.duration) || 10));

            if (time >= start && time < start + activeDur) {
                const outLocal = Math.max(0, time - start);
                const sourceLocal = outputTimeToSourceLocal(clip, outLocal);
                const sourceTime = trimStart + sourceLocal;
                active.push({
                    clip,
                    track,
                    zIndex,
                    sourceTime: Math.min(trimEnd, Math.max(trimStart, sourceTime)),
                    isBase: !!track.isBase
                });
            }
        });
    });

    return active.sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Locates the specific clip directly under the playhead on the most relevant track.
 */
export function findClipUnderPlayhead(tracks: Track[], time: number): { clip: Clip | null; track: Track | null } {
    const activeList = resolveActiveClipsAtTime(tracks, time);
    if (activeList.length === 0) return { clip: null, track: null };
    
    // Prioritize base video track first, then top overlay layer
    const baseInstance = activeList.find(a => a.isBase);
    if (baseInstance) {
        return { clip: baseInstance.clip, track: baseInstance.track };
    }
    const topInstance = activeList[activeList.length - 1];
    return { clip: topInstance.clip, track: topInstance.track };
}

/**
 * Splits a clip at a given timestamp into two distinct clip instances.
 */
export function splitClipAtTime(
    clip: Clip,
    track: Track,
    splitTime: number
): { original: Clip; created: Clip } | null {
    const start = Number(clip.start) || 0;
    const activeDur = calculateClipDuration(clip);
    const trimStart = Number(clip.trimStart) || 0;
    const trimEnd = Number(clip.trimEnd) || Number(clip.duration) || 10;

    if (splitTime <= start + MIN_TRIM_SECONDS || splitTime >= start + activeDur - MIN_TRIM_SECONDS) {
        return null; // Split point too close to boundary
    }

    const outLocal = splitTime - start;
    const sourceLocal = outputTimeToSourceLocal(clip, outLocal);
    const sourceCutPoint = trimStart + sourceLocal;
    const clipIndex = track.clips.indexOf(clip);
    if (clipIndex === -1) return null;

    // First half updates in place
    clip.trimEnd = Number(sourceCutPoint.toFixed(3));
    clip.duration = calculateClipDuration(clip);

    // Second half gets created as a separate clone
    const createdClip: Clip = {
        ...JSON.parse(JSON.stringify(clip)),
        id: `clip-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        start: Number(splitTime.toFixed(3)),
        trimStart: Number(sourceCutPoint.toFixed(3)),
        trimEnd: Number(trimEnd.toFixed(3))
    };
    createdClip.duration = calculateClipDuration(createdClip);

    track.clips.splice(clipIndex + 1, 0, createdClip);
    return { original: clip, created: createdClip };
}

/**
 * Trims a clip safely ensuring in/out boundaries remain consistent.
 */
export function trimClip(clip: Clip, newTrimStart: number, newTrimEnd: number, sourceDuration = 1000): void {
    const validStart = clamp(newTrimStart, 0, Math.max(0, sourceDuration - MIN_TRIM_SECONDS));
    const validEnd = clamp(newTrimEnd, validStart + MIN_TRIM_SECONDS, sourceDuration);
    clip.trimStart = Number(validStart.toFixed(3));
    clip.trimEnd = Number(validEnd.toFixed(3));
    clip.duration = Number((validEnd - validStart).toFixed(3));
}

/**
 * Calculates magnetic snapping against nearby clip boundaries and playhead.
 */
export function calculateMagneticSnap(
    targetTime: number,
    tracks: Track[],
    options: {
        snapThreshold?: number;
        playhead?: number;
        inPoint?: number;
        outPoint?: number;
        ignoreClipId?: string;
    } = {}
): SnappingResult {
    const threshold = options.snapThreshold || DEFAULT_SNAP_THRESHOLD;
    const targets: SnappingTarget[] = [];

    if (typeof options.playhead === 'number') {
        targets.push({ time: options.playhead, type: 'playhead', label: 'Playhead' });
    }
    if (typeof options.inPoint === 'number') {
        targets.push({ time: options.inPoint, type: 'in-point', label: 'In Point' });
    }
    if (typeof options.outPoint === 'number') {
        targets.push({ time: options.outPoint, type: 'out-point', label: 'Out Point' });
    }

    (tracks || []).forEach(track => {
        (track.clips || []).forEach(c => {
            if (options.ignoreClipId && c.id === options.ignoreClipId) return;
            const cStart = Number(c.start) || 0;
            const cDur = calculateClipDuration(c);
            targets.push({ time: cStart, type: 'clip-start', label: c.name });
            targets.push({ time: cStart + cDur, type: 'clip-end', label: c.name });
        });
    });

    let closestTarget: SnappingTarget | undefined;
    let minDistance = threshold;

    for (const t of targets) {
        const dist = Math.abs(targetTime - t.time);
        if (dist < minDistance) {
            minDistance = dist;
            closestTarget = t;
        }
    }

    if (closestTarget) {
        return {
            snappedTime: closestTarget.time,
            didSnap: true,
            target: closestTarget
        };
    }

    return {
        snappedTime: targetTime,
        didSnap: false
    };
}

/**
 * Deletes a clip and shifts all subsequent clips backwards to close the gap.
 */
export function rippleDeleteClip(tracks: Track[], clipId: string): boolean {
    for (const track of tracks) {
        const idx = track.clips.findIndex(c => c.id === clipId);
        if (idx !== -1) {
            const clip = track.clips[idx];
            const gapDuration = calculateClipDuration(clip);
            track.clips.splice(idx, 1);

            // Shift remaining clips on this track
            for (let i = idx; i < track.clips.length; i++) {
                track.clips[i].start = Math.max(0, (track.clips[i].start || 0) - gapDuration);
            }
            return true;
        }
    }
    return false;
}

export const TimelineEngine = {
    clamp,
    formatTimecode,
    getClipSourceDuration,
    calculateClipDuration,
    calculateTotalTimelineDuration,
    resolveActiveClipsAtTime,
    findClipUnderPlayhead,
    splitClipAtTime,
    trimClip,
    calculateMagneticSnap,
    rippleDeleteClip
};

