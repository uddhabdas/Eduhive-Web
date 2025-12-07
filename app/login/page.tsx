'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import Logo from "@/image.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      router.push("/home");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email, password);
      router.push("/home");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || "Login failed";
      setError(msg);
      if (err?.response?.status === 409) {
        setBlocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnlock = async () => {
    try {
      setError("");
      const res: any = await api.requestUnlockOtp(email);
      if (res && res.devOtp) {
        setOtp(String(res.devOtp));
      }
      setBlocked(true);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || "Failed to send OTP");
    }
  };

  const handleForceLogin = async () => {
    try {
      setLoading(true);
      const data = await api.forceLogout(email, otp);
      if (data?.token) router.push("/home");
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6 p-1 rounded-2xl bg-white shadow-lg border border-slate-100">
              <Image src={Logo} alt="EduHive" width={64} height={64} priority className="rounded-xl" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm font-medium">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 hover:bg-white hover:border-slate-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 hover:bg-white hover:border-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {!blocked && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
            )}

            {blocked && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                <div className="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-xl">
                  <p className="font-medium text-sm">Account logged in on another device.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Security Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center tracking-[0.5em] font-mono text-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder-slate-300"
                    placeholder="0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={handleRequestUnlock} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Send OTP</button>
                  <button type="button" onClick={handleForceLogin} className="px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20">Verify & Login</button>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-500 text-center font-medium">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors"
              >
                Create account
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
