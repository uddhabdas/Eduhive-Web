const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface User {
  _id: string;
  email: string;
  role: "user" | "teacher" | "admin";
  name: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  lectureCount: number;
  price: number;
  isPaid: boolean;
  about?: string;
  highlights?: string[];
  notes?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LectureItem {
  lectureId: string;
  videoId?: string;
  videoUrl?: string;
  previewUrl?: string;
  isPreview?: boolean;
  title: string;
  orderIndex: number;
  position: number;
  duration: number;
  completed: boolean;
  currentTime: number;
  totalDuration: number;
  isComplete: boolean;
}

export interface ProgressSummary {
  totalLectures: number;
  knownDurations: number;
  totalDuration: number;
  totalWatched: number;
  percent: number;
  remainingSeconds: number;
}

export interface PurchaseRecord {
  _id: string;
  courseId: Course | { _id: string } | string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface WalletBalance {
  balance: number;
  user?: { email: string; name: string };
}

export interface WalletTransaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  utrNumber?: string;
  description?: string;
  upiId?: string;
  adminNotes?: string;
  processedBy?: string | { _id: string; email?: string; name?: string };
  processedAt?: string | null;
  createdAt: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("user_token");
  }

  getStreamingUrl(lectureId: string) {
    if (!lectureId || typeof lectureId !== 'string' || lectureId.trim() === '') {
      console.error('getStreamingUrl: Invalid lectureId:', lectureId);
      throw new Error('Invalid lecture ID');
    }
    const token = this.getToken();
    const url = `${API_URL}/api/stream/${lectureId}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    return url;
  }

  getStreamingManifestUrl(lectureId: string) {
    if (!lectureId || typeof lectureId !== 'string' || lectureId.trim() === '') {
      throw new Error('Invalid lecture ID');
    }
    const token = this.getToken();
    const url = `${API_URL}/api/stream/${lectureId}/manifest${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    return url;
  }

  getProxyStream(originalUrl: string) {
    const token = this.getToken();
    const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
    return `${API_URL}/api/stream?url=${encodeURIComponent(originalUrl)}${tokenParam}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        data = { error: "Request failed" };
      }
      if (typeof window !== "undefined" && response.status === 401) {
        try {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user");
        } catch {}
        try {
          window.location.assign("/login");
        } catch {}
      }
      let errorMessage = "Request failed";
      if (data && typeof data === 'object') {
        errorMessage = data.error || data.message || "Request failed";
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else if (response.status >= 500) {
        errorMessage = "Server is currently unavailable. Please try again later.";
      }
      
      // Fallback: include status code if message is generic
      if (errorMessage === "Request failed") {
        errorMessage = `Request failed (${response.status}: ${response.statusText || 'Unknown'})`;
      }
      
      const err: any = new Error(errorMessage);
      err.response = { status: response.status, data };
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password, client: "web" }),
      }
    );

    if (data.user.role !== "user") {
      throw new Error("Only student accounts can use this web app");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  async requestUnlockOtp(email: string) {
    return this.request<{ message: string }>("/api/auth/request-unlock-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forceLogout(email: string, otp: string) {
    const data = await this.request<{ token: string; user: User }>(
      "/api/auth/force-logout",
      {
        method: "POST",
        body: JSON.stringify({ email, otp, client: "web" }),
      }
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async verifyOtp(email: string, otp: string) {
    const data = await this.request<{ token: string; user: User }>(
      "/api/auth/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, otp, client: "web" }),
      }
    );

    if (data.user.role !== "user") {
      throw new Error("Only student accounts can use this web app");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  }

  logout() {
    if (typeof window !== "undefined") {
      try {
        const u = this.getCurrentUser();
        if (u?.email) {
          // best-effort server logout to clear current session
          fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: u.email }),
          }).catch(() => {});
        }
      } catch {}
      localStorage.removeItem("user_token");
      localStorage.removeItem("user");
    }
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const value = localStorage.getItem("user");
    const parsed: User | null = value ? JSON.parse(value) : null;
    if (parsed && parsed.role !== "user") {
      this.logout();
      return null;
    }
    return parsed;
  }

  getCourses() {
    return this.request<Course[]>("/api/courses");
  }

  getMe() {
    return this.request<User>("/api/me");
  }

  async updateMe(payload: { name?: string }) {
    const updated = await this.request<User>("/api/me", {
      method: "PUT",
      body: JSON.stringify({ name: payload.name }),
    });
    if (typeof window !== "undefined") {
      try {
        const old = this.getCurrentUser();
        if (old && old.role === 'user') {
          const next = { ...old, name: updated.name } as User;
          localStorage.setItem("user", JSON.stringify(next));
        }
      } catch {}
    }
    return updated;
  }

  getRecommended() {
    return this.request<Course[]>("/api/courses/recommended");
  }

  getCourse(id: string) {
    return this.request<Course>(`/api/courses/${id}`);
  }

  async getCourseDetails(id: string) {
    try {
      return await this.request<Course>(`/api/courses/${id}/details`);
    } catch {
      return await this.getCourse(id);
    }
  }

  getMyAccessCourses() {
    return this.request<Course[]>(`/api/my/access`);
  }

  getMyCourses() {
    return this.getMyAccessCourses();
  }

  getLectures(id: string) {
    return this.request<any[]>(`/api/courses/${id}/lectures`).then((items) => {
      return (Array.isArray(items) ? items : []).map((l: any) => ({
        lectureId: (l._id || l.lectureId || '').toString(),
        videoId: l.videoId || undefined,
        videoUrl: l.videoUrl || undefined,
        previewUrl: l.previewUrl || undefined,
        isPreview: !!l.isPreview,
        title: l.title || 'Lecture',
        orderIndex: typeof l.orderIndex === 'number' ? l.orderIndex : 1,
        position: 0,
        duration: typeof l.duration === 'number' ? l.duration : 0,
        completed: false,
        currentTime: 0,
        totalDuration: typeof l.duration === 'number' ? l.duration : 0,
        isComplete: false,
      } as LectureItem));
    });
  }

  getProgress(courseId: string) {
    return this.request<{ summary: ProgressSummary; items: LectureItem[] }>(
      `/api/progress/course/${courseId}`
    );
  }

  async getLearningData(courseId: string) {
    try {
      const data = await this.request<{ summary: ProgressSummary; items: LectureItem[] }>(`/api/learning/${courseId}`);
      return data;
    } catch {
      const [prog, items] = await Promise.all([
        this.getProgress(courseId).catch(() => ({ summary: null, items: [] } as any)),
        this.getLectures(courseId).catch(() => []),
      ]);
      return { summary: (prog as any).summary || null, items: (prog as any).items?.length ? (prog as any).items : items } as { summary: ProgressSummary | null; items: LectureItem[] };
    }
  }

  upsertProgress(payload: {
    courseId: string;
    lectureId: string;
    videoId?: string;
    position: number;
    duration: number;
    isComplete?: boolean;
  }) {
    return this.request<{ ok: boolean; completed: boolean }>(
      "/api/progress/upsert",
      { method: "POST", body: JSON.stringify(payload) }
    );
  }

  getWalletBalance() {
    return this.request<WalletBalance>("/api/wallet/balance");
  }

  getWalletTransactions() {
    return this.request<WalletTransaction[]>("/api/wallet/transactions");
  }

  submitWalletTopup(amount: number, utrNumber: string, description?: string) {
    return this.request<WalletTransaction>("/api/wallet/topup", {
      method: "POST",
      body: JSON.stringify({ amount, utrNumber, description }),
    });
  }

  getPurchases() {
    return this.request<PurchaseRecord[]>("/api/purchases");
  }

  isCoursePurchased(courseId: string) {
    return this.request<{ purchased: boolean }>(
      `/api/courses/${courseId}/purchased`
    );
  }

  purchaseCourse(courseId: string) {
    return this.request<{ message: string; newBalance: number }>(
      `/api/courses/${courseId}/purchase`,
      { method: "POST" }
    );
  }

  getProfileSummary() {
    return this.request<{ coursesEnrolled: number; totalWatchTime: number; completedLectures: number }>(
      "/api/progress/profile/summary"
    );
  }

  async askAssistant(prompt: string, courseTitle?: string) {
    const data = await this.request<{ text: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ prompt, courseTitle }),
    });
    return data.text || "";
  }

  logEvent(event: string, payload?: Record<string, any>) {
    return this.request<{ ok: boolean }>("/api/logs", {
      method: "POST",
      body: JSON.stringify({ event, ...(payload || {}) }),
    });
  }
}

export const api = new ApiClient();


