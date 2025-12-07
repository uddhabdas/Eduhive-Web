'use client';

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { api, WalletBalance, WalletTransaction } from "@/lib/api";

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [upiConfig, setUpiConfig] = useState<{ upiId: string; qrUrl: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        
        // Execute requests
        // We don't use Promise.all to avoid one failure blocking the other if we want partial results,
        // but for balance we really need it.
        const txsPromise = api.getWalletTransactions().catch((e) => {
          console.error("Transactions fetch error:", e);
          return [];
        });
        
        const balancePromise = api.getWalletBalance();
        
        const [b, txs] = await Promise.all([balancePromise, txsPromise]);
        
        setBalance(b);
        setTransactions(txs);
        try {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/wallet/config`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token') || ''}` } });
          if (resp.ok) {
            const cfg = await resp.json();
            setUpiConfig(cfg);
          }
        } catch {}
      } catch (e: any) {
        setError(e.message || "Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitTopup = async () => {
    try {
      setMsg("");
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) {
        setMsg("Enter a valid amount");
        return;
      }
      const tx = await api.submitWalletTopup(amt, utr.trim(), desc.trim());
      setTransactions([tx, ...transactions]);
      setMsg("Top-up request submitted");
      setAmount("");
      setUtr("");
      setDesc("");
    } catch (e: any) {
      setMsg(e.message || "Failed to submit top-up");
    }
  };

  

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto">
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
              Secure Digital Wallet
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent tracking-tight mb-4 leading-tight drop-shadow-lg">
              My Wallet
            </h2>
            <p className="text-gray-700 text-lg sm:text-xl font-semibold max-w-2xl leading-relaxed">
              Manage your funds securely, track all transactions, and top-up instantly with UPI.
            </p>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
            {/* Premium Colorful Balance card */}
            <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-3xl shadow-2xl shadow-emerald-200/30 border-2 border-emerald-200/80 p-8 sm:p-10 flex flex-col h-fit relative overflow-hidden group">
              {/* Premium colorful animated backgrounds */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300/40 rounded-full mix-blend-overlay filter blur-[120px] opacity-60 animate-pulse group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-300/40 rounded-full mix-blend-overlay filter blur-[100px] opacity-50 animate-pulse animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-overlay filter blur-[80px] opacity-40"></div>
              
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs font-black text-emerald-700 tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Total Balance
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">₹</span>
                      <span className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-emerald-700 via-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
                        {(balance?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white/50 flex items-center justify-center shadow-xl shadow-emerald-400/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 border-2 border-emerald-300/50 shadow-lg">
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 border-2 border-emerald-400/50 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-400/30">
                    Active Account
                  </div>
                  <p className="text-xs text-gray-700 font-bold flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available for instant use
                  </p>
                </div>
              </div>

              <div className="mt-10 relative z-10 border-t-2 border-emerald-200/50 pt-8">
                <div className="flex items-center justify-between mb-6">
                   <p className="text-sm font-black bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent uppercase tracking-[0.15em] flex items-center gap-2">
                     <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     Recent Activity
                   </p>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 custom-scrollbar-dark">
                  <ul className="space-y-3">
                    {transactions.map((t) => (
                      <li
                        key={t._id}
                        className="group p-5 flex items-center justify-between bg-gradient-to-r from-white via-emerald-50/50 to-blue-50/50 hover:from-emerald-100 hover:via-blue-100 hover:to-purple-100 border-2 border-emerald-200/50 hover:border-emerald-400 rounded-2xl transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/60 hover:-translate-y-1"
                        onClick={() => setSelected(t)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                            t.type === 'credit' 
                              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' 
                              : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white'
                          }`}>
                            {t.type === 'credit' ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-blue-700 transition-all">
                              {t.type === 'credit' ? 'Wallet Top-up' : 'Course Purchase'}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 font-medium">
                              {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-base font-black ${t.type === 'credit' ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black capitalize mt-1 shadow-sm ${
                            ['approved', 'completed', 'success', 'paid'].includes(t.status.toLowerCase()) ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-emerald-400/40' : 
                            ['rejected', 'failed'].includes(t.status.toLowerCase()) ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-rose-400/40' : 
                            'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-400/40'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                      </li>
                    ))}
                    {transactions.length === 0 && (
                      <li className="py-8 text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <svg className="w-6 h-6 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">No recent transactions</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Premium Topup form card */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200/80 shadow-2xl shadow-gray-900/10 p-8 sm:p-10 relative overflow-hidden group">
              {/* Subtle background effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/30 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
              
              <div className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider mb-4">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Transaction
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Add Money to Wallet</h3>
                <p className="text-sm text-gray-600 font-medium">Top up your wallet securely via UPI payment</p>
              </div>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="relative pl-10 border-l-4 border-emerald-500 pb-4">
                  <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 ring-4 ring-emerald-50 shadow-lg shadow-emerald-500/30"></div>
                  <h4 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">1</span>
                    Transfer Amount via UPI
                  </h4>
                  
                  <div className="bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/50 border-2 border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-100/50">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      {upiConfig?.qrUrl && (
                        <div className="shrink-0 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={upiConfig.qrUrl} alt="UPI QR" className="w-32 h-32 object-contain" />
                        </div>
                      )}
                      <div className="flex-1 w-full text-center sm:text-left">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UPI ID</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 group cursor-pointer" onClick={() => {
                           navigator.clipboard.writeText(upiConfig?.upiId || 'eduhive@ybl');
                           // Optional: toast notification
                        }}>
                          <code className="text-lg font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 group-hover:border-emerald-300 transition-colors">
                            {upiConfig?.upiId || 'eduhive@ybl'}
                          </code>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                          Scan the QR code or copy the UPI ID to make a payment using any UPI app (GPay, PhonePe, Paytm).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative pl-10 border-l-4 border-gray-200">
                  <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 ring-4 ring-white shadow-lg"></div>
                  <h4 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-black">2</span>
                    Submit Payment Details
                  </h4>
                  
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Amount Paid (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-lg">₹</span>
                          <input 
                            type="number"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-emerald-200/80 rounded-xl text-gray-900 font-black text-lg focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm hover:shadow-md" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Bank UTR / Ref No.
                        </label>
                        <input 
                          value={utr} 
                          onChange={(e) => setUtr(e.target.value)} 
                          placeholder="12-digit UTR number"
                          className="w-full px-4 py-3.5 bg-white border-2 border-emerald-200/80 rounded-xl text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm hover:shadow-md" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Note (Optional)
                      </label>
                      <input 
                        value={desc} 
                        onChange={(e) => setDesc(e.target.value)} 
                        placeholder="Any additional details..."
                        className="w-full px-4 py-3.5 bg-white border-2 border-emerald-200/80 rounded-xl text-gray-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm hover:shadow-md" 
                      />
                    </div>

                    {msg && (
                      <div className={`p-4 rounded-xl text-sm font-black border-2 shadow-lg flex items-center gap-3 ${
                        msg.includes('submitted') 
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-300' 
                          : 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border-rose-300'
                      }`}>
                        {msg.includes('submitted') ? (
                          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {msg}
                      </div>
                    )}

                    <button 
                      onClick={submitTopup} 
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white rounded-xl font-black shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      <span className="relative z-10">Submit Payment Details</span>
                      <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {selected && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelected(null)}>
                <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-emerald-200/80 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b-2 border-emerald-200/50 flex items-center justify-between bg-gradient-to-r from-white to-emerald-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        selected.type === 'credit' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' 
                          : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white'
                      }`}>
                        {selected.type === 'credit' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Transaction Details</p>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-emerald-100 transition-colors border-2 border-transparent hover:border-emerald-200" onClick={() => setSelected(null)} aria-label="Close">
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Type</p>
                        <p className="font-black text-gray-900 capitalize">{selected.type}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 text-xs font-black rounded-full capitalize ${
                          ['approved', 'completed', 'success', 'paid'].includes(selected.status.toLowerCase()) 
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-400/30' 
                            : ['rejected', 'failed'].includes(selected.status.toLowerCase()) 
                            ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-400/30' 
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-400/30'
                        }`}>{selected.status}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Amount</p>
                        <p className={`text-xl font-black ${selected.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                          {selected.type === 'credit' ? '+' : '-'}₹{selected.amount}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Created</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(selected.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {selected.utrNumber && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">UTR Number</p>
                        <p className="text-sm font-mono font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{selected.utrNumber}</p>
                      </div>
                    )}
                    {selected.upiId && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">UPI ID</p>
                        <p className="text-sm font-bold text-gray-900">{selected.upiId}</p>
                      </div>
                    )}
                    {selected.description && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Description</p>
                        <p className="text-sm font-medium text-gray-900">{selected.description}</p>
                      </div>
                    )}
                    {selected.adminNotes && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Admin Notes</p>
                        <p className="text-sm font-medium text-gray-900">{selected.adminNotes}</p>
                      </div>
                    )}
                    {(selected as any).processedAt && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Processed At</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(String((selected as any).processedAt)).toLocaleString()}</p>
                      </div>
                    )}
                    {(selected as any).processedBy && (
                      <div className="p-4 rounded-xl bg-white border-2 border-emerald-100 shadow-sm">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-1">Processed By</p>
                        <p className="text-sm font-bold text-gray-900">{typeof (selected as any).processedBy === 'string' ? (selected as any).processedBy : ((selected as any).processedBy?.email || (selected as any).processedBy?._id)}</p>
                      </div>
                    )}
                    <div className="flex justify-end pt-2">
                      <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-black hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-400/30 hover:shadow-xl transition-all hover:scale-105" onClick={() => setSelected(null)}>Close</button>
                    </div>
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
