import React, { useState, useRef } from "react";
import { ProjectFile, Project, Task } from "../types";
import { FolderOpen, Upload, Trash2, FileCode, Check, Download, Paperclip, Link, Loader2 } from "lucide-react";

interface FileManagerViewProps {
  files: ProjectFile[];
  projects: Project[];
  tasks: Task[];
  onAddFile: (file: Omit<ProjectFile, "id" | "uploadedAt">) => void;
  onDeleteFile: (id: string) => void;
}

export default function FileManagerView({ files, projects, tasks, onAddFile, onDeleteFile }: FileManagerViewProps) {
  const [projectId, setProjectId] = useState("none");
  const [taskId, setTaskId] = useState("none");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handles manual file selection or drag and drop uploads (Base64 simulated)
  const processUpload = (name: string, type: string, size: number) => {
    setUploading(true);
    setTimeout(() => {
      onAddFile({
        name,
        type: type || "application/octet-stream",
        size,
        url: "#",
        projectId,
        taskId
      });
      setUploading(false);
      alert(`File "${name}" berhasil diunggah dan dikaitkan.`);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUpload(file.name, file.type, file.size);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Get file icon based on file extension/type
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "dwg":
      case "dxf":
        return <span className="bg-red-500/10 text-red-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-red-500/20 shrink-0">DWG</span>;
      case "zip":
      case "rar":
      case "7z":
        return <span className="bg-yellow-500/10 text-yellow-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-yellow-500/20 shrink-0">ZIP</span>;
      case "doc":
      case "docx":
        return <span className="bg-sky-500/10 text-sky-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-sky-500/20 shrink-0">DOC</span>;
      case "xls":
      case "xlsx":
        return <span className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-emerald-500/20 shrink-0">XLS</span>;
      case "ppt":
      case "pptx":
        return <span className="bg-rose-500/10 text-rose-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-rose-500/20 shrink-0">PPT</span>;
      case "pdf":
        return <span className="bg-orange-500/10 text-orange-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-orange-500/20 shrink-0">PDF</span>;
      case "step":
      case "stp":
        return <span className="bg-blue-500/10 text-blue-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-blue-500/20 shrink-0">3D</span>;
      case "png":
      case "jpg":
      case "jpeg":
        return <span className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg font-bold font-mono text-[10px] border border-emerald-500/20 shrink-0">IMG</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-400 p-2 rounded-lg font-bold font-mono text-[10px] shrink-0">FILE</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="file-manager-view-root">
      
      {/* Header element */}
      <div>
        <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
          <FolderOpen className="w-7 h-7 text-blue-500" /> File Manager
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Penyimpanan berkas kerja, dokumen rujukan, aset visual, laporan portofolio, serta draf pelengkap aktivitas Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload controller card (Span 1) */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-white">Unggah Berkas Baru</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold block">Kaitkan ke Proyek</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none"
              >
                <option value="none font-mono">Simpan Umum (Tanpa Proyek)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold block">Kaitkan ke Tugas Terstruktur</label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none"
              >
                <option value="none">Tidak Dikaitkan ke Tugas</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Simulated Drag & Drop Click Upload Area */}
            <div 
              onClick={triggerUploadClick}
              className="border-2 border-dashed border-zinc-800 hover:border-blue-500/40 rounded-xl p-8 text-center cursor-pointer transition bg-zinc-950/40 space-y-2.5 hover:bg-zinc-900/10"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.pptx,.txt,.zip,.dwg"
                className="hidden"
              />
              
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-zinc-400 font-medium font-mono">Mengunggah file...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-zinc-650 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-zinc-350 font-semibold">Tarik Berkas atau Klik disini</p>
                    <p className="text-zinc-550 text-[10px]">Mendukung PDF, Office (Word/Excel), ZIP, Gambar, dll. (Maks. 50MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Files Grid and Database View (Span 2) */}
        <div className="md:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center text-zinc-400">
            <h3 className="text-sm font-semibold text-white">Daftar Penyimpanan Berkas ({files.length})</h3>
            <span className="text-[10px] font-mono">Durable Cloud Sync</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {files.map((file) => {
              const fileProj = projects.find(p => p.id === file.projectId);
              const fileTask = tasks.find(t => t.id === file.taskId);

              return (
                <div 
                  key={file.id}
                  className="bg-zinc-900/40 border border-zinc-900 p-3.5 rounded-lg flex items-center justify-between gap-4 hover:border-zinc-800 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.name)}
                    
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs text-zinc-200 font-medium truncate font-sans">{file.name}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        {fileProj ? (
                          <span className="text-blue-400">📁 {fileProj.name}</span>
                        ) : (
                          <span className="text-zinc-600">Simpan Umum</span>
                        )}

                        {fileTask && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-500">📎 {fileTask.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => alert(`Mengunduh berkas teknis: ${file.name}`)}
                      className="p-1 px-2 hover:bg-zinc-800 rounded text-[10px] text-zinc-400 hover:text-white border border-zinc-800"
                    >
                      Unduh
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Hapus berkas "${file.name}"?`)) {
                          onDeleteFile(file.id);
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded border border-red-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {files.length === 0 && (
              <p className="text-center text-zinc-600 py-12 font-sans">Belum ada berkas teknis yang disimpan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
