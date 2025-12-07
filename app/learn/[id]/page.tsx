'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import ChatAssistant from "@/components/ChatAssistant";
import { api, Course, LectureItem, ProgressSummary } from "@/lib/api";

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [rawLectures, setRawLectures] = useState<LectureItem[]>([]);
  const [current, setCurrent] = useState<LectureItem | null>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [purchased, setPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isLectureCollapsed, setIsLectureCollapsed] = useState(false);
  const [isMobileLecturesOpen, setIsMobileLecturesOpen] = useState(false);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const lastTickRef = useRef<{ position: number; duration: number } | null>(null);
  const lastSaveAtRef = useRef<number>(0);
  const firstSaveDoneRef = useRef<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setError("");
        const purch = await api.isCoursePurchased(id).catch(() => ({ purchased: false }));
        const isEnrolled = !!purch?.purchased;
        setPurchased(isEnrolled);
        if (!isEnrolled) {
          router.push(`/course/${id}`);
          return;
        }
        const [c, prog, items] = await Promise.all([
          api.getCourse(id),
          api.getProgress(id).catch(() => null),
          api.getLectures(id).catch(() => []),
        ]);
        setCourse(c);
        if (prog) {
          setLectures(prog.items);
          setSummary(prog.summary);
        }
        setRawLectures(items);
        const idsInOrder = items.map((l) => (l.lectureId as unknown as string));
        const incomplete = (prog?.items || []).find((it) => !it.isComplete);
        const initialId = (incomplete ? (incomplete.lectureId as unknown as string) : idsInOrder[0]) || null;
        const withVideo = items.find((l) => ((l.lectureId as unknown as string) === initialId)) || null;
        const firstWithUrl = items.find((l) => !!(l.videoUrl && (l.videoUrl as string).trim() !== "")) || null;
        const selected = withVideo || firstWithUrl || (items[0] || null);
        setCurrent(selected);
      } catch (e: any) {
        setError(e.message || "Failed to load learning data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const percent = useMemo(() => {
    return summary ? Math.round(summary.percent * 100) : 0;
  }, [summary]);

  const playback = useMemo<LectureItem | null>(() => {
    if (!current) return rawLectures[0] || null;
    const targetId = current.lectureId as unknown as string;
    const found = rawLectures.find((r) => (r.lectureId as unknown as string) === targetId);
    return found || current;
  }, [current, rawLectures]);

  const baseLectures = useMemo(() => {
    return lectures.length ? lectures : rawLectures;
  }, [lectures, rawLectures]);

  const filteredLectures = useMemo(() => {
    if (!filter.trim()) return baseLectures;
    const q = filter.trim().toLowerCase();
    return baseLectures.filter((it) => it.title.toLowerCase().includes(q));
  }, [baseLectures, filter]);

  const lectureCount = baseLectures.length;

  const currentIndex = useMemo(() => {
    if (!playback) return -1;
    return baseLectures.findIndex(
      (it) => (it.lectureId as unknown as string) === (playback.lectureId as unknown as string)
    );
  }, [baseLectures, playback]);

  useEffect(() => {
    if (currentIndex >= 0) {
      setKeyboardIndex(currentIndex);
    }
  }, [currentIndex]);

  const allowSkipWhenCompleted = false;

  const scrollLectureIntoView = (lectureId: string | number | undefined | null) => {
    if (!lectureId || typeof document === "undefined") return;
    const idStr = String(lectureId);
    const el = document.querySelector<HTMLElement>(`[data-lecture-id="${idStr}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  const handleLectureChange = (it: LectureItem) => {
    const prevId = playback?.lectureId as unknown as string;
    const last = lastTickRef.current;
    if (prevId && last) {
      api
        .upsertProgress({
          courseId: id,
          lectureId: prevId,
          videoId: playback?.videoId,
          position: last.position,
          duration: last.duration,
        })
        .catch(() => {});
    }
    const targetId = it.lectureId as unknown as string;
    const src = rawLectures.find((r) => (r.lectureId as unknown as string) === targetId);
    setCurrent(src || it);
    lastSaveAtRef.current = 0;
    firstSaveDoneRef.current = false;
  };

  const handleLectureListKeyDown = (event: any) => {
    if (!filteredLectures.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setKeyboardIndex((prev) => {
        const baseIndex = typeof prev === "number" && prev >= 0 ? prev : currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = event.key === "ArrowDown"
          ? Math.min(baseIndex + 1, filteredLectures.length - 1)
          : Math.max(baseIndex - 1, 0);
        const target = filteredLectures[nextIndex];
        if (target) {
          scrollLectureIntoView(target.lectureId as unknown as string);
        }
        return nextIndex;
      });
    } else if (event.key === "Enter" && keyboardIndex !== null && keyboardIndex >= 0) {
      event.preventDefault();
      const target = filteredLectures[keyboardIndex];
      if (!target) return;
      const shouldDisable =
        !allowSkipWhenCompleted &&
        !(playback?.isComplete) &&
        target.orderIndex > (playback?.orderIndex || 0);
      if (shouldDisable) return;
      handleLectureChange(target);
    }
  };

  const renderLectureItem = (it: LectureItem) => {
    const isCurrent = (playback?.lectureId as unknown as string) === (it.lectureId as unknown as string);
    const itemProgress = (() => {
      const p = it.position || 0;
      const d = it.duration || 0;
      if (d <= 0) return 0;
      const val = Math.max(0, Math.min(1, p / d));
      return Math.round(val * 100);
    })();
    
    const prevLecture = baseLectures.find(l => l.orderIndex === it.orderIndex - 1);
    const isUnlocked = !prevLecture || prevLecture.isComplete || it.orderIndex === 1;
    
    const shouldDisable =
      !allowSkipWhenCompleted &&
      !isUnlocked &&
      it.orderIndex > (playback?.orderIndex || 0);

    const index = filteredLectures.findIndex(
      (l) => (l.lectureId as unknown as string) === (it.lectureId as unknown as string)
    );
    const isKeyboardFocused = keyboardIndex === index;

    return (
      <li
        key={it.lectureId as unknown as string}
        data-lecture-id={it.lectureId as unknown as string}
        className={`group relative flex items-center gap-4 transition-all duration-300 ${
          isCurrent
            ? "bg-gradient-to-r from-emerald-100/50 via-blue-100/50 to-purple-100/50 border-l-4 border-emerald-500 py-4 px-5 rounded-r-lg shadow-lg shadow-emerald-200/30"
            : isKeyboardFocused
            ? "bg-gray-100/60 border-l-4 border-blue-500 py-3.5 px-5 rounded-r-lg"
            : shouldDisable
            ? "bg-gray-50/30 border-l-4 border-gray-200 py-3.5 px-5 rounded-r-lg opacity-60"
            : "bg-white/30 border-l-4 border-transparent hover:bg-gray-50/50 hover:border-gray-200 py-3.5 px-5 rounded-r-lg"
        }`}
        aria-current={isCurrent ? "true" : undefined}
      >
        {/* Current lecture indicator glow */}
        {isCurrent && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-r-full shadow-lg shadow-emerald-500/50"></div>
        )}
        
        <div className="min-w-0 flex-1 relative z-10">
          <div className="flex items-start justify-between gap-3 mb-2">
             <p className={`font-bold text-sm leading-tight transition-colors ${
               isCurrent 
                 ? 'bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent' 
                 : shouldDisable 
                 ? 'text-gray-500' 
                 : 'text-gray-800 group-hover:text-gray-900'
             }`}>
               {it.title}
             </p>
             <span className={`text-[10px] font-mono shrink-0 mt-0.5 px-1.5 py-0.5 rounded ${
               isCurrent 
                 ? 'bg-emerald-100 text-emerald-700' 
                 : 'text-gray-600 bg-gray-100'
             }`}>
               #{it.orderIndex}
             </span>
          </div>
          
          <div className="flex items-center gap-3">
            {it.isComplete ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-2 border-emerald-300/50 shadow-sm">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Completed
              </span>
            ) : itemProgress > 0 ? (
              <div className="flex items-center gap-2.5 flex-1 max-w-[160px]">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300/50">
                   <div 
                     className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300" 
                     style={{ width: `${itemProgress}%` }}
                   />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 min-w-[35px]">{itemProgress}%</span>
              </div>
            ) : shouldDisable ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-gray-500 px-2 py-0.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Locked
              </span>
            ) : (
              <span className="text-[10px] font-medium text-gray-500">Not started</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
          <button
            onClick={() => {
              if (shouldDisable) return;
              handleLectureChange(it);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              shouldDisable
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : it.isComplete
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-110 border-2 border-emerald-300/50 shadow-lg shadow-emerald-200/30"
                : isCurrent
                ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-xl shadow-emerald-500/40 hover:scale-110 hover:from-emerald-600 hover:to-blue-600 ring-2 ring-emerald-400/50"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200 hover:border-gray-300 hover:scale-105"
            }`}
            disabled={shouldDisable}
            title={shouldDisable ? "Complete previous lecture to unlock" : isCurrent ? "Currently playing" : "Play this lecture"}
            aria-label={`Play lecture ${it.orderIndex}: ${it.title}`}
          >
            {isCurrent ? (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4l15 8-15 8V4z"/></svg>
            ) : (
               <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
      </li>
    );
  };

  const handleJumpToCurrent = () => {
    if (!playback || !playback.lectureId) return;
    scrollLectureIntoView(playback.lectureId as unknown as string);
  };

  const goToNextLecture = (force = false) => {
    if (!playback) return;
    const currentId = playback.lectureId as unknown as string;
    const list = baseLectures;
    const idx = list.findIndex(
      (it) => (it.lectureId as unknown as string) === currentId
    );
    if (idx < 0) return;
    const next = list[idx + 1];
    if (!next) return;
    const shouldDisable =
      !force &&
      !allowSkipWhenCompleted &&
      !(playback?.isComplete) &&
      next.orderIndex > (playback?.orderIndex || 0);
    if (shouldDisable) return;
    handleLectureChange(next);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20 lg:pb-10 max-w-7xl mx-auto">
        {/* Premium Colorful Header */}
        <section className="relative overflow-hidden rounded-3xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 shadow-2xl shadow-emerald-200/30 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3 group-hover:opacity-80 transition-opacity duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 -translate-x-1/3 translate-y-1/3 group-hover:opacity-70 transition-opacity duration-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 px-8 py-12">
            <div className="min-w-0 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-50 to-blue-100 border-2 border-emerald-300/50 text-emerald-700 text-[11px] font-black uppercase tracking-wider shadow-lg">
                  Course Content
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                <span className="text-sm font-bold text-gray-700 tracking-wide">In Progress</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent tracking-tight leading-tight max-w-3xl drop-shadow-lg">
                {course?.title || "Continue your course"}
              </h2>
              {summary && (
                <div className="flex items-center gap-5 text-gray-700 font-bold pt-2">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </div>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 text-sm">
                    <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent font-black text-xl">{percent}%</span> 
                    <span className="text-gray-600 font-bold">Completed</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="hidden md:flex flex-col items-end gap-5">
              {summary && (
                <div className="p-6 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-emerald-200/80 shadow-2xl w-72 group-hover:border-emerald-300 transition-colors duration-500">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-wider">Overall Progress</span>
                    <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-300 shadow-inner">
                    <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-full shadow-[0_0_20px_rgba(16,185,129,0.3)] relative transition-all duration-1000" style={{ width: `${percent}%` }}>
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/70 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsLectureCollapsed((prev) => !prev)}
                className="flex items-center gap-2.5 px-6 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl border-2 border-emerald-200 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white hover:border-emerald-300 shadow-lg transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={isLectureCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
                {isLectureCollapsed ? "Show lectures" : "Hide lectures"}
              </button>
            </div>
          </div>
          
          {summary && (
            <div className="mt-6 md:hidden px-6 pb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-300 shadow-inner">
                <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-3" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}
        </section>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 border-2 border-rose-300 text-rose-700 px-6 py-4 rounded-2xl shadow-lg font-bold">{error}</div>
        )}

        {!loading && !error && playback && (
          <>
            <div
              className={`grid gap-6 ${
                isLectureCollapsed ? "" : "lg:grid-cols-[1fr_380px] lg:items-start"
              }`}
            >
              {/* Premium Video Player Section */}
              <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-2xl border-2 border-emerald-200/80 shadow-2xl overflow-hidden">
                <div className="p-5 border-b-2 border-emerald-200/50 flex items-center justify-between gap-3 bg-white/50 backdrop-blur-sm">
                  <div className="min-w-0">
                    <p className="text-lg font-black bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent truncate flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                       {playback.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleJumpToCurrent}
                    className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-emerald-200 bg-white text-gray-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-lg"
                  >
                    Jump to current
                  </button>
                </div>
                <div className="p-0 bg-black">
                  {(() => {
                    const user = api.getCurrentUser();
                    const token =
                      typeof window !== "undefined" ? localStorage.getItem("user_token") : null;
                    if (!user || !token) {
                      return (
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-8 text-center m-4 shadow-lg">
                          <p className="text-amber-700 font-black text-lg">Authentication Required</p>
                          <p className="text-amber-600 text-sm mt-2 font-semibold">
                            Please log in to watch videos.
                          </p>
                        </div>
                      );
                    }
                    if (!playback || !playback.lectureId) {
                      return (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-8 text-center m-4 shadow-lg">
                          <p className="text-gray-800 font-black">No Lecture Available</p>
                          <p className="text-gray-600 text-sm mt-2 font-semibold">
                            No lecture selected or lecture data not available.
                          </p>
                        </div>
                      );
                    }
                    try {
                      const lectureId = playback.lectureId as unknown as string;
                      const sourceUrl = (playback.videoUrl || playback.previewUrl || "") as string;
                      const isHls = /\.m3u8(\?|$)/i.test(sourceUrl);
                      const isTs = /\.ts(\?|$)/i.test(sourceUrl);
                      const src =
                        isHls || isTs
                          ? api.getStreamingManifestUrl(lectureId)
                          : api.getStreamingUrl(lectureId);
                      return (
                        <VideoPlayer
                          key={lectureId}
                          src={src}
                          poster={course?.thumbnailUrl}
                          start={
                            lectures.find(
                              (l) => (l.lectureId as unknown as string) === lectureId
                            )?.position || 0
                          }
                          onTick={({ position, duration }) => {
                            lastTickRef.current = { position, duration };
                            const now = Date.now();
                            const since = now - lastSaveAtRef.current;
                            const initialReached = position >= 60;
                            const periodicReached = since >= 5 * 60 * 1000;
                            const nearComplete = duration > 0 && position / duration >= 0.9;
                            if (!firstSaveDoneRef.current && initialReached) {
                              firstSaveDoneRef.current = true;
                            }
                            if (
                              nearComplete ||
                              (!lastSaveAtRef.current && initialReached) ||
                              periodicReached
                            ) {
                              lastSaveAtRef.current = now;
                              api
                                .upsertProgress({
                                  courseId: id,
                                  lectureId: lectureId,
                                  videoId: playback.videoId,
                                  position,
                                  duration,
                                  isComplete: nearComplete ? true : undefined,
                                })
                                .then(() => {
                                  api
                                    .getProgress(id)
                                    .then((prog) => {
                                      setLectures(prog.items);
                                      setSummary(prog.summary);
                                    })
                                    .catch(() => {});
                                })
                                .catch(() => {});
                            }
                          }}
                          onEnded={({ position, duration }) => {
                            api
                              .upsertProgress({
                                courseId: id,
                                lectureId: lectureId,
                                videoId: playback.videoId,
                                position,
                                duration,
                                isComplete: true,
                              })
                              .then(() => {
                                api
                                  .getProgress(id)
                                  .then((prog) => {
                                    setLectures(prog.items);
                                    setSummary(prog.summary);
                                    goToNextLecture(true);
                                  })
                                  .catch(() => {
                                    goToNextLecture(true);
                                  });
                              })
                              .catch(() => {
                                goToNextLecture(true);
                              });
                          }}
                        />
                      );
                    } catch (err: any) {
                      return (
                        <div className="bg-gradient-to-r from-rose-50 to-rose-100 border-2 border-rose-300 rounded-xl p-8 text-center m-4 shadow-lg">
                          <p className="text-rose-700 font-black">Video Player Error</p>
                          <p className="text-rose-600 text-sm mt-2 font-semibold">
                            {err.message || "Failed to initialize video player"}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {!isLectureCollapsed && (
                <aside
                  id="desktop-lecture-list"
                  className="hidden lg:flex flex-col bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-3xl border-2 border-emerald-200/80 shadow-2xl backdrop-blur-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto scroll-touch focus:outline-none"
                  tabIndex={0}
                  aria-label="Course lectures"
                  onKeyDown={handleLectureListKeyDown}
                >
                  <div className="p-6 border-b-2 border-emerald-200/50 space-y-5 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent flex items-center gap-2.5 uppercase tracking-wider">
                        <span className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </span>
                        Course Content
                      </p>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-[10px] font-mono text-emerald-700 border-2 border-emerald-200 shadow-sm font-black">{lectureCount} items</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 group">
                        <input
                          type="search"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          placeholder="Search lectures..."
                          className="w-full pl-10 pr-4 py-3 text-xs font-bold bg-white border-2 border-emerald-200/50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-400 transition-all group-hover:bg-white group-hover:border-emerald-300 shadow-md"
                          aria-label="Search lectures"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 group-hover:text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={handleJumpToCurrent}
                        className="p-3 rounded-xl border-2 border-emerald-200 bg-white text-gray-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-lg"
                        title="Jump to current"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-emerald-200/50" aria-label="Lecture list">
                    {filteredLectures.map(renderLectureItem)}
                  </ul>
                </aside>
              )}
            </div>

            {/* Premium Mobile lectures bottom sheet trigger */}
            {lectureCount > 0 && (
              <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileLecturesOpen(true)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white via-emerald-50 to-blue-50 backdrop-blur-xl shadow-[0_-5px_20px_rgba(16,185,129,0.2)] border-t-2 border-emerald-200 text-sm font-black text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-expanded={isMobileLecturesOpen}
                  aria-controls="mobile-lecture-sheet"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start">
                      <span className="text-base font-black">Lectures ({lectureCount})</span>
                      {summary && (
                        <span className="text-xs text-emerald-700 font-bold">{percent}% complete</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border-2 border-emerald-200 font-black">Tap to browse</span>
                </button>

                {isMobileLecturesOpen && (
                  <div className="fixed inset-0 z-40 lg:hidden" aria-modal="true" role="dialog">
                    <div
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                      onClick={() => setIsMobileLecturesOpen(false)}
                    />
                    <section
                      id="mobile-lecture-sheet"
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-t-3xl shadow-2xl max-h-[85vh] transform transition-transform duration-300 ease-out translate-y-0 flex flex-col border-t-2 border-emerald-200"
                    >
                      <div className="px-6 pt-5 pb-4 border-b-2 border-emerald-200/50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                        <div>
                          <p className="text-lg font-black bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
                            Lectures ({lectureCount})
                          </p>
                          {summary && (
                            <p className="text-xs text-emerald-700 mt-0.5 font-bold">{percent}% complete</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleJumpToCurrent}
                            className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-emerald-200 bg-white text-gray-800 hover:bg-emerald-50 focus-visible:outline-none"
                          >
                            Current
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsMobileLecturesOpen(false)}
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 focus-visible:outline-none border-2 border-gray-200"
                            aria-label="Close lectures"
                          >
                            <span className="text-xl leading-none" aria-hidden="true">
                              ×
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 border-b-2 border-emerald-200/50 bg-white/50">
                        <input
                          type="search"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          placeholder="Search lectures..."
                          className="w-full px-4 py-3 text-sm bg-white border-2 border-emerald-200/50 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-gray-400 font-semibold shadow-md"
                          aria-label="Search lectures"
                        />
                      </div>
                      <div
                        className="flex-1 overflow-y-auto scroll-touch bg-white/30"
                        tabIndex={0}
                        onKeyDown={handleLectureListKeyDown}
                        aria-label="Course lectures"
                      >
                        <ul className="divide-y divide-emerald-200/50" aria-label="Lecture list">
                          {filteredLectures.map(renderLectureItem)}
                        </ul>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {/* Global course assistant floating button */}
      <ChatAssistant />
    </Layout>
  );
}
