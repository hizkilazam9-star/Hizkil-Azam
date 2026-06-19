import React from "react";
import { Project, Task, WorkLog, User } from "../types";
import { 
  Briefcase, 
  CheckSquare, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Activity,
  ArrowUpRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell
} from "recharts";

function formatIndoDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = months[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

function formatIndoMonth(monthStr: string): string {
  if (!monthStr) return "";
  const parts = monthStr.split("-");
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = months[monthIdx] || parts[1];
  return `${monthName} ${year}`;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <p className="text-zinc-400 font-medium pb-1.5 border-b border-zinc-800/80 mb-1">
          {data.fullDate || data.name}
        </p>
        <div className="flex justify-between items-center gap-4">
          <span className="text-blue-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Tugas Dibuat:
          </span>
          <span className="font-semibold text-white">{data.Dibuat}</span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <span className="text-green-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Tugas Selesai:
          </span>
          <span className="font-semibold text-white">{data.Selesai}</span>
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  workLogs: WorkLog[];
  onNavigate: (tab: string) => void;
  currentUser: User | null;
}

export default function DashboardView({ projects, tasks, workLogs, onNavigate, currentUser }: DashboardViewProps) {
  const [currentDate, setCurrentDate] = React.useState(() => new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // mengupdate waktu setiap menit untuk mendeteksi perubahan hari otomatis
    return () => clearInterval(interval);
  }, []);

  const currentLocalDate = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [currentDate]);

  const indonesianDateStr = React.useMemo(() => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      return new Intl.DateTimeFormat('id-ID', options).format(currentDate);
    } catch (e) {
      return currentDate.toLocaleDateString('id-ID');
    }
  }, [currentDate]);

  // Helper calculations
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== "Completed").length;
  
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status !== "Done").length;
  
  // Tasks completed today
  const completedToday = tasks.filter(t => t.status === "Done" && t.deadline === currentLocalDate).length;
  
  // Deadlines this week (7 days from today)
  const deadlinesThisWeek = tasks.filter(t => {
    if (!t.deadline || t.status === "Done") return false;
    if (t.deadline < currentLocalDate) return false;
    
    // Calculate maxDate string for 7 days from today
    const maxDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7);
    const maxY = maxDateObj.getFullYear();
    const maxM = String(maxDateObj.getMonth() + 1).padStart(2, "0");
    const maxD = String(maxDateObj.getDate()).padStart(2, "0");
    const maxDateStr = `${maxY}-${maxM}-${maxD}`;
    
    return t.deadline <= maxDateStr;
  }).length;

  const totalCompletedTasks = tasks.filter(t => t.status === "Done").length;
  const overallProgress = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

  // Let's identify critical/late tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === "Done" || !t.deadline) return false;
    return t.deadline < currentLocalDate;
  });

  // State for chart time frame filter
  const [timeFrame, setTimeFrame] = React.useState<"minggu" | "bulan" | "tahun">("minggu");
  const [offset, setOffset] = React.useState(0);

  // Reset offset when changing timeframe
  React.useEffect(() => {
    setOffset(0);
  }, [timeFrame]);

  // Compute the currently viewed date based on currentDate and user offset
  const viewDate = React.useMemo(() => {
    const date = new Date(currentDate);
    if (timeFrame === "minggu") {
      date.setDate(date.getDate() + offset * 7);
    } else if (timeFrame === "bulan") {
      date.setMonth(date.getMonth() + offset);
    } else if (timeFrame === "tahun") {
      date.setFullYear(date.getFullYear() + offset);
    }
    return date;
  }, [currentDate, timeFrame, offset]);

  // Generate the Monday-Sunday week dates for the week containing viewDate
  const currentWeekDays = React.useMemo(() => {
    const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());
    const day = current.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diffToMonday = day === 0 ? -6 : -(day - 1);
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);
    
    const daysName = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push({
        name: daysName[i],
        dateStr: `${yyyy}-${mm}-${dd}`
      });
    }
    return dates;
  }, [viewDate]);

  // Generate all days in the current month of viewDate
  const currentMonthDays = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-indexed
    const totalDays = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      dates.push({
        name: `${i}`,
        dateStr: dStr
      });
    }
    return dates;
  }, [viewDate]);

  // Generate 12 months for the current year of viewDate
  const currentYearMonths = React.useMemo(() => {
    const year = viewDate.getFullYear();
    const monthsName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return monthsName.map((name, index) => {
      return {
        name,
        monthStr: `${year}-${String(index + 1).padStart(2, "0")}` // "YYYY-MM"
      };
    });
  }, [viewDate]);

  // Generate label for the viewed period
  const periodLabel = React.useMemo(() => {
    if (timeFrame === "minggu") {
      if (currentWeekDays.length > 0) {
        const start = currentWeekDays[0].dateStr;
        const end = currentWeekDays[6].dateStr;
        return `${formatIndoDate(start)} - ${formatIndoDate(end)}`;
      }
      return "Minggu Ini";
    } else if (timeFrame === "bulan") {
      const year = viewDate.getFullYear();
      const monthIdx = viewDate.getMonth();
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${months[monthIdx]} ${year}`;
    } else {
      return `Tahun ${viewDate.getFullYear()}`;
    }
  }, [timeFrame, viewDate, currentWeekDays]);

  // Calculate chart data based on selected timeFrame
  const chartData = React.useMemo(() => {
    if (timeFrame === "minggu") {
      return currentWeekDays.map(day => {
        const selesaiCount = tasks.filter(t => t.status === "Done" && t.deadline === day.dateStr).length;
        const dibuatCount = tasks.filter(t => t.createdAt ? t.createdAt.substring(0, 10) === day.dateStr : false).length;
        return {
          name: day.name,
          Selesai: selesaiCount,
          Dibuat: dibuatCount,
          fullDate: formatIndoDate(day.dateStr)
        };
      });
    } else if (timeFrame === "bulan") {
      return currentMonthDays.map(day => {
        const selesaiCount = tasks.filter(t => t.status === "Done" && t.deadline === day.dateStr).length;
        const dibuatCount = tasks.filter(t => t.createdAt ? t.createdAt.substring(0, 10) === day.dateStr : false).length;
        return {
          name: day.name,
          Selesai: selesaiCount,
          Dibuat: dibuatCount,
          fullDate: formatIndoDate(day.dateStr)
        };
      });
    } else {
      // timeFrame === "tahun"
      return currentYearMonths.map(month => {
        const selesaiCount = tasks.filter(t => {
          if (t.status !== "Done" || !t.deadline) return false;
          return t.deadline.startsWith(month.monthStr);
        }).length;

        const dibuatCount = tasks.filter(t => {
          if (!t.createdAt) return false;
          return t.createdAt.startsWith(month.monthStr);
        }).length;

        return {
          name: month.name,
          Selesai: selesaiCount,
          Dibuat: dibuatCount,
          fullDate: formatIndoMonth(month.monthStr)
        };
      });
    }
  }, [timeFrame, currentWeekDays, currentMonthDays, currentYearMonths, tasks]);

  // Productivity Analytics Breakdown
  const priorityDistribution = {
    High: tasks.filter(t => t.priority === "High").length,
    Medium: tasks.filter(t => t.priority === "Medium").length,
    Low: tasks.filter(t => t.priority === "Low").length,
  };

  const projectStatusDistribution = [
    { name: "Planning", value: projects.filter(p => p.status === "Planning").length, color: "#9ca3af" },
    { name: "In Progress", value: projects.filter(p => p.status === "In Progress").length, color: "#3b82f6" },
    { name: "Review", value: projects.filter(p => p.status === "Review").length, color: "#eab308" },
    { name: "Completed", value: projects.filter(p => p.status === "Completed").length, color: "#22c55e" },
  ];

  // Activities Feed
  const recentActivities = React.useMemo(() => {
    return [...workLogs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return b.id.localeCompare(a.id);
    }).slice(0, 5);
  }, [workLogs]);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-view-root">
      {/* Header section with brand identity */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950/25 to-zinc-900 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl" id="dashboard-reflow-banner">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            {/* Status badges removed */}
            
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-widest text-white uppercase font-sans">
                RE<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400">-FLOW</span>
              </h1>
              <p className="text-xs text-indigo-300 font-mono tracking-wider font-semibold uppercase">
                Remainder Flow Work
              </p>
            </div>
            
            <p className="text-zinc-450 text-[11px] font-mono leading-relaxed max-w-2xl pt-1">
              Slogan: <strong className="text-zinc-200 font-semibold italic font-sans text-xs bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/35">&quot;Sinergi Alur Kerja Profesional, Sinkronisasi Tenggat Tanpa Batas&quot;</strong>
            </p>
            <p className="text-zinc-400 text-xs">
              Selamat datang kembali, <strong className="text-emerald-400">{currentUser?.name || "Hizkia"}</strong>. Kelola prioritas penugasan, catat kronologi log aktivitas harian, dan pantau tenggat waktu proyek secara terpusat.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-3 bg-zinc-950/70 border border-zinc-850 px-4 py-2.5 rounded-xl w-full sm:w-auto justify-center">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-mono text-zinc-300 font-semibold">{indonesianDateStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Reminders / Alerts */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-950/30 border border-red-800/60 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-medium text-red-200 block">
              Ada {overdueTasks.length} tugas melewati deadline (terlambat)!
            </span>
            <p className="text-xs text-red-400 mt-0.5">
              Tugas kritis: &quot;{overdueTasks.map(t => t.name).join(", ")}&quot;. Selesaikan hari ini atau hubungi klien untuk penyesuaian deadline.
            </p>
          </div>
        </div>
      )}

      {/* Statistics Row Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Proyek Aktif</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono text-white font-semibold">{activeProjects}</span>
              <span className="text-[10px] text-zinc-500 font-mono">/ {totalProjects} total</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between hover:border-yellow-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Tugas Prioritas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono text-white font-semibold">{activeTasks}</span>
              <span className="text-[10px] text-yellow-500 font-mono">aktif</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <CheckSquare className="w-5 h-5 text-yellow-500" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between hover:border-green-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Completed Today</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono text-white font-semibold">{completedToday}</span>
              <span className="text-[10px] text-green-500 font-mono">Done</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Clock className="w-5 h-5 text-green-500" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between hover:border-purple-500/40 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider block">Progress Kerja</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono text-white font-semibold">{overallProgress}%</span>
              <span className="text-[10px] text-purple-400 font-mono">task selesai</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Charts & Progress Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Productivity Analytics Chart (Span 2) */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-base font-medium text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                {timeFrame === "minggu" && "Grafik Produktivitas Mingguan"}
                {timeFrame === "bulan" && "Grafik Produktivitas Bulanan"}
                {timeFrame === "tahun" && "Grafik Produktivitas Tahunan"}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-zinc-400">
                  {timeFrame === "minggu" && "Tren tugas dibuat & diselesai"}
                  {timeFrame === "bulan" && "Tren tugas dibuat & diselesai"}
                  {timeFrame === "tahun" && "Tren tugas dibuat & diselesai"}
                </p>
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded font-semibold">
                    {periodLabel}
                  </span>
                  {offset !== 0 && (
                    <button 
                      onClick={() => setOffset(0)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded cursor-pointer"
                      title="Kembali ke waktu saat ini"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Hari Ini</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* History Navigation Shift */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setOffset(prev => prev - 1)}
                  className="p-1 px-1.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 transition"
                  title={
                    timeFrame === "minggu" ? "Minggu Sebelumnya" :
                    timeFrame === "bulan" ? "Bulan Sebelumnya" : "Tahun Sebelumnya"
                  }
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-semibold text-zinc-400 font-mono px-2">
                  {offset === 0 ? "Sekarang" : offset > 0 ? `+${offset}` : offset}
                </span>
                <button
                  onClick={() => setOffset(prev => prev + 1)}
                  className="p-1 px-1.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-400 transition"
                  title={
                    timeFrame === "minggu" ? "Minggu Berikutnya" :
                    timeFrame === "bulan" ? "Bulan Berikutnya" : "Tahun Berikutnya"
                  }
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Range Selector Tab Group */}
              <div className="bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg inline-flex text-[11px]">
                <button
                  onClick={() => setTimeFrame("minggu")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    timeFrame === "minggu"
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Minggu
                </button>
                <button
                  onClick={() => setTimeFrame("bulan")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    timeFrame === "bulan"
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Bulan
                </button>
                <button
                  onClick={() => setTimeFrame("tahun")}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    timeFrame === "tahun"
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Tahun
                </button>
              </div>

              {/* Legends */}
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Kerja Dibuat
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Selesai
                </span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDibuat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  axisLine={false} 
                  tickLine={false} 
                  interval={timeFrame === "bulan" ? 2 : 0} 
                />
                <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Dibuat" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDibuat)" name="Tugas Dibuat" />
                <Area type="monotone" dataKey="Selesai" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorSelesai)" name="Tugas Selesai" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task & Project Distribution Summary */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-white">Sebaran Proyek & Prioritas</h3>
              <p className="text-xs text-gray-400">Analisis profil beban kerja harian Anda</p>
            </div>

            {/* Task Priority Level indicators */}
            <div className="space-y-3 pt-2">
              <span className="text-xs text-zinc-400 font-medium block">Tugas Berdasarkan Tingkat Prioritas:</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-red-400 font-semibold block uppercase">High</span>
                  <span className="text-xl font-mono text-white font-semibold">{priorityDistribution.High}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-yellow-400 font-semibold block uppercase">Medium</span>
                  <span className="text-xl font-mono text-white font-semibold">{priorityDistribution.Medium}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-center space-y-1">
                  <span className="text-[10px] text-blue-400 font-semibold block uppercase">Low</span>
                  <span className="text-xl font-mono text-white font-semibold">{priorityDistribution.Low}</span>
                </div>
              </div>
            </div>

            {/* Project Status bars */}
            <div className="space-y-2 pt-1">
              <span className="text-xs text-zinc-400 font-medium block">Tercatat Status Proyek:</span>
              <div className="space-y-2">
                {projectStatusDistribution.map((item, idx) => {
                  const maxProjects = totalProjects || 1;
                  const pct = Math.round((item.value / maxProjects) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-300 font-mono">{item.name}</span>
                        <span className="text-zinc-400 font-semibold">{item.value} proyek</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities & Calendar Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Work Logs Feed */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-medium text-white">Log Aktivitas Kerja Terkini</h3>
              <p className="text-xs text-gray-400">Riwayat pengisian draf & revisi gambar</p>
            </div>
            <button 
              onClick={() => onNavigate("logs")}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded"
            >
              Ubah Log <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {recentActivities.map((log) => (
              <div key={log.id} className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg flex items-start gap-3 hover:bg-zinc-900/80 transition-all">
                <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 text-blue-400 flex items-center justify-center rounded-lg mt-0.5 hover:scale-105 transition-all">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-sans text-zinc-200">
                    {log.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      User: Hizkia Lazam
                    </span>
                    <span className="text-zinc-700 text-[10px]">•</span>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-800/50 px-1.5 py-0.2 rounded border border-zinc-700/50">
                      📅 {log.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">Belum ada aktivitas kerja hari ini.</p>
            )}
          </div>
        </div>

        {/* Reminders / Deadline Info Sheet */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-medium text-white">Sistem Pengingat (Tenggat Waktu)</h3>
            <p className="text-xs text-gray-400">Item kritis yang mendesak minggu ini</p>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {/* Urgent Tasks */}
            {tasks
              .filter(t => t.status !== "Done" && t.deadline)
              .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              .slice(0, 4)
              .map((task) => {
                const targetProj = projects.find(p => p.id === task.projectId)?.name || "Mandiri Proyek";
                const isOverdue = new Date(task.deadline) < new Date(currentLocalDate);
                const isToday = task.deadline === currentLocalDate;

                return (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-lg border flex items-center justify-between gap-4 ${
                      isOverdue 
                        ? "bg-red-950/15 border-red-900/50" 
                        : isToday 
                        ? "bg-yellow-950/20 border-yellow-800/50" 
                        : "bg-zinc-900/30 border-zinc-800/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          task.priority === "High" 
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-zinc-300 font-medium line-clamp-1">{task.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-sans line-clamp-1">Proyek: {targetProj}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-mono font-medium uppercase block ${
                        isOverdue 
                          ? "text-red-400" 
                          : isToday 
                          ? "text-yellow-400 font-bold" 
                          : "text-zinc-400"
                      }`}>
                        {isOverdue ? "Terlambat!" : isToday ? "Hari Ini!" : task.deadline}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono block">est. {task.estimatedDuration} jam</span>
                    </div>
                  </div>
                );
              })}
            
            {tasks.filter(t => t.status !== "Done").length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-6">Seluruh tugas Anda telah diselesaikan!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
