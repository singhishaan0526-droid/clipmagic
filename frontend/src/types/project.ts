/**
 * Clip Magic — Project, Track, and Media Asset Types
 * frontend/src/types/project.ts
 */

import { Clip } from './clip';

export type TrackType = 'video' | 'audio' | 'overlay' | 'text';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '4:3' | 'custom';

export interface Track {
    id: string;
    type: TrackType;
    name: string;
    isBase?: boolean;
    zIndex?: number;
    muted?: boolean;
    hidden?: boolean;
    locked?: boolean;
    clips: Clip[];
}

export interface MediaAsset {
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio';
    url: string;
    blob?: Blob;
    duration: number;
    width?: number;
    height?: number;
    fps?: number;
    size?: number;
}

export interface SubtitleWord {
    word: string;
    start: number;
    end: number;
}

export interface TextOverlay {
    id: string;
    kind?: 'text' | 'caption' | 'sticker' | 'lyric';
    text: string;
    name?: string;
    start: number;         // Start time in seconds
    end: number;           // End time in seconds
    x: number;             // Percent 0-100
    y: number;             // Percent 0-100
    size?: number;         // Font size or sticker px
    scale?: number;        // Scaling percentage (default 100)
    rotation?: number;     // Rotation in degrees (default 0)
    color?: string;
    style?: string;        // 'solid' | 'glow' | 'outline' | 'shadow' | 'gradient' | 'box'
    animation?: string;    // 'fade' | 'pop' | 'typewriter' | 'bounce' | 'slide-up' | etc.
    textFilter?: string;
    keyframes?: Array<{
        time: number;
        x: number;
        y: number;
        scale?: number;
        rotation?: number;
        opacity?: number;
    }>;
    words?: SubtitleWord[];
}

export interface EditorProject {
    id: string;
    name: string;
    schemaVersion: number;
    aspectRatio: AspectRatio;
    fps?: number;
    resolution?: string;
    duration?: number;
    musicVolume?: number;
    audioVolume?: number;
    mediaAssets: MediaAsset[];
    tracks: Track[];
    textOverlays?: TextOverlay[];
    updatedAt?: number;
}

/**
 * Creates an empty, valid default project state.
 */
export function createDefaultProject(id?: string, name?: string): EditorProject {
    return {
        id: id || `proj-${Date.now()}`,
        name: name || 'Untitled Project',
        schemaVersion: 2,
        aspectRatio: '16:9',
        fps: 30,
        musicVolume: 1.0,
        audioVolume: 1.0,
        mediaAssets: [],
        tracks: [
            { id: 'track-v1', type: 'video', name: 'Main Video', isBase: true, zIndex: 10, clips: [] },
            { id: 'track-a1', type: 'audio', name: 'Audio Track', zIndex: 5, clips: [] }
        ],
        textOverlays: [],
        updatedAt: Date.now()
    };
}

/**
 * Validates and safely migrates older or partially loaded project payloads.
 */
export function validateProjectState(raw: unknown): EditorProject {
    const fallback = createDefaultProject();
    if (!raw || typeof raw !== 'object') return fallback;

    const obj = raw as Partial<EditorProject>;
    const tracks: Track[] = Array.isArray(obj.tracks) && obj.tracks.length > 0
        ? obj.tracks.map((t, idx) => ({
            id: t.id || `track-${idx + 1}`,
            type: (t.type as TrackType) || (idx === 0 ? 'video' : 'audio'),
            name: t.name || (idx === 0 ? 'Main Video' : `Track ${idx + 1}`),
            isBase: t.isBase ?? (idx === 0),
            zIndex: typeof t.zIndex === 'number' ? t.zIndex : (idx === 0 ? 10 : 20 + idx * 5),
            muted: !!t.muted,
            hidden: !!t.hidden,
            locked: !!t.locked,
            clips: Array.isArray(t.clips) ? t.clips : []
        }))
        : fallback.tracks;

    return {
        id: typeof obj.id === 'string' ? obj.id : fallback.id,
        name: typeof obj.name === 'string' ? obj.name : fallback.name,
        schemaVersion: typeof obj.schemaVersion === 'number' ? obj.schemaVersion : 2,
        aspectRatio: (obj.aspectRatio as AspectRatio) || fallback.aspectRatio,
        fps: typeof obj.fps === 'number' ? obj.fps : 30,
        duration: typeof obj.duration === 'number' ? obj.duration : 0,
        musicVolume: typeof obj.musicVolume === 'number' ? obj.musicVolume : 1.0,
        audioVolume: typeof obj.audioVolume === 'number' ? obj.audioVolume : 1.0,
        mediaAssets: Array.isArray(obj.mediaAssets) ? obj.mediaAssets : [],
        tracks,
        textOverlays: Array.isArray(obj.textOverlays) ? obj.textOverlays : [],
        updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now()
    };
}
