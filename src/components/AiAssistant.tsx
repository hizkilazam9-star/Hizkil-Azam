import React, { useState, useRef, useEffect } from "react";
import { Sparkles, MessageSquare, Send, X, Loader2, Minimize2, Paperclip, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  createdAt: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "wel-1",
      role: "model",
      text: "Halo! Saya adalah **RE-FLOW AI Assistant**. Saya dapat membaca detail seluruh proyek, tugas, agenda tenggat waktu, dan draf kerja harian Anda saat ini.\n\nCoba pilih menu saran di bawah ini atau ketik pertanyaan langsung untuk analisis teknis Anda!",
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggestion parameters (Fitur 5)
  const suggestions = [
    "Apa pekerjaan yang harus saya prioritaskan hari ini?",
    "Buat laporan kerja hari ini",
    "Project mana yang paling terlambat?",
  ];

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;
    
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: promptText,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Send message payload containing history and current prompt elements
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, text: m.text })),
          userPrompt: promptText
        })
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan server API.");
      }

      const data = await response.json();
      
      const aiReply: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "model",
        text: data.text || "Tidak ada respon dihasilkan dari AI.",
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now() + 2}`,
        role: "model",
        text: `⚠️ **Gagal memproses respon:** ${err.message || "Pastikan server backend dalam status aktif terhubung."}\n\n*Silakan cek koneksi internet atau coba beberapa saat lagi.*`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Very simple Markdown formatter helper to render bold strings, list markers and line breaks beautifully without relying on bulky markup libraries
  const renderFormattedText = (txt: string) => {
    return txt.split("\n").map((line, idx) => {
      let content = line;
      
      // Bold rendering
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;
      
      // Basic formatting conversions
      let parts: React.ReactNode[] = [content];
      
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-sm font-semibold text-white pt-2 pb-1">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-base font-semibold text-white pt-3 pb-1 border-b border-zinc-900 mb-2">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- [x] ")) {
        return (
          <div key={idx} className="flex items-center gap-1.5 text-zinc-500 line-through text-[11px] py-0.5 pl-2 font-sans font-medium">
            <span className="text-green-500 font-bold">✓</span> {line.replace("- [x] ", "")}
          </div>
        );
      }
      if (line.startsWith("- [ ] ")) {
        return (
          <div key={idx} className="flex items-center gap-1.5 text-zinc-350 text-[11px] py-0.5 pl-2 font-sans">
            <span className="text-zinc-600">•</span> {line.replace("- [ ] ", "")}
          </div>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={idx} className="list-disc pl-4 text-zinc-300 py-0.5 font-sans leading-relaxed">{line.substring(2)}</li>;
      }

      // Format inline bold strings
      if (content.match(boldRegex)) {
        const matches = [...content.matchAll(boldRegex)];
        let formattedElements: React.ReactNode[] = [];
        let cursor = 0;
        
        matches.forEach((m, matchIdx) => {
          const index = m.index || 0;
          if (index > cursor) {
            formattedElements.push(content.substring(cursor, index));
          }
          formattedElements.push(<strong key={matchIdx} className="text-white font-semibold">{m[1]}</strong>);
          cursor = index + m[0].length;
        });
        
        if (cursor < content.length) {
          formattedElements.push(content.substring(cursor));
        }
        parts = formattedElements;
      }

      return <p key={idx} className="leading-relaxed font-sans text-xs text-zinc-355 py-0.5">{parts}</p>;
    });
  };

  return (
    <div id="ai-assistant-root">
      {/* Floating Action Button bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105"
        >
          <Sparkles className="w-5 h-5 duration-1000 animate-pulse text-yellow-300" />
        </button>
      )}

      {/* Floating Chat Container Box */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[90vw] h-[520px] bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden text-xs">
          
          {/* Header section */}
          <div className="bg-zinc-900 p-3.5 border-b border-zinc-900 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-blue-600 text-white">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <span className="text-white font-sans font-semibold text-xs block">RE-FLOW AI Assistant</span>
                <span className="text-[9px] text-zinc-500 font-mono">Gemini-3.5-Flash Active</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages chat stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Visual Avatar */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                  m.role === "user" 
                    ? "bg-zinc-800 text-zinc-350" 
                    : "bg-blue-600/10 text-blue-500 border border-blue-500/25"
                }`}>
                  {m.role === "user" ? "ME" : "AI"}
                </div>

                <div className={`p-3 rounded-lg ${
                  m.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-zinc-900/60 border border-zinc-900 text-zinc-300"
                }`}>
                  <div className="space-y-1">
                    {renderFormattedText(m.text)}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 pl-4 py-1">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-[10px] font-mono">Menganalisis lembar kerja...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Drawer list */}
          <div className="px-3.5 py-2.5 bg-zinc-950 border-t border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {suggestions.map((s, idx) => (
              <button 
                key={idx}
                disabled={loading}
                onClick={() => handleSendPrompt(s)}
                className="inline-block bg-zinc-900 hover:bg-zinc-850 text-[10px] text-zinc-400 border border-zinc-800 px-3 py-1.5 rounded-full transition shrink-0 max-w-[280px] truncate"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Form chat input submission */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }} 
            className="p-3 bg-zinc-900 border-t border-zinc-900 flex gap-2 shrink-0 items-center justify-between"
          >
            <input 
              type="text"
              required
              placeholder="Tanyakan prioritasi, rangkuman aktivitas, tenggat waktu..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              className="flex-1 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition disabled:bg-zinc-800 disabled:text-zinc-600 shrink-0 flex items-center justify-center font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
