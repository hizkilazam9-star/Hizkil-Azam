import fs from "fs";
import path from "path";

// Define the file paths
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure data directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  deadline: string;
  status: "Planning" | "In Progress" | "Review" | "Completed";
  progress: number; // 0 - 100
  notes: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  projectId: string; // Associated project id or "none"
  name: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  estimatedDuration: number; // Hours
  notes: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface WorkLog {
  id: string;
  userId: string;
  text: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  content: string; // markdown format
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string; // Base64 or placeholder image url
  fileUrl: string; // Base64 or standard string
  fileType: string; // e.g., "application/pdf", "image/png"
  fileName: string;
  date: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: string; // mime or extension
  size: number; // in bytes
  url: string; // Base64 content or simulated URL
  projectId: string; // Associated project ID or "none"
  taskId: string; // Associated task ID or "none"
  uploadedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  workLogs: WorkLog[];
  reports: Report[];
  portfolioItems: PortfolioItem[];
  files: ProjectFile[];
  calendarEvents: CalendarEvent[];
}

// Initial seed data
const currentLocalDate = "2026-06-17"; // Match server local time
const yesterdayDate = "2026-06-16";
const twoDaysAgoDate = "2026-06-15";
const nextWeekDate = "2026-06-24";
const endOfMonthDate = "2026-06-30";

