'use client';

import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CartItem = { _id: string; title: string; price: number; thumbnailUrl?: string };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [msg, setMsg] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('user_cart') : null;
        const arr = raw ? JSON.parse(raw) : [];
        setItems(Array.isArray(arr) ? arr : []);
        const bal = await api.getWalletBalance().catch(() => ({ balance: 0 }));
        setBalance(bal.balance || 0);
      } catch {
        setItems([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeItem = (id: string) => {
    const next = items.filter((it) => it._id !== id);
    setItems(next);
    localStorage.setItem('user_cart', JSON.stringify(next));
  };

  const purchase = async (id: string) => {
    try {
      setMsg("");
      const res = await api.purchaseCourse(id);
      setMsg(res.message || 'Purchased');
      removeItem(id);
    } catch (e: any) {
      setMsg(e.message || 'Purchase failed');
    }
  };

  const total = items.reduce((s, it) => s + (it.price || 0), 0);
  const hasEnoughBalance =
    typeof balance === 'number' ? balance >= total && total > 0 : false;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cart</h2>
            <p className="text-gray-600">Review items and purchase using your wallet.</p>
          </div>
          {typeof balance === 'number' && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 flex flex-col items-end shadow-sm">
              <span className="text-[11px] uppercase tracking-wide text-emerald-600 font-bold">
                Wallet balance
              </span>
              <span className="text-base font-black">₹{balance.toFixed(2)}</span>
            </div>
          )}
        </div>
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}
        {msg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 px-4 py-3 rounded-lg">
            {msg}
          </div>
        )}
        {!loading && items.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg shadow-black/50 p-6 text-gray-400 flex flex-col items-center gap-3">
            <p>Your cart is empty.</p>
            <a
              href="/courses"
              className="px-4 py-2 text-sm rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Browse courses
            </a>
          </div>
        ) : !loading && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg shadow-black/50">
            <ul className="divide-y divide-gray-800">
              {items.map((it) => (
                <li key={it._id} className="p-4 flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 bg-gray-800 rounded-lg overflow-hidden">
                      {it.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.thumbnailUrl} alt={it.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{it.title}</p>
                      <p className="text-sm text-gray-400">₹{it.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => purchase(it._id)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Buy</button>
                    <button onClick={() => removeItem(it._id)} className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-800 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">Total</p>
                <p className="font-semibold text-emerald-400">₹{total}</p>
              </div>
              {total > 0 && (
                <div className="text-right text-xs text-gray-400 space-y-1">
                  {typeof balance === 'number' && (
                    <p>
                      Wallet after purchase:{' '}
                      <span className={hasEnoughBalance ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        ₹{(balance - total).toFixed(2)}
                      </span>
                    </p>
                  )}
                  {!hasEnoughBalance && (
                    <p className="text-red-400">Insufficient wallet balance for all items.</p>
                  )}
                  {hasEnoughBalance && (
                    <p className="text-emerald-400">You have enough balance to buy all items.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

