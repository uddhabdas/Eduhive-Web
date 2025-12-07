'use client';

import Layout from "@/components/Layout";
import { api, User } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<{ coursesEnrolled: number; totalWatchTime: number; completedLectures: number } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  
  // Password Change State
  const [changePassMode, setChangePassMode] = useState(false);
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Enrolled Courses Dropdown State
  const [showCoursesList, setShowCoursesList] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = api.getCurrentUser();
        setUser(u);
        setName(u?.name || "");
        
        const [sum, bal, courses] = await Promise.all([
          api.getProfileSummary().catch(() => ({ coursesEnrolled: 0, totalWatchTime: 0, completedLectures: 0 })),
          api.getWalletBalance().catch(() => ({ balance: 0 })),
          api.getMyCourses().catch(() => []),
        ]);
        
        setSummary(sum);
        setBalance(bal.balance || 0);
        setMyCourses(courses);
      } catch (e: any) {
        setError(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      const updated = await api.updateMe({ name });
      setUser(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      setPassError("New passwords do not match");
      return;
    }
    if (passData.new.length < 6) {
      setPassError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess("");
      await api.changePassword(passData.old, passData.new);
      setPassSuccess("Password changed successfully!");
      setPassData({ old: "", new: "", confirm: "" });
      setTimeout(() => {
        setChangePassMode(false);
        setPassSuccess("");
      }, 2000);
    } catch (e: any) {
      setPassError(e.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pb-10 relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          </div>
        ) : error ? (
           <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg">{error}</div>
        ) : user ? (
          <div className="space-y-8">
            {/* Premium Colorful Brand Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 shadow-2xl shadow-emerald-200/30 border-2 border-emerald-200/80 p-8 text-center group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[120px] opacity-60 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-pulse animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-emerald-700 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tighter drop-shadow-lg">
                  EduHive
                </h1>
                <div className="flex items-center gap-3 text-gray-600 font-bold text-sm tracking-widest uppercase">
                  <span>Student</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Learn · Practice · Grow</span>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-gradient-to-r from-white via-emerald-50/50 to-blue-50/50 backdrop-blur-sm p-3 pr-6 rounded-full border-2 border-emerald-200/80 hover:border-emerald-300 transition-all duration-300 group/card shadow-xl shadow-emerald-100/50">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-emerald-400/40 group-hover/card:scale-110 transition-transform border-2 border-white/50">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-black text-xl leading-none mb-1">{user.name || 'Student'}</h3>
                    <p className="text-emerald-700 text-xs font-black uppercase tracking-wider">Student Account</p>
                  </div>
                  <div className="h-8 w-px bg-emerald-200 hidden sm:block"></div>
                  <button 
                    onClick={() => { api.logout(); router.push('/login'); }}
                    className="px-5 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 border-2 border-rose-400/50 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-400/30 hover:shadow-xl hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enrolled Courses - Interactive */}
              <div 
                className="relative group bg-gradient-to-br from-white via-emerald-50/50 to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-emerald-200/80 flex flex-col gap-2 cursor-pointer hover:border-emerald-300 transition-all hover:shadow-2xl hover:-translate-y-1"
                onClick={() => setShowCoursesList(!showCoursesList)}
                onMouseEnter={() => setShowCoursesList(true)}
                onMouseLeave={() => setShowCoursesList(false)}
              >
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl shadow-blue-400/40 border-2 border-white/50">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-600 uppercase tracking-wider">Enrolled Courses</p>
                      <p className="text-3xl font-black bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">{myCourses.length}</p>
                    </div>
                     <div className="ml-auto text-emerald-600">
                        <svg className={`w-5 h-5 transform transition-transform ${showCoursesList ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                     </div>
                </div>
                
                {/* Dropdown List */}
                <div className={`mt-4 space-y-2 overflow-hidden transition-all duration-300 ${showCoursesList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                   <div className="h-px bg-emerald-200 mb-3"></div>
                   {myCourses.length > 0 ? (
                       myCourses.map((c) => (
                           <div key={c._id} className="flex items-center justify-between p-3 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" onClick={(e) => {
                               e.stopPropagation();
                               router.push(`/learn/${c._id}`);
                           }}>
                               <span className="text-gray-800 text-sm line-clamp-1 font-bold">{c.title}</span>
                               <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                               </svg>
                           </div>
                       ))
                   ) : (
                       <p className="text-gray-600 text-sm font-medium">No courses found.</p>
                   )}
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="bg-gradient-to-br from-white via-emerald-50/50 to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-emerald-200/80 flex items-center gap-5 hover:border-emerald-300 transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-400/40 border-2 border-white/50">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-600 uppercase tracking-wider">Wallet Balance</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">₹{balance.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Premium Account Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-emerald-200/80 p-6">
                  <h3 className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="p-4 bg-white border-2 border-emerald-100 rounded-xl text-gray-800 font-bold shadow-sm">
                        {user.name || "Not set"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="p-4 bg-white border-2 border-emerald-100 rounded-xl text-gray-800 font-bold shadow-sm">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Account Type</label>
                      <div className="p-4 bg-gradient-to-r from-emerald-100 to-blue-100 border-2 border-emerald-200 rounded-xl text-emerald-700 font-black capitalize shadow-sm">
                        Student Account
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">Member ID</label>
                      <div className="p-4 bg-white border-2 border-emerald-100 rounded-xl text-gray-600 font-mono text-sm truncate shadow-sm">
                        {user._id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl p-6 shadow-xl relative overflow-hidden border-2 border-blue-200/80">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full mix-blend-overlay filter blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                    <h3 className="text-lg font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Quick Actions</h3>
                    <p className="text-gray-600 text-sm mb-6 font-medium">Manage your account and settings</p>
                    
                    <div className="space-y-3 relative z-10">
                      <button 
                        onClick={() => setChangePassMode(!changePassMode)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl text-sm font-black transition-all text-left flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                      >
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Change Password
                      </button>
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-xl text-sm font-black transition-all text-left flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105">
                         <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Support & Help
                      </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Password Change Modal */}
        {changePassMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Change Password
                </h3>
                <button 
                  onClick={() => { setChangePassMode(false); setPassError(""); setPassSuccess(""); setPassData({old:"", new:"", confirm:""}); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passError && <div className="text-red-200 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {passError}
                  </div>}
                  {passSuccess && <div className="text-emerald-200 text-sm bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {passSuccess}
                  </div>}
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Old Password</label>
                    <input 
                      type="password" 
                      required
                      value={passData.old}
                      onChange={e => setPassData({...passData, old: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passData.new}
                        onChange={e => setPassData({...passData, new: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passData.confirm}
                        onChange={e => setPassData({...passData, confirm: e.target.value})}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6 pt-2">
                    <button 
                      type="button"
                      onClick={() => { setChangePassMode(false); setPassError(""); setPassSuccess(""); setPassData({old:"", new:"", confirm:""}); }}
                      className="px-5 py-2.5 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={passLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                      {passLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {passLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
