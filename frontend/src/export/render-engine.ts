/**
 * Clip Magic - Render & Export Engine
 * Type-safe FFmpeg export argument builder, stream-copy evaluator,
 * file-size estimator, and export state manager.
 */

import { VideoClip, isVideoClip } from '../types/clip';
import { EditorProject } from '../types/project';
import { ExportSettings } from '../types/timeline';
import { FilterEngine } from '../features/filters';

export type ExportState = 'idle' | 'preparing' | 'rendering' | 'cancelling' | 'completed' | 'failed';

export interface RenderPlan {
    isLossless: boolean;
    inputArgs: string[];
    filterComplex?: string;
    outputArgs: string[];
    outputFilename: string;
    estimatedBytes: number;
    requiredAssetIds: string[];
}

export interface ExportProgressEvent {
    percent: number;
    time?: number;
    state: ExportState;
    stageMessage: string;
}

export class RenderEngine {
    /**
     * Validates and normalizes export options with safe fallbacks.
     */
    public static normalizeSettings(settings?: Partial<ExportSettings>): ExportSettings {
        const quality = settings?.quality || 'balanced';
        const rawRes = settings?.resolution;
        let resolution: 480 | 720 | 1080 = 1080;
        if (rawRes === 480 || rawRes === '480p') resolution = 480;
        else if (rawRes === 720 || rawRes === '720p') resolution = 720;
        else resolution = 1080;

        const fps = settings?.fps || 30;
        const format = settings?.format || 'mp4';
        const audioBitrate = settings?.audioBitrate || '192k';

        return {
            quality,
            resolution,
            fps: [24, 30, 60].includes(Number(fps)) ? (Number(fps) as 24 | 30 | 60) : 30,
            format,
            audioBitrate: ['128k', '192k', '256k'].includes(audioBitrate) ? (audioBitrate as '128k' | '192k' | '256k') : '192k',
            includeAudio: settings?.includeAudio ?? true
        };
    }

    /**
     * Estimates file size in bytes based on timeline duration and bitrate model.
     */
    public static estimateFileSize(durationSec: number, settings: ExportSettings): number {
        if (durationSec <= 0) return 0;

        // Bitrates in bits per second based on resolution and CRF preset
        const videoBitrates: Record<number, Record<string, number>> = {
            1080: { fast: 4000_000, balanced: 6000_000, standard: 6000_000, high: 9000_000, quality: 10_000_000, draft: 3000_000, lossless: 12_000_000 },
            720:  { fast: 2000_000, balanced: 3500_000, standard: 3500_000, high: 5000_000, quality: 6000_000, draft: 1500_000, lossless: 8_000_000 },
            480:  { fast: 1000_000, balanced: 1500_000, standard: 1500_000, high: 2200_000, quality: 3000_000, draft: 800_000, lossless: 4_000_000 }
        };

        const resNum = typeof settings.resolution === 'string'
            ? parseInt(settings.resolution, 10)
            : (settings.resolution || 1080);
        const vBitrate = videoBitrates[resNum]?.[settings.quality] || 5000_000;
        const aBitrate = parseInt(settings.audioBitrate || '192k', 10) * 1000 || 192_000;
        const totalBps = vBitrate + (settings.includeAudio ? aBitrate : 0);

        return Math.round((totalBps / 8) * durationSec);
    }

    /**
     * Determines whether project qualifies for ultra-fast instant lossless stream copy (`-c copy`).
     */
    public static canPerformLosslessCopy(project: EditorProject, settings: ExportSettings): boolean {
        if (settings.quality === 'quality' || settings.quality === 'high') return false; // User requested re-encode
        const mainTrack = project.tracks.find(t => t.type === 'video');
        if (!mainTrack || mainTrack.clips.length !== 1) return false;

        const otherVideoTracks = project.tracks.filter(t => t.type === 'video' && t.id !== mainTrack.id);
        const hasPip = otherVideoTracks.some(t => t.clips.length > 0);
        if (hasPip) return false;

        const musicTracks = project.tracks.filter(t => t.type === 'audio');
        const hasExtraAudio = musicTracks.some(t => t.clips.length > 0);
        if (hasExtraAudio) return false;

        const clip = mainTrack.clips[0];
        if (!isVideoClip(clip)) return false;

        // Check for filters, effects, keyframes or custom transforms
        if (clip.filter && clip.filter !== 'none') return false;
        if (clip.colorGrade && (clip.colorGrade.preset || clip.colorGrade.brightness !== 0 || clip.colorGrade.contrast !== 0)) return false;
        if (clip.transition) return false;
        if (clip.transform && (clip.transform.scale !== 100 || clip.transform.x !== 0 || clip.transform.y !== 0 || clip.transform.rotation !== 0)) return false;
        if (clip.keyframes && clip.keyframes.length > 0) return false;
        if (project.textOverlays && project.textOverlays.length > 0) return false;
        if (clip.speedMode === 'curve') return false;
        if (typeof clip.speed === 'number' && Math.abs(clip.speed - 1.0) > 0.01) return false;

        return true;
    }

