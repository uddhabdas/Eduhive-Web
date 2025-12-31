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

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = api.getCurrentUser();
      const token = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;

      if (!currentUser || currentUser.role !== "user" || !token) {
        api.logout();
        router.push("/login");
        return;
      }
      setUser(currentUser);
    };
    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const navItems = [
    { href: "/home", label: "Home", icon: "home" },
    { href: "/courses", label: "Courses", icon: "courses" },
    { href: "/my-courses", label: "My Learning", icon: "learning" },
    { href: "/wallet", label: "Wallet", icon: "wallet" },
    { href: "/profile", label: "Profile", icon: "profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition duration-700"></div>

                <div className="relative flex items-center gap-3.5 px-2 py-1">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-gray-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl opacity-90 mix-blend-overlay"></div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="/logo.png" alt="Learnexia Logo" className="w-7 h-7 object-contain mix-blend-multiply" />
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col justify-center">
                    <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 transition-all duration-300">
                      Learnexia
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-0.5 group-hover:text-emerald-600 transition-colors duration-300">
                      Student
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* USER */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">{user.name || user.email}</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 text-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300`}>
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} className={`block px-4 py-3 rounded-xl ${isActive ? "bg-emerald-100 text-emerald-700" : "hover:bg-gray-100 text-gray-700"}`}>
                  {item.label}
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
