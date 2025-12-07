'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import Logo from "@/image.png";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.register(name.trim(), email.trim(), password);
      setMessage("OTP sent to your email. Enter it below to verify.");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.verifyOtp(email.trim(), otp.trim());
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4 p-1 rounded-2xl bg-white shadow-lg border border-slate-100">
              <Image src={Logo} alt="EduHive" width={72} height={72} priority className="rounded-xl" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">EduHive</h1>
            <p className="text-slate-500 font-medium">
              {step === "form"
                ? "Create your account"
                : "Verify your email with OTP"}
            </p>
          </div>

          {step === "form" ? (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 hover:bg-white hover:border-slate-300"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 hover:bg-white hover:border-slate-300"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 hover:bg-white hover:border-slate-300"
                  placeholder="Min 6 characters"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
              <p className="text-sm text-slate-500 text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-emerald-600 hover:text-emerald-500 hover:underline font-bold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {message && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center text-sm font-medium">
                  {message}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Security Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center tracking-[0.75em] font-mono text-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 placeholder-slate-300"
                  placeholder="0000"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </button>
              <p className="text-sm text-slate-500 text-center">
                Wrong email?{" "}
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-emerald-600 hover:text-emerald-500 hover:underline font-bold transition-colors"
                >
                  Change email
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
