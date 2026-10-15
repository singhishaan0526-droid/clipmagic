/**
 * Clip Magic — Audio Processing & Automation Feature
 * frontend/src/features/audio.ts
 */

import { AudioClip } from '../types/clip';
import { Track } from '../types/project';
import { calculateClipDuration, clamp } from '../core/timeline-engine';

export interface ActiveAudioOutput {
    clip: AudioClip;
    volume: number;        // Computed volume after fades and automation (0.0 to 2.0)
    sourceTime: number;
    muted: boolean;
}

export class AudioEngine {
    /**
     * Calculates the instantaneous effective volume of an audio clip, accounting for fade-in and fade-out.
     */
    public static computeInstantVolume(clip: AudioClip, clipLocalTime: number): number {
        const baseVol = typeof clip.volume === 'number' ? clip.volume : 1.0;
        if (baseVol <= 0) return 0;

        const dur = calculateClipDuration(clip);
        let factor = 1.0;

        // Fade in
        const fadeIn = clip.fadeIn || 0;
        if (fadeIn > 0 && clipLocalTime < fadeIn) {
            factor *= clamp(clipLocalTime / fadeIn, 0, 1);
        }

        // Fade out
        const fadeOut = clip.fadeOut || 0;
        if (fadeOut > 0 && clipLocalTime > dur - fadeOut) {
            const rem = dur - clipLocalTime;
            factor *= clamp(rem / fadeOut, 0, 1);
        }

        return Number((baseVol * factor).toFixed(3));
    }

    /**
     * Resolves all active audio streams across tracks at a specific timeline timestamp.
     */
    public static resolveActiveAudio(
        tracks: Track[],
        timelineTime: number,
        globalMusicVolume = 1.0,
        globalAudioVolume = 1.0
    ): ActiveAudioOutput[] {
        const outputs: ActiveAudioOutput[] = [];

        (tracks || []).forEach(track => {
            const isTrackMuted = !!track.muted;
            const isAudioTrack = track.type === 'audio';

            (track.clips || []).forEach(c => {
                const start = c.start || 0;
                const dur = calculateClipDuration(c);

                if (timelineTime >= start && timelineTime < start + dur) {
                    const localTime = timelineTime - start;
                    const trimStart = c.trimStart || 0;
                    const sourceTime = trimStart + localTime * (c.speed || 1.0);

                    const effectiveVol = this.computeInstantVolume(c as AudioClip, localTime);
                    const multiplier = isAudioTrack ? globalMusicVolume : globalAudioVolume;

                    outputs.push({
                        clip: c as AudioClip,
                        volume: isTrackMuted ? 0 : effectiveVol * multiplier,
                        sourceTime,
                        muted: isTrackMuted || effectiveVol === 0
                    });
                }
            });
        });

        return outputs;
    }

    /**
     * Generates a downsampled normalized waveform array from raw audio channel data.
     */
    public static generateWaveform(channelData: Float32Array, targetBuckets = 100): number[] {
        if (!channelData || channelData.length === 0) return [];
        const buckets = Math.max(10, targetBuckets);
        const blockSize = Math.floor(channelData.length / buckets);
        const waveform: number[] = [];

        for (let i = 0; i < buckets; i++) {
            const start = i * blockSize;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[start + j] || 0);
            }
            const avg = sum / blockSize;
            waveform.push(Number(clamp(avg * 2.5, 0.05, 1.0).toFixed(2)));
        }

        return waveform;
    }

    /**
     * Analyzes audio buffer peaks to estimate tempo (BPM).
     */
    public static estimateBPM(bufferData: Float32Array, sampleRate = 44100): number {
        if (!bufferData || bufferData.length === 0) return 120;
        
        // Simple peak energy thresholding
        const interval = Math.floor(sampleRate / 4); // 250ms window
        let peaks = 0;
        let threshold = 0.35;

        for (let i = 0; i < bufferData.length; i += interval) {
            if (Math.abs(bufferData[i]) > threshold) {
                peaks++;
            }
        }

        const totalMinutes = bufferData.length / sampleRate / 60;
        if (totalMinutes <= 0) return 120;

        const rawBpm = Math.round(peaks / totalMinutes);
        return clamp(rawBpm > 50 && rawBpm < 220 ? rawBpm : 120, 60, 200);
    }
}
