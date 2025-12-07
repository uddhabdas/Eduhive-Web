"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { api } from "@/lib/api";

type Props = {
  src: string;
  poster?: string;
  start?: number;
  onTick?: (args: { position: number; duration: number }) => void;
  onEnded?: (args: { position: number; duration: number }) => void;
};

export default function VideoPlayer({ src, poster, start = 0, onTick, onEnded }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [pos, setPos] = useState<number>(0);
  const [dur, setDur] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const [buffering, setBuffering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const percent = useMemo(() => {
    if (!dur) return 0;
    const p = Math.max(0, Math.min(1, pos / dur));
    return Math.round(p * 100);
  }, [pos, dur]);

  // Attach HLS / src only after user clicks play (initialized=true)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !initialized) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setReady(false);
    setError(null);
    setBuffering(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
    const hasTokenParam = src.includes("token=");
    const srcWithToken = token && !hasTokenParam
      ? `${src}${src.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : src;

    const isHls = Hls.isSupported() && (src.endsWith(".m3u8") || src.includes("/manifest"));

    if (isHls) {
      const hls = new Hls({
        enableWorker: true,
        maxBufferSize: 10 * 1024 * 1024, // 10MB to reduce waiting time
        maxBufferLength: 30, // 30 seconds buffer
        maxMaxBufferLength: 60,
        startFragPrefetch: true,
        startPosition: start > 0 ? start : -1,
        xhrSetup: (xhr) => {
          if (token) {
            try { xhr.setRequestHeader("Authorization", `Bearer ${token}`); } catch {}
          }
        },
      });

      hlsRef.current = hls;
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(srcWithToken);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setReady(true);
        setBuffering(false);
        try {
          if (start > 0) {
            video.currentTime = start;
          }
          // try autoplay once manifest is ready
          video.play().catch(() => {});
        } catch {}
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setError("Playback error");
              setBuffering(false);
              break;
          }
        }
      });
    } else {
      // Native playback
      video.src = srcWithToken;
      video.load();
      try {
        if (start > 0) video.currentTime = start;
        video.play().catch(() => {});
      } catch {}
    }

    // Event listeners
    const timeUpdate = () => {
      if (video.duration) {
        setPos(video.currentTime);
        setDur(video.duration);
        onTick && onTick({ position: video.currentTime, duration: video.duration });
      }
    };

    const onPlay = () => {
      setPlaying(true);
      setBuffering(false);
      try { api.logEvent("play", { position: video.currentTime }); } catch {}
    };

    const onPause = () => {
      setPlaying(false);
      try { api.logEvent("pause", { position: video.currentTime }); } catch {}
    };

    const onEndedHandler = () => {
      try { api.logEvent("complete", { position: video.currentTime, duration: video.duration }); } catch {}
      if (onEnded && video.duration) onEnded({ position: video.currentTime, duration: video.duration });
    };

    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => {
      setBuffering(false);
      setReady(true);
    };

    const onNativeError = () => {
      if (video.error) {
        setError("Video load error");
        setBuffering(false);
      }
    };

    video.addEventListener("timeupdate", timeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEndedHandler);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onNativeError);

    return () => {
      video.removeEventListener("timeupdate", timeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEndedHandler);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onNativeError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, start, initialized, onTick, onEnded]);

  // Startup timeout: if initialized but not ready after 30s, show softer error
  useEffect(() => {
    if (!initialized || ready || error) return;
    const id = window.setTimeout(() => {
      if (!ready) {
        setError("Video is taking longer than expected. Please try again.");
        setBuffering(false);
      }
    }, 30000);
    return () => window.clearTimeout(id);
  }, [initialized, ready, error]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!initialized) {
      setInitialized(true);
      return;
    }
    try {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    } catch {}
  };

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    try {
      const next = Math.max(0, Math.min((v.duration || 0) || 0, v.currentTime + delta));
      v.currentTime = next;
    } catch {}
  };

  const handleRetry = () => {
    setError(null);
    setInitialized(false);
    setReady(false);
    setBuffering(false);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-xl bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        controls={false}
        playsInline
        crossOrigin="anonymous"
        poster={poster}
        preload="metadata"
        className="w-full h-auto min-h-[400px] bg-black"
      />

      {/* Loading State */}
      {initialized && (!ready || buffering) && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 pointer-events-none">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error / retry overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-3">
          <p className="text-white text-sm mb-1">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-sm rounded-full bg-white text-gray-900 hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Center play button - only the central button is clickable so bottom controls work correctly */}
      {!error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            type="button"
            onClick={togglePlay}
            className={`focus:outline-none pointer-events-auto transform transition-all duration-300 ${playing ? 'opacity-0 scale-110 hover:opacity-100 hover:scale-100' : 'opacity-100 scale-100'}`}
            aria-label={playing ? "Pause" : "Play"}
          >
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 hover:bg-emerald-500/90 hover:border-emerald-500 hover:scale-110 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              {playing ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Bottom controls bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 flex flex-col gap-3 z-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group/progress">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 relative" style={{ width: `${percent}%` }}>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="text-white hover:text-emerald-400 transition-colors"
            >
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              className="text-white/80 hover:text-white transition-colors group flex items-center gap-1"
              title="Back 10s"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
              <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">-10</span>
            </button>
            <button
              type="button"
              onClick={() => seekBy(10)}
              className="text-white/80 hover:text-white transition-colors group flex items-center gap-1"
              title="Forward 10s"
            >
              <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">+10</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V8a1 1 0 00-1.6-.8l-5.334 4a1 1 0 000 1.6l5.334 4A1 1 0 0013 16zm8 0V8a1 1 0 00-1.6-.8l-5.334 4a1 1 0 000 1.6l5.334 4A1 1 0 0021 16z" />
              </svg>
            </button>
            
            <span className="text-xs font-medium text-gray-300 font-mono">
              {Math.floor(pos / 60)}:{Math.floor(pos % 60).toString().padStart(2, '0')} / {Math.floor(dur / 60)}:{Math.floor(dur % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={speed}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSpeed(val);
                if (videoRef.current) videoRef.current.playbackRate = val;
              }}
              className="bg-black/50 text-white text-xs font-bold border border-white/10 rounded-lg px-2 py-1 backdrop-blur-md hover:bg-white/10 transition-colors outline-none focus:border-emerald-500"
              aria-label="Playback speed"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                const isFs = typeof document !== 'undefined' && !!document.fullscreenElement;
                try {
                  if (!isFs) {
                    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
                    else (v as any).webkitEnterFullscreen?.();
                  } else {
                    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                  }
                } catch {}
              }}
              className="text-white hover:text-emerald-400 transition-colors"
              title="Fullscreen"
              aria-label="Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
