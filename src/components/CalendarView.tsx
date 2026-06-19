import React, { useState } from "react";
import { Task, Project, CalendarEvent } from "../types";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Tag, 
  FileText, 
  Sparkles, 
  BellRing,
  AlertTriangle
} from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  events?: CalendarEvent[];
  onAddEvent?: (event: Omit<CalendarEvent, "id" | "createdAt">) => void;
  onDeleteEvent?: (id: string) => void;
}

export default function CalendarView({ 
  tasks, 
  projects, 
  events = [], 
  onAddEvent, 
  onDeleteEvent 
}: CalendarViewProps) {
  
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date();
    // If it's June 2026, return the current day, otherwise default to 17
    if (d.getFullYear() === 2026 && d.getMonth() === 5) {
      return d.getDate();
    }
    return 17;
  });
  
  // Custom Events / Reminders Form States
  const [showEventForm, setShowEventForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Rapat");
  const [newTime, setNewTime] = useState("09:00");
  const [newDate, setNewDate] = useState(`2026-06-17`);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setNewDate(`2026-06-${day.toString().padStart(2, "0")}`);
    setSuccessMsg("");
  };

  // June 2026 Calendar parameters
  // June 1st, 2026 is a Monday. Total days is 30.
  const totalDays = 30;
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate calendar days array
  const calendarDaysArr = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Helper to extract items matching specified date
  const getDeadlinesForDate = (day: number) => {
    const dateStr = `2026-06-${day.toString().padStart(2, "0")}`;
    
    const matchedTasks = tasks.filter(t => t.deadline === dateStr);
    const matchedProjects = projects.filter(p => p.deadline === dateStr);
    const matchedEvents = events.filter(e => e.date === dateStr);
    
    return { 
      tasks: matchedTasks, 
      projects: matchedProjects,
      events: matchedEvents
    };
  };

  const selectedDeadlines = getDeadlinesForDate(selectedDay);

  const getDayNameIndo = (day: number) => {
    const names = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    return names[(day - 1) % 7];
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    if (onAddEvent) {
      onAddEvent({
        title: newTitle,
        description: newDesc,
        date: newDate,
        time: newTime,
        category: newCategory
      });

      // Clear input fields
      setNewTitle("");
      setNewDesc("");
      setSuccessMsg("Pengingat berhasil dijadwalkan!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowEventForm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="calendar-view-root">
      
      {/* Header view wrapper */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-indigo-400" /> Kalender Jadwal & Pengingat
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Visualisasi target pengerjaan gambar teknis, review, serta pengingat agenda rujukan klien mandiri secara berkala.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-lg p-2 px-3">
          <ChevronLeft className="w-4 h-4 text-zinc-650 cursor-pointer hover:text-white" />
          <span className="text-zinc-300 font-mono font-bold tracking-wider px-2">JUNI 2026</span>
          <ChevronRight className="w-4 h-4 text-zinc-650 cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Monthly Calendar Grid Card (Span 2) */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[10px] text-zinc-500 font-mono font-medium border-b border-zinc-900 pb-2">
            {weekDays.map((day, idx) => (
              <span key={idx} className="uppercase font-semibold tracking-wider">{day}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {calendarDaysArr.map((day) => {
              const deadlines = getDeadlinesForDate(day);
              const totalDeadlines = deadlines.tasks.length + deadlines.projects.length + deadlines.events.length;
              const isSelected = selectedDay === day;
              
              const dateStr = `2026-06-${day.toString().padStart(2, "0")}`;
              const localTodayStr = (() => {
                const d = new Date();
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
              })();
              const isToday = dateStr === localTodayStr;

              return (
                <div 
                  key={day}
                  onClick={() => handleDaySelect(day)}
                  className={`min-h-16 border rounded-lg p-1.5 flex flex-col justify-between cursor-pointer transition relative hover:border-indigo-500/30 ${
                    isSelected 
                      ? "bg-indigo-950/25 border-indigo-700/60" 
                      : isToday
                      ? "bg-yellow-950/20 border-yellow-800/50"
                      : "bg-zinc-900/40 border-zinc-900 hover:bg-zinc-900/80"
                  }`}
                >
                  {/* Number indicator */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-mono font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                      isToday 
                        ? "bg-yellow-500/10 text-yellow-500 font-extrabold" 
                        : isSelected 
                        ? "bg-indigo-600 text-white" 
                        : "text-zinc-400"
                    }`}>
                      {day}
                    </span>
                    
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 absolute top-2 right-2 duration-1000 animate-pulse"></span>
                    )}
                  </div>

                  {/* Badges/Deadlines indicator count bottom */}
                  {totalDeadlines > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1">
                      {deadlines.projects.length > 0 && (
                        <span className="inline-block text-[8px] bg-sky-500/10 text-sky-400 px-1 border border-sky-500/25 rounded scale-[0.9] origin-left truncate max-w-full font-sans">
                          📁 Proyek
                        </span>
                      )}
                      {deadlines.tasks.length > 0 && (
                        <span className="inline-block text-[8px] bg-yellow-500/10 text-yellow-400 px-1 border border-yellow-500/25 rounded scale-[0.9] origin-left truncate max-w-full font-sans">
                          📌 {deadlines.tasks.length} Task
                        </span>
                      )}
                      {deadlines.events.length > 0 && (
                        <span className="inline-block text-[8px] bg-indigo-500/10 text-indigo-400 px-1 border border-indigo-500/25 rounded scale-[0.9] origin-left truncate max-w-full font-sans">
                          📅 {deadlines.events.length} Acara
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Box */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Context Title Header with trigger button */}
            <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Agenda Tanggal Terpilih</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {getDayNameIndo(selectedDay)}, {selectedDay} Juni 2026
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowEventForm(!showEventForm);
                  setSuccessMsg("");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[10px] transition shrink-0 ${
                  showEventForm 
                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-705" 
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-950/20"
                }`}
              >
                {showEventForm ? (
                  <>
                    <X className="w-3 h-3" /> Tutup Form
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> + Acara
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Form Card to Add Event / Reminder */}
            {showEventForm && (
              <form onSubmit={handleFormSubmit} className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-lg space-y-3 animate-fade-in text-[11px]">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5 mb-1">
                  <span className="font-semibold text-white tracking-wide uppercase text-[9px] flex items-center gap-1 text-indigo-400">
                    <BellRing className="w-3 h-3" /> Jadwalkan Pengingat Baru
                  </span>
                  <button type="button" onClick={() => setShowEventForm(false)} className="text-zinc-500 hover:text-zinc-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium font-sans">Nama Acara / Pengingat*</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Diskusi Layout DED"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-zinc-650 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium font-sans">Keterangan / Agenda</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Opsional: Bahas material, catatan, atau draf terkait"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white h-12 placeholder-zinc-650 focus:outline-none focus:border-indigo-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium font-sans">Sisa Tanggal</label>
                    <input 
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-medium font-sans">Waktu (Jam)</label>
                    <input 
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-medium font-sans">Kategori Agenda</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Rapat">📞 Rapat / Koordinasi</option>
                    <option value="Serah Terima">📦 Serah Terima Berkas</option>
                    <option value="Survei">📐 Survei Lapangan / Pengukuran</option>
                    <option value="Penting">⚡ Agenda Penting / Deadline Klien</option>
                    <option value="Lainnya">📝 Catatan Pribadi / Kegiatan Lain</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-zinc-800/50">
                  <button 
                    type="button" 
                    onClick={() => setShowEventForm(false)} 
                    className="bg-zinc-805 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-1.5 px-3 rounded text-[10px]"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded text-[10px]"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </form>
            )}

            {successMsg && (
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-2.5 rounded-lg text-emerald-400 flex items-center gap-2 text-[10px] animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-0.5">
              
              {/* Linked Custom Events/Reminders */}
              {selectedDeadlines.events.map((ev) => (
                <div key={ev.id} className="relative group bg-indigo-950/15 border border-indigo-900/40 p-3 rounded-lg space-y-1 animate-fade-in">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase border ${
                      ev.category === "Rapat"
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30"
                        : ev.category === "Serah Terima"
                        ? "text-purple-400 bg-purple-950/20 border-purple-900/30"
                        : ev.category === "Survei"
                        ? "text-sky-400 bg-sky-950/20 border-sky-900/30"
                        : ev.category === "Penting"
                        ? "text-red-400 bg-red-950/20 border-red-900/30"
                        : "text-zinc-300 bg-zinc-900 border-zinc-800"
                    }`}>
                      📅 {ev.category || "Pribadi"}
                    </span>
                    
                    {onDeleteEvent && (
                      <button 
                        onClick={() => onDeleteEvent(ev.id)}
                        className="text-zinc-600 hover:text-red-400 p-0.5 rounded transition md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  <h4 className="text-zinc-100 font-medium font-sans text-[11px] leading-snug">{ev.title}</h4>
                  {ev.description && (
                    <p className="text-[10px] text-zinc-400 leading-normal font-sans">{ev.description}</p>
                  )}
                  {ev.time && (
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-mono pt-1">
                      <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Pukul {ev.time}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Linked Projects deadlines */}
              {selectedDeadlines.projects.map((proj) => (
                <div key={proj.id} className="bg-sky-950/15 border border-sky-900/50 p-3 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold uppercase tracking-wider text-[9px]">
                    <span>📁 DATUM DEADLINE PROYEK</span>
                  </div>
                  <h4 className="text-zinc-200 font-medium font-sans">{proj.name}</h4>
                  <p className="text-[10px] text-sky-500 font-mono">Client: {proj.clientName}</p>
                </div>
              ))}

              {/* Linked Tasks deadlines */}
              {selectedDeadlines.tasks.map((task) => (
                <div key={task.id} className="bg-zinc-900 border border-zinc-850 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className={`uppercase font-bold ${
                      task.priority === "High" ? "text-red-400" : "text-yellow-500"
                    }`}>
                      📌 {task.priority} TASK
                    </span>
                    <span className="text-zinc-500">Status: {task.status}</span>
                  </div>
                  <h4 className="text-zinc-200 font-medium font-sans">{task.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono block">est. {task.estimatedDuration} Jam</span>
                </div>
              ))}

              {selectedDeadlines.projects.length === 0 && selectedDeadlines.tasks.length === 0 && selectedDeadlines.events.length === 0 && (
                <div className="text-center py-16 text-zinc-650 space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-zinc-800" />
                  <p className="font-sans text-[11px] font-medium">Tidak ada jadwal jatuh tempo atau pengingat.</p>
                  <p className="text-[9px] text-zinc-600">Klik tombol "+ Acara" di kanan atas jika ingin memprogram pengingat baru.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg text-[10px] text-zinc-500 leading-relaxed font-sans">
            💡 <strong>Saran Kolaborasi:</strong> Segala agenda rapat atau survei yang Anda jadwalkan di sini akan otomatis terekam dalam log histori harian untuk memudahkan penyusunan laporan kemajuan mingguan.
          </div>
        </div>
      </div>
    </div>
  );
}
