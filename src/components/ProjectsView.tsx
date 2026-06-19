import React, { useState } from "react";
import { Project } from "../types";
import { Plus, Briefcase, Calendar, ChevronRight, Check, Trash2, Edit3, X } from "lucide-react";

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (p: Omit<Project, "id" | "createdAt">) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

export default function ProjectsView({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"Planning" | "In Progress" | "Review" | "Completed">("Planning");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setClientName("");
    setDescription("");
    setStartDate("");
    setDeadline("");
    setStatus("Planning");
    setProgress(0);
    setNotes("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientName) return;
    onAddProject({
      name,
      clientName,
      description,
      startDate: startDate || new Date().toISOString().split("T")[0],
      deadline: deadline || "",
      status,
      progress: Number(progress),
      notes
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEditInit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setClientName(p.clientName);
    setDescription(p.description);
    setStartDate(p.startDate);
    setDeadline(p.deadline);
    setStatus(p.status);
    setProgress(p.progress);
    setNotes(p.notes);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    onUpdateProject(editingProject.id, {
      name,
      clientName,
      description,
      startDate,
      deadline,
      status,
      progress: Number(progress),
      notes
    });
    setEditingProject(null);
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="projects-view-root">
      
      {/* Upper header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-500" /> Manajemen Proyek
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Pantau detail pengerjaan, target progres, dan tenggat waktu client Anda secara terorganisir.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingProject(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-blue-950/20 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Proyek Baru
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="bg-zinc-950 border border-zinc-900/80 rounded-xl p-5 hover:border-zinc-800 transition-all flex flex-col justify-between hover:translate-y-[-2px] duration-300"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-4">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  project.status === "Planning" 
                    ? "bg-zinc-900/80 text-zinc-400 border-zinc-800" 
                    : project.status === "In Progress"
                    ? "bg-blue-900/20 text-blue-400 border-blue-900/30"
                    : project.status === "Review"
                    ? "bg-yellow-900/20 text-yellow-500 border-yellow-900/30"
                    : "bg-green-950/20 text-green-400 border-green-950/40"
                }`}>
                  {project.status}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditInit(project)}
                    className="p-1 px-2 text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setProjectToDelete(project.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 bg-red-950/10 hover:bg-red-950/30 rounded border border-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-medium text-white line-clamp-1">{project.name}</h3>
                <p className="text-xs text-blue-500 font-mono">Client: {project.clientName}</p>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {project.description || "Tidak ada deskripsi rinci proyek."}
              </p>

              {project.notes && (
                <div className="bg-zinc-900/40 border border-zinc-800 p-2.5 rounded text-[10px] text-zinc-500 font-serif leading-relaxed italic">
                  📝 {project.notes}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-900 space-y-3">
              {/* Progress bar info */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-500 text-xs font-semibold uppercase">Total Progres</span>
                  <span className="text-blue-400 font-mono font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Dates info */}
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Mulai: {project.startDate}</span>
                <span className="text-zinc-400">Tenggat: {project.deadline || "-"}</span>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
            <p className="text-zinc-500 text-sm">Belum ada proyek terdaftar.</p>
            <p className="text-zinc-600 text-xs">Tambahkan proyek baru untuk mengelola tugas & tenggat waktu.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Project Dialog Layer */}
      {(showAddModal || editingProject) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl my-8 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {editingProject ? "Revisi Detail Proyek" : "Pendaftaran Proyek Baru"}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingProject(null); }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingProject ? handleUpdate : handleCreate} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Nama Proyek*</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Desain Kitchen Set SUS304 v2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Nama Client*</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: PT Boga Sejahtera"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Status Proyek</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Deskripsi Proyek</label>
                <textarea 
                  rows={2}
                  placeholder="Detail lingkup pengerjaan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Tanggal Mulai</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Tenggat Waktu (Deadline)</label>
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-zinc-400 font-semibold block">Progres Proyek ({progress}%)</label>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full bg-zinc-900 border-none rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Catatan Tambahan</label>
                <input 
                  type="text"
                  placeholder="Catatan pengerjaan kritis dari klien..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <input type="hidden"/>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingProject(null); }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded transition shadow-lg shadow-blue-950/25"
                >
                  {editingProject ? "Simpan Perubahan" : "Buat Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Konfirmasi Hapus Proyek</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Apakah Anda yakin ingin menghapus proyek ini? Seluruh kaitan file dan tugas yang terhubung dengan proyek ini akan diputus secara permanen.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded transition text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(projectToDelete);
                  setProjectToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2 rounded transition text-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
