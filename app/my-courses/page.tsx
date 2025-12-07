'use client';

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, Course, ProgressSummary } from "@/lib/api";

type CourseWithProgress = Course & { _progress?: ProgressSummary | null };

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const valid = await api.getMyAccessCourses();
        const withProgress = await Promise.all(
          valid.map(async (c) => {
            try {
              const prog = await api.getProgress(c._id);
              return { ...c, _progress: prog.summary };
            } catch {
              return { ...c, _progress: null };
            }
          })
        );
        setCourses(withProgress);
      } catch (e: any) {
        setError(e.message || "Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Colorful Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 shadow-2xl shadow-emerald-200/30 border-2 border-emerald-200/80 p-8 sm:p-12 group">
          {/* Animated gradient backgrounds */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[120px] opacity-60 animate-pulse group-hover:opacity-80 transition-opacity duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-pulse animation-delay-2000 group-hover:opacity-70 transition-opacity duration-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40 animate-pulse animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 border-2 border-emerald-300/50 text-emerald-700 text-xs font-black uppercase tracking-[0.15em] mb-6 shadow-lg shadow-emerald-200/50">
              <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
              </span>
              Active Learning Journey
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent tracking-tight mb-4 leading-tight drop-shadow-lg">
              My Learning
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl font-semibold max-w-2xl leading-relaxed">
              Track your progress, unlock achievements, and continue your journey to mastery.
            </p>
            
            {/* Stats */}
            {courses.length > 0 && (
              <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t-2 border-emerald-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-400/40 border-2 border-white/50">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{courses.length}</p>
                    <p className="text-xs text-gray-600 font-black uppercase tracking-wider">Courses</p>
                  </div>
                </div>
                {courses.filter(c => c._progress && c._progress.percent > 0).length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-400/40 border-2 border-white/50">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {Math.round(
                          courses
                            .filter(c => c._progress)
                            .reduce((acc, c) => acc + (c._progress?.percent || 0), 0) / courses.length * 100
                        )}%
                      </p>
                      <p className="text-xs text-gray-600 font-black uppercase tracking-wider">Avg Progress</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const progressPercent = course._progress ? Math.round(course._progress.percent * 100) : 0;
              return (
                <a
                  key={course._id}
                  href={`/learn/${course._id}`}
                  className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-3xl border-2 border-emerald-100/80 shadow-xl hover:shadow-2xl hover:shadow-emerald-200/50 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-3 hover:border-emerald-300"
                >
                  {/* Premium colorful glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-blue-200/15 to-purple-200/20 group-hover:from-emerald-300/30 group-hover:via-blue-300/20 group-hover:to-purple-300/25 transition-all duration-500 rounded-3xl"></div>
                  
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                  
                  <div className="aspect-video bg-gradient-to-br from-emerald-100 to-blue-100 relative overflow-hidden">
                    {course.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt="thumb"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    {/* Colorful gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/40 via-blue-500/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="relative z-20">
                        <div className="absolute inset-0 bg-emerald-500/40 rounded-full blur-xl animate-pulse"></div>
                        <span className="relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black rounded-full border-2 border-white/50 shadow-2xl shadow-emerald-500/50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Resume Course →
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress badge */}
                    {progressPercent > 0 && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full border-2 border-white/60 shadow-xl shadow-emerald-500/40 z-10">
                        <span className="text-xs font-black text-white">{progressPercent}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col relative z-10">
                    {/* Icon badge */}
                    <div className="absolute -top-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-400/40 flex items-center justify-center text-white border-2 border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-20">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent mb-5 line-clamp-2 group-hover:from-emerald-600 group-hover:via-blue-600 group-hover:to-purple-600 transition-all duration-300 pt-2 leading-tight">
                      {course.title}
                    </h3>
                    
                    {course._progress && progressPercent > 0 && (
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-600 uppercase tracking-[0.15em]">Progress</span>
                          <span className="text-sm font-black text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-50 px-3 py-1 rounded-lg border-2 border-emerald-300 shadow-sm">
                            {progressPercent}% Complete
                          </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-300/50 shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 relative shadow-lg shadow-emerald-500/30"
                            style={{ width: `${progressPercent}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!course._progress && (
                      <div className="mt-auto">
                        <div className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white font-black rounded-xl group-hover:from-emerald-600 group-hover:via-emerald-500 group-hover:to-blue-500 transition-all duration-300 border-2 border-emerald-400/50 text-center shadow-xl shadow-emerald-400/30 group-hover:shadow-2xl group-hover:shadow-emerald-500/40 group-hover:scale-105">
                          Start Learning →
                        </div>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
            
            {courses.length === 0 && (
               <div className="col-span-full py-12 text-center">
                 <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-400/30">
                   <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">No courses yet</h3>
                 <p className="text-gray-600 mb-6">Start your learning journey by exploring our catalog.</p>
                 <a href="/courses" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white font-black rounded-xl hover:from-emerald-600 hover:via-emerald-500 hover:to-blue-500 transition-all shadow-xl shadow-emerald-400/40 hover:shadow-2xl hover:scale-105">
                   Browse Courses
                 </a>
               </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
