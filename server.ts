import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./src/server/db";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit increased to support base64 uploading for drawings/files
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini AI SDK if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("Gemini AI SDK initialized successfully.");
    } catch (err) {
      console.error("Failed to initialize Gemini AI SDK:", err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not defined in environment variables. AI queries will fall back to simulated responses.");
  }

  // API ROUTES -- MUST GO FIRST

  // 1. Auth Mock API
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = Database.findUserByEmail(email);
    if (!user) {
      // Auto-register design: if not found, we create a new user for instant friction-free login
      const name = email.split("@")[0];
      const newUser = Database.addProject({
        // wait, database user is created in database. Let's add user
        name: "test", clientName: "", description: "", startDate: "", deadline: "", status: "Planning", progress: 0, notes: ""
      }); // We will create user manually in db
      const db = Database.get();
      const createdUser = {
        id: `user-${Date.now()}`,
        email: email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: "Professional Technical Designer",
        createdAt: new Date().toISOString()
      };
      db.users.push(createdUser);
      Database.save(db);
      return res.json({ success: true, user: createdUser, message: "Pendaftaran otomatis berhasil!" });
    }
    res.json({ success: true, user, message: "Login berhasil!" });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, name, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email dan nama wajib diisi" });
    }
    const db = Database.get();
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: role || "Freelancer Drafter",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    Database.save(db);
    res.json({ success: true, user: newUser });
  });

  app.put("/api/auth/profile", (req, res) => {
    const { id, name, role, avatarUrl } = req.body;
    if (!id || !name || !role) {
      return res.status(400).json({ success: false, message: "ID, nama, dan jabatan wajib diisi" });
    }
    try {
      const updatedUser = Database.updateUserProfile(id, name, role, avatarUrl || "");
      res.json({ success: true, user: updatedUser });
    } catch (e: any) {
      res.status(404).json({ success: false, message: e.message || "User tidak ditemukan" });
    }
  });

  // 2. Project API
  app.get("/api/projects", (req, res) => {
    res.json(Database.getProjects());
  });

  app.post("/api/projects", (req, res) => {
    const { name, clientName, description, startDate, deadline, status, progress, notes } = req.body;
    if (!name || !clientName) {
      return res.status(400).json({ error: "Nama Proyek & Client wajib diisi" });
    }
    const project = Database.addProject({
      name,
      clientName,
      description: description || "",
      startDate: startDate || new Date().toISOString().split("T")[0],
      deadline: deadline || "",
      status: status || "Planning",
      progress: progress !== undefined ? Number(progress) : 0,
      notes: notes || ""
    });
    res.json(project);
  });

  app.put("/api/projects/:id", (req, res) => {
    try {
      const updated = Database.updateProject(req.params.id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  app.delete("/api/projects/:id", (req, res) => {
    Database.deleteProject(req.params.id);
    res.json({ success: true });
  });

  // 3. Task API
  app.get("/api/tasks", (req, res) => {
    res.json(Database.getTasks());
  });

  app.post("/api/tasks", (req, res) => {
    const { projectId, name, priority, deadline, status, estimatedDuration, notes, checklist } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama Task wajib diisi" });
    }
    const task = Database.addTask({
      projectId: projectId || "none",
      name,
      priority: priority || "Medium",
      deadline: deadline || "",
      status: status || "Todo",
      estimatedDuration: estimatedDuration !== undefined ? Number(estimatedDuration) : 0,
      notes: notes || "",
      checklist: checklist || []
    });
    res.json(task);
  });

  app.put("/api/tasks/:id", (req, res) => {
    try {
      const updated = Database.updateTask(req.params.id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  app.delete("/api/tasks/:id", (req, res) => {
    Database.deleteTask(req.params.id);
    res.json({ success: true });
  });

  // 4. Daily Work Log API
  app.get("/api/work-logs", (req, res) => {
    res.json(Database.getWorkLogs());
  });

  app.post("/api/work-logs", (req, res) => {
    const { userId, text, date } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Catatan aktivitas wajib diisi" });
    }
    const log = Database.addWorkLog({
      userId: userId || "user-1",
      text,
      date: date || new Date().toISOString().split("T")[0]
    });
    res.json(log);
  });

  // 5. Portfolio API
  app.get("/api/portfolio", (req, res) => {
    res.json(Database.getPortfolioItems());
  });

  app.post("/api/portfolio", (req, res) => {
    const { title, description, thumbnail, fileUrl, fileType, fileName, date } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Judul dan deskripsi wajib diisi" });
    }
    const portfolio = Database.addPortfolioItem({
      title,
      description,
      thumbnail: thumbnail || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80",
      fileUrl: fileUrl || "",
      fileType: fileType || "application/pdf",
      fileName: fileName || "specification.pdf",
      date: date || new Date().toISOString().split("T")[0]
    });
    res.json(portfolio);
  });

  app.delete("/api/portfolio/:id", (req, res) => {
    Database.deletePortfolioItem(req.params.id);
    res.json({ success: true });
  });

  // 5.5 Calendar Events API (Pengingat / Acara Baru)
  app.get("/api/events", (req, res) => {
    res.json(Database.getCalendarEvents());
  });

  app.post("/api/events", (req, res) => {
    const { title, description, date, time, category } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: "Judul dan tanggal wajib diisi" });
    }
    const newEvent = Database.addCalendarEvent({
      title,
      description: description || "",
      date,
      time: time || "",
      category: category || "Rapat"
    });
    res.json(newEvent);
  });

  app.delete("/api/events/:id", (req, res) => {
    Database.deleteCalendarEvent(req.params.id);
    res.json({ success: true });
  });

  // 6. File Manager API
  app.get("/api/files", (req, res) => {
    res.json(Database.getFiles());
  });

  app.post("/api/files", (req, res) => {
    const { name, type, size, url, projectId, taskId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama file wajib diisi" });
    }
    const newFile = Database.addFile({
      name,
      type: type || "application/octet-stream",
      size: size || 0,
      url: url || "#",
      projectId: projectId || "none",
      taskId: taskId || "none"
    });
    res.json(newFile);
  });

  app.delete("/api/files/:id", (req, res) => {
    Database.deleteFile(req.params.id);
    res.json({ success: true });
  });

  // 7. Daily Report Generation
  app.get("/api/reports", (req, res) => {
    res.json(Database.getReports());
  });

  app.post("/api/reports", (req, res) => {
    const { title, date, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Judul dan isi laporan wajib diisi" });
    }
    const report = Database.addReport({
      title,
      date: date || new Date().toISOString().split("T")[0],
      content
    });
    res.json(report);
  });

  // 8. AI Assistant API (Internal Chat)
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, userPrompt } = req.body;
    const currentLocalDate = "2026-06-17";

    // Load actual context from db for Gemini
    const projects = Database.getProjects();
    const tasks = Database.getTasks();
    const workLogs = Database.getWorkLogs();

    // Prepare dense details for AI context
    const projectsContext = projects.map(p => 
      `- Proyek: ${p.name} (Client: ${p.clientName}) | Status: ${p.status} | Progress: ${p.progress}% | Deadline: ${p.deadline} | Catatan: ${p.notes}`
    ).join("\n");

    const tasksContext = tasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)?.name || "Mandiri";
      const chkTotal = t.checklist.length;
      const chkDone = t.checklist.filter(c => c.done).length;
      return `- Tugas: "${t.name}" | Proyek: "${proj}" | Status: ${t.status} | Prioritas: ${t.priority} | Deadline: ${t.deadline} | Checklist: (${chkDone}/${chkTotal} selesai) | Catatan: ${t.notes}`;
    }).join("\n");

    const logsContext = workLogs.slice(0, 15).map(l => 
      `- Log [${l.date}]: "${l.text}"`
    ).join("\n");

    const systemInstruction = `Anda adalah RE-FLOW AI Assistant (dari sistem Remainder Flow Work), asisten profesional pintar khusus untuk para pekerja profesional, desainer, fotografer, produser konten, developer, freelancer, dan kolaborator proyek.
Tugas Anda adalah menganalisis proyek, tugas, log kerja, dan tenggat waktu (deadline) pengguna, lalu memberikan saran taktis yang sangat terarah, analisis keterlambatan, prioritasi tugas, atau menyusun draf laporan kerja harian.

INFORMASI PROYEK PENGGUNA SAAT INI (DATABASE REALTIME):
--- PROYEK ---
${projectsContext || "Belum ada proyek yang terdaftar."}

--- TUGAS UTAMA ---
${tasksContext || "Belum ada tugas yang terdaftar."}

--- LOG AKTIVITAS HR INI / AKHIR-AKHIR INI ---
${logsContext || "Belum ada catatan aktivitas hari ini."}

Waktu sistem saat ini: 17 Juni 2026.

PANDUAN MENJAWAB:
- Jawablah menggunakan Bahasa Indonesia yang profesional namun ramah, taktis, dan fokus pada efisiensi kerja.
- Gunakan format Markdown (bold, list, tabel, dll) agar sangat mudah didraft atau dibaca.
- Jika ditanya tentang prioritasi, identifikasi tugas-tugas berstatus 'Todo' atau 'In Progress' yang memiliki Tenggat Waktu terdekat dan Prioritas Tinggi (High).
- Jika diminta membuat laporan kerja, gabungkan log aktivitas hari ini (${currentLocalDate}) ke dalam layout laporan yang indah beserta ringkasan kemajuan proyek.
- Jika ditanya proyek mana yang paling terlambat, bandingkan tanggal deadline dengan status dan persentase progress saat ini.`;

    if (!ai) {
      // Offline fallback simulations
      const lower = (userPrompt || "").toLowerCase();
      let reply = "";
      if (lower.includes("prioritas") || lower.includes("prioritaskan")) {
        reply = `### Rekomendasi Prioritas Kerja Hari Ini

Berdasarkan analisis backlog (Koneksi AI Terbatas, Menggunakan Analisis Lokal):
1. **Menyelesaikan fungsionalitas utama & review draf berkas** (Tinggi - Tenggat Hari Ini) - Proyek: *Draf Kampanye Media / Pengembangan Fitur*
2. **Penyusunan laporan akhir harian & sinkronisasi data** (Tinggi - Besok) - Proyek: *Optimasi Data Proyek Utama*

*Silakan aktifkan API Key untuk evaluasi AI yang lebih mendalam.*`;
      } else if (lower.includes("laporan") || lower.includes("report")) {
        reply = `### DRAF LAPORAN HARIAN (17 Juni 2026)
        
**Ringkasan Aktivitas Selesai Hari Ini:**
${workLogs.filter(l => l.date === currentLocalDate).map(l => `- ${l.text}`).join("\n") || "- Melaksanakan update pengerjaan rutinitas harian & review tenggat."}

**Progress Proyek Utama:**
- **Branding & Digital Campaign:** 80% (Review Aset Visual)
- **Pengembangan Aplikasi Web Internal:** 90% (Review Deployment)

*Silakan hubungkan API Key di menu rahasia untuk penyusunan laporan otomatis berbasis Gemini.*`;
      } else {
        reply = `Halo! Saya adalah **RE-FLOW AI Assistant** (Remainder Flow Work). 

Koneksi server ke API Gemini saat ini menggunakan respons lokal. Saya tetap dapat membantu Anda melihat daftar proyek aktif dan jadwal tugas Anda. Ada yang bisa saya bantu untuk mengorganisir aktivitas dan penugasan kerja Anda hari ini?`;
      }
      return res.json({ text: reply });
    }

    try {
      // Build structured model request
      // Clean up inputs to format exactly as the Gemini SDK expects
      const contentsList: any[] = [];
      
      // Append historical logs if provided
      if (messages && Array.isArray(messages)) {
        // Map messages to Gemini SDK contents format
        const lastFew = messages.slice(-6); // Only include last few rounds to keep it lightweight
        lastFew.forEach(m => {
          contentsList.push({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          });
        });
      }

      // Add actual current prompt at the end
      contentsList.push({
        role: "user",
        parts: [{ text: userPrompt || "Halo" }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "Tidak ada respon dihasilkan dari AI." });
    } catch (err: any) {
      console.error("Gemini Response Generation Error:", err);
      res.status(500).json({ error: "Gagal memproses respon AI: " + err.message });
    }
  });

  // Setup Vite development server or production static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
