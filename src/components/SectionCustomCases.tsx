import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Trash2, Copy, Check, Clock, Bot } from 'lucide-react';

export interface CustomCase {
  id: string;
  category: 'voip' | 'zucchetti' | 'windows' | 'hardware' | 'network' | 'altro';
  question: string;
  answer: string;
  timestamp: string;
  source?: string;
}

interface SectionCustomCasesProps {
  category: 'voip' | 'zucchetti' | 'windows' | 'hardware' | 'network';
  cases: CustomCase[];
  onDeleteCase: (id: string) => void;
}

export default function SectionCustomCases({
  category,
  cases,
  onDeleteCase,
}: SectionCustomCasesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => c.category === category);

  if (filteredCases.length === 0) {
    return null;
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCase(id);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="p-3.5 rounded-xl border space-y-2.5 transition-colors
      bg-[#f0f7ff] border-[#c2e0ff]
      dark:bg-[#06140b] dark:border-[#00ff66]/30">
      <div className="flex items-center justify-between border-b pb-2
        border-[#d0e5ff] dark:border-[#00ff66]/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Casistiche Archiviate da IO-IT</span>
            <span className="text-[11px] font-mono px-2 py-0.2 rounded-full font-bold
              bg-[#1a73e8] text-white
              dark:bg-[#00ff66] dark:text-[#050b07]">
              {filteredCases.length}
            </span>
          </h4>
        </div>
        <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-gray-400">
          Aggiornamento automatico
        </span>
      </div>

      <div className="space-y-2">
        {filteredCases.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-lg border transition-all overflow-hidden text-xs
                bg-white border-[#dadce0] hover:border-[#1a73e8] shadow-xs
                dark:bg-[#08120c] dark:border-[#00ff66]/20 dark:hover:border-[#00ff66]/40"
            >
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-2.5 flex items-start justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#00220a]/30 transition-colors"
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Bot className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-gray-100 line-clamp-2 leading-snug">
                      {item.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span>•</span>
                      <span className="text-[#1a73e8] dark:text-[#00ff66]">
                        {item.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Knowledge Engine'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.id, item.answer, e)}
                    title="Copia diagnosi"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-[#00ff66] dark:hover:bg-[#00220a] transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-[#34a853] dark:text-[#00ff66]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Rimuovi casistica"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    className="p-1 text-slate-400 dark:text-gray-400"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 border-t bg-slate-50/70 border-[#dadce0] dark:bg-[#050b07] dark:border-[#00ff66]/20 space-y-2">
                  <div className="text-[11px] font-mono text-slate-500 dark:text-gray-400 pb-1 border-b border-slate-200 dark:border-[#00ff66]/10">
                    Diagnosi Specialistica & Script Risolutivi:
                  </div>
                  <div
                    className="text-xs leading-relaxed whitespace-pre-line text-slate-800 dark:text-[#d4f8e0]"
                    dangerouslySetInnerHTML={{
                      __html: item.answer.replace(
                        /`([^`]+)`/g,
                        '<code class="px-1 py-0.5 rounded font-mono text-[11px] bg-slate-200 text-[#1a73e8] dark:text-[#00ff66] dark:bg-[#020503] dark:border dark:border-[#00ff66]/30">$1</code>'
                      ),
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
