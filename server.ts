import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./src/server/db";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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

  // Helper to create SMTP transporter
  function getTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = process.env.SMTP_PORT?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASSWORD?.trim();

    if (host && port && user && pass) {
      // Validate SMTP host to prevent DNS getaddrinfo errors on placeholder/unconfigured settings (e.g. name like "azam")
      if (host !== "localhost" && !host.includes(".")) {
        console.warn(`SMTP_HOST "${host}" is not a valid domain or IP address. Falling back to Sandbox Mode.`);
        return null;
      }
      return nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: parseInt(port) === 465, // true for 465, else false
        auth: {
          user,
          pass,
        },
        // Low connection timeout to fail fast if network issues occur
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
    }
    return null;
  }

  // Helper to send registration verification email
  async function sendVerificationEmail(email: string, code: string, name: string) {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || '"RE-FLOW Work" <noreply@re-flow-work.com>';
    
    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: "[RE-FLOW] Verifikasi Email Anda",
          text: `Halo ${name},\n\nTerima kasih telah mendaftar di RE-FLOW Workspace.\n\nKode verifikasi Anda adalah: ${code}\n\nKode ini berlaku selama 20 menit.\n\nSalam hangat,\nTim RE-FLOW`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #4f46e5; text-align: center;">Verifikasi Email RE-FLOW</h2>
              <p>Halo <strong>${name}</strong>,</p>
              <p>Terima kasih telah bergabung di <strong>RE-FLOW Workspace</strong>, platform kolaborasi dan manajemen tugas profesional Anda.</p>
              <p style="font-size: 16px;">Kode verifikasi pendaftaran akun Anda adalah:</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1e1b4b; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #6b7280; font-size: 12px; text-align: center;">Kode ini berlaku selama 20 menit. Jangan sebarkan kode ini kepada siapa pun.</p>
            </div>
          `
        });
        console.log(`REAL EMAIL: Verification email sent to ${email}`);
        return true;
      } catch (err) {
        console.error(`Failed to send real email via SMTP:`, err);
        return false;
      }
    }
    console.log(`\n===============================================\n[SANDBOX MAILBOX] Verifikasi Email\nKirim ke: ${email}\nKode: ${code}\n===============================================\n`);
    return false;
  }

  // Helper to send password reset email
  async function sendPasswordResetEmail(email: string, code: string, name: string) {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || '"RE-FLOW Work" <noreply@re-flow-work.com>';
    
    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: "[RE-FLOW] Pemulihan Kata Sandi",
          text: `Halo ${name},\n\nKami menerima permintaan untuk mereset kata sandi akun RE-FLOW Anda.\n\nKode pemulihan Anda adalah: ${code}\n\nKode ini berlaku selama 20 menit.\n\nJika Anda tidak meminta ini, abaikan email ini.\n\nSalam hangat,\nTim RE-FLOW`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #ef4444; text-align: center;">Atur Ulang Kata Sandi RE-FLOW</h2>
              <p>Halo <strong>${name}</strong>,</p>
              <p>Kami menerima permintaan untuk melakukan pengaturan ulang kata sandi pada akun RE-FLOW Anda.</p>
              <p style="font-size: 16px;">Kode pemulihan kata sandi Anda adalah:</p>
              <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #ef4444; margin: 20px 0; border: 1px dashed #fca5a5;">
                ${code}
              </div>
              <p style="color: #6b7280; font-size: 12px; text-align: center;">Kode ini berlaku selama 20 menit. Jika Anda tidak merasa melakukan tindakan ini, abaikan email ini.</p>
            </div>
          `
        });
        console.log(`REAL EMAIL: Password reset email sent to ${email}`);
        return true;
      } catch (err) {
        console.error(`Failed to send real password reset email via SMTP:`, err);
        return false;
      }
    }
    console.log(`\n===============================================\n[SANDBOX MAILBOX] Lupa Kata Sandi\nKirim ke: ${email}\nKode: ${code}\n===============================================\n`);
    return false;
  }

  // API ROUTES -- MUST GO FIRST

  // 1. Auth & Verification API
  const isSMTPConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER);

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email wajib diisi" });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: "Kata sandi wajib diisi" });
      }

      const db = Database.get();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(401).json({ success: false, message: "Email tidak terdaftar." });
      }

      // Verify Password (direct string check for simple local database architecture)
      const userPassword = user.password || "admin123"; // Default pre-seed bypass password
      if (userPassword !== password) {
        return res.status(401).json({ success: false, message: "Kata sandi salah." });
      }

      // If matches, check if Gmail/Email verified
      if (user.isEmailVerified === false) {
        // Send a new verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 20 * 60 * 1000).toISOString();

        user.emailVerificationCode = code;
        user.emailVerificationExpires = expires;
        Database.save(db);

        // Async email sending which we await to check for errors
        const emailSent = await sendVerificationEmail(user.email, code, user.name);

        return res.json({
          success: true,
          needsVerification: true,
          email: user.email,
          message: emailSent 
            ? "Email belum diverifikasi. Kode verifikasi baru telah dikirim ke email Anda."
            : "Format SMTP salah/gagal kirim. Gunakan Kode Sandbox di bawah untuk verifikasi.",
          sandboxCode: emailSent ? undefined : code
        });
      }

      // Login successful
      res.json({
        success: true,
        user,
        message: "Login berhasil!"
      });
    } catch (err: any) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal server saat login: " + err.message });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: "Email, nama, dan kata sandi wajib diisi" });
      }

      const db = Database.get();
      const existingUserIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      if (existingUserIndex !== -1) {
        const existingUser = db.users[existingUserIndex];
        if (existingUser.isEmailVerified) {
          return res.status(400).json({ success: false, message: "Email sudah terdaftar dan aktif. Silakan login." });
        }

        // If registered but unverified, allow updating password/name/role and send new code
        existingUser.name = name;
        existingUser.password = password;
        existingUser.role = role || "Professional Contributor";
        existingUser.emailVerificationCode = code;
        existingUser.emailVerificationExpires = expires;
        
        Database.save(db);
        const emailSent = await sendVerificationEmail(email, code, name);

        return res.json({
          success: true,
          needsVerification: true,
          email,
          message: emailSent
            ? "Pendaftaran diperbarui! Kode verifikasi baru telah dikirim."
            : "Pendaftaran diperbarui, namun pengiriman SMTP gagal. Silakan gunakan Kode Sandbox di bawah.",
          sandboxCode: emailSent ? undefined : code
        });
      }

      // New User
      const newUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        role: role || "Professional Contributor",
        password,
        isEmailVerified: false,
        emailVerificationCode: code,
        emailVerificationExpires: expires,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      Database.save(db);
      const emailSent = await sendVerificationEmail(email, code, name);

      res.json({
        success: true,
        needsVerification: true,
        email,
        message: emailSent
          ? "Pendaftaran berhasil! Kode verifikasi telah dikirim ke email."
          : "Pendaftaran berhasil! SMTP gagal mengirim email, gunakan Kode Sandbox di bawah.",
        sandboxCode: emailSent ? undefined : code
      });
    } catch (err: any) {
      console.error("Register Error:", err);
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal server saat pendaftaran: " + err.message });
    }
  });

  // Verification Endpoint
  app.post("/api/auth/verify-email", (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email dan kode verifikasi wajib diisi" });
    }

    const db = Database.get();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    if (user.isEmailVerified) {
      return res.json({ success: true, user, message: "Akun Anda sudah diverifikasi sebelumnya." });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ success: false, message: "Kode verifikasi salah." });
    }

    if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
      return res.status(400).json({ success: false, message: "Kode verifikasi telah kedaluwarsa. Silakan minta kode baru." });
    }

    // Verify user
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    Database.save(db);

    res.json({
      success: true,
      user,
      message: "Selamat! Email Anda berhasil diverifikasi."
    });
  });

  // Resend code
  app.post("/api/auth/resend-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email wajib diisi" });
      }

      const db = Database.get();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      user.emailVerificationCode = code;
      user.emailVerificationExpires = expires;

      Database.save(db);
      const emailSent = await sendVerificationEmail(user.email, code, user.name);

      res.json({
        success: true,
        message: emailSent 
          ? "Kode verifikasi baru telah dikirim." 
          : "SMTP gagal mengirim kode. Silakan gunakan Kode Sandbox di bawah.",
        sandboxCode: emailSent ? undefined : code
      });
    } catch (err: any) {
      console.error("Resend Code Error:", err);
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal server saat mengirim ulang kode: " + err.message });
    }
  });

  // Forgot Password Initiator
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email wajib diisi" });
      }

      const db = Database.get();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ success: false, message: "Email tidak terdaftar sebagai pengguna." });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 20 * 60 * 1000).toISOString();

      user.passwordResetCode = code;
      user.passwordResetExpires = expires;

      Database.save(db);
      const emailSent = await sendPasswordResetEmail(user.email, code, user.name);

      res.json({
        success: true,
        email: user.email,
        message: emailSent 
          ? "Kode pemulihan kata sandi telah dikirim." 
          : "SMTP gagal mengirim email pemulihan. Silakan gunakan Kode Sandbox di bawah.",
        sandboxCode: emailSent ? undefined : code
      });
    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal server saat memproses lupa kata sandi: " + err.message });
    }
  });

  // Reset Password Executor
  app.post("/api/auth/reset-password", (req, res) => {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ success: false, message: "Email, kode, dan kata sandi baru harus diisi." });
    }

    const db = Database.get();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    if (user.passwordResetCode !== code) {
      return res.status(400).json({ success: false, message: "Kode pemulihan salah." });
    }

    if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
      return res.status(400).json({ success: false, message: "Kode pemulihan telah kedaluwarsa." });
    }

    user.password = password;
    user.isEmailVerified = true; // Proved ownership via email reset token code
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    Database.save(db);

    res.json({
      success: true,
      message: "Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru mendatar."
    });
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
    try {
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

Berorientasikan analisis backlog (Koneksi AI Terbatas, Menggunakan Analisis Lokal):
1. **Menyelesaikan fungsionalitas utama & review draf berkas** (Tinggi - Tenggat Hari Ini) - Proyek: *Draf Kampanye Media / Pengembangan Fitur*
2. **Penyusunan laporan akhir harian & sinkronisasi data** (Tinggi - Besok) - Proyek: *Optimasi Data Proyek Utama*

*Silakan aktifkan API Key untuk evaluasi AI yang lebih mendalam.*`;
        } else if (lower.includes("laporan") || lower.includes("report")) {
          reply = `### DRAF LAPORAN HARIAN (17 Juni 2026)
          
Ringkasan Aktivitas Selesai Hari Ini:
${workLogs.filter(l => l.date === currentLocalDate).map(l => `- ${l.text}`).join("\n") || "- Melaksanakan update pengerjaan rutinitas harian & review tenggat."}

Progress Proyek Utama:
- **Branding & Digital Campaign:** 80% (Review Aset Visual)
- **Pengembangan Aplikasi Web Internal:** 90% (Review Deployment)

*Silakan hubungkan API Key di menu rahasia untuk penyusunan laporan otomatis berbasis Gemini.*`;
        } else {
          reply = `Halo! Saya adalah **RE-FLOW AI Assistant** (Remainder Flow Work). 

Koneksi server ke API Gemini saat ini menggunakan respons lokal. Saya tetap dapat membantu Anda melihat daftar proyek aktif dan jadwal tugas Anda. Ada yang bisa saya bantu untuk mengorganisir aktivitas dan penugasan kerja Anda hari ini?`;
        }
        return res.json({ text: reply });
      }

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
      console.error("AI Assistant Error:", err);
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
