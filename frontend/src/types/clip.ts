/**
 * Clip Magic — Clip Data Types & Discriminated Unions
 * frontend/src/types/clip.ts
 */

export type ClipType = 'video' | 'image' | 'audio' | 'music' | 'text' | 'extracted';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface KeyframeData {
    time: number;          // Clip-local seconds
    property: string;      // 'scale' | 'x' | 'y' | 'rotation' | 'opacity' | 'volume'
    value: number;
    easing?: EasingType;
}

export interface ClipTransform {
    x: number;             // Percentage 0-100
    y: number;             // Percentage 0-100
    scale: number;         // Percentage 10-500
    rotation: number;      // Degrees -360 to +360
    opacity: number;       // Percentage 0-100
}

export type PiPPosition = 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left' | 'center' | 'custom';

export interface ClipPiP {
    position: PiPPosition;
    size: number;          // Percentage 10-100
    opacity: number;       // Percentage 0-100
    x?: number;
    y?: number;
}

export interface ClipColorGrade {
    preset?: string;
    exposure?: number;     // -2 to +2
    contrast?: number;     // 0.5 to 2.0
    saturation?: number;   // 0 to 3.0
    brightness?: number;   // -1 to +1
    temperature?: number;  // Warmth offset
}

export type TransitionType = 'none' | 'fade' | 'dissolve' | 'slide' | 'wipe' | 'zoom' | 'dip-black';

export interface TransitionConfig {
    type: TransitionType;
    duration: number;      // Duration in seconds (0.1 to 3.0)
}

export interface SpeedSegment {
    time: number;          // Seconds from clip source start
    speed: number;         // 0.1 to 100.0
}

/**
 * Base clip attributes shared across all timeline items.
 */
export interface BaseClip {
    id: string;
    assetId: string;
    name: string;
    type: ClipType;
    start: number;         // Timeline start position in seconds
    duration: number;      // Calculated active duration (trimEnd - trimStart) / speed
    trimStart: number;     // Source in-point in seconds
    trimEnd: number;       // Source out-point in seconds
    volume: number;        // 0.0 to 2.0 (1.0 = normal)
    color?: string;        // Visual background color
    borderColor?: string;  // Visual border color
    isBase?: boolean;      // Belongs to primary video track
    isOverlay?: boolean;   // Belongs to PiP / overlay track
    keyframes?: KeyframeData[];
    transform?: ClipTransform;
    speed?: number;        // Constant playback speed (default 1.0)
    speedSegments?: SpeedSegment[];
    prevVolume?: number;   // Used for unmuting toggle
}

export interface VideoClip extends BaseClip {
    type: 'video';
    filter?: string;
    filterAmount?: number;
    colorGrade?: ClipColorGrade;
    pip?: ClipPiP;
    transition?: TransitionConfig;
    hasAudio?: boolean;
}

export interface ImageClip extends BaseClip {
    type: 'image';
    filter?: string;
    filterAmount?: number;
    pip?: ClipPiP;
    transition?: TransitionConfig;
}

export interface AudioClip extends BaseClip {
    type: 'audio' | 'music' | 'extracted';
    fadeIn?: number;       // Seconds
    fadeOut?: number;      // Seconds
    bassBoost?: number;    // dB (-10 to +20)
    waveform?: number[];   // Cached normalized waveform amplitudes
    bpm?: number;
}

export interface TextClip extends BaseClip {
    type: 'text';
    text: string;
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    animation?: string;
}

/**
 * Discriminated union of all timeline clip models.
 */
export type Clip = VideoClip | ImageClip | AudioClip | TextClip;

// ── Type Guards ──────────────────────────────────────────

export function isVideoClip(clip: Clip | null | undefined): clip is VideoClip {
    return !!clip && clip.type === 'video';
}

export function isImageClip(clip: Clip | null | undefined): clip is ImageClip {
    return !!clip && clip.type === 'image';
}

export function isAudioClip(clip: Clip | null | undefined): clip is AudioClip {
    return !!clip && (clip.type === 'audio' || clip.type === 'music' || clip.type === 'extracted');
}

export function isTextClip(clip: Clip | null | undefined): clip is TextClip {
    return !!clip && clip.type === 'text';
}

export function isOverlayClip(clip: Clip | null | undefined): boolean {
    return !!clip && (clip.isOverlay === true || (!clip.isBase && clip.type !== 'audio' && clip.type !== 'music'));
}

