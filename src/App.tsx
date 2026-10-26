import { useState, useEffect } from 'react';
import Rj45Visualizer from './components/Rj45Visualizer';
import SubnetCalculator from './components/SubnetCalculator';
import CommandsCheatSheet from './components/CommandsCheatSheet';
import ServerLoadMonitor from './components/ServerLoadMonitor';
import DictionarySection from './components/DictionarySection';
import NotesSection from './components/NotesSection';
import NetworkHistorySection from './components/NetworkHistorySection';
import SeniorItModal from './components/SeniorItModal';
import VoiceInputBar from './components/VoiceInputBar';
import ThemeToggle from './components/ThemeToggle';
import MatrixToggle from './components/MatrixToggle';
import MatrixRainBackground from './components/MatrixRainBackground';
import OoklaSpeedtest from './components/OoklaSpeedtest';
import SystemLogSection from './components/SystemLogSection';
import LavoriSvoltiSection from './components/LavoriSvoltiSection';
import SplashScreen from './components/SplashScreen';
import SectionCustomCases, { CustomCase } from './components/SectionCustomCases';
import { useSystemLogs } from './context/LogContext';
import { CategoryType } from './types';
import {
  Wrench,
  Phone,
  Building,
  Server,
  BookOpen,
  NotebookPen,
  ChevronDown,
  ChevronUp,
  Cpu,
  Printer,
  Wifi,
  Copy,
  Check,
  Search,
  Bot,
  Network,
  Radio,
  Gauge,
  Zap,
  Briefcase,
  Terminal,
} from 'lucide-react';