    /**
     * Constructs a comprehensive RenderPlan detailing FFmpeg input flags, filtergraphs, and codecs.
     */
    public static buildRenderPlan(project: EditorProject, settings: ExportSettings, durationSec: number): RenderPlan {
        const normalized = this.normalizeSettings(settings);
        const mainVideoTrack = project.tracks.find(t => t.type === 'video');
        const clips = (mainVideoTrack?.clips || []).filter(isVideoClip) as VideoClip[];

        const requiredAssets = new Set<string>();
        project.tracks.forEach(track => {
            track.clips.forEach(clip => {
                if (clip.assetId) requiredAssets.add(clip.assetId);
            });
        });

        // Fast path: Lossless Stream Copy
        if (this.canPerformLosslessCopy(project, normalized) && clips.length === 1) {
            const clip = clips[0];
            const trimStart = Math.max(0, clip.trimStart);
            const trimEnd = clip.trimEnd > trimStart ? clip.trimEnd : null;
            const dur = trimEnd !== null ? trimEnd - trimStart : null;

            const inputArgs = [
                '-ss', trimStart.toFixed(3),
                ...(dur !== null ? ['-t', dur.toFixed(3)] : []),
                '-i', clip.assetId
            ];

            return {
                isLossless: true,
                inputArgs,
                outputArgs: ['-c', 'copy', '-movflags', '+faststart'],
                outputFilename: `clipmagic-lossless-${Date.now()}.mp4`,
                estimatedBytes: this.estimateFileSize(dur || durationSec, normalized),
                requiredAssetIds: Array.from(requiredAssets)
            };
        }

        // Full Re-encode Plan with FFmpeg filter_complex
        const qualityMap: Record<string, { preset: string; crf: string }> = {
            fast: { preset: 'ultrafast', crf: '28' },
            draft: { preset: 'ultrafast', crf: '30' },
            balanced: { preset: 'veryfast', crf: '23' },
            standard: { preset: 'veryfast', crf: '23' },
            high: { preset: 'medium', crf: '19' },
            quality: { preset: 'medium', crf: '18' },
            lossless: { preset: 'veryfast', crf: '16' }
        };
        const qConfig = qualityMap[normalized.quality] || qualityMap.balanced;

        const inputArgs: string[] = [];
        const filterChains: string[] = [];
        let inputIdx = 0;
        const resNum = typeof normalized.resolution === 'string'
            ? parseInt(normalized.resolution, 10)
            : normalized.resolution;

        // Process Main Video Clips
        clips.forEach((clip, idx) => {
            const trimStart = Math.max(0, clip.trimStart);
            const trimEnd = clip.trimEnd > trimStart ? clip.trimEnd : null;
            const dur = trimEnd !== null ? trimEnd - trimStart : null;

            inputArgs.push('-ss', trimStart.toFixed(3));
            if (dur !== null) inputArgs.push('-t', dur.toFixed(3));
            inputArgs.push('-i', clip.assetId);

            // Filter resolution and scaling
            const filterStr = FilterEngine.resolveFFmpegFilter(clip);
            let vFilter = `[${inputIdx}:v]scale=-2:${resNum}[v${idx}_scaled]`;
            if (filterStr) {
                filterChains.push(vFilter);
                vFilter = `[v${idx}_scaled]${filterStr}[v${idx}]`;
            } else {
                vFilter = `[${inputIdx}:v]scale=-2:${resNum}[v${idx}]`;
            }
            filterChains.push(vFilter);
            inputIdx++;
        });

        // Concat or Crossfade
        if (clips.length === 1) {
            filterChains.push('[v0]copy[outv]');
        } else if (clips.length > 1) {
            // Concatenate video clips
            const concatInputs = clips.map((_, i) => `[v${i}]`).join('');
            filterChains.push(`${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`);
        }

        const outputArgs = [
            '-c:v', 'libx264',
            '-preset', qConfig.preset,
            '-crf', qConfig.crf,
            '-r', normalized.fps.toString(),
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', normalized.audioBitrate || '192k',
            '-movflags', '+faststart'
        ];

        return {
            isLossless: false,
            inputArgs,
            filterComplex: filterChains.length > 0 ? filterChains.join('; ') : undefined,
            outputArgs,
            outputFilename: `clipmagic-${resNum}p-${Date.now()}.mp4`,
            estimatedBytes: this.estimateFileSize(durationSec, normalized),
            requiredAssetIds: Array.from(requiredAssets)
        };
    }
}