const seedData: DatabaseSchema = {
  users: [
    {
      id: "user-1",
      email: "hizkilazam9@gmail.com",
      name: "Hizkia Lazam",
      role: "Senior Consultant / Specialist",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      createdAt: new Date().toISOString(),
    }
  ],
  projects: [
    {
      id: "project-1",
      name: "Rebranding & Digital Campaign Villa Ubud V3",
      clientName: "Wayan Residence",
      description: "Menyusun draf strategi pemasaran, materi visual berkualifikasi tinggi, riset audiens, serta visual promo lengkap untuk aset Villa Ubud.",
      startDate: "2026-06-01",
      deadline: endOfMonthDate,
      status: "In Progress",
      progress: 60,
      notes: "Klien meminta penekanan pada estetika minimalis modern dan strategi optimasi draf konten.",
      createdAt: new Date().toISOString()
    },
    {
      id: "project-2",
      name: "UI/UX & Desain Website Platform Boga",
      clientName: "PT Boga Sejahtera",
      description: "Perancangan antarmuka pengguna interaktif (UI/UX), draf sistem desain dasar, serta prototype responsif untuk kemudahan pemesanan produk katering pusat.",
      startDate: "2026-06-10",
      deadline: "2026-06-22",
      status: "In Progress",
      progress: 80,
      notes: "Gunakan standard warna ramah konsumen dan tata letak yang bersih, modern, serta informatif.",
      createdAt: new Date().toISOString()
    },
    {
      id: "project-3",
      name: "Strategi Konten & Media Sosial CV Mandiri",
      clientName: "CV Mandiri Mulia",
      description: "Pembersihan draf kalender editorial bulanan, analisis performa kampanye kreatif, serta sinkronisasi visual pemasaran digital terpadu.",
      startDate: "2026-06-14",
      deadline: "2026-06-19",
      status: "Review",
      progress: 90,
      notes: "Tinjauan target sasaran utama audiens. Koordinasikan draf akhir dengan direktur pelaksana.",
      createdAt: new Date().toISOString()
    },
    {
      id: "project-4",
      name: "Laporan Riset & Pengkajian Strategis Mandiri",
      clientName: "Layanan Umum Mandiri",
      description: "Pemeriksaan audit digital atas operasional tim, draf penjaminan mutu, analisis risiko proyek, dan rangkuman efisiensi bisnis korporat.",
      startDate: "2026-05-20",
      deadline: "2026-06-10",
      status: "Completed",
      progress: 100,
      notes: "Laporan akhir diserahkan. Seluruh poin perbaikan yang direkomendasikan telah disetujui komite pusat.",
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: "task-1",
      projectId: "project-2",
      name: "Sketsa kasar layout pengerjaan materi kampanye",
      priority: "High",
      deadline: "2026-06-12",
      status: "Done",
      estimatedDuration: 4,
      notes: "Memastikan sirkulasi visual branding berjarak selaras di draf banner.",
      checklist: [
        { id: "chk-1", text: "Kumpulkan ukuran detail area penayangan media", done: true },
        { id: "chk-2", text: "Asistensi awal layout kasar dengan kreatif manajer", done: true }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "task-2",
      projectId: "project-2",
      name: "Revisi draf sistem desain dasar & skema warna",
      priority: "High",
      deadline: currentLocalDate,
      status: "In Progress",
      estimatedDuration: 3,
      notes: "Ubah tebal lipatan komponen button dari 4px menjadi 8px untuk menambah kontras visual dan modernitas.",
      checklist: [
        { id: "chk-3", text: "Ubah palet warna latar belakang komponen", done: true },
        { id: "chk-4", text: "Ganti letak double deck grid card landing", done: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "task-3",
      projectId: "project-2",
      name: "Final eksport aset visual resolusi tinggi",
      priority: "Medium",
      deadline: "2026-06-21",
      status: "Todo",
      estimatedDuration: 4,
      notes: "Gunakan kompresi gambar tanpa penurunan kualitas pada format PNG atau JPEG.",
      checklist: [
        { id: "chk-5", text: "Set pencahayaan kontras 3 titik elemen draf", done: false },
        { id: "chk-6", text: "Eksport kualitas tinggi ke file format PNG", done: false }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "task-4",
      projectId: "project-3",
      name: "Penyusunan penulisan draf artikel bulanan",
      priority: "High",
      deadline: "2026-06-18",
      status: "Review",
      estimatedDuration: 5,
      notes: "Pengecekan konsistensi tata bahasa, pemenggalan kalimat, serta optimalisasi kata kunci pencarian draf.",
      checklist: [
        { id: "chk-7", text: "Tulis 3 variasi bagian utama pembuka artikel", done: true },
        { id: "chk-8", text: "Beri rujukan sitasi dan tautan lampiran pendukung", done: true }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: "task-5",
      projectId: "project-1",
      name: "Drafting analisis risiko & rancangan anggaran",
      priority: "Medium",
      deadline: nextWeekDate,
      status: "Todo",
      estimatedDuration: 8,
      notes: "Cek kontur pengeluaran tim, sesuaikan modul kebutuhan anggaran dengan target pencapaian klien.",
      checklist: [
        { id: "chk-9", text: "Import file template neraca anggaran umum", done: false },
        { id: "chk-10", text: "Buat klasifikasi prioritas pengeluaran utama", done: false }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  workLogs: [
    {
      id: "log-1",
      userId: "user-1",
      text: "Menyelesaikan penyusunan draf rancangan sistem desain dasar dan komponen UI.",
      date: currentLocalDate,
      createdAt: new Date().toISOString()
    },
    {
      id: "log-2",
      userId: "user-1",
      text: "Asistensi konten kreatif dengan perwakilan CV Mandiri Mulia, penentuan model penayangan.",
      date: currentLocalDate,
      createdAt: new Date().toISOString()
    },
    {
      id: "log-3",
      userId: "user-1",
      text: "Rendering pratinjau aset visual kampanye utama dan mengirim mockup ke klien.",
      date: yesterdayDate,
      createdAt: new Date().toISOString()
    },
    {
      id: "log-4",
      userId: "user-1",
      text: "Revisi draf penulisan dan struktur artikel pelengkap proyek Wayan Residence.",
      date: twoDaysAgoDate,
      createdAt: new Date().toISOString()
    }
  ],
  reports: [
    {
      id: "report-1",
      title: "Laporan Harian Kerja Profesional - 16 Juni 2026",
      date: yesterdayDate,
      content: `# Laporan Harian Kerja Profesional\n**Tanggal:** 16 Juni 2026\n\n## 1. Ringkasan Pekerjaan Selesai\n- Menyelesaikan rendering pratinjau aset visual kampanye utama proyek **PT Boga Sejahtera**.\n- Melakukan uji kesesuaian draf layout dengan skema warna ungu kontemporer.\n\n## 2. Pekerjaan Sedang Berjalan\n- Revisi draf sistem desain dasar dan komponen UI.\n\n## 3. Hambatan / Catatan\n- Diperlukan koordinasi tambahan untuk menyinkronkan draf artikel pendukung dengan tim relasi publik.\n\n---\n*Dibuat otomatis oleh platform RE-FLOW.*`,
      createdAt: new Date().toISOString()
    }
  ],
  portfolioItems: [
    {
      id: "portfolio-1",
      title: "Branding & Desain Visual Media Sosial",
      description: "Solusi pemasaran visual terpadu lengkap dengan draf sistem warna, aset logo resolusi tinggi, dan pedoman gaya draf kreatif multimedia.",
      thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
      fileUrl: "preview_branding_visual.pdf",
      fileType: "application/pdf",
      fileName: "brand-guidelines-creative-spec.pdf",
      date: yesterdayDate,
      createdAt: new Date().toISOString()
    },
    {
      id: "portfolio-2",
      title: "Layout Antarmuka Situs Berita Responsif",
      description: "Satu set cetak draf rancangan detail lengkap meliputi struktur navigasi berjenjang, tata letak grid konten, skema dark mode, dan model interaktivitas.",
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      fileUrl: "situs_berita_nav_layout.png",
      fileType: "image/png",
      fileName: "layout-situs-berita-grid.png",
      date: "2026-06-05",
      createdAt: new Date().toISOString()
    }
  ],
  files: [
    {
      id: "file-1",
      name: "sistem_desain_branding_v2.zip",
      type: "application/zip",
      size: 4404019, // ~4.2 MB
      url: "#",
      projectId: "project-2",
      taskId: "task-2",
      uploadedAt: new Date().toISOString()
    },
    {
      id: "file-2",
      name: "Laporan_Audit_Audit_Strategis.pdf",
      type: "application/pdf",
      size: 1547820, // ~1.5 MB
      url: "#",
      projectId: "project-3",
      taskId: "task-4",
      uploadedAt: new Date().toISOString()
    },
    {
      id: "file-3",
      name: "photo_reference_website_draft.jpg",
      type: "image/jpeg",
      size: 852031, // ~832 KB
      url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
      projectId: "project-2",
      taskId: "none",
      uploadedAt: new Date().toISOString()
    }
  ],
  calendarEvents: [
    {
      id: "event-1",
      title: "Rapat Review Draf Materi Kampanye",
      description: "Diskusi detail skema konten visual dan tenggat penayangan bersama Wayan Residence.",
      date: "2026-06-20",
      time: "10:00",
      category: "Rapat",
      createdAt: new Date().toISOString()
    },
    {
      id: "event-2",
      title: "Serah Terima Berkas Kitchen Stainless",
      description: "Penyerahan draf final berkas dwg ke PT Boga Sejahtera.",
      date: "2026-06-22",
      time: "14:00",
      category: "Serah Terima",
      createdAt: new Date().toISOString()
    },
    {
      id: "event-3",
      title: "Survei Lapangan Tambahan",
      description: "Pengecekan akhir kemiringan tanah & batas kapling site plan aktual.",
      date: "2026-06-25",
      time: "09:00",
      category: "Survei",
      createdAt: new Date().toISOString()
    }
  ]
};

// Database class helper to get, save and reset database states
export class Database {
  static get(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      this.save(seedData);
      return seedData;
    }
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(content) as DatabaseSchema;
      if (!data.calendarEvents) {
        data.calendarEvents = [];
      }
      return data;
    } catch (e) {
      console.error("Failed to read database, resetting to seed...", e);
      this.save(seedData);
      return seedData;
    }
  }

  static save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to database file", e);
    }
  }

  // Find a user by email
  static findUserByEmail(email: string): User | undefined {
    const db = this.get();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // Generic methods
  static getLocalTodayStr(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  static getProjects(): Project[] {
    return this.get().projects;
  }

  static addProject(project: Omit<Project, "id" | "createdAt">): Project {
    const db = this.get();
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.projects.push(newProject);

    // Auto log activity
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `Membuka Proyek Baru: "${newProject.name}" (Klien: ${newProject.clientName})`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project {
    const db = this.get();
    const index = db.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Proyek tidak ditemukan");
    
    const oldProject = db.projects[index];
    
    // Auto log status update
    if (updates.status && updates.status !== oldProject.status) {
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `Mengubah status proyek "${oldProject.name}" dari "${oldProject.status}" menjadi "${updates.status}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }

    db.projects[index] = { ...db.projects[index], ...updates };
    this.save(db);
    return db.projects[index];
  }

  static deleteProject(id: string): void {
    const db = this.get();
    const project = db.projects.find(p => p.id === id);
    if (project) {
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `Menghapus proyek: "${project.name}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }
    db.projects = db.projects.filter((p) => p.id !== id);
    // Unlink tasks
    db.tasks = db.tasks.map((t) => (t.projectId === id ? { ...t, projectId: "none" } : t));
    // Unlink files
    db.files = db.files.map((f) => (f.projectId === id ? { ...f, projectId: "none" } : f));
    this.save(db);
  }

  static getTasks(): Task[] {
    return this.get().tasks;
  }

  static addTask(task: Omit<Task, "id" | "createdAt">): Task {
    const db = this.get();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.tasks.push(newTask);

    // Auto log activity
    const projName = db.projects.find(p => p.id === newTask.projectId)?.name || "Mandiri Proyek";
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `Membuat Tugas Baru: "${newTask.name}" di proyek "${projName}" (Prioritas: ${newTask.priority})`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task {
    const db = this.get();
    const index = db.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tugas tidak ditemukan");
    
    const oldTask = db.tasks[index];

    // Check if status is updated
    if (updates.status && updates.status !== oldTask.status) {
      const projName = db.projects.find(p => p.id === oldTask.projectId)?.name || "Mandiri Proyek";
      let logText = `Mengubah status tugas "${oldTask.name}" menjadi "${updates.status}" di proyek "${projName}"`;
      if (updates.status === "Done") {
        logText = `✅ Menyelesaikan Tugas: "${oldTask.name}" di proyek "${projName}"`;
      }
      
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: logText,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }

    db.tasks[index] = { ...db.tasks[index], ...updates };
    this.save(db);
    return db.tasks[index];
  }

  static deleteTask(id: string): void {
    const db = this.get();
    const task = db.tasks.find(t => t.id === id);
    if (task) {
      const projName = db.projects.find(p => p.id === task.projectId)?.name || "Mandiri Proyek";
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `Menghapus tugas: "${task.name}" di proyek "${projName}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }
    db.tasks = db.tasks.filter((t) => t.id !== id);
    // Unlink files
    db.files = db.files.map((f) => (f.taskId === id ? { ...f, taskId: "none" } : f));
    this.save(db);
  }

  static getWorkLogs(): WorkLog[] {
    return this.get().workLogs;
  }

  static addWorkLog(log: Omit<WorkLog, "id" | "createdAt">): WorkLog {
    const db = this.get();
    const newLog: WorkLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.workLogs.push(newLog);
    this.save(db);
    return newLog;
  }

  static getReports(): Report[] {
    return this.get().reports;
  }

  static addReport(report: Omit<Report, "id" | "createdAt">): Report {
    const db = this.get();
    const newReport: Report = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.reports.push(newReport);

    // Auto log report creation
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `📝 Menyusun Laporan Aktivitas Harian Baru: "${newReport.title}"`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newReport;
  }

  static getPortfolioItems(): PortfolioItem[] {
    return this.get().portfolioItems;
  }

  static addPortfolioItem(item: Omit<PortfolioItem, "id" | "createdAt">): PortfolioItem {
    const db = this.get();
    const newItem: PortfolioItem = {
      ...item,
      id: `portfolio-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.portfolioItems.push(newItem);

    // Auto log portfolio addition
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `💼 Menambahkan Item Portofolio Baru: "${newItem.title}"`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newItem;
  }

  static deletePortfolioItem(id: string): void {
    const db = this.get();
    const item = db.portfolioItems.find((p) => p.id === id);
    if (item) {
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `🗑️ Menghapus Item Portofolio: "${item.title}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }
    db.portfolioItems = db.portfolioItems.filter((p) => p.id !== id);
    this.save(db);
  }

  static getFiles(): ProjectFile[] {
    return this.get().files;
  }

  static addFile(file: Omit<ProjectFile, "id" | "uploadedAt">): ProjectFile {
    const db = this.get();
    const newFile: ProjectFile = {
      ...file,
      id: `file-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    db.files.push(newFile);

    // Auto log file upload
    const projName = db.projects.find(p => p.id === newFile.projectId)?.name || "Mandiri Proyek";
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `📁 Mengunggah Berkas Baru: "${newFile.name}" ke proyek "${projName}"`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newFile;
  }

  static deleteFile(id: string): void {
    const db = this.get();
    const file = db.files.find(f => f.id === id);
    if (file) {
      const projName = db.projects.find(p => p.id === file.projectId)?.name || "Mandiri Proyek";
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `🗑️ Menghapus berkas: "${file.name}" dari proyek "${projName}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }
    db.files = db.files.filter((f) => f.id !== id);
    this.save(db);
  }

  static getCalendarEvents(): CalendarEvent[] {
    return this.get().calendarEvents || [];
  }

  static addCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt">): CalendarEvent {
    const db = this.get();
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (!db.calendarEvents) {
      db.calendarEvents = [];
    }
    db.calendarEvents.push(newEvent);

    // Auto-create work log
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: "user-1",
      text: `📅 Membuat Pengingat/Acara Baru: "${newEvent.title}" untuk tanggal ${newEvent.date}`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return newEvent;
  }

  static deleteCalendarEvent(id: string): void {
    const db = this.get();
    const event = db.calendarEvents?.find((e) => e.id === id);
    if (event) {
      db.workLogs.push({
        id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: "user-1",
        text: `🗑️ Menghapus Pengingat/Acara: "${event.title}"`,
        date: this.getLocalTodayStr(),
        createdAt: new Date().toISOString(),
      });
    }
    if (db.calendarEvents) {
      db.calendarEvents = db.calendarEvents.filter((e) => e.id !== id);
    }
    this.save(db);
  }

  static updateUserProfile(id: string, name: string, role: string, avatarUrl: string): User {
    const db = this.get();
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      // If user-1 is not found, dynamically seed/find
      const newUser: User = {
        id,
        email: "hizkilazam9@gmail.com",
        name,
        role,
        avatarUrl,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      this.save(db);
      return newUser;
    }
    
    const updatedUser: User = {
      ...db.users[userIndex],
      name,
      role,
      avatarUrl
    };
    db.users[userIndex] = updatedUser;

    // Log the change
    db.workLogs.push({
      id: `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: id,
      text: `👤 Memperbarui profil pengguna: "${name}" sebagai "${role}"`,
      date: this.getLocalTodayStr(),
      createdAt: new Date().toISOString(),
    });

    this.save(db);
    return updatedUser;
  }
}
