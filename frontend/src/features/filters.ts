/**
 * Clip Magic — Visual Filters & Color Grading Feature
 * frontend/src/features/filters.ts
 */

import { Clip, ClipColorGrade } from '../types/clip';
import { clamp } from '../core/timeline-engine';

export interface FilterDefinition {
    id: string;
    name: string;
    category: 'cinematic' | 'retro' | 'mood' | 'vivid' | 'bw';
    cssFilter: (strength: number) => string;
    ffmpegFilter: (strength: number) => string;
}

export class FilterEngine {
    public static readonly FILTERS: Record<string, FilterDefinition> = {
        none: {
            id: 'none',
            name: 'Original (No Filter)',
            category: 'cinematic',
            cssFilter: () => 'none',
            ffmpegFilter: () => 'null'
        },
        vivid: {
            id: 'vivid',
            name: 'Vivid Pop',
            category: 'vivid',
            cssFilter: (s) => `saturate(${(1 + s * 0.4).toFixed(2)}) contrast(${(1 + s * 0.15).toFixed(2)})`,
            ffmpegFilter: (s) => `eq=saturation=${(1 + s * 0.4).toFixed(2)}:contrast=${(1 + s * 0.15).toFixed(2)}`
        },
        cinematic: {
            id: 'cinematic',
            name: 'Teal & Orange',
            category: 'cinematic',
            cssFilter: (s) => `contrast(${(1 + s * 0.2).toFixed(2)}) saturate(${(1 + s * 0.15).toFixed(2)}) hue-rotate(-${Math.round(s * 8)}deg)`,
            ffmpegFilter: (s) => `eq=contrast=${(1 + s * 0.2).toFixed(2)}:saturation=${(1 + s * 0.15).toFixed(2)},hue=h=-${Math.round(s * 8)}`
        },
        monochrome: {
            id: 'monochrome',
            name: 'Noir Classic',
            category: 'bw',
            cssFilter: (s) => `grayscale(${(s).toFixed(2)}) contrast(${(1 + s * 0.25).toFixed(2)})`,
            ffmpegFilter: (s) => `hue=s=0,eq=contrast=${(1 + s * 0.25).toFixed(2)}`
        },
        vintage: {
            id: 'vintage',
            name: '70s Vintage',
            category: 'retro',
            cssFilter: (s) => `sepia(${(s * 0.45).toFixed(2)}) contrast(${(1 - s * 0.1).toFixed(2)}) saturate(${(1 - s * 0.2).toFixed(2)})`,
            ffmpegFilter: () => `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
        },
        dramatic: {
            id: 'dramatic',
            name: 'Dark Moody',
            category: 'mood',
            cssFilter: (s) => `brightness(${(1 - s * 0.15).toFixed(2)}) contrast(${(1 + s * 0.35).toFixed(2)}) saturate(${(1 - s * 0.1).toFixed(2)})`,
            ffmpegFilter: (s) => `eq=brightness=-${(s * 0.08).toFixed(2)}:contrast=${(1 + s * 0.35).toFixed(2)}`
        },
        cyberpunk: {
            id: 'cyberpunk',
            name: 'Neon Cyberpunk',
            category: 'vivid',
            cssFilter: (s) => `saturate(${(1 + s * 0.6).toFixed(2)}) hue-rotate(${Math.round(s * 45)}deg) contrast(${(1 + s * 0.2).toFixed(2)})`,
            ffmpegFilter: (s) => `hue=h=${Math.round(s * 45)}:s=${(1 + s * 0.6).toFixed(2)}`
        },
        warm: {
            id: 'warm',
            name: 'Sunset Golden',
            category: 'mood',
            cssFilter: (s) => `sepia(${(s * 0.25).toFixed(2)}) saturate(${(1 + s * 0.2).toFixed(2)})`,
            ffmpegFilter: (s) => `colorbalance=rs=${(s * 0.1).toFixed(2)}:gs=${(s * 0.05).toFixed(2)}`
        }
    };

    /**
     * Resolves the CSS filter string for preview rendering.
     */
    public static resolveCssFilter(clip: Clip): string {
        const filterId = (clip as any).filter || 'none';
        const rawAmount = typeof (clip as any).filterAmount === 'number' ? (clip as any).filterAmount : 100;
        const strength = clamp(rawAmount / 100, 0, 1);

        const filterDef = this.FILTERS[filterId] || this.FILTERS.none;
        const filterStr = filterDef.cssFilter(strength);

        const grade = (clip as any).colorGrade as ClipColorGrade | undefined;
        if (!grade) return filterStr;

        const gradeParts: string[] = [];
        if (typeof grade.exposure === 'number' && grade.exposure !== 0) {
            gradeParts.push(`brightness(${(1 + grade.exposure * 0.4).toFixed(2)})`);
        }
        if (typeof grade.contrast === 'number' && grade.contrast !== 1) {
            gradeParts.push(`contrast(${grade.contrast.toFixed(2)})`);
        }
        if (typeof grade.saturation === 'number' && grade.saturation !== 1) {
            gradeParts.push(`saturate(${grade.saturation.toFixed(2)})`);
        }

        if (gradeParts.length === 0) return filterStr;
        return filterStr === 'none' ? gradeParts.join(' ') : `${filterStr} ${gradeParts.join(' ')}`;
    }

    /**
     * Resolves FFmpeg video filtergraph commands for export parity.
     */
    public static resolveFFmpegFilter(clip: Clip): string {
        const filterId = (clip as any).filter || 'none';
        const rawAmount = typeof (clip as any).filterAmount === 'number' ? (clip as any).filterAmount : 100;
        const strength = clamp(rawAmount / 100, 0, 1);

        const filterDef = this.FILTERS[filterId] || this.FILTERS.none;
        const baseFFmpeg = filterDef.ffmpegFilter(strength);

        const grade = (clip as any).colorGrade as ClipColorGrade | undefined;
        if (!grade) return baseFFmpeg === 'null' ? '' : baseFFmpeg;

        const gradeFilters: string[] = [];
        if (typeof grade.exposure === 'number' && grade.exposure !== 0) {
            gradeFilters.push(`eq=brightness=${(grade.exposure * 0.2).toFixed(2)}`);
        }
        if (typeof grade.contrast === 'number' && grade.contrast !== 1) {
            gradeFilters.push(`eq=contrast=${grade.contrast.toFixed(2)}`);
        }
        if (typeof grade.saturation === 'number' && grade.saturation !== 1) {
            gradeFilters.push(`eq=saturation=${grade.saturation.toFixed(2)}`);
        }

        const all = [baseFFmpeg !== 'null' ? baseFFmpeg : '', ...gradeFilters].filter(Boolean);
        return all.join(',');
    }
}
