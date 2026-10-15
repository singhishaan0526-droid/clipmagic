/**
 * Clip Magic - TypeScript Core Suite Entry Point
 * Exports all data contracts, core timeline calculations, compositing,
 * keyframes, transitions, audio mixing, filters, and rendering engines.
 */

// Types
export * from './types/clip';
export * from './types/project';
export * from './types/timeline';

// Core Engines
export * from './core/timeline-engine';
export * from './core/playback-engine';
export * from './core/compositor';
export * from './core/transition-engine';

// Feature Engines
export * from './features/keyframes';
export * from './features/audio';
export * from './features/filters';
export * from './features/overlays';

// Export Engine
export * from './export/render-engine';

// Import references for browser window registration
import * as ClipTypes from './types/clip';
import * as ProjectTypes from './types/project';
import { TimelineEngine } from './core/timeline-engine';
import { PlaybackEngine } from './core/playback-engine';
import { CompositorEngine } from './core/compositor';
import { TransitionEngine } from './core/transition-engine';
import { KeyframeEngine } from './features/keyframes';
import { AudioEngine } from './features/audio';
import { FilterEngine } from './features/filters';
import { OverlayEngine } from './features/overlays';
import { RenderEngine } from './export/render-engine';

export const ClipMagicCore = {
    // Engines
    TimelineEngine,
    PlaybackEngine,
    CompositorEngine,
    TransitionEngine,
    KeyframeEngine,
    AudioEngine,
    FilterEngine,
    OverlayEngine,
    RenderEngine,

    // Project Helpers
    createDefaultProject: ProjectTypes.createDefaultProject,
    validateProjectState: ProjectTypes.validateProjectState,

    // Clip Guards
    isVideoClip: ClipTypes.isVideoClip,
    isAudioClip: ClipTypes.isAudioClip,
    isTextClip: ClipTypes.isTextClip,
    isImageClip: ClipTypes.isImageClip
};

// Automatic window attachment for non-module scripts (editor.html compatibility)
if (typeof window !== 'undefined') {
    const win = window as any;
    win.ClipMagicCore = ClipMagicCore;
    win.TimelineEngine = TimelineEngine;
    win.PlaybackEngine = PlaybackEngine;
    win.CompositorEngine = CompositorEngine;
    win.TransitionEngine = TransitionEngine;
    win.KeyframeEngine = KeyframeEngine;
    win.AudioEngine = AudioEngine;
    win.FilterEngine = FilterEngine;
    win.OverlayEngine = OverlayEngine;
    win.RenderEngine = RenderEngine;
}

export default ClipMagicCore;
