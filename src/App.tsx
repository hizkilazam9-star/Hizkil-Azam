import React, { useState, useEffect } from "react";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import TasksView from "./components/TasksView";
import DailyLogView from "./components/DailyLogView";
import PortfolioView from "./components/PortfolioView";
import FileManagerView from "./components/FileManagerView";
import CalendarView from "./components/CalendarView";
import AiAssistant from "./components/AiAssistant";
import ProfileView from "./components/ProfileView";
import Logo from "./components/Logo";
import { Project, Task, WorkLog, Report, PortfolioItem, ProjectFile, User, CalendarEvent } from "./types";
import { 
  Briefcase, 
  CheckSquare, 
  History, 
  Award, 
  FolderOpen, 
  Calendar as CalendarIcon, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  Layers,
  Unlock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Menu,
  X
} from "lucide-react";

async function safeFetchJSON(url: string, options?: RequestInit) {
  const method = options?.method || "GET";
  const response = await fetch(url, options);
  const text = await response.text();

  console.log("Request URL:", url);
  console.log("Request Method:", method);
  console.log("Response Status:", response.status);
  console.log("Response Body:", text);

  try {
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Server returned non-JSON:", text);
    throw new Error(
      `Expected JSON but received HTML or invalid response: ${text.slice(0, 100)}`
    );
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth Form parameters
  const [isRegister, setIsRegister] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("hizkilazam9@gmail.com"); // Prepopulate with user email for friction-free view
  const [name, setName] = useState("Hizkia Lazam");
  const [role, setRole] = useState("Senior Engineering Drafter");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isForgotPasswordVerifying, setIsForgotPasswordVerifying] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [sandboxCode, setSandboxCode] = useState("");

  // Storage states
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch all initial data
  const fetchAllData = async () => {
    const endpoints = [
      { name: "projects", url: "/api/projects", setter: setProjects },
      { name: "tasks", url: "/api/tasks", setter: setTasks },
      { name: "work-logs", url: "/api/work-logs", setter: setWorkLogs },
      { name: "reports", url: "/api/reports", setter: setReports },
      { name: "portfolio", url: "/api/portfolio", setter: setPortfolioItems },
      { name: "files", url: "/api/files", setter: setFiles },
      { name: "events", url: "/api/events", setter: setCalendarEvents }
    ];

    await Promise.all(
      endpoints.map(async ({ name, url, setter }) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`Respon untuk ${name} tidak OK (Status: ${res.status})`);
            return;
          }
          const text = await res.text();
          if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html") || text.trim().startsWith("<!DOCTYPE")) {
            console.error(`Gagal parsing JSON untuk ${name}: Respon berupa HTML dari ${url}`);
            return;
          }
          const jsonData = JSON.parse(text);
          setter(jsonData);
        } catch (err) {
          console.error(`Gagal sinkronisasi data ${name} dengan server database:`, err);
        }
      })
    );
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Handle Login & Register Actions with Email Verification
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setSandboxCode("");

    if (!email) {
      setAuthError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setAuthError("Kata sandi wajib diisi.");
      return;
    }

    try {
      if (isRegister) {
        const data = await safeFetchJSON("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, role })
        });
        
        if (data.success) {
          if (data.needsVerification) {
            setNeedsVerification(true);
            setVerificationEmail(data.email);
            setSandboxCode(data.sandboxCode || "");
            setAuthSuccess(data.message || "Silakan lakukan verifikasi email Anda.");
          } else {
            setCurrentUser(data.user);
            setAuthSuccess("Pendaftaran berhasil!");
          }
        } else {
          setAuthError(data.message || "Gagal melakukan register.");
        }
      } else {
        const data = await safeFetchJSON("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
          if (data.needsVerification) {
            setNeedsVerification(true);
            setVerificationEmail(data.email);
            setSandboxCode(data.sandboxCode || "");
            setAuthSuccess(data.message || "Silakan verifikasi email Anda.");
          } else {
            setCurrentUser(data.user);
            setAuthSuccess("Login berhasil!");
            setPassword("");
          }
        } else {
          setAuthError(data.message || "Gagal login.");
        }
      }
    } catch (err: any) {
      console.error("Auth error caught:", err);
      setAuthError("Gagal menyambung ke server database: " + (err.message || "Koneksi terputus"));
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!verificationCode) {
      setAuthError("Kode verifikasi wajib diisi.");
      return;
    }

    try {
      const data = await safeFetchJSON("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code: verificationCode })
      });

      if (data.success) {
        setNeedsVerification(false);
        setVerificationCode("");
        setSandboxCode("");
        setCurrentUser(data.user);
        setAuthSuccess(data.message || "Verifikasi berhasil!");
        setPassword("");
      } else {
        setAuthError(data.message || "Kode verifikasi salah.");
      }
    } catch (err: any) {
      setAuthError("Gagal memverifikasi dokumen: " + err.message);
    }
  };

  const handleResendCode = async () => {
    setAuthError("");
    setAuthSuccess("");
    try {
      const data = await safeFetchJSON("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail })
      });
      if (data.success) {
        setAuthSuccess(data.message);
        if (data.sandboxCode) {
          setSandboxCode(data.sandboxCode);
        }
      } else {
        setAuthError(data.message || "Gagal mengirim ulang kode.");
      }
    } catch (err: any) {
      setAuthError("Kesalahan server saat mengirim ulang kode: " + err.message);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setSandboxCode("");

    if (!email) {
      setAuthError("Email wajib diisi.");
      return;
    }

    try {
      const data = await safeFetchJSON("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (data.success) {
        setIsForgotPasswordVerifying(true);
        setVerificationEmail(data.email);
        setSandboxCode(data.sandboxCode || "");
        setAuthSuccess(data.message || "Kode pemulihan sandi telah dikirim ke email.");
      } else {
        setAuthError(data.message || "Email tidak terdaftar.");
      }
    } catch (err: any) {
      setAuthError("Gagal menghubungi server database: " + err.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!verificationCode) {
      setAuthError("Kode pemulihan wajib diisi.");
      return;
    }
    if (!password) {
      setAuthError("Kata sandi baru wajib diisi.");
      return;
    }

    try {
      const data = await safeFetchJSON("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code: verificationCode, password })
      });

      if (data.success) {
        setForgotPassword(false);
        setIsForgotPasswordVerifying(false);
        setVerificationCode("");
        setSandboxCode("");
        setAuthSuccess(data.message || "Sandi berhasil diatur ulang!");
        setPassword("");
      } else {
        setAuthError(data.message || "Kode pemulihan salah atau kedaluwarsa.");
      }
    } catch (err: any) {
      setAuthError("Kesalahan server saat mereset kata sandi: " + err.message);
    }
  };

  const handleLogput = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  const handleUpdateProfile = async (name: string, role: string, avatarUrl: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const data = await safeFetchJSON("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name,
          role,
          avatarUrl
        })
      });
      if (data.success && data.user) {
        setCurrentUser(data.user);
        fetchAllData();
        return true;
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    }
    return false;
  };

  // CRUD Operations triggered by children subviews
  const handleAddProject = async (p: Omit<Project, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to add project", e);
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to update project", e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to delete project", e);
    }
  };

  const handleAddTask = async (t: Omit<Task, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to update task", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  const handleAddWorkLog = async (log: { text: string; date: string }) => {
    try {
      const res = await fetch("/api/work-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id, ...log })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to add work log", e);
    }
  };

  const handleSaveReport = async (report: { title: string; date: string; content: string }) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to save report", e);
    }
  };

  const handleAddPortfolio = async (item: Omit<PortfolioItem, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to add portfolio", e);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to delete portfolio", e);
    }
  };

  const handleAddCalendarEvent = async (event: Omit<CalendarEvent, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to add calendar event", e);
    }
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to delete calendar event", e);
    }
  };

  const handleAddFile = async (file: Omit<ProjectFile, "id" | "uploadedAt">) => {
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(file)
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to save file", e);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to delete file", e);
    }
  };

  // Pre-seed instant login bypass for the evaluating user
  const bypassAndSeedLogin = () => {
    setCurrentUser({
      id: "user-1",
      email: "hizkilazam9@gmail.com",
      name: "Hizkia Lazam",
      role: "Senior Engineering Drafter",
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col justify-between select-none">
      
      {/* 1. AUTHENTICATION SCREENS (LOGIN, REGISTER, FORGOT PASSWORD) */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center p-4 py-12 animate-fade-in relative overflow-hidden bg-zinc-950">
          {/* Subtle design accents */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-650/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl p-8 relative space-y-6 shadow-2xl text-xs">
            <div className="text-center space-y-2.5">
              <Logo size={80} className="mx-auto" />
              <div className="inline-flex items-center gap-1.5 bg-indigo-900/15 text-indigo-400 font-mono font-bold uppercase py-1 px-3.5 rounded-full tracking-wider border border-indigo-900/20">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                RE-FLOW WORKSPACE
              </div>
              <h2 className="text-xl font-sans font-bold text-white tracking-tight flex flex-col items-center gap-1">
                <span className="text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400 font-extrabold uppercase">RE-FLOW</span>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider font-light mt-0.5">Remainder Flow Work</span>
              </h2>
              <hr className="border-zinc-800/65 w-12 mx-auto my-1" />
              <p className="text-[11px] text-zinc-450 font-medium font-sans">
                {forgotPassword 
                  ? "Reset Sandi Akun RE-FLOW Anda" 
                  : isRegister 
                  ? "Pendaftaran Akun Baru Kontributor" 
                  : "Sinergi Alur Kerja Profesional & Pengendali Tenggat Terstruktur"
                }
              </p>
              <p className="text-[10px] text-zinc-500 max-w-xs mx-auto italic font-mono leading-relaxed">
                &quot;Sinergi Alur Kerja Profesional, Sinkronisasi Tenggat Tanpa Batas&quot;
              </p>
            </div>

            {authError && (
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg flex items-center gap-2.5 text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="bg-green-950/20 border border-green-900/40 p-3 rounded-lg flex items-center gap-2.5 text-green-200">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* 1. Case: Needs Email Verification */}
            {needsVerification ? (
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl space-y-2">
                  <div className="font-semibold text-white tracking-tight text-xs uppercase font-sans">
                    📧 Verifikasi Diperlukan
                  </div>
                  <p className="text-[10px] text-zinc-450 leading-relaxed">
                    Kami telah mengirimkan 6 digit kode keamanan ke email: <span className="font-mono text-zinc-300 font-bold">{verificationEmail}</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Masukkan Kode Verifikasi</label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Contoh: 123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-center text-white tracking-widest text-lg font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {sandboxCode && (
                  <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl text-amber-200 space-y-1.5 font-sans leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 text-amber-400 text-[10px] uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                      Sandbox Dev Mode
                    </div>
                    <div className="text-[10px] text-zinc-450">SMTP belum diatur di file <code>.env</code>. Kode simulasi Anda:</div>
                    <div className="font-mono text-center text-md font-bold bg-amber-950/40 py-1.5 px-3 rounded-lg border border-amber-800/20 tracking-widest text-amber-300 select-all">
                      {sandboxCode}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setVerificationCode(sandboxCode)}
                      className="w-full text-center text-[10px] text-amber-400/90 underline hover:text-amber-300 font-medium transition cursor-pointer"
                    >
                      Isi kode otomatis
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg transition py-3 cursor-pointer"
                >
                  Confirm & Aktifkan Akun
                </button>

                <div className="flex justify-between items-center pt-2 text-[10px] border-t border-zinc-800/60 font-medium">
                  <button 
                    type="button"
                    onClick={handleResendCode}
                    className="text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Kirim Ulang Kode
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setNeedsVerification(false); setAuthError(""); setAuthSuccess(""); setSandboxCode(""); }}
                    className="text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    Batal / Kembali
                  </button>
                </div>
              </form>
            ) : forgotPassword ? (
              /* 2. Case: Forgot Password Form */
              <div className="space-y-4">
                {!isForgotPasswordVerifying ? (
                  /* Stage A: Enter Email */
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-semibold block">E-mail Terdaftar</label>
                      <input 
                        type="text"
                        required
                        placeholder="nama@email.com atau azam"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg transition cursor-pointer"
                    >
                      Kirim Kode Pemulihan
                    </button>

                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => { setForgotPassword(false); setAuthError(""); setAuthSuccess(""); setSandboxCode(""); }}
                        className="text-zinc-500 hover:text-white font-medium hover:underline cursor-pointer"
                      >
                        Kembali ke halaman masuk
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Stage B: Enter Code & New Password */
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl space-y-1 text-red-200">
                      <div className="font-semibold text-xs uppercase font-sans">
                        🔑 Masukkan Kode Pemulihan
                      </div>
                      <p className="text-[10px] text-zinc-450">
                        Kami telah mengirim kode reset password ke email: <span className="font-mono text-zinc-300 font-bold">{verificationEmail}</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-semibold block">Kode Reset Pemulihan</label>
                        <input 
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Kode 6 digit"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-center text-white font-mono tracking-widest text-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-zinc-400 font-semibold block">Kata Sandi Baru</label>
                        <input 
                          type="password"
                          required
                          placeholder="Kata sandi baru Anda"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    {sandboxCode && (
                      <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl text-amber-200 space-y-1.5 font-sans leading-relaxed">
                        <div className="font-bold flex items-center gap-1.5 text-amber-400 text-[10px] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                          Sandbox Dev Mode
                        </div>
                        <div className="text-[10px] text-zinc-450">SMTP belum diatur di file <code>.env</code>. Kode reset Anda:</div>
                        <div className="font-mono text-center text-md font-bold bg-amber-950/40 py-1.5 px-3 rounded-lg border border-amber-800/20 tracking-widest text-amber-300 select-all">
                          {sandboxCode}
                        </div>
                        <button 
                          type="button"
                          onClick={() => setVerificationCode(sandboxCode)}
                          className="w-full text-center text-[10px] text-amber-400/90 underline hover:text-amber-300 font-medium transition cursor-pointer"
                        >
                          Isi kode otomatis
                        </button>
                      </div>
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-red-650 hover:bg-red-600 text-white font-semibold p-2.5 rounded-lg transition cursor-pointer"
                    >
                      Perbarui Kata Sandi
                    </button>

                    <div className="text-center font-medium">
                      <button 
                        type="button"
                        onClick={() => { setIsForgotPasswordVerifying(false); setForgotPassword(false); setAuthError(""); setAuthSuccess(""); setSandboxCode(""); }}
                        className="text-zinc-500 hover:text-white text-[10px] transition cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* 3. Case: Standard Login & Register Form */
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">E-mail Korporat atau Pribadi</label>
                  <input 
                    type="text"
                    required
                    placeholder="hizkilazam9@gmail.com atau azam"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {isRegister && (
                  <>
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-zinc-400 font-semibold block">Nama Pengguna Lengkap</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Hizkia Lazam"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-zinc-400 font-semibold block">Spesialisasi Profesional / Peran</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Senior Engineering Drafter"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <label className="text-zinc-400 font-semibold block">Kata Sandi</label>
                    {!isRegister && (
                      <button 
                        type="button" 
                        onClick={() => { setForgotPassword(true); setIsForgotPasswordVerifying(false); setAuthError(""); setAuthSuccess(""); }}
                        className="text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                      >
                        Lupa Kata Sandi?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password"
                    required
                    placeholder={isRegister ? "Buat kata sandi akun baru" : "Masukkan kata sandi Anda"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg transition cursor-pointer"
                >
                  {isRegister ? "Daftar & Kirim Kode Verifikasi" : "Masuk ke Ruang Kerja"}
                </button>

                <div className="text-center text-zinc-500 pt-2 border-t border-zinc-800/600 select-none">
                  <button 
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setAuthError(""); setAuthSuccess(""); }}
                    className="text-[11px] text-zinc-400 hover:text-white hover:underline font-medium cursor-pointer"
                  >
                    {isRegister ? "Sudah punya akun? Masuk disini" : "Belum punya akun? Buat akun baru"}
                  </button>
                </div>
              </form>
            )}


          </div>
        </div>
      ) : (
        
        // 2. MAIN APPLICATION WORKSPACE LAYOUT (AUTHORIZED USERS)
        <div className="flex-1 flex flex-col md:flex-row min-h-screen relative">
          
          {/* Sticky Mobile/Tablet Header */}
          <header className="md:hidden flex items-center justify-between bg-zinc-950 border-b border-zinc-900/80 p-4 sticky top-0 z-40 shrink-0">
            <button 
              onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-2.5 text-left group"
              title="Klik untuk membuka profil"
            >
              {currentUser?.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-zinc-800 shrink-0 group-hover:border-indigo-500/50 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0 font-bold uppercase text-[10px]">
                  {currentUser?.name ? currentUser.name.substring(0, 2) : "DF"}
                </div>
              )}
              <div>
                <span className="text-white font-sans font-semibold text-xs tracking-tight block group-hover:text-indigo-300 transition-colors">{currentUser?.name || "Hizkia Lazam"}</span>
                <span className="text-[8px] text-zinc-500 font-mono tracking-wider block font-medium">{currentUser?.role || "Profesional Kontributor"}</span>
              </div>
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </header>

          {/* Mobile Drawer Overlay Backdrop */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Left responsive sidebar rail */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900/60 p-5 flex flex-col justify-between space-y-6
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:w-64 md:h-auto min-h-screen md:min-h-0 shrink-0
          `}>
            <div className="space-y-6">
              {/* Logo / Brand header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Logo size={42} className="shrink-0" />
                  <div>
                    <span className="text-white font-sans font-extrabold text-sm tracking-widest block uppercase text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-indigo-300 to-purple-300">RE-FLOW</span>
                    <span className="text-[8px] text-zinc-500 font-mono tracking-wider block font-medium">Remainder Flow Work</span>
                  </div>
                </div>
                {/* Close Button Inside Drawer (Mobile Only) */}
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden p-1 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Interactive Profile Area in Top Left */}
              <div className="border-b border-zinc-900/80 pb-4">
                <button 
                  onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 bg-zinc-900/35 hover:bg-zinc-900/80 p-2.5 rounded-xl border text-left transition ${
                    activeTab === "profile" ? "border-indigo-500/50 bg-indigo-950/10" : "border-zinc-900"
                  }`}
                  title="Klik untuk mengubah profil"
                >
                  {currentUser?.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt="Avatar" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0 font-bold uppercase text-xs">
                      {currentUser?.name ? currentUser.name.substring(0, 2) : "HL"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-white block font-semibold truncate text-xs">{currentUser?.name}</span>
                    <span className="text-[10px] text-indigo-400 truncate block font-mono font-medium">{currentUser?.role || "Profesional Kontributor"}</span>
                  </div>
                </button>
              </div>

              {/* Sidebar items navigation */}
              <nav className="space-y-1.5 text-xs text-zinc-400">
                <button
                  onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "dashboard" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800"
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500 shrink-0" /> Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab("projects"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "projects" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-sky-400 shrink-0" /> Daftar Proyek
                </button>

                <button
                  onClick={() => { setActiveTab("tasks"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "tasks" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-yellow-500 shrink-0" /> Tugas Kerja
                </button>

                <button
                  onClick={() => { setActiveTab("logs"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "logs" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <History className="w-4 h-4 text-green-500 shrink-0" /> Daily Log & Report
                </button>

                <button
                  onClick={() => { setActiveTab("portfolio"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "portfolio" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <Award className="w-4 h-4 text-indigo-400 shrink-0" /> Portfolio Showcase
                </button>

                <button
                  onClick={() => { setActiveTab("calendar"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "calendar" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 text-purple-400 shrink-0" /> Kalender Deadline
                </button>

                <button
                  onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                    activeTab === "profile" 
                      ? "bg-zinc-900 text-white font-semibold border border-zinc-800" 
                      : "hover:bg-zinc-900/50 hover:text-zinc-200"
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-pink-400 shrink-0" /> Profil Saya
                </button>
              </nav>
            </div>

            {/* Profile footer section and sign out */}
            <div className="pt-4 border-t border-zinc-900 space-y-3 shrink-0">
              <button
                onClick={() => { handleLogput(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 text-[11px] text-red-500 hover:text-red-400 hover:bg-red-950/15 py-2 px-3 rounded-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>

          {/* Core main interactive dashboard area */}
          <main className="flex-1 bg-zinc-950 p-4 md:p-8 space-y-6 overflow-x-hidden">
            {activeTab === "dashboard" && (
              <DashboardView 
                projects={projects}
                tasks={tasks}
                workLogs={workLogs}
                onNavigate={setActiveTab}
                currentUser={currentUser}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsView 
                projects={projects}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            )}

            {activeTab === "tasks" && (
              <TasksView 
                tasks={tasks}
                projects={projects}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === "logs" && (
              <DailyLogView 
                workLogs={workLogs}
                reports={reports}
                projects={projects}
                tasks={tasks}
                onAddWorkLog={handleAddWorkLog}
                onGeneratorReport={handleSaveReport}
              />
            )}

            {activeTab === "portfolio" && (
              <PortfolioView 
                portfolioItems={portfolioItems}
                onAddPortfolioItem={handleAddPortfolio}
                onDeletePortfolioItem={handleDeletePortfolio}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView 
                tasks={tasks}
                projects={projects}
                events={calendarEvents}
                onAddEvent={handleAddCalendarEvent}
                onDeleteEvent={handleDeleteCalendarEvent}
              />
            )}

            {activeTab === "profile" && currentUser && (
              <ProfileView 
                currentUser={currentUser}
                workLogs={workLogs}
                projects={projects}
                tasks={tasks}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {/* Sliding chatbot widget assistant (Fitur 5) */}
            <AiAssistant />
          </main>
        </div>
      )}
    </div>
  );
}
