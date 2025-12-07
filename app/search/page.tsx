'use client';

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, Course } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await api.getCourses();
        setCourses(res);
      } catch (e: any) {
        setError(e.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Search</h2>
        </div>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
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

        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <a
                key={item._id}
                href={`/course/${item._id}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex gap-4 hover:shadow-md transition"
              >
                <div className="w-36 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-2">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

