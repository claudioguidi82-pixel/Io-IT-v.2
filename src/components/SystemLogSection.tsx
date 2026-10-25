import { useState, useMemo, useRef, useEffect } from 'react';
import { useSystemLogs } from '../context/LogContext';
import { LogCategory, LogLevel } from '../types';
import {
  Terminal,
  Trash2,
  Copy,
  Check,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Code2,
  Activity,
  Briefcase,
  Zap,
} from 'lucide-react';

export default function SystemLogSection() {
  const { logs, clearLogs } = useSystemLogs();

  const [activeTab, setActiveTab] = useState<'ALL' | LogCategory | 'ERRORS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new log arrives
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs.length]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Tab filter
      if (activeTab === 'ERRORS') {
        if (log.level !== 'ERROR' && log.level !== 'WARN') return false;
      } else if (activeTab !== 'ALL') {
        if (log.category !== activeTab) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = log.title.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q) ?? false;
        const matchesCat = log.category.toLowerCase().includes(q);
        const matchesLevel = log.level.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDetails && !matchesCat && !matchesLevel) return false;
      }

      return true;
    });
  }, [logs, activeTab, searchTerm]);

  const counts = useMemo(() => {
    let queries = 0;
    let diagnosi = 0;
    let note = 0;
    let speedtest = 0;
    let lavori = 0;
    let errors = 0;

    logs.forEach((l) => {
      if (l.category === 'QUERY') queries++;
      if (l.category === 'DIAGNOSI') diagnosi++;
      if (l.category === 'NOTE') note++;
      if (l.category === 'SPEEDTEST') speedtest++;
      if (l.category === 'LAVORI') lavori++;
      if (l.level === 'ERROR' || l.level === 'WARN') errors++;
    });

    return { all: logs.length, queries, diagnosi, note, speedtest, lavori, errors };
  }, [logs]);

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${l.dateStr} ${l.timestamp}] [${l.level}] [${l.category}] ${l.title}${
            l.durationMs ? ` (${l.durationMs}ms)` : ''
          }\n${l.details ? `  > ${l.details}\n` : ''}${
            l.rawPayload ? `  > PAYLOAD: ${JSON.stringify(l.rawPayload, null, 2)}\n` : ''
          }`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      assistant: 'IO-IT',
      totalLogs: logs.length,
      logs: logs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `io_it_system_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] dark:bg-[#002b0c] dark:text-[#00ff66] dark:border-[#00ff66]/40">
            <CheckCircle2 className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fef7e0] text-[#b06000] border border-[#feefc3] dark:bg-[#2b1f00] dark:text-[#ffbe3b] dark:border-[#ffbe3b]/40">
            <AlertTriangle className="w-3 h-3" /> WARN
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] dark:bg-[#330005] dark:text-[#ff4d6d] dark:border-[#ff4d6d]/40">
            <XCircle className="w-3 h-3" /> ERROR
          </span>
        );
      case 'DEBUG':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
            <Code2 className="w-3 h-3" /> DEBUG
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] dark:bg-[#001833] dark:text-[#42a5f5] dark:border-[#1e88e5]/40">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  const getCategoryColor = (category: LogCategory) => {
    switch (category) {
      case 'QUERY':
        return 'text-[#1a73e8] dark:text-[#64b5f6]';
      case 'DIAGNOSI':
        return 'text-[#34a853] dark:text-[#00ff66]';
      case 'NOTE':
        return 'text-[#f29900] dark:text-[#ffca28]';
      case 'SPEEDTEST':
        return 'text-[#9334e8] dark:text-[#b388ff]';
      case 'LAVORI':
        return 'text-[#00897b] dark:text-[#00e676]';
      case 'NETWORK':
        return 'text-[#129eaf] dark:text-[#4dd0e1]';
      case 'SYSTEM':
      default:
        return 'text-slate-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar inside section */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors
        bg-[#f8f9fa] border-[#dadce0]
        dark:bg-[#09150e] dark:border-[#00ff66]/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] dark:bg-[#00ff66]/15 dark:text-[#00ff66] border border-[#1a73e8]/20 dark:border-[#00ff66]/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-mono font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white">
                CONSOLE LOG SISTEMA & DEBUGGER INTERVENTI
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5 font-sans">
              Audit in tempo reale delle interrogazioni assistente IO-IT, diagnosi AI, note tecniche, speedtest e lavorazioni Zucchetti.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#00ff66]/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtra log..."
              className="w-32 sm:w-44 pl-7 pr-2 py-1 text-xs font-mono rounded-lg border focus:outline-none transition-all
                bg-white border-[#dadce0] text-slate-800 placeholder:text-slate-400 focus:border-[#1a73e8]
                dark:bg-[#0b160f] dark:border-[#00ff66]/40 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#00ff66]"
            />
          </div>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors
              bg-white hover:bg-[#f1f3f4] text-slate-700 border-[#dadce0]
              dark:bg-[#0a160f] dark:hover:bg-[#00260e] dark:text-[#00ff66] dark:border-[#00ff66]/40"
            title="Copia log filtrati"
          >
            {copied ? <Check className="w-3 h-3 text-[#34a853] dark:text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copiati' : 'Copia'}</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors
              bg-white hover:bg-[#f1f3f4] text-slate-700 border-[#dadce0]
              dark:bg-[#0a160f] dark:hover:bg-[#00260e] dark:text-[#00ff66] dark:border-[#00ff66]/40"
            title="Scarica log in formato JSON"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Esporta JSON</span>
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={clearLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors
              bg-white hover:bg-rose-50 text-rose-600 border-[#dadce0] hover:border-rose-300
              dark:bg-[#0a160f] dark:hover:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
            title="Svuota registro console"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Svuota</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border overflow-x-auto no-scrollbar text-xs font-mono transition-colors
        bg-[#f1f3f4]/80 border-[#dadce0]
        dark:bg-[#060e08] dark:border-[#00ff66]/20">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'ALL'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Tutti ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('QUERY')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'QUERY'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Query IO-IT ({counts.queries})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DIAGNOSI')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'DIAGNOSI'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Diagnosi ({counts.diagnosi})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LAVORI')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'LAVORI'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Lavori ({counts.lavori})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NOTE')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'NOTE'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Note KB ({counts.note})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SPEEDTEST')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'SPEEDTEST'
              ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07] font-bold shadow-sm'
              : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Speedtest ({counts.speedtest})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ERRORS')}
          className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
            activeTab === 'ERRORS'
              ? 'bg-rose-600 text-white dark:bg-[#ff4d6d] dark:text-white font-bold shadow-sm'
              : 'text-rose-600 dark:text-[#ff4d6d] hover:underline'
          }`}
        >
          Errori / Warn ({counts.errors})
        </button>
      </div>

      {/* Log Stream Box */}
      <div
        ref={logContainerRef}
        className="font-mono text-xs p-3 rounded-xl border space-y-2 overflow-y-auto transition-colors
          bg-white border-[#dadce0] text-slate-900
          dark:bg-[#040b06] dark:border-[#00ff66]/30 dark:text-gray-200"
        style={{ maxHeight: '360px', minHeight: '180px' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-gray-500 text-xs">
            Nessun log registrato in questa categoria o filtro.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border transition-all duration-150
                  bg-[#f8f9fa] border-slate-200 hover:border-slate-300
                  dark:bg-[#07150c] dark:border-[#00ff66]/20 dark:hover:border-[#00ff66]/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-400 dark:text-[#00ff66]/70 shrink-0 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </span>

                    {/* Level */}
                    <div className="shrink-0">{getLevelBadge(log.level)}</div>

                    {/* Category */}
                    <span className={`text-[10px] font-bold shrink-0 uppercase ${getCategoryColor(log.category)}`}>
                      [{log.category}]
                    </span>

                    {/* Action Title and Details */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white break-words">
                        {log.title}
                        {log.durationMs !== undefined && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-200 text-slate-700 dark:bg-[#00220a] dark:text-[#00ff66]">
                            {log.durationMs}ms
                          </span>
                        )}
                      </div>

                      {log.details && (
                        <div className="text-[11px] text-slate-600 dark:text-gray-300 mt-0.5 leading-relaxed font-sans">
                          {log.details}
                        </div>
                      )}

                      {/* Raw Payload toggle */}
                      {log.rawPayload && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-[10px] underline font-mono text-[#1a73e8] dark:text-[#00ff66] hover:opacity-80"
                          >
                            {isExpanded ? '▲ Nascondi dati payload' : '▼ Visualizza dati payload RAW'}
                          </button>
                          {isExpanded && (
                            <pre className="mt-1.5 p-2 rounded text-[10px] bg-slate-900 text-emerald-300 dark:bg-black dark:text-[#00ff66] border border-slate-700 dark:border-[#00ff66]/30 overflow-x-auto whitespace-pre max-h-48">
                              {JSON.stringify(log.rawPayload, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] opacity-40 font-mono shrink-0 select-none hidden md:inline">
                    #{log.id.slice(-5)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar */}
      <div className="p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between transition-colors
        bg-[#f8f9fa] border-[#dadce0] text-slate-500
        dark:bg-[#07120a] dark:border-[#00ff66]/20 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <span>Visualizzati: <strong>{filteredLogs.length}</strong> su <strong>{logs.length}</strong> eventi</span>
          <span className="hidden sm:inline">• Buffer locale attivo</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#34a853] dark:text-[#00ff66]">
          <span className="w-2 h-2 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
          <span className="font-semibold">IO-IT Logger Pronto</span>
        </div>
      </div>
    </div>
  );
}
