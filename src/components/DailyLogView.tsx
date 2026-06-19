import React, { useState } from "react";
import { WorkLog, Project, Task, Report } from "../types";
import { Plus, History, FileText, Download, CheckCircle2, Loader2, Sparkles, RefreshCcw } from "lucide-react";

interface DailyLogViewProps {
  workLogs: WorkLog[];
  reports: Report[];
  projects: Project[];
  tasks: Task[];
  onAddWorkLog: (log: { text: string; date: string }) => void;
  onGeneratorReport: (report: { title: string; date: string; content: string }) => void;
}

export default function DailyLogView({ workLogs, reports, projects, tasks, onAddWorkLog, onGeneratorReport }: DailyLogViewProps) {
  const [logText, setLogText] = useState("");
  const [logDate, setLogDate] = useState("2026-06-17"); // Default simulated date
  
  // Daily Report draft state
  const [generating, setGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper date formatting to Indonesian
  const formatIndoDate = (dateStr: string) => {
    try {
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${months[monthIdx]} ${year}`;
        }
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const sortedWorkLogs = React.useMemo(() => {
    return [...workLogs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return b.id.localeCompare(a.id);
    });
  }, [workLogs]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    onAddWorkLog({ text: logText.trim(), date: logDate });
    setLogText("");
  };

  // Automated Report Drafter Algorithm (Fitur 6) - Adjusted with actual Tasks statistics & Indonesian wording as a reply to supervisor
  const handleAutoGenerateReport = () => {
    setGenerating(true);
    setSaveSuccess(false);

    setTimeout(() => {
      // 1. Tugas baru dibuat hari itu (createdAt starts with logDate)
      const newTasks = tasks.filter(t => t.createdAt && t.createdAt.substring(0, 10) === logDate);

      // 2. Tugas yang sedang dalam progress/review pada hari itu
      const runningTasks = tasks.filter(t => t.status === "In Progress" || t.status === "Review");

      // 3. Tugas yang selesai hari itu (status is Done and either deadline is today or a workLog completed it today)
      const completedTasks = tasks.filter(t => {
        const isDone = t.status === "Done";
        const matchesDeadline = t.deadline === logDate;
        const matchesWorkLog = workLogs.some(
          l => l.date === logDate && 
          (l.text.includes("Menyelesaikan Tugas") || l.text.includes("Selesai") || l.text.includes("Done")) && 
          l.text.includes(t.name)
        );
        return isDone && (matchesDeadline || matchesWorkLog);
      });

      // 4. Catatan aktivitas tambahan / manual logs harian
      const daysLogs = workLogs.filter(l => l.date === logDate);

      // Construct markdown lists
      const formattedDate = formatIndoDate(logDate);

      const listNewTasks = newTasks.length > 0
        ? newTasks.map((t, idx) => `${idx + 1}. **${t.name}** [Prioritas: ${t.priority}, Estimasi: ${t.estimatedDuration} Jam]`).join("\n")
        : "- *Hari ini tidak ada entri tugas teknis baru yang didaftarkan ke sistem; fokus penuh dialokasikan pada pengerjaan antrean aktif.*";

      const listRunningTasks = runningTasks.length > 0
        ? runningTasks.map((t, idx) => `${idx + 1}. **${t.name}** [Status: ${t.status}, Prioritas: ${t.priority}, Est: ${t.estimatedDuration} Jam]`).join("\n")
        : "- *Seluruh antrean tugas berjalan berada dalam koridor aman dan tidak terdapat draf yang tertunda hari ini.*";

      const listCompletedTasks = completedTasks.length > 0
        ? completedTasks.map((t, idx) => `${idx + 1}. **${t.name}** [SELESAI - Done] - *Telah diverifikasi sesuai parameter gambar kerja.*`).join("\n")
        : "- *Belum ada penugasan baru yang dipinalkan ke status Done khusus hari ini; beberapa elemen gambar kompleks masih dalam tahap detailer.*";

      const listLogs = daysLogs.length > 0
        ? daysLogs.map((l, idx) => {
            const timeStr = l.createdAt ? new Date(l.createdAt).toLocaleTimeString("id-ID", {hour: "2-digit", minute: "2-digit"}) : "Hari Ini";
            return `   - [${timeStr}] ${l.text}`;
          }).join("\n")
        : "   - Menggambar draf rujukan engineering secara mandiri.";

      const pSummary = projects.map(p => `- **${p.name}** - Progress: **${p.progress}%** (Status: ${p.status})`).join("\n");

      const markdownContent = `# LAPORAN PERKEMBANGAN AKTIVITAS HARIAN DRAFTER
**Kepada:** Yth. Direksi / Project Manager (Atasan)
**Oleh:** Hizkia Lazam (Senior Engineering Drafter)
**Tanggal Pelaporan:** ${formattedDate}

---

### Menjawab pertanyaan Bapak/Ibu:
> *"Hari ini sudah mengerjakan apa saja dan?"*

Selamat pagi/siang/sore Bapak/Ibu, salam sejahtera. 
Menanggapi pertanyaan Bapak/Ibu terkait progres pengerjaan harian saya per tanggal **${formattedDate}**, berikut saya sampaikan perincian laporan aktual mengenai seluruh penugasan baru yang dirintis, daftar pekerjaan yang sedang giat diproses (in progress), serta sejumlah target yang telah berhasil diselesaikan pada hari ini dengan status *Done*:

---

### 1. 📂 DAFTAR TUGAS BARU YANG DI-SETUP / DIBUAT HARI INI
Berikut adalah rincian tugas pengerjaan draf atau kalkulasi teknis baru yang baru saja diprogramkan ke dalam antrean sistem per hari ini:
${listNewTasks}

---

### 2. ⚡ TUGAS DALAM TAHAP PROGRES AKSI (IN PROGRESS & REVIEW)
Sejumlah penugasan di bawah ini merupakan fokus pengerjaan aktif hari ini yang statusnya sedang berjalan (In Progress) maupun sedang dalam tahap tinjauan internal (Review):
${listRunningTasks}

---

### 3. ✅ TUGAS YANG BERHASIL DISELESAIKAN HARI INI (DONE)
Dengan gembira kami laporkan bahwa target-target pengerjaan teknis di bawah ini telah berhasil diselesaikan secara tuntas dan divalidasi dengan status akhir *Done* hari ini:
${listCompletedTasks}

---

### 📝 4. CATATAN AKTIVITAS TAMBAHAN / LOG LAPANGAN HARIAN
Berikut adalah catatan mendetail mengenai alur pengerjaan dan modifikasi revisi gambar aktual yang terekam dalam histori sistem kami hari ini:
${listLogs}

---

### 📊 RINGKASAN PROGRES PROYEK AKTIF
${pSummary || "- Tidak ada proyek tercatat aktif."}

---
Demikian laporan pertanggungjawaban progres harian ini saya buat dengan sebenar-benarnya sebagai bahan rujukan dan supervisi Bapak/Ibu. Segala bentuk masukan atau arahan kritis berikutnya siap saya laksanakan dengan integritas tinggi.

Hormat saya,
**Hizkia Lazam**
*Senior Engineering Drafter - RE-FLOW Studio (Remainder Flow Work)*
`;

      setReportTitle(`Tanggapan Laporan Harian - ${formattedDate}`);
      setReportContent(markdownContent);
      setGenerating(false);
    }, 850);
  };

  const handleSaveReportToDb = () => {
    if (!reportContent) return;
    onGeneratorReport({
      title: reportTitle,
      date: logDate,
      content: reportContent
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4500);
  };

  // File Download Helpers
  const handleExportTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${reportTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
            h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 24px; color: #1e3a8a; }
            h2 { color: #2563eb; font-size: 18px; margin-top: 30px; }
            pre { background: #f3f4f6; padding: 15px; border-radius: 6px; white-space: pre-wrap; }
            hr { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
            .footer { font-size: 11px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <div style="font-size: 14px; margin-bottom: 20px;"><strong>Tanggal:</strong> ${logDate} | <strong>Drafter:</strong> Hizkia Lazam</div>
          <hr/>
          <pre>${reportContent}</pre>
          <hr/>
          <div class="footer">Dibuat otomatis menggunakan platform RE-FLOW (Remainder Flow Work)</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="daily-log-view-root">
      
      {/* Upper header summary */}
      <div>
        <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
          <History className="w-7 h-7 text-green-500" /> Daily Log & Report Generator
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Catat aktivitas harian, review draf, dan ekspor laporan kerja otomatis untuk client atau manajer proyek Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column (logs submission & logs list) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Work Log Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Catat Aktivitas Kerja Hari Ini</h3>
            
            <form onSubmit={handleAddLog} className="space-y-3">
              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Tanggal Aktivitas</label>
                <input 
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-green-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-semibold block">Catatan Pekerjaan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Contoh: Membuat gambar kerja sink table, revisi tebal rangka bungkusan plat..."
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-green-500 font-sans text-xs"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-black font-semibold p-2.5 rounded-lg transition text-xs"
                id="submit-log-btn"
              >
                + Simpan Aktivitas Ke Histori
              </button>
            </form>
          </div>

          {/* Logs List history */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Histori Catatan Aktivitas</h3>
              <span className="text-[10px] text-zinc-500 font-mono">{workLogs.length} Entri</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {sortedWorkLogs.map((log) => (
                <div key={log.id} className="bg-zinc-900/50 border border-zinc-900 p-3 rounded-lg space-y-1.5 hover:border-zinc-800 transition">
                  <p className="text-zinc-300 leading-relaxed font-sans">{log.text}</p>
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                    <span>Oleh: Hizkia Lazam</span>
                    <span className="bg-zinc-800 px-2 py-0.2 rounded text-zinc-400">📅 {log.date}</span>
                  </div>
                </div>
              ))}
              {sortedWorkLogs.length === 0 && (
                <p className="text-center text-zinc-600 py-6">Belum ada aktivitas tercatat.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column (Auto Report generator workspace) */}
        <div className="md:col-span-7 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-3 border-b border-zinc-900">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" /> Generator Laporan Kerja Aktual
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Sistem mengompilasi penugasan baru, progres aktif, & draf selesai.</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Tanggal:</span>
                <input 
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500 font-mono text-xs w-36"
                  title="Sesuaikan tanggal laporan"
                />
              </div>
              
              <button 
                onClick={handleAutoGenerateReport}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                Generate Laporan
              </button>
            </div>
          </div>

          {/* Success Notification Alert */}
          {saveSuccess && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 p-3 rounded-lg text-[11px] flex items-center gap-2.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <div>
                <strong className="font-semibold block text-emerald-300">Berhasil Disimpan!</strong>
                <span>Draf tanggapan laporan harian ini telah ditambahkan ke dalam Histori & Laporan RE-FLOW.</span>
              </div>
            </div>
          )}

          {reportContent ? (
            <div className="space-y-4 animate-fade-in" id="report-composer-area">
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block uppercase tracking-wider text-[10px]">Judul Laporan Tanggapan</label>
                <input 
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white font-sans text-xs focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-zinc-400 font-semibold block uppercase tracking-wider text-[10px]">Isi Laporan (Gaya Menjawab Atasan - Markdown)</label>
                  <span className="text-[9px] bg-indigo-950/45 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-900/30">Tonasi Profesional</span>
                </div>
                <textarea 
                  rows={14}
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-300 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Action output button exports */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900">
                <button 
                  onClick={handleSaveReportToDb}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold px-4 py-2 rounded-lg transition-all text-xs"
                >
                  Simpan Laporan di Histori
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportTxt}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> `.TXT`
                  </button>
                  <button 
                    onClick={handlePrintPdf}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> `.PDF / Cetak`
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
              <FileText className="w-12 h-12 text-zinc-700 animate-pulse" />
              <div className="space-y-1">
                <p className="text-zinc-400 font-semibold text-xs font-sans">Laporan Belum Dihasilkan</p>
                <p className="text-zinc-500 max-w-sm text-[10px]">
                  Pilih tanggal pelaporan di atas, lalu tekan tombol <strong>&quot;Generate Laporan&quot;</strong> untuk menyusun tanggapan profesional atas pengerjaan harian Anda secara otomatis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
