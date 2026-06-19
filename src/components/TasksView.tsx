import React, { useState } from "react";
import { Task, Project, ChecklistItem } from "../types";
import { Plus, CheckSquare, Search, Filter, Trash2, Edit3, X, Check, Clock, ListTodo } from "lucide-react";

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (t: Omit<Task, "id" | "createdAt">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function TasksView({ tasks, projects, onAddTask, onUpdateTask, onDeleteTask }: TasksViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Todo" | "In Progress" | "Review" | "Done">("All");
  const [projectIdFilter, setProjectIdFilter] = useState<string>("All");

  // Form State
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<"Todo" | "In Progress" | "Review" | "Done">("Todo");
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const resetForm = () => {
    setName("");
    setProjectId("none");
    setPriority("Medium");
    setDeadline("");
    setStatus("Todo");
    setEstimatedDuration(0);
    setNotes("");
    setChecklist([]);
    setNewChecklistItem("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const localTodayStr = (() => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    })();

    onAddTask({
      projectId,
      name,
      priority,
      deadline: deadline || localTodayStr,
      status,
      estimatedDuration: Number(estimatedDuration),
      notes,
      checklist
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEditInit = (t: Task) => {
    setEditingTask(t);
    setName(t.name);
    setProjectId(t.projectId);
    setPriority(t.priority);
    setDeadline(t.deadline);
    setStatus(t.status);
    setEstimatedDuration(t.estimatedDuration);
    setNotes(t.notes || "");
    setChecklist(t.checklist || []);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    onUpdateTask(editingTask.id, {
      projectId,
      name,
      priority,
      deadline,
      status,
      estimatedDuration: Number(estimatedDuration),
      notes,
      checklist
    });
    setEditingTask(null);
    resetForm();
  };

  // Add individual task item checklist in real-time dialog
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistItem.trim(),
      done: false
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistItem("");
  };

  const toggleChecklistInForm = (id: string) => {
    setChecklist(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));
  };

  const removeChecklistInForm = (id: string) => {
    setChecklist(checklist.filter(c => c.id !== id));
  };

  // Quick Inline Status Toggles for fast workflow checks
  const toggleTaskStatus = (t: Task) => {
    const statuses: Task["status"][] = ["Todo", "In Progress", "Review", "Done"];
    const currentIndex = statuses.indexOf(t.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onUpdateTask(t.id, { status: statuses[nextIndex] });
  };

  const toggleInlineChecklist = (task: Task, chkId: string) => {
    const updatedChecklist = task.checklist.map(c => 
      c.id === chkId ? { ...c, done: !c.done } : c
    );
    // Auto complete task if all checklist items are checked and status was Todo
    let updatedStatus = task.status;
    const allChecked = updatedChecklist.length > 0 && updatedChecklist.every(c => c.done);
    if (allChecked && task.status === "In Progress") {
      updatedStatus = "Review";
    }
    onUpdateTask(task.id, { checklist: updatedChecklist, status: updatedStatus });
  };

  // Filters logic application
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesProject = projectIdFilter === "All" || task.projectId === projectIdFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="tasks-view-root">
      
      {/* Header and Add Task */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-yellow-500" /> Tugas & Detail Kerja
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Mengatur daftar tugas berdasar prioritas, jam pengerjaan draf, dan checklist.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingTask(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-yellow-950/20 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Tugas Baru
        </button>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between text-xs">
        
        {/* Search Input Box */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            placeholder="Cari tugas atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-yellow-500 text-xs font-sans"
          />
        </div>

        {/* Filter dropdown select elements */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-zinc-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 rounded p-1.5 px-3 text-zinc-300 focus:outline-none w-full sm:w-auto font-mono text-[11px]"
            >
              <option value="All">Semua Status</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-zinc-500 font-medium whitespace-nowrap">Proyek:</span>
            <select
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded p-1.5 px-3 text-zinc-300 focus:outline-none w-full sm:w-auto max-w-[180px] text-[11px]"
            >
              <option value="All">Semua Proyek</option>
              <option value="none">Mandiri (Tanpa Proyek)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const associatedProject = projects.find(p => p.id === task.projectId);
          const chkTotal = task.checklist ? task.checklist.length : 0;
          const chkDone = task.checklist ? task.checklist.filter(c => c.done).length : 0;

          return (
            <div 
              key={task.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-4 rounded-xl transition-all hover:bg-zinc-900/10 space-y-3"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {/* Checkbox title & priority layout */}
                <div className="flex items-start gap-3">
                  <button 
                    onClick={() => toggleTaskStatus(task)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      task.status === "Done" 
                        ? "bg-green-600 border-green-600 text-black hover:bg-green-500" 
                        : "border-zinc-700 hover:border-yellow-500/40"
                    }`}
                  >
                    {task.status === "Done" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-300 font-medium font-sans">
                      {task.name}
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      {associatedProject ? (
                        <span className="text-blue-400 font-semibold bg-blue-950/20 px-2 py-0.2 rounded border border-blue-900/30">
                          📁 {associatedProject.name}
                        </span>
                      ) : (
                        <span className="text-zinc-500 bg-zinc-900 px-2 py-0.2 rounded">
                          📌 Mandiri
                        </span>
                      )}

                      <span className="text-zinc-700">•</span>

                      <span className={`uppercase font-bold px-1.5 py-0.2 rounded border ${
                        task.priority === "High" 
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority === "Medium"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                        {task.priority} Priority
                      </span>

                      <span className="text-zinc-700">•</span>

                      <span className="text-zinc-400">
                        {task.estimatedDuration} hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side status / buttons */}
                <div className="flex items-center gap-3 sm:self-center self-end">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                    task.status === "Todo" 
                      ? "bg-zinc-900 text-zinc-400 border-zinc-800" 
                      : task.status === "In Progress"
                      ? "bg-blue-900/20 text-blue-400 border-blue-900/30"
                      : task.status === "Review"
                      ? "bg-yellow-900/10 text-yellow-500 border-yellow-900/30"
                      : "bg-green-950/20 text-green-400 border-green-950/40"
                  }`}>
                    {task.status}
                  </span>

                  <button 
                    onClick={() => handleEditInit(task)}
                    className="p-1 px-2 text-[10px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded"
                    id={`edit-task-btn-${task.id}`}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-red-400 hover:text-red-300 bg-red-950/10 hover:bg-red-950/30 rounded border border-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Checklist visualizer */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1.5"><ListTodo className="w-3.5 h-3.5" /> CHECKLIST AKTIVITAS DOSSIER</span>
                    <span>{chkDone}/{chkTotal} Selesai</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {task.checklist.map((chk) => (
                      <label 
                        key={chk.id}
                        className="flex items-center gap-2 cursor-pointer py-1 bg-zinc-900/50 p-2 rounded border border-zinc-900 hover:border-zinc-800 transition"
                      >
                        <input 
                          type="checkbox"
                          checked={chk.done}
                          onChange={() => toggleInlineChecklist(task, chk.id)}
                          className="rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 w-3.5 h-3.5 focus:ring-offset-0"
                        />
                        <span className={`text-zinc-300 truncate font-sans text-[11px] ${chk.done ? "line-through text-zinc-600" : ""}`}>
                          {chk.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline reminder and notes indicator */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-zinc-500 font-mono pt-1">
                <span>🗓️ Tenggat: {task.deadline || "-"}</span>
                {task.notes && (
                  <span className="text-zinc-400 italic line-clamp-1 mt-1 sm:mt-0 font-sans">
                    Catatan: {task.notes}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 text-xs">
            <p className="text-zinc-500 text-sm">Belum ada tugas.</p>
            <p className="text-zinc-600">Tekan &quot;Tugas Baru&quot; di kanan atas untuk memformulasikan lembar penugasan.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal Layer */}
      {(showAddModal || editingTask) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl my-8 text-xs relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {editingTask ? "Ubah Detail Tugas" : "Formulasikan Tugas Baru"}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdate : handleCreate} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Nama Tugas*</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Membuat gambar kerja sink table SUS304"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-yellow-500 font-sans text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Kaitkan ke Proyek</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-zinc-300 focus:outline-none focus:border-yellow-500 text-xs"
                  >
                    <option value="none">Mandiri (Tanpa Proyek)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Tingkat Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-zinc-300 focus:outline-none focus:border-yellow-500 text-xs"
                  >
                    <option value="High">Tinggi (High)</option>
                    <option value="Medium">Sedang (Medium)</option>
                    <option value="Low">Rendah (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Tenggat Waktu (Deadline)</label>
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-yellow-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Estimasi (Jam)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="4"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-yellow-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-zinc-300 focus:outline-none focus:border-yellow-500 text-xs"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Catatan Pendukung</label>
                <input 
                  type="text"
                  placeholder="Instruksi tambahan, toleransi ukuran draf..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-yellow-500 text-xs"
                />
              </div>

              {/* Checklist builder in form */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                <label className="text-zinc-400 font-semibold block">Checklist Sub-Pekerjaan</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Contoh: Desain pipa buangan grease trap..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none text-xs"
                  />
                  <button 
                    type="button"
                    onClick={addChecklistItem}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 rounded font-bold"
                  >
                    + Tambah
                  </button>
                </div>

                {checklist.length > 0 && (
                  <div className="mt-2 bg-zinc-900/40 border border-zinc-900 p-2.5 rounded max-h-32 overflow-y-auto space-y-1.5">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-zinc-350">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklistInForm(item.id)}
                            className="rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 w-3.5 h-3.5"
                          />
                          <span className={`text-[11px] font-sans ${item.done ? "line-through text-zinc-650" : ""}`}>
                            {item.text}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeChecklistInForm(item.id)}
                          className="text-red-400 hover:text-red-300 text-[10px]"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded transition shadow-lg shadow-yellow-950/25"
                >
                  {editingTask ? "Simpan Perubahan" : "Buat Tugas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
