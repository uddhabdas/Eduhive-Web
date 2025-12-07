'use client';

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { api, Course, ProgressSummary } from "@/lib/api";

type CourseWithProgress = Course & { _progress?: ProgressSummary | null };

export default function HomePage() {
  const [recommended, setRecommended] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const [all, my] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getMyAccessCourses().catch(() => []),
        ]);
        const sortedRec = [...all].sort(
          (a, b) => (b.lectureCount || 0) - (a.lectureCount || 0)
        );
        setRecommended(sortedRec);

        // Fetch progress for my courses
        const withProgress = await Promise.all(
          my.map(async (c) => {
            try {
              const prog = await api.getProgress(c._id);
              return { ...c, _progress: prog.summary };
            } catch {
              return { ...c, _progress: null };
            }
          })
        );
        setMyCourses(withProgress);

        // derive a friendly name for greeting
        try {
          const user = api.getCurrentUser();
          if (user) {
            const base = user.name && user.name.trim().length > 0 ? user.name : user.email;
            const first = base.split(" ")[0];
            setUserName(first);
          }
        } catch {
          // ignore greeting errors
        }
      } catch (e: any) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addToCart = (course: Course) => {
    try {
      const raw = localStorage.getItem('user_cart');
      const arr = raw ? JSON.parse(raw) : [];
      const exists = Array.isArray(arr) && arr.find((it: any) => it._id === course._id);
      const item = { _id: course._id, title: course.title, price: course.price, thumbnailUrl: course.thumbnailUrl };
      const next = exists ? arr : [item, ...arr];
      localStorage.setItem('user_cart', JSON.stringify(next));
    } catch {}
  };

  const greetingTitle = userName
    ? `Keep learning, ${userName}`
    : "Keep learning with EduHive";
  const greetingSubtitle =
    "Build your skills step by step. Continue your course or start something new today.";

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Hero banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 shadow-2xl shadow-emerald-200/30 border-2 border-emerald-200/80 px-6 py-10 sm:px-12 sm:py-14 group">
           {/* Animated Background Elements */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse group-hover:opacity-80"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse animation-delay-2000"></div>
           <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
           
           {/* Shimmer effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
            <div className="min-w-0 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 border-2 border-emerald-300/50 text-emerald-700 text-xs font-black uppercase tracking-widest mb-6 shadow-lg shadow-emerald-200/50">
                <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                </span>
                Welcome Back
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent tracking-tight leading-tight drop-shadow-lg">
                {greetingTitle}
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-gray-700 max-w-xl leading-relaxed font-semibold">
                {greetingSubtitle}
              </p>
              
              {myCourses.length > 0 ? (
                 <div className="mt-10 flex items-center gap-5">
                   <div className="flex -space-x-3 overflow-hidden p-1">
                     {myCourses.slice(0, 3).map((c, i) => (
                       <div key={c._id} className="inline-block h-14 w-14 rounded-full ring-4 ring-white bg-gradient-to-br from-emerald-400 to-blue-500 overflow-hidden shadow-xl">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                       </div>
                     ))}
                   </div>
                   <p className="text-base font-bold text-gray-700">
                     <span className="font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent text-xl">{myCourses.length}</span> active course{myCourses.length > 1 ? 's' : ''} in progress
                   </p>
                 </div>
              ) : (
                <div className="mt-10">
                  <a href="/courses" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white font-black shadow-xl shadow-emerald-400/40 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 group">
                    Start Learning
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/50 to-blue-50/50 border-2 border-emerald-200/80 shadow-2xl shadow-emerald-200/30 p-3 rotate-2 hover:rotate-0 transition-transform duration-500 group/card">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 p-8 text-white min-w-[280px] relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -mr-20 -mt-20 blur-2xl transition-opacity group-hover/card:opacity-75"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-16 -mb-16 blur-xl"></div>
                  
                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className="p-3 bg-white/30 rounded-xl shadow-lg border border-white/20">
                       <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                    </div>
                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg border border-white/20">Featured</span>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-emerald-100 text-xs font-black tracking-wider uppercase mb-2">Recommended for you</p>
                    <p className="text-5xl font-black mb-8 tracking-tight drop-shadow-lg">{recommended.length} Courses</p>
                    
                    <a
                      href="/courses"
                      className="w-full block text-center py-3.5 rounded-xl bg-white text-emerald-700 font-black text-sm hover:bg-emerald-50 transition-all shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 border-2 border-white/50"
                    >
                      Explore Catalog →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content sections */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">My Learning</h3>
              <a href="/my-courses" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">View all →</a>
            </div>
            
            <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-3xl border-2 border-emerald-200/80 shadow-xl shadow-emerald-100/50 p-6">
              {loading && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              )}
              {!loading && myCourses.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-bold">No active courses</p>
                  <p className="text-sm text-gray-600 mt-1">Start your learning journey today.</p>
                </div>
              )}
              {!loading && myCourses.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {myCourses.map((c) => {
                    const pct = Math.round((c._progress?.percent || 0) * 100);
                    return (
                    <a
                      key={c._id}
                      href={`/course/${c._id}`}
                      className="group relative bg-gradient-to-br from-white via-emerald-50/50 to-blue-50/50 rounded-2xl border-2 border-emerald-200/80 overflow-hidden hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300"
                    >
                      <div className="aspect-video bg-gradient-to-br from-emerald-100 to-blue-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/50 via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                           <span className="text-white text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">Continue Learning</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-1 group-hover:from-emerald-600 group-hover:to-blue-600 transition-all">{c.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden border border-gray-300/50 shadow-inner">
                             <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm" style={{ width: `${pct}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-emerald-700 min-w-[35px]">{pct}%</span>
                        </div>
                      </div>
                    </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Recommended for you</h3>
             <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl border-2 border-blue-200/80 shadow-xl shadow-blue-100/50 p-6">
              {loading && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600" />
                </div>
              )}
              {error && !loading && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}
              {!loading && !error && (
                <div className="space-y-4">
                  {recommended.slice(0, 3).map((c) => (
                    <div key={c._id} className="group flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-white via-emerald-50/50 to-blue-50/50 hover:from-emerald-100 hover:via-blue-100 hover:to-purple-100 transition-all border-2 border-emerald-200/50 hover:border-emerald-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                      <a href={`/course/${c._id}`} className="shrink-0 w-32 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-200 to-blue-200 relative shadow-lg border-2 border-white/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                      </a>
                      <div className="flex-1 min-w-0 py-1">
                        <a href={`/course/${c._id}`} className="block">
                          <p className="font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-1 group-hover:from-emerald-600 group-hover:to-blue-600 transition-all">{c.title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1 font-medium">{c.description}</p>
                        </a>
                        <div className="mt-2 flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-600">{c.lectureCount} lectures</span>
                           <div className="flex items-center gap-2">
                             {c.price > 0 ? (
                               <span className="text-sm font-black text-gray-900">₹{c.price}</span>
                             ) : (
                               <span className="text-sm font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Free</span>
                             )}
                             {c.price > 0 && (
                               <button onClick={() => addToCart(c)} className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:scale-110">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                 </svg>
                               </button>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

