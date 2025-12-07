'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { api, Course } from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const [course, setCourse] = useState<Course | null>(null);
  const [purchased, setPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setError("");
        const [c, purch] = await Promise.all([
          api.getCourseDetails(id),
          api.isCoursePurchased(id).catch(() => ({ purchased: false })),
        ]);
        setCourse(c);
        setPurchased(!!(purch as any)?.purchased);
      } catch (e: any) {
        setError(e.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      try {
        setScrolled((window.scrollY || 0) > 160);
      } catch {}
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handlePurchase = async () => {
    try {
      setActionMsg("");
      const res = await api.purchaseCourse(id);
      setPurchased(true);
      setActionMsg(res.message || "Course purchased successfully");
    } catch (e: any) {
      setActionMsg(e.message || "Purchase failed");
    }
  };

  
  
  return (
    <Layout>
      {/* Premium Sticky mini-header */}
      {course && (
        <div className={`fixed top-0 inset-x-0 z-40 transition-opacity duration-200 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-gradient-to-r from-white via-emerald-50/90 to-blue-50/90 backdrop-blur-md border-b-2 border-emerald-200/80 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-100 border-2 border-emerald-200">
                  {course.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="text-sm font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent line-clamp-1">{course.title}</p>
              </div>
              <div>
                {course.price > 0 && !purchased && (
                  <button 
                    onClick={handlePurchase} 
                    className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-400/30 hover:shadow-xl hover:scale-105 transition-all font-black"
                  >
                    Buy • ₹{course.price}
                  </button>
                )}
                {purchased && (
                  <a 
                    href={`/learn/${course._id}`} 
                    className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl border-2 border-emerald-400/50 hover:from-emerald-600 hover:to-emerald-700 shadow-lg transition-all font-black"
                  >
                    Go to My Learning
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-lg font-bold">{error}</div>
        )}
        {!loading && !error && course && (
          <div className="space-y-8">
            {/* Premium Colorful Hero */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-200/80 shadow-2xl shadow-emerald-200/30 group">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"></div>
               {/* Animated Background Elements */}
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse group-hover:opacity-80"></div>
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-60 animate-pulse animation-delay-2000 group-hover:opacity-70"></div>
               <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
               
               {/* Shimmer effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:px-10 sm:py-16">
                  <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl shadow-emerald-200/50 border-2 border-emerald-200/80 transform transition-transform hover:scale-[1.02] duration-500">
                       <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-blue-100 relative">
                          {course.thumbnailUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={course.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/40 via-blue-500/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
                       </div>
                       {!purchased && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full border-2 border-white/50 shadow-xl flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Preview Mode
                          </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                      <div className="inline-flex items-center gap-2 mb-4">
                        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 border-2 border-emerald-300/50 text-emerald-700 text-xs font-black uppercase tracking-wider shadow-lg">
                          Verified Course
                        </span>
                        {(course as any).rating && (
                           <span className="flex items-center gap-1 text-amber-600 text-sm font-black bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                             <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                             {Number((course as any).rating).toFixed(1)}
                           </span>
                        )}
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent drop-shadow-lg">
                        {course.title}
                      </h1>
                      
                      <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mb-8 font-semibold">
                        {course.description}
                      </p>
                      
                      <div className="mt-auto flex flex-wrap items-center gap-4">
                        {course.price > 0 && !purchased && (
                          <button 
                            onClick={handlePurchase} 
                            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                          >
                            <span>Unlock Full Access</span>
                            <span className="bg-emerald-700/50 px-2 py-0.5 rounded text-sm">₹{course.price}</span>
                          </button>
                        )}
                        {purchased && (
                          <div className="flex items-center gap-4">
                            <span className="px-4 py-2 text-sm font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Already Enrolled
                            </span>
                            <a 
                              href={`/learn/${course._id}`} 
                              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Start Learning
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {actionMsg && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-lg text-sm font-black ${
                          actionMsg.includes('success') || actionMsg.includes('purchased')
                            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700'
                            : 'bg-gradient-to-r from-rose-50 to-rose-100 border-rose-300 text-rose-700'
                        }`}>
                           {actionMsg.includes('success') || actionMsg.includes('purchased') ? (
                             <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           ) : (
                             <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           )}
                           {actionMsg}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>

            {/* Premium Course Overview */}
            <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-3xl border-2 border-emerald-200/80 shadow-xl shadow-emerald-100/50 overflow-hidden">
              <div className="p-8 border-b-2 border-emerald-200/50 bg-gradient-to-r from-white to-emerald-50/50">
                <h3 className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></span>
                  {purchased ? 'Your Enrollment Status' : 'Course Highlights'}
                </h3>
              </div>
              <div className="p-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 transition-all shadow-lg hover:shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-400/40 flex items-center justify-center text-2xl border-2 border-white/50">👨‍🏫</div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Instructor</p>
                      <p className="text-gray-900 font-black text-lg">EduHive Expert</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-400/40 flex items-center justify-center text-2xl border-2 border-white/50">📚</div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Content</p>
                      <p className="text-gray-900 font-black text-lg">{course.lectureCount} Lectures</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:border-purple-300 transition-all shadow-lg hover:shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-xl shadow-purple-400/40 flex items-center justify-center text-2xl border-2 border-white/50">♾️</div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Validity</p>
                      <p className="text-gray-900 font-black text-lg">Lifetime Access</p>
                    </div>
                  </div>
                </div>

                {!purchased && (
                  <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-3 shadow-xl shadow-amber-400/30 border-2 border-white/50">
                       <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                    </div>
                    <p className="font-black text-gray-900 mb-1">Content is locked</p>
                    <p className="text-sm text-gray-600 font-semibold">Purchase this course to unlock all lectures and materials.</p>
                  </div>
                )}

                {!purchased && course.lectureCount > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Course Syllabus
                    </h4>
                    <div className="space-y-3">
                      {Array.from({ length: Math.min(course.lectureCount, 5) }).map((_, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-4 rounded-xl bg-white border-2 border-emerald-200/80 hover:border-emerald-300 hover:shadow-lg transition-all">
                          <div className="flex items-center gap-4">
                             <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-black border-2 border-emerald-300 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-colors">
                               {idx + 1}
                             </span>
                             <div>
                               <p className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors">Introduction to Module {idx + 1}</p>
                               <p className="text-xs text-gray-600 font-semibold">Video Lecture • 15 mins</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      ))}
                      {course.lectureCount > 5 && (
                         <div className="text-center pt-2">
                           <span className="text-sm text-gray-600 font-bold">+ {course.lectureCount - 5} more lectures</span>
                         </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(course.highlights && course.highlights.length > 0) && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 shadow-xl shadow-emerald-100/50 border-2 border-emerald-200/80 p-1 group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
                <div className="relative bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-sm rounded-[1.4rem] p-8 border-2 border-emerald-200/50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-400/40 border-2 border-white/50">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Course Highlights</h3>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {course.highlights.map((h, idx) => (
                      <div key={idx} className="group flex items-start gap-3 p-4 rounded-2xl bg-white border-2 border-emerald-200/80 hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                        <span className="mt-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform shadow-lg shadow-emerald-400/30">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <p className="text-gray-800 group-hover:text-emerald-700 transition-colors leading-relaxed font-semibold">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(course.about && course.about.trim()) && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-xl shadow-blue-100/50 border-2 border-blue-200/80 p-1 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300/30 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
                
                <div className="relative bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm rounded-[1.4rem] p-8 sm:p-10 border-2 border-blue-200/50">
                   <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-400/40 border-2 border-white/50">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">About this course</h3>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-800 leading-8 whitespace-pre-line text-lg font-semibold">{course.about}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