export default function App() {
  // Accordion open/close state for all sections (previous vertical menu)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hardware: true,
    voip: false,
    zucchetti: false,
    windows: false,
    dictionary: false,
    notes: false,
    networkHistory: false,
    tools: false,
    lavori: false,
    systemLog: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = (open: boolean) => {
    setOpenSections({
      hardware: open,
      voip: open,
      zucchetti: open,
      windows: open,
      dictionary: open,
      notes: open,
      networkHistory: open,
      tools: open,
      lavori: open,
      systemLog: open,
    });
  };

  // State to pass subnet from history to calculator
  const [calcSubnet, setCalcSubnet] = useState<string | undefined>(undefined);

  // Global search query
  const [globalSearch, setGlobalSearch] = useState('');

  // Custom cases automatically saved per section
  const [customCases, setCustomCases] = useState<CustomCase[]>(() => {
    try {
      const saved = localStorage.getItem('io_it_custom_cases');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDeleteCustomCase = (id: string) => {
    setCustomCases((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('io_it_custom_cases', JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });
  };

  // AI IO-IT State
  const { addLog } = useSystemLogs();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [aiSource, setAiSource] = useState<string>('knowledge-engine');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // In-page quick AI preview box (matching user's #aiBox in their HTML)
  const [inlineAiBox, setInlineAiBox] = useState<{
    visible: boolean;
    question: string;
    answer: string;
  }>({
    visible: false,
    question: '',
    answer: '',
  });

  // External note to pass to NotesSection when user clicks "Salva nei miei Appunti"
  const [newNotePayload, setNewNotePayload] = useState<{
    title: string;
    solution: string;
    category?: CategoryType;
  } | null>(null);

  // Copy state for small snippets
  const [copiedKey, setCopiedKey] = useState<string | null>(null);



  const handleSelectSubnetForCalc = (sub: string) => {
    setCalcSubnet(sub);
    setOpenSections((prev) => ({ ...prev, hardware: true }));
  };

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSaveSpeedtestToHistory = (result: any, clientName: string) => {
    try {
      const STORAGE_KEY = 'io_it_network_history_v1';
      const saved = localStorage.getItem(STORAGE_KEY);
      const audits = saved ? JSON.parse(saved) : [];
      const newAudit = {
        id: 'audit-speedtest-' + Date.now(),
        clientName: clientName || 'Audit Speedtest Rete',
        location: 'Sede Locale / Gateway',
        networkType: 'Ufficio PMI',
        subnet: '192.168.1.0/24',
        gateway: '192.168.1.1',
        dnsPrimary: '1.1.1.1',
        dhcpRange: '.50 - .200',
        ispInfo: `Speedtest Ookla: ${result.downloadMbps} Mbps DL / ${result.uploadMbps} Mbps UL`,
        firewallRouter: 'Router / Firewall Gateway',
        switches: 'Switch LAN Gigabit',
        vlans: [],
        avgLatencyMs: result.pingMs,
        packetLossPercent: result.packetLossPercent || 0,
        status: result.downloadMbps >= 40 && result.pingMs <= 35 ? 'conforme' : 'warning',
        keyFindings: `Speedtest completato: Download ${result.downloadMbps} Mbps, Upload ${result.uploadMbps} Mbps, Ping ${result.pingMs} ms, Jitter ${result.jitterMs} ms.`,
        resolutionNotes: `Banda verificata: Idonea per centralino 3CX e Cloud Zucchetti Infinity (${result.downloadMbps >= 30 ? 'Prestazioni ottimali' : 'Attenzione a saturazione'}).`,
        analyzedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newAudit, ...audits]));

      addLog({
        category: 'SPEEDTEST',
        level: 'SUCCESS',
        title: `Speedtest Ookla: ${result.downloadMbps} Mbps DL / ${result.uploadMbps} Mbps UL`,
        details: `Ping: ${result.pingMs}ms | Jitter: ${result.jitterMs}ms | Server: ${result.server || 'Auto'} | Cliente: ${clientName || 'Audit Rete'}`,
        rawPayload: result,
      });
    } catch (e) {
      console.error('Error saving speedtest to network history:', e);
      addLog({
        category: 'SPEEDTEST',
        level: 'ERROR',
        title: 'Errore salvataggio speedtest in storico',
        details: String(e),
      });
    }
  };

  const classifyQueryCategory = (query: string): 'voip' | 'zucchetti' | 'windows' | 'hardware' | 'network' => {
    const low = query.toLowerCase();
    if (low.includes('3cx') || low.includes('telefono') || low.includes('voip') || low.includes('sbc') || low.includes('yealink') || low.includes('fanvil') || low.includes('snom')) {
      return 'voip';
    }
    if (low.includes('zucchetti') || low.includes('infinity') || low.includes('ad hoc') || low.includes('paghe') || low.includes('hr') || low.includes('tomcat') || low.includes('adhoc')) {
      return 'zucchetti';
    }
    if (low.includes('server') || low.includes('active directory') || low.includes('domain') || low.includes('gpo') || low.includes('utente') || low.includes('dc') || low.includes('powershell')) {
      return 'windows';
    }
    if (low.includes('169.254') || low.includes('dhcp') || low.includes('ip') || low.includes('dns') || low.includes('ping') || low.includes('gateway') || low.includes('vlan') || low.includes('wifi') || low.includes('rete') || low.includes('router') || low.includes('firewall')) {
      return 'network';
    }
    return 'hardware';
  };

  // Handler for IO-IT AI questions
  const handleAskSeniorIt = async (q: string) => {
    if (!q.trim()) return;

    const startTime = performance.now();
    addLog({
      category: 'QUERY',
      level: 'INFO',
      title: `Query IO-IT: "${q.length > 55 ? q.slice(0, 55) + '...' : q}"`,
      details: 'Interrogazione assistente tecnico avviata da prompt operatore.',
      rawPayload: { question: q, timestamp: new Date().toISOString() },
    });

    setCurrentQuestion(q);
    setIsAiLoading(true);
    setModalOpen(true);

    try {
      const res = await fetch('/api/senior-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, depth: 'expert' }),
      });

      if (res.ok) {
        const data = await res.json();
        const durationMs = Math.round(performance.now() - startTime);
        setCurrentAnswer(data.answer);
        setAiSource(data.source || 'gemini-3.8-flash');
        setInlineAiBox({
          visible: true,
          question: q,
          answer: data.answer,
        });

        // Automatically add case study to its reference section
        const cat = classifyQueryCategory(q);
        const newCase: CustomCase = {
          id: 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          category: cat,
          question: q,
          answer: data.answer,
          timestamp: new Date().toISOString(),
          source: data.source || 'gemini-3.8-flash',
        };
        setCustomCases((prev) => {
          const updated = [newCase, ...prev.filter((c) => c.question !== q)];
          try {
            localStorage.setItem('io_it_custom_cases', JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save custom case in storage:', e);
          }
          return updated;
        });

        // Automatically open the reference section so the technician sees it immediately
        const targetSection = cat === 'network' ? 'networkHistory' : cat;
        setOpenSections((prev) => ({ ...prev, [targetSection]: true }));

        addLog({
          category: 'DIAGNOSI',
          level: 'SUCCESS',
          title: `Risposta IO-IT archiviata in [${cat.toUpperCase()}] (${data.source || 'gemini-3.8-flash'})`,
          details: `Livello Approfondito Enterprise | Generata in ${durationMs}ms | Sezione [${targetSection}] espansa.`,
          durationMs,
          rawPayload: {
            source: data.source,
            category: cat,
            depth: data.depth || 'expert',
            answerPreview: data.answer?.slice(0, 300),
          },
        });
      } else {
        throw new Error(`Errore risposta API HTTP ${res.status}`);
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const fallback = `### 🔬 1. Architettura & Analisi Preliminare
Si è verificato un problema di comunicazione con il backend API (${err?.message || 'timeout di rete'}). 
Di seguito la procedura standard di triage sistemistico ad alta affidabilità per isolare l'incidente:

### 🔍 2. Diagnostica Strumentale Immediata (PowerShell)
\`\`\`powershell
# Verifica rapida connettività di base e risoluzione DNS
Test-Connection -ComputerName 8.8.8.8 -Count 2
Test-Connection -ComputerName 127.0.0.1 -Count 2
Get-Service -Name *3cx*, *tomcat*, *spooler*, *adhoc* -ErrorAction SilentlyContinue
\`\`\`

### ⚙️ 3. Procedura Operativa Consigliata
1. **Verifica Servizi Locali:** Apri \`services.msc\` o la console del PBX 3CX / Server Zucchetti e verifica che i daemons applicativi siano in stato "In esecuzione".
2. **Ispezione Event Viewer:** Esegui \`eventvwr.msc\` e controlla nel log *System* gli errori del Service Control Manager (Event ID 7031 / 7034).
3. **Ripristino Rete:** Se l'anomalia riguarda la connettività, esegui \`ipconfig /flushdns\` e \`ipconfig /renew\`.

### 💡 4. Verdetto & Consiglio IO-IT
Riprova l'interrogazione non appena la connessione al server locale o remoto è ristabilita.`;
      setCurrentAnswer(fallback);
      setAiSource('knowledge-engine');
      setInlineAiBox({
        visible: true,
        question: q,
        answer: fallback,
      });

      const cat = classifyQueryCategory(q);
      const newCase: CustomCase = {
        id: 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        category: cat,
        question: q,
        answer: fallback,
        timestamp: new Date().toISOString(),
        source: 'knowledge-engine',
      };
      setCustomCases((prev) => {
        const updated = [newCase, ...prev.filter((c) => c.question !== q)];
        try {
          localStorage.setItem('io_it_custom_cases', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      const targetSection = cat === 'network' ? 'networkHistory' : cat;
      setOpenSections((prev) => ({ ...prev, [targetSection]: true }));

      addLog({
        category: 'DIAGNOSI',
        level: 'WARN',
        title: 'Fallback Knowledge Engine attivato',
        details: `Causa: ${err?.message || 'Servizio offline'}. Procedura tecnica archiviata in sezione [${targetSection}].`,
        durationMs,
        rawPayload: { error: String(err), fallbackText: fallback },
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveToNotes = (title: string, solution: string) => {
    let cat: CategoryType = 'altro';
    const low = title.toLowerCase() + ' ' + solution.toLowerCase();
    if (low.includes('3cx') || low.includes('voip')) cat = '3cx';
    else if (low.includes('zucchetti') || low.includes('adhoc')) cat = 'zucchetti';
    else if (low.includes('windows') || low.includes('server') || low.includes('active directory')) cat = 'windows';
    else if (low.includes('rj45') || low.includes('cavo') || low.includes('stampante')) cat = 'hardware';
    else if (low.includes('ip') || low.includes('dns') || low.includes('dhcp') || low.includes('rete')) cat = 'network';

    setNewNotePayload({ title, solution, category: cat });
    setOpenSections((prev) => ({ ...prev, notes: true }));

    addLog({
      category: 'NOTE',
      level: 'SUCCESS',
      title: `Nota tecnica salvata da IO-IT`,
      details: `Titolo: "${title}" | Categoria assegnata: [${cat.toUpperCase()}]`,
      rawPayload: { title, solutionPreview: solution.slice(0, 160), category: cat },
    });
  };

  // Open corresponding section when globalSearch matches keywords
  useEffect(() => {
    if (globalSearch.trim().length > 2) {
      const q = globalSearch.toLowerCase();
      if (q.includes('speed') || q.includes('banda') || q.includes('ping') || q.includes('ookla') || q.includes('mbps')) {
        setOpenSections((prev) => ({ ...prev, tools: true }));
      } else if (q.includes('voip') || q.includes('3cx') || q.includes('telef') || q.includes('sbc') || q.includes('yealink') || q.includes('fanvil')) {
        setOpenSections((prev) => ({ ...prev, voip: true }));
      } else if (q.includes('zucchetti') || q.includes('infinity') || q.includes('ad hoc') || q.includes('tomcat') || q.includes('adhoc') || q.includes('paghe')) {
        setOpenSections((prev) => ({ ...prev, zucchetti: true }));
      } else if (q.includes('server') || q.includes('active directory') || q.includes('gpo') || q.includes('ad') || q.includes('spooler')) {
        setOpenSections((prev) => ({ ...prev, windows: true }));
      } else if (q.includes('cavo') || q.includes('rj45') || q.includes('poe') || q.includes('stampant') || q.includes('subnet') || q.includes('ip')) {
        setOpenSections((prev) => ({ ...prev, hardware: true }));
      } else if (q.includes('audit') || q.includes('storico') || q.includes('vlan') || q.includes('isp')) {
        setOpenSections((prev) => ({ ...prev, networkHistory: true }));
      } else if (q.includes('lavor') || q.includes('rapport') || q.includes('client') || q.includes('ore') || q.includes('commess')) {
        setOpenSections((prev) => ({ ...prev, lavori: true }));
      } else if (q.includes('nota') || q.includes('appunt')) {
        setOpenSections((prev) => ({ ...prev, notes: true }));
      } else if (q.includes('log') || q.includes('console') || q.includes('debug')) {
        setOpenSections((prev) => ({ ...prev, systemLog: true }));
      } else if (q.includes('dizionario')) {
        setOpenSections((prev) => ({ ...prev, dictionary: true }));
      }
    }
  }, [globalSearch]);

  const casesCountByCategory = customCases.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative min-h-screen font-sans pb-36 transition-colors duration-200 overflow-x-hidden
      bg-[#f8f9fa] text-slate-800
      dark:bg-[#050b07] dark:text-[#e5fbee]">
      {/* Full-screen Launch Splash Screen with Official App Icon */}
      <SplashScreen />

      {/* Animated Matrix Digital Rain Canvas Background */}
      <MatrixRainBackground />

      {/* Top Google-style colored bar in Light Mode / Clean dark accent line in Dark Mode */}
      <div className="h-1 w-full bg-gradient-to-r from-[#4285f4] via-[#ea4335] via-[#fbbc04] to-[#34a853] dark:from-[#00ff66]/15 dark:via-[#00ff66]/25 dark:to-[#00ff66]/15" />

      {/* Top Main Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md transition-colors px-4 py-2.5 sm:px-6 border-b
        bg-white/95 border-[#dadce0] shadow-[0_1px_3px_0_rgba(60,64,67,0.12)]
        dark:bg-[#08120c]/95 dark:border-[#00ff66]/20 dark:shadow-md dark:shadow-black/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0 group">
                <img
                  src="/assets/aistudio/1792888079906_d7414e2f.jpg"
                  alt="io IT Logo"
                  className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl object-cover shadow-md border-2 border-[#1a73e8]/30 dark:border-[#00ff66]/40 shadow-[#1a73e8]/10 group-hover:scale-105 transition-transform duration-200 shrink-0"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#34a853] dark:bg-[#00ff66] border-2 border-white dark:border-[#08120c]" />
              </div>
              <div className="flex flex-col justify-between h-16 sm:h-[72px] py-0.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight m-0 text-slate-900 dark:text-white leading-none">
                  <span className="text-[#ea4335]">io</span>{' '}
                  <span className="text-[#1a73e8] dark:text-[#00ff66]">IT</span>
                </h1>
                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-gray-200 tracking-tight leading-none">
                  Guidi Claudio
                </span>
                <div className="flex items-center leading-none">
                  <img
                    src="/assets/aistudio/cropped-newlogo_dac22d97.png"
                    alt="System Byte"
                    className="h-4 sm:h-[18px] w-auto object-contain dark:bg-white/95 dark:px-1 dark:py-0.5 dark:rounded shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Mobile: MatrixToggle exactly under ThemeToggle */}
            <div className="flex flex-col items-end gap-1 sm:hidden min-w-[125px]">
              <ThemeToggle />
              <MatrixToggle />
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3">
            {/* Quick search input (Cerca) + IO-IT Online status placed underneath */}
            <div className="flex-1 sm:w-64 flex flex-col gap-1.5">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#00ff66]/70" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Cerca (es. 3CX, Zucchetti, RJ45)..."
                  title="Cerca"
                  aria-label="Cerca"
                  className="w-full rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none transition-all font-sans
                    bg-[#f1f3f4] border border-[#dadce0] text-slate-900 focus:bg-white focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20
                    dark:bg-[#0b140e] dark:border-[#00ff66]/30 dark:text-white dark:focus:border-[#00ff66] dark:focus:ring-2 dark:focus:ring-[#00ff66]/20"
                />
              </div>

              {/* IO-IT Online badge directly under Cerca */}
              <div className="flex items-center justify-between px-2.5 py-1 rounded-md border text-[11px] font-mono select-none
                bg-[#e6f4ea] border-[#ceead6] text-[#137333] shadow-xs
                dark:bg-[#00220a] dark:border-[#00ff66]/30 dark:text-[#00ff66]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
                  <span className="font-semibold tracking-wide">IO-IT Online</span>
                </div>
                <span className="text-[10px] font-sans font-medium text-slate-500 dark:text-[#00ff66]/70">Pronto</span>
              </div>
            </div>

            {/* Desktop: MatrixToggle exactly under ThemeToggle */}
            <div className="hidden sm:flex flex-col items-stretch gap-1 min-w-[130px] shrink-0">
              <ThemeToggle />
              <MatrixToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* INLINE AI ANSWER BOX */}
        {inlineAiBox.visible && (
          <div className="matrix-card-glow p-4 rounded-2xl border shadow-md space-y-2.5 transition-colors
            bg-white border-[#1a73e8]/40 shadow-[#1a73e8]/10
            dark:bg-[#09140c] dark:border-[#00ff66]/50 dark:shadow-[0_0_15px_rgba(0,255,102,0.12)]">
            <div className="flex items-center justify-between border-b pb-2 border-[#e8eaed] dark:border-[#00ff66]/30">
              <strong className="text-sm flex items-center gap-1.5 font-bold text-[#1a73e8] dark:text-[#00ff66]">
                <Bot className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                🤖 Risposta IO-IT:
              </strong>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToNotes(`Intervento: ${inlineAiBox.question}`, inlineAiBox.answer)}
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors border
                    bg-[#e6f4ea] text-[#137333] border-[#ceead6] hover:bg-[#ceead6]
                    dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/40 dark:hover:bg-[#003810]"
                >
                  Salva in Note
                </button>
                <button
                  type="button"
                  onClick={() => setInlineAiBox((prev) => ({ ...prev, visible: false }))}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors
                    bg-[#1a73e8] text-white hover:bg-[#1557b0]
                    dark:bg-[#00ff66] dark:text-[#050b07] dark:hover:bg-[#33ff85]"
                >
                  Chiudi
                </button>
              </div>
            </div>
            <div className="text-xs italic text-slate-500 dark:text-gray-400">Domanda: "{inlineAiBox.question}"</div>
            <div
              className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans text-slate-800 dark:text-[#d4f8e0]"
              dangerouslySetInnerHTML={{
                __html: inlineAiBox.answer.replace(
                  /`([^`]+)`/g,
                  '<code class="px-1 py-0.5 rounded font-mono text-xs bg-slate-100 text-[#1a73e8] border border-blue-200 dark:text-[#00ff66] dark:bg-[#020503] dark:border-[#00ff66]/30">$1</code>'
                ),
              }}
            />
          </div>
        )}

        {/* Quick Toolbar: Espandi tutte / Comprimi tutte */}
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-slate-500 dark:text-gray-400 font-medium">
            Sezioni Tecniche & Strumenti Operativi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => expandAll(true)}
              className="text-[11px] font-semibold text-[#1a73e8] dark:text-[#00ff66] hover:underline"
            >
              Espandi tutte
            </button>
            <span className="text-slate-300 dark:text-gray-600">•</span>
            <button
              onClick={() => expandAll(false)}
              className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 hover:underline"
            >
              Comprimi tutte
            </button>
          </div>
        </div>

        {/* SECTION 1: HARDWARE, IMPIANTI & RETI */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('hardware')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.hardware
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>🛠️ Hardware, Impianti & Reti</span>
            </div>
            {openSections.hardware ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.hardware && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
              {/* Dynamic Cases for Hardware & Reti */}
              <SectionCustomCases
                category="hardware"
                cases={customCases}
                onDeleteCase={handleDeleteCustomCase}
              />

              {/* Interactive RJ45 Pinout Visualizer */}
              <div className="p-3.5 rounded-xl border transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Cpu className="w-4 h-4 text-[#34a853] dark:text-[#00ff66]" />
                  Sequenza Cavo RJ45 (Standard T568B & T568A)
                </h4>
                <Rj45Visualizer />
              </div>

              {/* PC non naviga in rete */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                    <Wifi className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                    PC non naviga in rete (Isolamento guasto)
                  </h4>
                  <button
                    onClick={() => handleCopySnippet('ipconfig /all\nping 8.8.8.8\nipconfig /flushdns', 'pc-net')}
                    className="text-[11px] font-medium flex items-center gap-1 text-[#1a73e8] hover:underline dark:text-[#00ff66]"
                  >
                    {copiedKey === 'pc-net' ? <Check className="w-3 h-3 text-[#34a853] dark:text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
                    Copia Comandi
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Verifica IP con DHCP:</strong> Apri CMD e digita <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">ipconfig</code>. Se visualizzi un indirizzo <strong className="text-amber-600 dark:text-amber-400">169.254.x.x</strong> (APIPA), la macchina non comunica con il server DHCP (cavo staccato, porta switch bloccata, VLAN errata o pool esaurito).
                  </p>
                  <p>
                    <strong>2. Verifica connettività Internet:</strong> Esegui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">ping 8.8.8.8</code>. Se risponde ma i siti non si aprono, è un <strong className="text-[#1a73e8] dark:text-[#00ff66]">problema di risoluzione DNS</strong>: imposta 1.1.1.1 o 8.8.8.8 nella scheda di rete ed esegui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">ipconfig /flushdns</code>.
                  </p>
                  <p>
                    <strong>3. Verifica Gateway:</strong> Se non risponde neanche l'IP del gateway locale, controlla che la scheda di rete non sia disabilitata o che non vi sia un conflitto di IP statico.
                  </p>
                </div>
              </div>

              {/* Stampante di rete bloccata */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                    <Printer className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                    Stampante di rete bloccata / Offline
                  </h4>
                  <button
                    onClick={() =>
                      handleCopySnippet(
                        'net stop spooler && del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*" && net start spooler',
                        'print-spool'
                      )
                    }
                    className="text-[11px] font-medium flex items-center gap-1 text-[#34a853] hover:underline dark:text-[#00ff66]"
                  >
                    {copiedKey === 'print-spool' ? <Check className="w-3 h-3 text-[#34a853] dark:text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
                    Copia Reset Spooler
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Ping Hardware:</strong> Fai <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">ping &lt;IP_Stampante&gt;</code> per verificare che la stampante sia accesa e collegata alla rete.
                  </p>
                  <p>
                    <strong>2. Riavvio Spooler:</strong> Su <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">services.msc</code> riavvia il servizio <strong>Spooler di stampa</strong> oppure esegui lo script CMD per cancellare i documenti corrotti bloccati in coda.
                  </p>
                  <p>
                    <strong>3. Porta Standard TCP/IP:</strong> Non utilizzare MAI le porte generate automaticamente via <strong className="text-rose-600 dark:text-rose-400">WSD</strong> (Web Services for Devices) che si disconnettono frequentemente dopo lo standby. Configura sempre una porta <strong>Standard TCP/IP</strong> su indirizzo IP fisso riservato nel DHCP.
                  </p>
                </div>
              </div>

              {/* Subnet Calculator */}
              <SubnetCalculator externalSubnet={calcSubnet} />
            </div>
          )}
        </section>

        {/* SECTION 2: 3CX & TELEFONIA VOIP */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('voip')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.voip
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>📞 Spazio 3CX & Telefonia VoIP</span>
            </div>
            {openSections.voip ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.voip && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
              {/* Dynamic Cases for 3CX & VoIP */}
              <SectionCustomCases
                category="voip"
                cases={customCases}
                onDeleteCase={handleDeleteCustomCase}
              />

              {/* Telefono No Service */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Telefono Fisico Yealink / Fanvil / Snom con "No Service"
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Controllo Porta & Cavi:</strong> Verifica che il cavo proveniente dalla presa a muro entri tassativamente nella porta etichettata <strong>LAN / PoE</strong> (o Internet) e NON nella porta 'PC'.
                  </p>
                  <p>
                    <strong>2. Verifica 3CX SBC:</strong> Accedi alla console web del centralino 3CX, vai nella sezione <strong>SBC</strong> e verifica che l'istanza della sede cliente sia <strong className="text-teal-600 dark:text-teal-400">verde (Online)</strong>. Se è rossa, riavvia il servizio <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">3cxsbc</code> sulla macchina locale dell'ufficio.
                  </p>
                  <p>
                    <strong>3. Controllo IP Blacklist:</strong> In <em>Sicurezza → IP Blacklist</em> del 3CX verifica che l'indirizzo IP pubblico o locale della sede non sia stato bloccato per tentativi di autenticazione errati. Se presente, rimuovilo e aggiungilo alla Whitelist con tempo permanente.
                  </p>
                </div>
              </div>

              {/* Configurare App e Telefoni */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Configurare App 3CX e Telefoni IP Nuovi</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    • <strong>App Smartphone / PC:</strong> Console 3CX ➔ <em>Utenti</em> ➔ Seleziona l'interno ➔ Clicca <strong>Invia Email di Benvenuto</strong> ➔ Apri l'app 3CX e inquadra il <strong>QR Code</strong> allegato all'email.
                  </p>
                  <p>
                    • <strong>Telefono Fisico:</strong> Copia l'indirizzo <strong>MAC Address</strong> (12 caratteri alfanumerici) stampato sotto al telefono ➔ In console 3CX: <em>Utenti ➔ Provisioning Telefono ➔ Aggiungi</em> ➔ Seleziona modello Yealink/Fanvil ➔ Scegli connessione <strong>3CX SBC (remoto)</strong>.
                  </p>
                  <p>
                    • <strong>Hard Reset Yealink da tastiera:</strong> A telefono acceso e collegato, tieni premuto il tasto circolare <strong>OK</strong> per 10 secondi finché a display compare <em>"Reset to factory defaults?"</em> e premi OK.
                  </p>
                </div>
              </div>

              {/* Audio Monodirezionale / SIP ALG */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Chiamata muta o audio solo da un lato (One-Way Audio)
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    • <strong>Disabilita SIP ALG:</strong> Sul modem/router (FritzBox, Zyxel, DrayTek, Cisco) disattiva la funzione <em>SIP ALG</em>. Modifica i pacchetti voce corrompendo l'indirizzo IP di ritorno.
                  </p>
                  <p>
                    • <strong>Range Porte RTP UDP:</strong> Assicurati che il firewall non blocchi il traffico UDP in uscita sulle porte <strong className="text-cyan-700 dark:text-cyan-300">9000-10999 UDP</strong> (porte audio RTP standard del 3CX).
                  </p>
                  <p>
                    • <strong>Codec Audio:</strong> Nel Trunk SIP e negli interni, imposta come primo codec <strong>G.711 A-law (PCMA)</strong>, lo standard europeo per la massima compatibilità telecom.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: SPAZIO ZUCCHETTI */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('zucchetti')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.zucchetti
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>🏢 Spazio Zucchetti (Infinity, Ad Hoc, HR, Paghe)</span>
            </div>
            {openSections.zucchetti ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.zucchetti && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
              {/* Dynamic Cases for Zucchetti */}
              <SectionCustomCases
                category="zucchetti"
                cases={customCases}
                onDeleteCase={handleDeleteCustomCase}
              />

              {/* Utente Bloccato */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Utente Bloccato / Sessione Appesa / Documento in Uso</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    • <strong>Ambiente Web Infinity / Portale HR / Zucchetti Paghe:</strong> Accedi con account amministratore ➔ <em>Amministrazione del Sistema ➔ Controllo Sessioni / Utenti Connessi</em> ➔ Seleziona l'utente bloccato e clicca <strong>Disconnetti / Termina Sessione</strong>.
                  </p>
                  <p>
                    • <strong>Ad Hoc Revolution / Enterprise (Server RDS / Terminal Server):</strong> Apri <strong>Gestione Attività (Task Manager)</strong> sul server Terminal ➔ Vai alla scheda <em>Utenti</em> ➔ Individua l'utente (spesso in stato "Disconnesso") ➔ Espandi e fai clic destro su <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">adhoc.exe</code> ➔ <strong>Termina attività</strong>.
                  </p>
                  <p>
                    • <strong>Tabelle di blocco database:</strong> Se il record rimane bloccato (es. bolla o fattura in modifica), esegui l'utility di riallineamento indici e verifica archivi integrata in Ad Hoc.
                  </p>
                </div>
              </div>

              {/* Pagina bianca / Nessuno entra */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pagina bianca, errore HTTP 500 o nessuno riesce ad accedere</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Cache e Pop-up del Browser:</strong> Su Chrome/Edge premi <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">CTRL + SHIFT + CANC</code>, svuota file temporanei e immagini memorizzate nella cache. Nelle impostazioni del browser verifica che i <strong>Pop-up</strong> e i reindirizzamenti siano impostati su <em>"Consenti sempre"</em> per l'URL del server Zucchetti.
                  </p>
                  <p>
                    <strong>2. Servizi su Server Zucchetti:</strong> Apri <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">services.msc</code> sul server applicativo e controlla lo stato dei seguenti servizi essenziali:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5 text-slate-500 dark:text-gray-400">
                    <li><strong>Apache Tomcat (Zucchetti Web / Infinity):</strong> In esecuzione. Se la RAM è satura, riavvia il servizio.</li>
                    <li><strong>SQL Server / PostgreSQL / Pervasive:</strong> Verifica che il motore di database sia avviato e non sia in pausa.</li>
                  </ul>
                  <p>
                    <strong>3. Spazio su Disco Server:</strong> Controlla che il disco <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">C:\</code> del server Zucchetti non sia completamente pieno a causa dei file di log di Tomcat (<code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">catalina.out</code> o dump), condizione che blocca all'istante qualsiasi operazione di scrittura del database.
                  </p>
                </div>
              </div>

              {/* Stampe bloccate */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-[#f8f9fa] border-[#e8eaed] dark:bg-[#050c07] dark:border-[#00ff66]/20">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Stampe PDF Crystal Reports bloccate o lente</h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    Sui server RDS, le stampe Zucchetti si appoggiano alla cartella temporanea dell'utente. Se si bloccano, chiudi Ad Hoc, apri <em>Esegui</em> (<code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">Win + R</code>) ➔ digita <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">%temp%</code> e cancella i file residui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-[#00ff66] dark:bg-[#020503] font-mono">~*.*</code> e i file PDF temporanei.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: SISTEMISTICA & SERVER */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('windows')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.windows
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>💻 Sistemistica & Server Windows</span>
            </div>
            {openSections.windows ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.windows && (
            <div className="p-4 space-y-6">
              {/* Dynamic Cases for Windows & Server */}
              <SectionCustomCases
                category="windows"
                cases={customCases}
                onDeleteCase={handleDeleteCustomCase}
              />

              {/* Real-time Simulated Server Load Monitor (recharts) */}
              <div>
                <ServerLoadMonitor />
              </div>

              {/* Commands Cheat Sheet */}
              <div className="pt-4 border-t border-[#dadce0] dark:border-[#00ff66]/20">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
                  Prontuario Comandi Salvavita CMD & PowerShell
                </h4>
                <CommandsCheatSheet />
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: DIZIONARIO IT ZERO DUBBI */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('dictionary')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.dictionary
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>📖 Dizionario IT "Zero Dubbi"</span>
            </div>
            {openSections.dictionary ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.dictionary && (
            <div className="p-4 space-y-4">
              <DictionarySection />
            </div>
          )}
        </section>

        {/* SECTION 6: BLOCCO NOTE "COME HO RISOLTO" */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('notes')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.notes
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>📝 Blocco Note "Come ho risolto" (Knowledge Base)</span>
            </div>
            {openSections.notes ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.notes && (
            <div className="p-4 space-y-4">
              <NotesSection
                externalNewNote={newNotePayload}
                onClearExternalNote={() => setNewNotePayload(null)}
              />
            </div>
          )}
        </section>

        {/* SECTION 7: STORICO RETI ANALIZZATE & AUDIT */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('networkHistory')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.networkHistory
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>📡 Storico Reti Analizzate & Audit Clienti</span>
            </div>
            {openSections.networkHistory ? <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />}
          </button>

          {openSections.networkHistory && (
            <div className="p-4 space-y-4">
              {/* Dynamic Cases for Network & Connectivity */}
              <SectionCustomCases
                category="network"
                cases={customCases}
                onDeleteCase={handleDeleteCustomCase}
              />

              <NetworkHistorySection onSelectSubnetForCalculator={handleSelectSubnetForCalc} />
            </div>
          )}
        </section>

        {/* SECTION 8: TOOL & UTILITY IT */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('tools')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.tools
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>⚡ Tool & Strumenti IT (Speedtest Ookla & Utility)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1967d2] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#aecbfa] dark:border-[#00ff66]/40">
                Toolbox
              </span>
            </div>
            {openSections.tools ? (
              <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />
            )}
          </button>

          {openSections.tools && (
            <div className="p-4 space-y-6">
              {/* Speedtest Ookla with Security & Criticality Audit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-[#dadce0] dark:border-[#00ff66]/20">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#fbbc04]" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Speedtest Banda & Latenza (Motore Ookla-Style con Gauge & Audit Criticità)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#ceead6] dark:border-[#00ff66]/40">
                    Live Engine
                  </span>
                </div>
                <OoklaSpeedtest onSaveToHistory={handleSaveSpeedtestToHistory} />
              </div>

              {/* Hub Spazio per Futuri Tool */}
              <div className="pt-3 border-t border-[#dadce0] dark:border-[#00ff66]/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#00ff66]" />
                    Slot per Nuovi Tool in arrivo:
                  </h4>
                  <span className="text-[11px] font-mono text-[#1a73e8] dark:text-[#00ff66]">Architettura Modulare</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-dashed border-[#dadce0] dark:border-[#00ff66]/30 bg-[#f8f9fa] dark:bg-[#050c07] flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#00ff66]" />
                        Ping Continuo & Packet Loss Tester
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                        Monitoraggio continuo di jitter e stabilità linea su DNS Cloudflare / Google o gateway personalizzato.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-200 dark:bg-[#00220a] text-slate-700 dark:text-[#00ff66] border border-transparent dark:border-[#00ff66]/30 shrink-0">
                      In sviluppo
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-dashed border-[#dadce0] dark:border-[#00ff66]/30 bg-[#f8f9fa] dark:bg-[#050c07] flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-[#34a853] dark:text-[#00ff66]" />
                        Port Scanner & Verificatore Porte VoIP / Web
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
                        Test immediato porte critiche 3CX (5060 SIP, 5090 Tunnel, 9000-10999 RTP) e server Zucchetti.
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-200 dark:bg-[#00220a] text-slate-700 dark:text-[#00ff66] border border-transparent dark:border-[#00ff66]/30 shrink-0">
                      In sviluppo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 9: LAVORI SVOLTI & RAPPORTINI IT (ZUCCHETTI AD HOC) */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('lavori')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.lavori
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>💼 Lavori Svolti & Rapportini IT</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1967d2] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#aecbfa] dark:border-[#00ff66]/40">
                Zucchetti Ad Hoc
              </span>
            </div>
            {openSections.lavori ? (
              <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />
            )}
          </button>

          {openSections.lavori && (
            <div className="p-4 space-y-4">
              <LavoriSvoltiSection />
            </div>
          )}
        </section>

        {/* SECTION 10: CONSOLE LOG SISTEMA IO-IT (TAB A FINE PAGINA) */}
        <section className="matrix-card-glow rounded-2xl border overflow-hidden transition-all
          bg-white border-[#dadce0] shadow-[0_1px_2px_0_rgba(60,64,67,0.18)] hover:shadow-md hover:border-[#1a73e8]/40
          dark:bg-[#09140c] dark:border-[#00ff66]/25 dark:shadow-[0_0_12px_rgba(0,255,102,0.04)] dark:hover:border-[#00ff66]/50">
          <button
            onClick={() => toggleSection('systemLog')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.systemLog
                ? 'bg-[#e8f0fe] text-[#1a73e8] border-b border-[#dadce0] dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/30'
                : 'text-slate-800 hover:bg-[#f8f9fa] dark:text-gray-100 dark:hover:bg-[#00ff66]/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
              <span>💻 Console Log Sistema IO-IT</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#ceead6] dark:border-[#00ff66]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
                Live Debugger
              </span>
            </div>
            {openSections.systemLog ? (
              <ChevronUp className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-500" />
            )}
          </button>

          {openSections.systemLog && (
            <div className="p-4 space-y-4">
              <SystemLogSection />
            </div>
          )}
        </section>
      </main>

      {/* IO-IT Modal Dialog */}
      <SeniorItModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        question={currentQuestion}
        answer={currentAnswer}
        isLoading={isAiLoading}
        source={aiSource}
        onSaveToNotes={handleSaveToNotes}
      />

      {/* Fixed Bottom Voice & Text Assistant Bar */}
      <VoiceInputBar onAsk={handleAskSeniorIt} isLoading={isAiLoading} />
    </div>
  );
}
