/**
 * Clip Magic — Text, Captions & Sticker Overlays Feature
 * frontend/src/features/overlays.ts
 */

import { TextOverlay } from '../types/project';
import { clamp } from '../core/timeline-engine';

export interface OverlayTransform {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
}

export class OverlayEngine {
    /**
     * Evaluates the interpolated position, scale, rotation and opacity of an overlay item at timestamp t.
     */
    public static getTransformAt(item: TextOverlay, time: number): OverlayTransform {
        const fallback: OverlayTransform = {
            x: clamp(item.x ?? 50, 0, 100),
            y: clamp(item.y ?? 50, 0, 100),
            scale: clamp(item.scale ?? 100, 10, 500),
            rotation: item.rotation ?? 0,
            opacity: 100
        };

        const keyframes = item.keyframes;
        if (!keyframes || !Array.isArray(keyframes) || keyframes.length === 0) {
            return fallback;
        }

        const sorted = [...keyframes].sort((a, b) => a.time - b.time);
        if (time <= sorted[0].time) {
            const first = sorted[0];
            return {
                x: first.x ?? fallback.x,
                y: first.y ?? fallback.y,
                scale: first.scale ?? fallback.scale,
                rotation: first.rotation ?? fallback.rotation,
                opacity: first.opacity ?? fallback.opacity
            };
        }

        if (time >= sorted[sorted.length - 1].time) {
            const last = sorted[sorted.length - 1];
            return {
                x: last.x ?? fallback.x,
                y: last.y ?? fallback.y,
                scale: last.scale ?? fallback.scale,
                rotation: last.rotation ?? fallback.rotation,
                opacity: last.opacity ?? fallback.opacity
            };
        }

        for (let i = 0; i < sorted.length - 1; i++) {
            const kfA = sorted[i];
            const kfB = sorted[i + 1];

            if (time >= kfA.time && time <= kfB.time) {
                const span = kfB.time - kfA.time;
                const ratio = span > 0 ? (time - kfA.time) / span : 0;

                const lerp = (start: number, end: number) => start + (end - start) * ratio;

                return {
                    x: Number(lerp(kfA.x ?? fallback.x, kfB.x ?? fallback.x).toFixed(2)),
                    y: Number(lerp(kfA.y ?? fallback.y, kfB.y ?? fallback.y).toFixed(2)),
                    scale: Number(lerp(kfA.scale ?? fallback.scale, kfB.scale ?? fallback.scale).toFixed(2)),
                    rotation: Number(lerp(kfA.rotation ?? fallback.rotation, kfB.rotation ?? fallback.rotation).toFixed(2)),
                    opacity: Number(lerp(kfA.opacity ?? fallback.opacity, kfB.opacity ?? fallback.opacity).toFixed(2))
                };
            }
        }

        return fallback;
    }

    /**
     * Finds which overlays should be drawn on canvas or preview at time t.
     */
    public static resolveVisibleOverlays(overlays: TextOverlay[] | undefined, time: number): TextOverlay[] {
        if (!overlays || !Array.isArray(overlays)) return [];
        return overlays.filter(item => {
            const s = Number(item.start) || 0;
            const e = Number(item.end) || 0;
            return time >= s && time <= e;
        });
    }

    /**
     * Resolves the current spoken or sung word for karaoke / word-level captions.
     */
    public static resolveActiveWord(item: TextOverlay, time: number): string | null {
        if (!item.words || !Array.isArray(item.words) || item.words.length === 0) return null;
        const current = item.words.find(w => time >= w.start && time <= w.end);
        return current ? current.word : null;
    }
}
