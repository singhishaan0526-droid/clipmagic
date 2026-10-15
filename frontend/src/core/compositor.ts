/**
 * Clip Magic — Multi-Layer Compositor Engine
 * frontend/src/core/compositor.ts
 */

import { Clip, ClipTransform, ClipPiP } from '../types/clip';
import { ActiveClipInstance } from '../types/timeline';

export interface CompositorLayerStyle {
    transform: string;
    opacity: number;
    zIndex: number;
    filter: string;
    mixBlendMode?: string;
    width?: string;
    height?: string;
    left?: string;
    top?: string;
    position: 'absolute';
}

export class CompositorEngine {
    /**
     * Calculates the CSS / GPU transform for an overlay Picture-in-Picture clip.
     */
    public static computePiPStyle(pip?: ClipPiP): { left: string; top: string; width: string; transform: string; opacity: number } {
        if (!pip) {
            return {
                left: '0%',
                top: '0%',
                width: '100%',
                transform: 'none',
                opacity: 1
            };
        }

        const sizePct = Math.max(10, Math.min(100, pip.size || 35));
        const opacity = Math.max(0, Math.min(1, (pip.opacity ?? 100) / 100));

        let left = '70%';
        let top = '70%';

        switch (pip.position) {
            case 'top-left':
                left = '10%';
                top = '10%';
                break;
            case 'top-right':
                left = `${100 - sizePct - 5}%`;
                top = '10%';
                break;
            case 'bottom-left':
                left = '10%';
                top = `${100 - sizePct - 5}%`;
                break;
            case 'bottom-right':
                left = `${100 - sizePct - 5}%`;
                top = `${100 - sizePct - 5}%`;
                break;
            case 'center':
                left = `${(100 - sizePct) / 2}%`;
                top = `${(100 - sizePct) / 2}%`;
                break;
            case 'custom':
                left = `${pip.x ?? 50}%`;
                top = `${pip.y ?? 50}%`;
                break;
        }

        return {
            left,
            top,
            width: `${sizePct}%`,
            transform: 'translateZ(0)',
            opacity
        };
    }

    /**
     * Resolves the complete CSS style representation for a clip layer at an instantaneous frame.
     */
    public static resolveLayerStyle(instance: ActiveClipInstance, transform?: ClipTransform): CompositorLayerStyle {
        const { clip, isBase, zIndex } = instance;

        if (isBase) {
            return {
                position: 'absolute',
                left: '0',
                top: '0',
                width: '100%',
                height: '100%',
                zIndex,
                opacity: transform ? transform.opacity / 100 : 1,
                transform: transform
                    ? `translate(${transform.x - 50}%, ${transform.y - 50}%) scale(${transform.scale / 100}) rotate(${transform.rotation}deg) translateZ(0)`
                    : 'translateZ(0)',
                filter: (clip as any).filter ? `url(#${(clip as any).filter})` : 'none'
            };
        }

        // Overlay layer (PiP)
        const pipStyle = this.computePiPStyle((clip as any).pip);
        return {
            position: 'absolute',
            left: pipStyle.left,
            top: pipStyle.top,
            width: pipStyle.width,
            zIndex,
            opacity: transform ? (transform.opacity / 100) * pipStyle.opacity : pipStyle.opacity,
            transform: transform
                ? `translate(${transform.x - 50}%, ${transform.y - 50}%) scale(${transform.scale / 100}) rotate(${transform.rotation}deg) ${pipStyle.transform}`
                : pipStyle.transform,
            filter: (clip as any).filter ? `url(#${(clip as any).filter})` : 'none'
        };
    }

    /**
     * Builds standard CSS filter string from clip filter and grade settings.
     */
    public static buildCssFilterString(clip: Clip): string {
        const parts: string[] = [];
        const grade = (clip as any).colorGrade;
        if (grade) {
            if (typeof grade.exposure === 'number' && grade.exposure !== 0) {
                parts.push(`brightness(${(1 + grade.exposure * 0.5).toFixed(2)})`);
            }
            if (typeof grade.contrast === 'number' && grade.contrast !== 1) {
                parts.push(`contrast(${grade.contrast.toFixed(2)})`);
            }
            if (typeof grade.saturation === 'number' && grade.saturation !== 1) {
                parts.push(`saturate(${grade.saturation.toFixed(2)})`);
            }
        }
        return parts.length > 0 ? parts.join(' ') : 'none';
    }
}
