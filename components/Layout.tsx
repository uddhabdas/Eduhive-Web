'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api, User } from "@/lib/api";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Click outside to close sidebar (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('aside');
      const menuButton = document.querySelector('button[aria-label="Toggle sidebar"]');
      
      if (sidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          menuButton && 
          !menuButton.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      const currentUser = api.getCurrentUser();
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
      
      // Debug logs only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Layout - Auth check:', { 
          hasUser: !!currentUser, 
          hasToken: !!token,
          userRole: currentUser?.role,
          pathname 
        });
      }
      
      // Skip auth check for auth pages
      if (pathname === '/login' || pathname === '/register') {
        setLoading(false);
        return;
      }
      
      if (!currentUser || currentUser.role !== "user" || !token) {
        console.log('Layout - User not authenticated, redirecting to login');
        api.logout();
        router.push("/login");
        return;
      }
      
      setUser(currentUser);
      setLoading(false);
    };
    
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway
      localStorage.removeItem('user_token');
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // The useEffect will handle redirect
  }

  const navItems = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/courses", label: "Courses", icon: "courses" },
    { href: "/my-courses", label: "My Learning", icon: "learning" },
    { href: "/wallet", label: "Wallet", icon: "wallet" },
    { href: "/profile", label: "Profile", icon: "profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <nav className="bg-white backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition duration-700"></div>
                <div className="relative flex items-center gap-3.5 px-2 py-1">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl transform group-hover:rotate-6 transition-transform duration-500 ease-out border border-gray-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl shadow-lg transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500 ease-out opacity-90 mix-blend-overlay"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src="/logo.png"
                        alt="Learnexia Logo"
                        className="w-7 h-7 object-contain mix-blend-multiply"
                      />
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col justify-center">
                    <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 transition-all duration-300">
                      Learnexia
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-tight mt-0.5 group-hover:text-emerald-600 transition-colors duration-300">
                      Student
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full backdrop-blur-md hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-emerald-600 text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-left pr-2">
                <p className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name || user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group relative px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50 flex items-center gap-2"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="relative group-hover:text-red-400 transition-colors">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:transition-none h-[calc(100vh-73px)] overflow-y-auto`}
        >
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
                (item.href === "/" && pathname === "/");
                
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-50/50 text-emerald-900 shadow-md shadow-emerald-500/10 border border-emerald-200"
                      : "text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 border border-transparent hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-xl shadow-lg shadow-emerald-500/50" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl" />
                    </>
                  )}
                  
                  {/* Hover glow effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}
                  
                  <div className={`relative z-10 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/20 transform scale-105 ring-2 ring-emerald-200/50" 
                      : "bg-gray-100 text-gray-500 group-hover:bg-gradient-to-br group-hover:from-emerald-50 group-hover:to-white group-hover:text-emerald-600 group-hover:shadow-lg group-hover:shadow-emerald-500/20 group-hover:scale-110 group-hover:ring-2 group-hover:ring-emerald-200/50"
                  }`}>
                    {item.icon === "home" && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                    {item.icon === "courses" && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                    {item.icon === "learning" && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )}
                    {item.icon === "wallet" && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {item.icon === "profile" && (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className="tracking-wide text-[15px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-65px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
