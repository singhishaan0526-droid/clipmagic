/**
 * Clip Magic — Playback & Synchronization Engine
 * frontend/src/core/playback-engine.ts
 */

import { PlaybackState } from '../types/timeline';

export type TimeUpdateCallback = (currentTime: number, state: PlaybackState) => void;
export type StateChangeCallback = (isPlaying: boolean, state: PlaybackState) => void;

export class PlaybackEngine {
    private state: PlaybackState = {
        isPlaying: false,
        currentTime: 0,
        duration: 10,
        playbackRate: 1.0,
        loop: false
    };

    private rafId: number | null = null;
    private lastTickTime: number = 0;
    private timeListeners: Set<TimeUpdateCallback> = new Set();
    private stateListeners: Set<StateChangeCallback> = new Set();

    public loopStart: number | null = null;
    public loopEnd: number | null = null;

    constructor(initialDuration = 10) {
        this.state.duration = Math.max(1, initialDuration);
    }

    public getState(): PlaybackState {
        return { ...this.state };
    }

    public getCurrentTime(): number {
        return this.state.currentTime;
    }

    public isPlaying(): boolean {
        return this.state.isPlaying;
    }

    public setDuration(duration: number): void {
        this.state.duration = Math.max(0.1, duration);
        if (this.state.currentTime > this.state.duration) {
            this.seek(this.state.duration);
        }
    }

    public setPlaybackRate(rate: number): void {
        this.state.playbackRate = Math.max(0.1, Math.min(10, rate));
    }

    public onTimeUpdate(cb: TimeUpdateCallback): () => void {
        this.timeListeners.add(cb);
        return () => this.timeListeners.delete(cb);
    }

    public onStateChange(cb: StateChangeCallback): () => void {
        this.stateListeners.add(cb);
        return () => this.stateListeners.delete(cb);
    }

    public play(): void {
        if (this.state.isPlaying) return;

        // If at end of timeline, wrap back to start or loop in-point
        if (this.state.currentTime >= this.state.duration - 0.05) {
            this.seek(this.loopStart !== null ? this.loopStart : 0);
        }

        this.state.isPlaying = true;
        this.lastTickTime = performance.now();
        this.notifyState();
        this.tick();
    }

    public pause(): void {
        if (!this.state.isPlaying) return;
        this.state.isPlaying = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.notifyState();
    }

    public togglePlay(): boolean {
        if (this.state.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.state.isPlaying;
    }

    public seek(time: number): void {
        const clamped = Math.max(0, Math.min(this.state.duration, time));
        this.state.currentTime = Number(clamped.toFixed(3));
        this.notifyTime();
    }

    public stepFrames(frames: number, fps = 30): void {
        const delta = frames / fps;
        this.seek(this.state.currentTime + delta);
    }

    private tick = (): void => {
        if (!this.state.isPlaying) return;

        const now = performance.now();
        const dt = Math.min((now - this.lastTickTime) / 1000, 0.1); // Cap delta at 100ms
        this.lastTickTime = now;

        const nextTime = this.state.currentTime + dt * this.state.playbackRate;

        // Check loop boundaries or timeline end
        if (this.loopEnd !== null && nextTime >= this.loopEnd) {
            this.seek(this.loopStart !== null ? this.loopStart : 0);
            if (!this.state.loop) {
                this.pause();
                return;
            }
        } else if (nextTime >= this.state.duration) {
            this.seek(this.state.duration);
            this.pause();
            return;
        } else {
            this.state.currentTime = nextTime;
            this.notifyTime();
        }

        this.rafId = requestAnimationFrame(this.tick);
    };

    private notifyTime(): void {
        const s = this.getState();
        this.timeListeners.forEach(cb => {
            try { cb(s.currentTime, s); } catch (e) { console.error(e); }
        });
    }

    private notifyState(): void {
        const s = this.getState();
        this.stateListeners.forEach(cb => {
            try { cb(s.isPlaying, s); } catch (e) { console.error(e); }
        });
    }

    public dispose(): void {
        this.pause();
        this.timeListeners.clear();
        this.stateListeners.clear();
    }
}
