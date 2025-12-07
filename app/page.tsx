'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
    </div>
  );
}


