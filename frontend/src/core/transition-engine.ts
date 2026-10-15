/**
 * Clip Magic — Transition Engine
 * frontend/src/core/transition-engine.ts
 */

import { Clip, TransitionType } from '../types/clip';
import { Track } from '../types/project';
import { calculateClipDuration, clamp } from './timeline-engine';

export interface TransitionState {
    incomingClip: Clip;
    outgoingClip: Clip;
    type: TransitionType;
    duration: number;
    progress: number; // 0.0 to 1.0
}

export class TransitionEngine {
    /**
     * Checks if a specific timestamp falls inside a transition between adjacent clips.
     */
    public static detectTransition(
        track: Track,
        time: number
    ): TransitionState | null {
        const clips = track.clips || [];
        for (let i = 0; i < clips.length - 1; i++) {
            const outgoing = clips[i];
            const incoming = clips[i + 1];

            const outgoingStart = outgoing.start || 0;
            const outgoingDur = calculateClipDuration(outgoing);
            const cutPoint = outgoingStart + outgoingDur;

            const transition = (incoming as any).transition || (outgoing as any).transition;
            if (!transition || transition.type === 'none') continue;

            const tDuration = Math.max(0.1, Number(transition.duration) || 0.5);
            const windowStart = cutPoint - tDuration / 2;
            const windowEnd = cutPoint + tDuration / 2;

            if (time >= windowStart && time <= windowEnd) {
                const progress = clamp((time - windowStart) / tDuration, 0, 1);
                return {
                    outgoingClip: outgoing,
                    incomingClip: incoming,
                    type: transition.type,
                    duration: tDuration,
                    progress
                };
            }
        }
        return null;
    }

    /**
     * Computes the visual opacity and CSS transformation for outgoing and incoming clips.
     */
    public static evaluateVisualTransition(
        type: TransitionType,
        progress: number
    ): { outgoingOpacity: number; incomingOpacity: number; outgoingTransform: string; incomingTransform: string } {
        const p = clamp(progress, 0, 1);

        switch (type) {
            case 'fade':
            case 'dissolve':
                return {
                    outgoingOpacity: 1 - p,
                    incomingOpacity: p,
                    outgoingTransform: 'none',
                    incomingTransform: 'none'
                };

            case 'slide':
                return {
                    outgoingOpacity: 1,
                    incomingOpacity: 1,
                    outgoingTransform: `translateX(-${(p * 100).toFixed(1)}%)`,
                    incomingTransform: `translateX(${((1 - p) * 100).toFixed(1)}%)`
                };

            case 'zoom':
                return {
                    outgoingOpacity: 1 - p,
                    incomingOpacity: p,
                    outgoingTransform: `scale(${(1 + p * 0.5).toFixed(2)})`,
                    incomingTransform: `scale(${(0.5 + p * 0.5).toFixed(2)})`
                };

            case 'dip-black': {
                // Dips completely to black at p = 0.5
                const outOp = p < 0.5 ? 1 - p * 2 : 0;
                const inOp = p >= 0.5 ? (p - 0.5) * 2 : 0;
                return {
                    outgoingOpacity: outOp,
                    incomingOpacity: inOp,
                    outgoingTransform: 'none',
                    incomingTransform: 'none'
                };
            }

            case 'wipe':
            default:
                return {
                    outgoingOpacity: 1 - p,
                    incomingOpacity: p,
                    outgoingTransform: 'none',
                    incomingTransform: 'none'
                };
        }
    }

    /**
     * Maps an editor transition name to FFmpeg xfade filter transition name.
     */
    public static toFFmpegXFade(type: TransitionType): string {
        switch (type) {
            case 'fade':
            case 'dissolve':
                return 'fade';
            case 'slide':
                return 'slideleft';
            case 'wipe':
                return 'wipeleft';
            case 'zoom':
                return 'zoomin';
            case 'dip-black':
                return 'fadeblack';
            default:
                return 'fade';
        }
    }
}
