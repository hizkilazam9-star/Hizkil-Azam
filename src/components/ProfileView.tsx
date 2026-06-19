import React, { useState } from "react";
import { User, WorkLog, Project, Task } from "../types";
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Camera, 
  Save, 
  Check, 
  Award,
  Clock,
  Layout,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

interface ProfileViewProps {
  currentUser: User;
  workLogs: WorkLog[];
  projects: Project[];
  tasks: Task[];
  onUpdateProfile: (name: string, role: string, avatarUrl: string) => Promise<boolean>;
}

const PRESET_AVATARS = [
  { name: "Female Senior Advisor", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
  { name: "Female Creative Designer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { name: "Female Project Leader", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { name: "Male Creative Specialist", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { name: "Male Developer & Tech Analyst", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" }
];

export default function ProfileView({ 
  currentUser, 
  workLogs, 
  projects, 
  tasks, 
  onUpdateProfile 
}: ProfileViewProps) {
  const [name, setName] = useState(currentUser.name || "");
  const [role, setRole] = useState(currentUser.role || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[1].url);
  const [customAvatar, setCustomAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePresetSelect = (url: string) => {
    setAvatarUrl(url);
    setCustomAvatar("");
  };

  const handleCustomAvatarApply = () => {
    if (customAvatar.trim().startsWith("http")) {
      setAvatarUrl(customAvatar.trim());
      setErrorMsg("");
    } else {
      setErrorMsg("Harap masukkan URL foto yang valid diawali dengan http/https.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama Lengkap wajib diisi.");
      return;
    }
    if (!role.trim()) {
      setErrorMsg("Jabatan / Peran wajib diisi.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    try {
      const success = await onUpdateProfile(name.trim(), role.trim(), avatarUrl);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4500);
      } else {
        setErrorMsg("Gagal melakukan pembaruan profil di server.");
      }
    } catch (err) {
      setErrorMsg("Gagal menyambung ke server untuk memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  // Stat Counters
  const totalCompletedTasks = tasks.filter(t => t.status === "Done").length;
  const totalProjectsActive = projects.filter(p => p.status === "In Progress").length;
  const totalUserWorkLogs = workLogs.filter(l => l.userId === currentUser.id).length;

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="profile-container-root">
      
      {/* Header View */}
      <div>
        <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
          <UserIcon className="w-7 h-7 text-indigo-400" /> Profil & Pengaturan Pengguna
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Perbarui data pribadi Anda, pilih avatar representatif, serta tinjau performa kontribusi teknis kerja Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Profile Card & Stats */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-center space-y-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-600"></div>
            
            <div className="pt-4 flex flex-col items-center">
              <div className="relative group">
                <img 
                  src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full border-2 border-indigo-500/40 object-cover shadow-lg"
                />
                <span className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full border border-zinc-950 text-white" title="Avatar Aktif">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white mt-4 font-sans tracking-tight">{currentUser.name}</h2>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">{currentUser.role || "Senior Consultant / Specialist"}</p>
              <div className="flex items-center gap-1.5 text-zinc-500 mt-2 font-mono text-[10px]">
                <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span>{currentUser.email}</span>
              </div>
            </div>

            <div className="border-t border-zinc-900/80 pt-4 text-left">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-2.5">Ringkasan Kinerja Aktif</p>
              
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-zinc-900/45 border border-zinc-900 rounded-lg p-2.5">
                  <span className="block text-base font-bold text-sky-400 font-mono">{totalProjectsActive}</span>
                  <span className="text-[9px] text-zinc-500 text-center block">Proyek</span>
                </div>
                <div className="bg-zinc-900/45 border border-zinc-900 rounded-lg p-2.5">
                  <span className="block text-base font-bold text-yellow-500 font-mono">{totalCompletedTasks}</span>
                  <span className="text-[9px] text-zinc-500 text-center block">Selesai</span>
                </div>
                <div className="bg-zinc-900/45 border border-zinc-900 rounded-lg p-2.5">
                  <span className="block text-base font-bold text-green-400 font-mono">{totalUserWorkLogs}</span>
                  <span className="text-[9px] text-zinc-500 text-center block">Log Kerja</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Informational Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" /> Sertifikasi RE-FLOW
            </h3>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Tingkat fungsionalitas pengguna tervalidasi sebagai level profesional di naungan ekosistem <strong>RE-FLOW</strong> (*Remainder Flow Work*). Segala log audit revisi kerja, laporan harian, dan berkas arsip secara aktual ditandatangani secara digital via akun Anda.
            </p>
          </div>
        </div>

        {/* Right Columns: Edit Form & Presets Grid */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-5">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-semibold text-white">Formulir Informasi Pribadi</h3>
              <p className="text-[10px] text-zinc-500">Anda dapat merubah biodata, foto avatar rujukan, serta peran yang akan tampil di lembar laporan aktivitas.</p>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-lg text-emerald-400 flex items-center gap-2.5 text-[11px] animate-fade-in">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Profil Anda berhasil diperbarui di sistem database pusat dan histori aktivitas diperbarui!</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-red-400 text-[11px]">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name input */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium text-xs">Nama Lengkap*</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Hizkia Lazam"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-650 font-medium"
                  />
                </div>
              </div>

              {/* Role / Jabatan input */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-medium text-xs">Jabatan / Peran Professional*</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input 
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Senior Project Manager / Specialist"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-650 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Select Presets */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-zinc-400 font-medium text-xs block">Pilih Foto Profil (Preset Profesional)</label>
                <p className="text-[10px] text-zinc-500 mt-0.5">Pilih dari katalog ilustrasi industri atau gunakan URL eksternal pilihan Anda sendiri di bawah.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_AVATARS.map((av, idx) => {
                  const isSelected = avatarUrl === av.url;
                  return (
                    <div 
                      key={idx}
                      onClick={() => handlePresetSelect(av.url)}
                      className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center space-y-2 transition-all ${
                        isSelected 
                          ? "bg-indigo-950/25 border-indigo-600/70 shadow-lg scale-102"
                          : "bg-zinc-900/60 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={av.url} 
                          alt={av.name} 
                          className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <span className="absolute -bottom-1 -right-1 bg-indigo-600 p-0.5 rounded-full text-white">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-center text-zinc-400 leading-tight font-medium truncate max-w-full block">
                        {av.name.split(" ")[2] || av.name.split(" ")[1]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom URL or Direct File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Direct File Upload (PNG/JPG) - Drag and Drop + Manual Select */}
              <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl space-y-2.5">
                <label className="text-zinc-400 font-medium text-xs block">Unggah Foto Sendiri (.PNG, .JPG, .JPEG)</label>
                
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setErrorMsg("");
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                        setErrorMsg("Format file tidak didukung. Harap unggah file berformat .PNG, .JPG, atau .JPEG.");
                        return;
                      }
                      // Check file size (max 3.5MB to be safe for DB storage)
                      if (file.size > 3.5 * 1024 * 1024) {
                        setErrorMsg("Ukuran file terlalu besar. Maksimal resolusi adalah 3.5 MB untuk kestabilan draf.");
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setAvatarUrl(reader.result);
                        }
                      };
                      reader.onerror = () => {
                        setErrorMsg("Gagal memproses file gambar.");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => document.getElementById("profile-file-picker")?.click()}
                  className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/65 bg-zinc-950/65 hover:bg-zinc-900/45 rounded-xl p-5 text-center transition cursor-pointer group space-y-2 relative"
                >
                  <input 
                    type="file"
                    id="profile-file-picker"
                    accept=".png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      setErrorMsg("");
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
                          setErrorMsg("Format file tidak didukung. Harap unggah file berformat .PNG, .JPG, atau .JPEG.");
                          return;
                        }
                        if (file.size > 3.5 * 1024 * 1024) {
                          setErrorMsg("Ukuran file terlalu besar. Maksimal resolusi adalah 3.5 MB untuk kestabilan draf.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setAvatarUrl(reader.result);
                          }
                        };
                        reader.onerror = () => {
                          setErrorMsg("Gagal memproses file gambar.");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Camera className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-zinc-300 font-medium text-[11px] block">Tarik & Lepas Foto atau Klik untuk Pilih</span>
                    <span className="text-[9px] text-zinc-600 block">Mendukung PNG, JPG, JPEG (Max 3.5MB)</span>
                  </div>
                </div>
              </div>

              {/* Custom URL Input */}
              <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-medium text-xs block">Opsi: Gunakan URL Foto Khusus</label>
                  <input 
                    type="text"
                    value={customAvatar}
                    onChange={(e) => setCustomAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/your-custom-photo-url-here"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 px-3 text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-650 font-mono text-xs"
                  />
                </div>
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <p className="text-[9px] text-zinc-600 font-mono leading-tight">Gunakan link eksternal jika ingin menyertakan gambar dari Unsplash atau CDN lainnya secara langsung.</p>
                  <button
                    type="button"
                    onClick={handleCustomAvatarApply}
                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-200 px-3.5 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer shrink-0"
                  >
                    Terapkan URL
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-3 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-xs shadow-md shadow-indigo-900/20 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>Memperbarui...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Perobahan Profil
                  </>
                )}
              </button>
            </div>
          </form>

          {/* User History Logs in Profile Context */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" /> Kronologis Log Aktivitas Terakhir Anda
              </h4>
              <p className="text-[10px] text-zinc-500">Histori terlampir merepresentasikan audit digital atas pengarsipan data aktivitas dan pekerjaan milik Anda.</p>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {workLogs.slice(0, 5).map((log) => {
                const logTime = log.createdAt ? new Date(log.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }) : "Terbaca";
                return (
                  <div key={log.id} className="bg-zinc-900/40 border border-zinc-900/60 p-2.5 rounded-lg flex items-start justify-between gap-3 text-[10px]">
                    <span className="text-zinc-300 leading-snug">{log.text}</span>
                    <span className="text-[9px] text-zinc-500 font-mono shrink-0 font-medium">{logTime}</span>
                  </div>
                );
              })}
              {workLogs.length === 0 && (
                <p className="text-center py-6 text-zinc-600">Belum ada kronologi audit terekam.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
