import React, { useState, useRef } from "react";
import { PortfolioItem } from "../types";
import { Plus, Award, Download, ExternalLink, Image, X, FileText, Globe, Upload, FileUp, Trash2 } from "lucide-react";

interface PortfolioViewProps {
  portfolioItems: PortfolioItem[];
  onAddPortfolioItem: (item: Omit<PortfolioItem, "id" | "createdAt">) => void;
  onDeletePortfolioItem?: (id: string) => void;
}

export default function PortfolioView({ portfolioItems, onAddPortfolioItem, onDeletePortfolioItem }: PortfolioViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("application/pdf");
  const [fileName, setFileName] = useState("");
  const [date, setDate] = useState("2026-06-17");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([]);

  // Drags & uploads physical files
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setThumbnail("");
    setFileUrl("");
    setFileType("application/pdf");
    setFileName("");
    setUploadedFiles([]);
    setDate("2026-06-17");
  };

  const handleBannerUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleAttachmentsUpload = (filesList: FileList | File[]) => {
    Array.from(filesList).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let type = file.type || "application/octet-stream";
      if (extension === "pdf") {
        type = "application/pdf";
      } else if (extension === "dwg") {
        type = "application/dwg";
      } else if (["png", "jpg", "jpeg", "webp"].includes(extension || "")) {
        type = `image/${extension === "jpg" ? "jpeg" : extension}`;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            url: reader.result as string,
            type: type,
          },
        ]);
        
        // Populate first file for fallback backwards compatibility with single fields
        if (uploadedFiles.length === 0) {
          setFileName(file.name);
          setFileType(type);
          setFileUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    // Fallbacks for thumbnail and doc links
    const finalThumbnail = thumbnail || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80";
    
    // Backwards-compatible fallback values for single-file schemas
    const firstFile = uploadedFiles[0];
    const finalFileName = firstFile?.name || fileName || `${title.replace(/\s+/g, "_").toLowerCase()}-spec.pdf`;
    const finalFileUrl = firstFile?.url || fileUrl || "#";
    const finalFileType = firstFile?.type || fileType;

    onAddPortfolioItem({
      title,
      description,
      thumbnail: finalThumbnail,
      fileUrl: finalFileUrl,
      fileType: finalFileType,
      fileName: finalFileName,
      files: uploadedFiles,
      date
    });
    resetForm();
    setShowAddModal(false);
  };

  const triggerDownload = (item: PortfolioItem) => {
    if (item.fileUrl && item.fileUrl !== "#" && item.fileUrl.startsWith("data:")) {
      // Real native browser trigger download for the uploaded base64 data URL
      const link = document.createElement("a");
      link.href = item.fileUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // In-development simulation or relative asset path alert
      alert(`Unduh file Portofolio: "${item.fileName}"\n(Simpan lembar kerja berhasil disimulasikan)`);
    }
  };

  const triggerSingleFileDownload = (file: { name: string; url: string; type: string }) => {
    if (file.url && file.url !== "#" && file.url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Unduh file Portofolio: "${file.name}"\n(Simpan lembar kerja berhasil disimulasikan)`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs" id="portfolio-view-root">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-sans font-semibold tracking-tight text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-indigo-400" /> Portfolio Showcase
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Simpan hasil karya terbaik, file dokumen (Word/Excel/PDF), cuplikan gambar desain, serta rekam jejak portofolio profesional Anda.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-950/20 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Item Portofolio Baru
        </button>
      </div>

      {/* Grid of portfolio showcase items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <div 
            key={item.id}
            className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Display Container */}
              <div className="relative h-44 w-full overflow-hidden bg-zinc-900 border-b border-zinc-900">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stock illustration image if failed
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <span className="absolute top-3 left-3 bg-zinc-950/90 text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded border border-zinc-900">
                  📅 {item.date}
                </span>
                {item.fileType && (
                  <span className="absolute top-3 right-3 bg-indigo-900/90 border border-indigo-500/30 text-indigo-200 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                    {item.fileName.split(".").pop() || "FILE"}
                  </span>
                )}
              </div>

              {/* Text detail metadata section */}
              <div className="p-4 space-y-2">
                <h3 className="text-base font-medium text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Document link / attachments card drawer */}
            <div className="p-4 pt-0 space-y-2">
              {item.files && item.files.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">File Lampiran ({item.files.length}):</p>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5">
                    {item.files.map((file, fIdx) => (
                      <div key={fIdx} className="bg-zinc-900/60 border border-zinc-900 p-2 rounded-lg flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-zinc-300 truncate min-w-0">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[120px] font-mono" title={file.name}>{file.name}</span>
                        </div>
                        <button 
                          onClick={() => triggerSingleFileDownload(file)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold hover:underline shrink-0 ml-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/60 border border-zinc-900 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-zinc-400 truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[130px] font-mono">{item.fileName}</span>
                  </div>
                  <button 
                    onClick={() => triggerDownload(item)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold hover:underline shrink-0 ml-2"
                  >
                    <Download className="w-3 h-3" /> Unduh
                  </button>
                </div>
              )}

              {onDeletePortfolioItem && (
                confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1.5 w-full mt-1 animate-fade-in">
                    <button 
                      onClick={() => {
                        onDeletePortfolioItem(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-semibold transition text-center"
                    >
                      Ya, Hapus
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-semibold transition text-center"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 hover:text-red-350 rounded-lg text-[10px] font-medium transition"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus Portofolio
                  </button>
                )
              )}
            </div>
          </div>
        ))}

        {portfolioItems.length === 0 && (
          <div className="col-span-3 text-center py-16 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2">
            <Award className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-500 text-sm">Portofolio Kerja Kosong.</p>
            <p className="text-zinc-600">Tekan &quot;Item Portofolio Baru&quot; di atas untuk mengisi katalog lembar kerja yang divalidasi client.</p>
          </div>
        )}
      </div>

      {/* Add Portfolio Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl my-8 relative max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Item Portofolio Kerja Baru</h3>
              <button 
                onClick={() => { setShowAddModal(false); }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Judul Portofolio*</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Konstruksi Atap Truss 12 Meter SUS304"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Deskripsi Detail Pekerjaan*</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Deskripsikan proses pengerjaan, alat yang digunakan (Figma/Adobe/Office/Visual Studio/dll), atau rincian spesifikasi pekerjaan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Banner Image Drag / Drop Upload */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">Foto Banner / Cover Portofolio*</label>
                
                <div 
                  onClick={() => bannerInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingBanner(true); }}
                  onDragLeave={() => setIsDraggingBanner(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingBanner(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleBannerUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed ${
                    isDraggingBanner ? "border-indigo-500 bg-indigo-950/20" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  } rounded-xl p-4 text-center cursor-pointer transition relative overflow-hidden flex flex-col items-center justify-center min-h-[100px]`}
                >
                  <input 
                    type="file"
                    ref={bannerInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleBannerUpload(e.target.files[0]);
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  {thumbnail ? (
                    <div className="w-full h-24 relative rounded overflow-hidden">
                      <img 
                        src={thumbnail} 
                        alt="Banner Preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-200">
                        <p className="text-white text-[10px] font-semibold">Ganti Gambar Banner</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Image className="w-6 h-6 text-zinc-500 mx-auto" />
                      <p className="text-[11px] text-zinc-300">
                        Drop / <span className="text-indigo-400 font-semibold">Klik untuk Upload Banner Cover</span>
                      </p>
                      <p className="text-[9px] text-zinc-500">Mendukung format gambar PNG, JPG, JPEG, WebP</p>
                    </div>
                  )}
                </div>

                {/* Optional manual Link */}
                <div className="pt-1.5">
                  <input 
                    type="text"
                    placeholder="Atau masukkan URL gambar langsung (opsional)"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono text-[10px]"
                  />
                </div>
              </div>

              {/* Attachment Document Upload Area - Multi-upload */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold block">File Desain, Dokumen & Lampiran Kerja*</label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    if (e.dataTransfer.files) {
                      handleMultipleAttachmentsUpload(e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed ${
                    isDraggingFile ? "border-indigo-500 bg-indigo-950/20" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  } rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[90px]`}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) handleMultipleAttachmentsUpload(e.target.files);
                    }}
                    accept="*"
                    multiple
                    className="hidden"
                  />
                  
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-indigo-400 mx-auto" />
                    <p className="text-[11px] text-zinc-300">
                      Drop / <span className="text-indigo-400 font-semibold">Klik untuk lampirkan file (Bisa pilih beberapa sekaligus)</span>
                    </p>
                    <p className="text-[9px] text-zinc-500">Mendukung format file PDF, Word, Excel, ZIP, Gambar PNG/JPG, dll.</p>
                  </div>
                </div>

                {/* List of uploaded files under the drag-drop zone */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5 mt-2 max-h-[160px] overflow-y-auto pr-1">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">File Terpilih ({uploadedFiles.length}):</p>
                    {uploadedFiles.map((f, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-left">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <FileUp className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <p className="text-white text-[11px] font-semibold truncate font-mono">{f.name}</p>
                            <p className="text-zinc-500 text-[9px] uppercase font-mono">{f.type.split("/").pop() || "Document"}</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedFile(index);
                          }}
                          className="bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-red-400 p-1 rounded transition shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-zinc-400 font-semibold block">Tanggal Penyelesaian</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); }}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-semibold px-4 py-2 rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={!title || !description || (uploadedFiles.length === 0)}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded transition shadow-lg shadow-indigo-950/25"
                >
                  Tambahkan ke Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
