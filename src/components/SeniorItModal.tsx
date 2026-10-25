import { useState } from 'react';
import { Bot, X, Copy, Check, BookmarkPlus, Sparkles, AlertCircle } from 'lucide-react';

interface SeniorItModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  isLoading: boolean;
  source?: string;
  onSaveToNotes: (title: string, solution: string) => void;
}

export default function SeniorItModal({
  isOpen,
  onClose,
  question,
  answer,
  isLoading,
  source,
  onSaveToNotes,
}: SeniorItModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [savedToNotes, setSavedToNotes] = useState(false);

  if (!isOpen) return null;

  const handleCopyFull = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    onSaveToNotes(`Senior IT: ${question.slice(0, 50)}${question.length > 50 ? '...' : ''}`, answer);
    setSavedToNotes(true);
    setTimeout(() => setSavedToNotes(false), 2000);
  };

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 1800);
  };

  const renderFormattedAnswer = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeIdx = 0;

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const currentCode = codeBuffer.join('\n');
          const thisIdx = codeIdx++;
          elements.push(
            <div key={`code-${index}`} className="my-2.5 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between px-3 py-1 bg-slate-950 border-b border-slate-800 text-[11px] text-gray-400">
                <span className="font-mono text-cyan-400">Comando / Script</span>
                <button
                  onClick={() => copyCode(currentCode, thisIdx)}
                  className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white transition-colors"
                >
                  {copiedCodeIdx === thisIdx ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCodeIdx === thisIdx ? 'Copiato!' : 'Copia'}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-teal-300 overflow-x-auto whitespace-pre">{currentCode}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={index} className="text-sm font-bold mt-3 mb-1.5 flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            {line.replace('### ', '')}
          </h4>
        );
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={index} className="text-base font-bold mt-3.5 mb-1.5 text-slate-900 dark:text-white">
            {line.replace('## ', '')}
          </h3>
        );
        return;
      }

      const formatInline = (str: string) => {
        const codeParts = str.split(/`([^`]+)`/g);
        return codeParts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded text-xs font-mono border
                bg-slate-100 text-teal-800 border-teal-200
                dark:bg-[#070b19] dark:text-teal-300 dark:border-teal-500/20">
                {part}
              </code>
            );
          }
          const boldParts = part.split(/\*\*([^*]+)\*\*/g);
          return boldParts.map((bPart, bIdx) => {
            if (bIdx % 2 === 1) {
              return <strong key={bIdx} className="font-semibold text-slate-900 dark:text-white">{bPart}</strong>;
            }
            return bPart;
          });
        });
      };

      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.trim().substring(2);
        elements.push(
          <div key={index} className="flex items-start gap-2 text-xs ml-2 my-1 text-slate-700 dark:text-gray-300">
            <span className="mt-1 font-bold text-cyan-600 dark:text-cyan-400">•</span>
            <div className="flex-1 leading-relaxed">{formatInline(content)}</div>
          </div>
        );
        return;
      }

      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2 text-xs ml-1 my-1.5 text-slate-700 dark:text-gray-300">
            <span className="font-mono font-bold rounded px-1.5 py-0.2 text-[10px] mt-0.5
              bg-cyan-100 border border-cyan-200 text-cyan-800
              dark:bg-cyan-950/60 dark:border-cyan-800/80 dark:text-cyan-400">
              {numMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed">{formatInline(numMatch[2])}</div>
          </div>
        );
        return;
      }

      if (line.includes('ATTENZIONE') || line.includes('Attenzione')) {
        elements.push(
          <div key={index} className="p-2.5 my-2 rounded-lg text-xs flex items-start gap-2
            bg-rose-50 border border-rose-200 text-rose-900
            dark:bg-rose-950/30 dark:border-rose-500/40 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="leading-relaxed">{formatInline(line)}</div>
          </div>
        );
        return;
      }

      if (line.trim().length > 0) {
        elements.push(
          <p key={index} className="text-xs my-1 leading-relaxed text-slate-700 dark:text-gray-300">
            {formatInline(line)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-1.5" />);
      }
    });

    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors border
        bg-white border-slate-200 shadow-slate-900/20
        dark:bg-[#1c2541] dark:border-cyan-500/50 dark:shadow-cyan-950/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b transition-colors
          bg-slate-50 border-slate-200
          dark:bg-[#141b30] dark:border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center
              bg-cyan-100 border border-cyan-200 text-cyan-800
              dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <span>Senior IT — Diagnosi & Soluzione</span>
                {source === 'gemini-3.8-flash' ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono
                    bg-emerald-100 border border-emerald-200 text-emerald-800
                    dark:bg-emerald-950 dark:border-emerald-500/40 dark:text-emerald-300">
                    Gemini 3.8 Flash
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono
                    bg-cyan-100 border border-cyan-200 text-cyan-800
                    dark:bg-cyan-950 dark:border-cyan-500/40 dark:text-cyan-300">
                    Knowledge Engine
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Prontuario tecnico per sistemisti e tecnici sul campo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Question */}
        <div className="px-4 py-2.5 border-b text-xs flex items-center gap-2
          bg-slate-100 border-slate-200 text-slate-700
          dark:bg-[#0b132b]/80 dark:border-gray-800 dark:text-gray-300">
          <span className="font-bold shrink-0 text-cyan-700 dark:text-cyan-400">Domanda:</span>
          <span className="italic truncate font-medium text-slate-900 dark:text-white">"{question}"</span>
        </div>

        {/* Answer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono animate-pulse text-cyan-700 dark:text-cyan-300">Analisi guasto con Senior IT in corso...</p>
            </div>
          ) : (
            <div className="space-y-1">{renderFormattedAnswer(answer)}</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t flex flex-wrap items-center justify-between gap-2
          bg-slate-50 border-slate-200
          dark:bg-[#141b30] dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFull}
              disabled={isLoading || !answer}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50
                bg-white hover:bg-slate-100 text-slate-700 border border-slate-300
                dark:bg-[#0b132b] dark:hover:bg-cyan-500/20 dark:text-gray-200 dark:hover:text-cyan-300 dark:border-cyan-500/40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Risposta Copiata!' : 'Copia Risposta'}
            </button>

            <button
              onClick={handleSaveNotes}
              disabled={isLoading || !answer}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50
                bg-white hover:bg-teal-50 text-teal-800 border border-teal-200
                dark:bg-[#0b132b] dark:hover:bg-teal-500/20 dark:text-gray-200 dark:hover:text-teal-300 dark:border-teal-500/40"
            >
              {savedToNotes ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
              {savedToNotes ? 'Salvato negli Appunti!' : 'Salva in Blocco Note'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs px-4 py-1.5 font-bold rounded-lg transition-colors
              bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm
              dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b]"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
