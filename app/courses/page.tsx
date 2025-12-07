'use client';

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, Course } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [enrolled, setEnrolled] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [data, mine] = await Promise.all([
          api.getCourses(),
          api.getMyAccessCourses().catch(() => []),
        ]);
        setCourses(data);
        const map: Record<string, boolean> = {};
        mine.forEach((c) => {
          map[c._id] = true;
        });
        setEnrolled(map);
      } catch (e: any) {
        setError(e.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    // load initial cart count
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user_cart") : null;
      const arr = raw ? JSON.parse(raw) : [];
      setCartCount(Array.isArray(arr) ? arr.length : 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  const addToCart = (course: Course) => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("user_cart") : null;
      const arr = raw ? JSON.parse(raw) : [];
      const exists = Array.isArray(arr) && arr.find((it: any) => it._id === course._id);
      const item = {
        _id: course._id,
        title: course.title,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
      };
      const next = exists ? arr : [item, ...arr];
      if (!exists) {
        setCartCount(next.length);
      }
      localStorage.setItem("user_cart", JSON.stringify(next));
    } catch {}
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [courses, query]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 shadow-2xl shadow-emerald-200/30 border-2 border-emerald-200/80 p-8 sm:p-10 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[120px] opacity-60 animate-pulse group-hover:opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent tracking-tight mb-2">All Courses</h2>
              <p className="text-gray-700 text-lg font-semibold max-w-lg">
                Expand your knowledge with our premium course collection.
              </p>
            </div>
            
            <a
              href="/cart"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 border-2 border-emerald-400/50 hover:from-emerald-600 hover:via-emerald-500 hover:to-blue-500 transition-all duration-300 shadow-xl shadow-emerald-400/40 hover:shadow-2xl hover:scale-105 text-white font-black"
            >
              <div className="relative">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H6.4M7 13l-1.6 8h12.2M7 13l1.6 8M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                  />
                </svg>
                {cartCount > 0 && (
                   <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-[10px] font-black text-white ring-2 ring-white shadow-lg">
                     {cartCount}
                   </span>
                )}
              </div>
              <span className="text-white font-black tracking-wide">Your Cart</span>
              <svg className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="mt-8 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses..."
              className="w-full pl-11 pr-4 py-4 bg-white border-2 border-emerald-200/80 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-lg shadow-emerald-100/50"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <a
                key={course._id}
                href={`/course/${course._id}`}
                className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-3xl border-2 border-emerald-200/80 shadow-xl hover:shadow-2xl hover:shadow-emerald-200/50 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-3 hover:border-emerald-300"
              >
                {/* Premium glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-blue-200/15 to-purple-200/20 group-hover:from-emerald-300/30 group-hover:via-blue-300/20 group-hover:to-purple-300/25 transition-all duration-500 rounded-3xl"></div>
                
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-blue-100 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/40 via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black rounded-full border-2 border-white/50 shadow-2xl shadow-emerald-500/50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      View Details →
                    </span>
                  </div>
                  {enrolled[course._id] && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black rounded-full shadow-xl shadow-emerald-500/40 border-2 border-white/50 z-10">
                      Enrolled
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col relative z-10">
                  <div className="absolute -top-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-400/40 flex items-center justify-center text-white border-2 border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-20">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent mb-2 line-clamp-2 group-hover:from-emerald-600 group-hover:via-blue-600 group-hover:to-purple-600 transition-all pt-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed font-medium">
                    {course.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t-2 border-emerald-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{course.lectureCount || 0} Lessons</span>
                    </div>
                    
                    {!enrolled[course._id] && (
                      course.price > 0 ? (
                        <span className="text-lg font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">₹{course.price}</span>
                      ) : (
                        <span className="text-lg font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Free</span>
                      )
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform lg:translate-y-2 lg:group-hover:translate-y-0">
                    {enrolled[course._id] ? (
                      <button className="col-span-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-emerald-400/30 hover:scale-105">
                        Continue Learning →
                      </button>
                    ) : (
                      course.price > 0 ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(course);
                            }}
                            className="py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-xl shadow-emerald-400/30 hover:shadow-2xl transition-all active:scale-95"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              try { window.location.assign(`/course/${course._id}`); } catch {}
                            }}
                            className="py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-black rounded-xl hover:from-gray-200 hover:to-gray-100 border-2 border-gray-200 transition-all"
                          >
                            Details
                          </button>
                        </>
                      ) : (
                        <button className="col-span-2 py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-white font-black rounded-xl hover:from-emerald-600 hover:via-emerald-500 hover:to-blue-500 shadow-xl shadow-emerald-400/30 transition-all hover:scale-105">
                          Start for Free →
                        </button>
                      )
                    )}
                  </div>
                </div>
              </a>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                   <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                </div>
                <p className="text-xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">No courses found</p>
                <p className="text-gray-600 mt-2 font-medium">Try adjusting your search or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
