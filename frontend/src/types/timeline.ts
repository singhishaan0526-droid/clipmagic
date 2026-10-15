/**
 * Clip Magic — Timeline, Playback, and Export Types
 * frontend/src/types/timeline.ts
 */

import { Clip } from './clip';
import { Track } from './project';

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    playbackRate: number;
    loop?: boolean;
}

export interface ActiveClipInstance {
    clip: Clip;
    track: Track;
    zIndex: number;
    sourceTime: number;
    isBase: boolean;
}

export interface SelectionState {
    clip: Clip | null;
    overlay: any | null;
    trackId: string | null;
}

export interface SnappingTarget {
    time: number;
    type: 'playhead' | 'clip-start' | 'clip-end' | 'in-point' | 'out-point' | 'marker';
    label?: string;
}

export interface SnappingResult {
    snappedTime: number;
    didSnap: boolean;
    target?: SnappingTarget;
}

export interface ExportSettings {
    resolution: '480p' | '720p' | '1080p' | '4k' | 480 | 720 | 1080;
    fps: 24 | 30 | 60;
    format: 'mp4' | 'webm' | 'gif' | string;
    quality: 'draft' | 'balanced' | 'standard' | 'high' | 'quality' | 'lossless' | 'fast';
    preset?: 'tiktok' | 'youtube' | 'instagram' | 'custom' | string;
    presetPlatform?: string;
    losslessAuto?: boolean;
    bitrate?: string;
    audioBitrate?: '128k' | '192k' | '256k' | string;
    includeAudio?: boolean;
}

export interface ExportProgress {
    percentage: number;
    currentTime: number;
    totalDuration: number;
    stage: 'preparing' | 'demuxing' | 'filtering' | 'encoding' | 'muxing' | 'completed' | 'failed';
    error?: string;
}
