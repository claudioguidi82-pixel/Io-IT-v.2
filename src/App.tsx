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
import MatrixRainBackground from './components/MatrixRainBackground';
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
} from 'lucide-react';

export default function App() {
  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hardware: true,
    voip: true,
    zucchetti: false,
    windows: false,
    dictionary: false,
    notes: false,
    networkHistory: false,
  });

  // State to pass subnet from history to calculator
  const [calcSubnet, setCalcSubnet] = useState<string | undefined>(undefined);

  // Global search query
  const [globalSearch, setGlobalSearch] = useState('');

  // AI Senior IT State
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
    });
  };

  const handleSelectSubnetForCalc = (sub: string) => {
    setCalcSubnet(sub);
    setOpenSections((prev) => ({ ...prev, hardware: true }));
  };

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Handler for Senior IT AI questions
  const handleAskSeniorIt = async (q: string) => {
    if (!q.trim()) return;

    setCurrentQuestion(q);
    setIsAiLoading(true);
    setModalOpen(true);

    try {
      const res = await fetch('/api/senior-it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentAnswer(data.answer);
        setAiSource(data.source || 'gemini-3.8-flash');
        setInlineAiBox({
          visible: true,
          question: q,
          answer: data.answer,
        });
      } else {
        throw new Error('Errore durante la risposta.');
      }
    } catch (err) {
      const fallback = `1. Verifica la connettività fisica dei cavi e il ping verso l'apparato.\n2. Controlla lo stato dei servizi in services.msc o in console 3CX/Zucchetti.\n3. Controlla se il problema riguarda una singola postazione o tutta l'infrastruttura.`;
      setCurrentAnswer(fallback);
      setAiSource('knowledge-engine');
      setInlineAiBox({
        visible: true,
        question: q,
        answer: fallback,
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
  };

  // Auto-expand sections if globalSearch matches keywords
  useEffect(() => {
    if (globalSearch.trim().length > 2) {
      const q = globalSearch.toLowerCase();
      setOpenSections({
        hardware: q.includes('cavo') || q.includes('rj45') || q.includes('stampant') || q.includes('subnet') || q.includes('rete') || q.includes('ip'),
        voip: q.includes('3cx') || q.includes('voip') || q.includes('telef') || q.includes('sbc') || q.includes('yealink'),
        zucchetti: q.includes('zucchetti') || q.includes('infinity') || q.includes('ad hoc') || q.includes('tomcat') || q.includes('hr'),
        windows: q.includes('windows') || q.includes('cmd') || q.includes('server') || q.includes('ad') || q.includes('gpo') || q.includes('spooler'),
        dictionary: q.includes('dizionario') || q.includes('poe') || q.includes('vlan') || q.includes('nat'),
        notes: q.includes('nota') || q.includes('appunt'),
        networkHistory: q.includes('storico') || q.includes('audit') || q.includes('analizz') || q.includes('vlan') || q.includes('isp') || q.includes('tim') || q.includes('fastweb') || q.includes('fortigate'),
      });
    }
  }, [globalSearch]);

  return (
    <div className="relative min-h-screen font-sans pb-36 transition-colors duration-200 overflow-x-hidden
      bg-slate-100 text-slate-800
      dark:bg-[#0b132b] dark:text-[#f8f9fa]">
      {/* Animated Matrix Digital Rain Canvas Background */}
      <MatrixRainBackground />

      {/* Top Main Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md transition-colors px-4 py-3 sm:px-6 border-b
        bg-white/95 border-slate-200 shadow-sm
        dark:bg-[#1c2541]/95 dark:border-cyan-500/60 dark:shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 group">
                <img
                  src="/assets/aistudio/1792888079906_d7414e2f.jpg"
                  alt="io IT Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-md border-2 border-cyan-500/60 dark:border-cyan-400/80 shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1c2541] animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight m-0 text-slate-900 dark:text-white">
                  <span className="text-[#e63946]">io</span> IT — Assistente Tecnico
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">Prontuario rapido per tecnici e sistemisti aziendali</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
              <div className="flex items-center gap-1 text-xs font-mono text-teal-600 dark:text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Pronto
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick search input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Filtro rapido (es. 3CX, Zucchetti, RJ45)..."
                className="w-full rounded-lg pl-8 pr-2.5 py-1.5 text-xs focus:outline-none transition-colors font-sans
                  bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                  dark:bg-[#0b132b] dark:border-cyan-500/40 dark:text-white dark:focus:border-cyan-400"
              />
            </div>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-2 py-1.5 rounded-md border
              bg-slate-50 border-slate-200 text-teal-700
              dark:bg-[#0b132b] dark:border-teal-500/30 dark:text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Senior IT Online
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-2.5 rounded-xl border transition-colors
          bg-white border-slate-200 text-slate-600 shadow-sm
          dark:bg-[#1c2541]/70 dark:border-gray-800 dark:text-gray-300">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold uppercase tracking-wider mr-1 text-slate-400 dark:text-gray-400">Sezioni:</span>
            <button
              onClick={() => toggleSection('hardware')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.hardware
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              🛠️ Reti & Cavo
            </button>
            <button
              onClick={() => toggleSection('voip')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.voip
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              📞 3CX & VoIP
            </button>
            <button
              onClick={() => toggleSection('zucchetti')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.zucchetti
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              🏢 Zucchetti
            </button>
            <button
              onClick={() => toggleSection('windows')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.windows
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              💻 Windows Server
            </button>
            <button
              onClick={() => toggleSection('notes')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.notes
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              📝 Appunti
            </button>
            <button
              onClick={() => toggleSection('networkHistory')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                openSections.networkHistory
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-[#0b132b] dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              📡 Storico Reti
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => expandAll(true)}
              className="text-[11px] font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              Espandi Tutto
            </button>
            <span className="text-slate-300 dark:text-gray-600">|</span>
            <button
              onClick={() => expandAll(false)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:underline dark:text-gray-400 dark:hover:text-white"
            >
              Riduci Tutto
            </button>
          </div>
        </div>

        {/* INLINE AI ANSWER BOX (matching user's #aiBox in their HTML) */}
        {inlineAiBox.visible && (
          <div className="p-4 rounded-xl border shadow-md space-y-2.5 transition-colors
            bg-white border-cyan-300 dark:bg-[#1c2541] dark:border-cyan-500">
            <div className="flex items-center justify-between border-b pb-2 border-cyan-100 dark:border-cyan-500/30">
              <strong className="text-sm flex items-center gap-1.5 font-bold text-cyan-800 dark:text-cyan-400">
                <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                🤖 Risposta Senior IT:
              </strong>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveToNotes(`Intervento: ${inlineAiBox.question}`, inlineAiBox.answer)}
                  className="text-xs px-2.5 py-1 rounded font-semibold transition-colors
                    bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100
                    dark:bg-teal-500/20 dark:hover:bg-teal-500/30 dark:text-teal-300 dark:border-teal-500/40"
                >
                  Salva in Note
                </button>
                <button
                  type="button"
                  onClick={() => setInlineAiBox((prev) => ({ ...prev, visible: false }))}
                  className="px-2.5 py-1 rounded text-xs font-bold transition-colors
                    bg-cyan-600 text-white hover:bg-cyan-700
                    dark:bg-cyan-500 dark:text-[#0b132b] dark:hover:bg-cyan-400"
                >
                  Chiudi
                </button>
              </div>
            </div>
            <div className="text-xs italic text-slate-500 dark:text-gray-400">Domanda: "{inlineAiBox.question}"</div>
            <div
              className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans text-slate-800 dark:text-[#dbe2ef]"
              dangerouslySetInnerHTML={{
                __html: inlineAiBox.answer.replace(
                  /`([^`]+)`/g,
                  '<code class="px-1 py-0.5 rounded font-mono text-xs bg-slate-100 text-teal-800 border border-teal-200 dark:text-teal-300 dark:bg-[#070b19] dark:border-teal-500/20">$1</code>'
                ),
              }}
            />
          </div>
        )}

        {/* SECTION 1: HARDWARE, IMPIANTI & RETI */}
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('hardware')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.hardware
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>🛠️ 1. Hardware, Impianti & Reti</span>
            </div>
            {openSections.hardware ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.hardware && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
              {/* Interactive RJ45 Pinout Visualizer */}
              <div className="p-3.5 rounded-xl border transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Sequenza Cavo RJ45 (Standard T568B & T568A)
                </h4>
                <Rj45Visualizer />
              </div>

              {/* PC non naviga in rete */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                    <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    PC non naviga in rete (Isolamento guasto)
                  </h4>
                  <button
                    onClick={() => handleCopySnippet('ipconfig /all\nping 8.8.8.8\nipconfig /flushdns', 'pc-net')}
                    className="text-[11px] font-medium flex items-center gap-1 text-cyan-700 hover:underline dark:text-cyan-400"
                  >
                    {copiedKey === 'pc-net' ? <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3 h-3" />}
                    Copia Comandi
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Verifica IP con DHCP:</strong> Apri CMD e digita <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">ipconfig</code>. Se visualizzi un indirizzo <strong className="text-amber-600 dark:text-amber-400">169.254.x.x</strong> (APIPA), la macchina non comunica con il server DHCP (cavo staccato, porta switch bloccata, VLAN errata o pool esaurito).
                  </p>
                  <p>
                    <strong>2. Verifica connettività Internet:</strong> Esegui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">ping 8.8.8.8</code>. Se risponde ma i siti non si aprono, è un <strong className="text-cyan-700 dark:text-cyan-300">problema di risoluzione DNS</strong>: imposta 1.1.1.1 o 8.8.8.8 nella scheda di rete ed esegui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">ipconfig /flushdns</code>.
                  </p>
                  <p>
                    <strong>3. Verifica Gateway:</strong> Se non risponde neanche l'IP del gateway locale, controlla che la scheda di rete non sia disabilitata o che non vi sia un conflitto di IP statico.
                  </p>
                </div>
              </div>

              {/* Stampante di rete bloccata */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                    <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Stampante di rete bloccata / Offline
                  </h4>
                  <button
                    onClick={() =>
                      handleCopySnippet(
                        'net stop spooler && del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*" && net start spooler',
                        'print-spool'
                      )
                    }
                    className="text-[11px] font-medium flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-400"
                  >
                    {copiedKey === 'print-spool' ? <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3 h-3" />}
                    Copia Reset Spooler
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Ping Hardware:</strong> Fai <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">ping &lt;IP_Stampante&gt;</code> per verificare che la stampante sia accesa e collegata alla rete.
                  </p>
                  <p>
                    <strong>2. Riavvio Spooler:</strong> Su <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">services.msc</code> riavvia il servizio <strong>Spooler di stampa</strong> oppure esegui lo script CMD per cancellare i documenti corrotti bloccati in coda.
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
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('voip')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.voip
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>📞 2. Spazio 3CX & Telefonia VoIP</span>
            </div>
            {openSections.voip ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.voip && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
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
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('zucchetti')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.zucchetti
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>🏢 3. Spazio Zucchetti (Infinity, Ad Hoc, HR, Paghe)</span>
            </div>
            {openSections.zucchetti ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.zucchetti && (
            <div className="p-4 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-[#dbe2ef]">
              {/* Utente Bloccato */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Utente Bloccato / Sessione Appesa / Documento in Uso</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    • <strong>Ambiente Web Infinity / Portale HR / Zucchetti Paghe:</strong> Accedi con account amministratore ➔ <em>Amministrazione del Sistema ➔ Controllo Sessioni / Utenti Connessi</em> ➔ Seleziona l'utente bloccato e clicca <strong>Disconnetti / Termina Sessione</strong>.
                  </p>
                  <p>
                    • <strong>Ad Hoc Revolution / Enterprise (Server RDS / Terminal Server):</strong> Apri <strong>Gestione Attività (Task Manager)</strong> sul server Terminal ➔ Vai alla scheda <em>Utenti</em> ➔ Individua l'utente (spesso in stato "Disconnesso") ➔ Espandi e fai clic destro su <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">adhoc.exe</code> ➔ <strong>Termina attività</strong>.
                  </p>
                  <p>
                    • <strong>Tabelle di blocco database:</strong> Se il record rimane bloccato (es. bolla o fattura in modifica), esegui l'utility di riallineamento indici e verifica archivi integrata in Ad Hoc.
                  </p>
                </div>
              </div>

              {/* Pagina bianca / Nessuno entra */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pagina bianca, errore HTTP 500 o nessuno riesce ad accedere</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    <strong>1. Cache e Pop-up del Browser:</strong> Su Chrome/Edge premi <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">CTRL + SHIFT + CANC</code>, svuota file temporanei e immagini memorizzate nella cache. Nelle impostazioni del browser verifica che i <strong>Pop-up</strong> e i reindirizzamenti siano impostati su <em>"Consenti sempre"</em> per l'URL del server Zucchetti.
                  </p>
                  <p>
                    <strong>2. Servizi su Server Zucchetti:</strong> Apri <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">services.msc</code> sul server applicativo e controlla lo stato dei seguenti servizi essenziali:
                  </p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5 text-slate-500 dark:text-gray-400">
                    <li><strong>Apache Tomcat (Zucchetti Web / Infinity):</strong> In esecuzione. Se la RAM è satura, riavvia il servizio.</li>
                    <li><strong>SQL Server / PostgreSQL / Pervasive:</strong> Verifica che il motore di database sia avviato e non sia in pausa.</li>
                  </ul>
                  <p>
                    <strong>3. Spazio su Disco Server:</strong> Controlla che il disco <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">C:\</code> del server Zucchetti non sia completamente pieno a causa dei file di log di Tomcat (<code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">catalina.out</code> o dump), condizione che blocca all'istante qualsiasi operazione di scrittura del database.
                  </p>
                </div>
              </div>

              {/* Stampe bloccate */}
              <div className="p-3.5 rounded-xl border space-y-2 transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-white/10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Stampe PDF Crystal Reports bloccate o lente</h4>
                <div className="space-y-1 text-xs text-slate-600 dark:text-gray-300">
                  <p>
                    Sui server RDS, le stampe Zucchetti si appoggiano alla cartella temporanea dell'utente. Se si bloccano, chiudi Ad Hoc, apri <em>Esegui</em> (<code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">Win + R</code>) ➔ digita <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">%temp%</code> e cancella i file residui <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-900 dark:text-teal-300 dark:bg-[#070b19]">~*.*</code> e i file PDF temporanei.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: SISTEMISTICA & SERVER */}
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('windows')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.windows
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>💻 4. Sistemistica & Server Windows</span>
            </div>
            {openSections.windows ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.windows && (
            <div className="p-4 space-y-6">
              {/* Real-time Simulated Server Load Monitor (recharts) */}
              <div>
                <ServerLoadMonitor />
              </div>

              {/* Commands Cheat Sheet */}
              <div className="pt-4 border-t border-slate-200 dark:border-gray-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Prontuario Comandi Salvavita CMD & PowerShell
                </h4>
                <CommandsCheatSheet />
              </div>
            </div>
          )}
        </section>

        {/* SECTION 5: DIZIONARIO IT ZERO DUBBI */}
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('dictionary')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.dictionary
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>📖 5. Dizionario IT "Zero Dubbi"</span>
            </div>
            {openSections.dictionary ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.dictionary && (
            <div className="p-4 space-y-4">
              <DictionarySection />
            </div>
          )}
        </section>

        {/* SECTION 6: BLOCCO NOTE "COME HO RISOLTO" */}
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('notes')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.notes
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>📝 6. Blocco Note "Come ho risolto" (Knowledge Base)</span>
            </div>
            {openSections.notes ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
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
        <section className="rounded-xl border overflow-hidden transition-all
          bg-white border-slate-200 shadow-sm
          dark:bg-[#1c2541] dark:border-white/15 dark:shadow-md">
          <button
            onClick={() => toggleSection('networkHistory')}
            className={`w-full p-3.5 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors ${
              openSections.networkHistory
                ? 'bg-cyan-50 text-cyan-900 border-b border-cyan-100 dark:bg-[#253256] dark:text-cyan-400 dark:border-white/10'
                : 'text-slate-800 hover:bg-slate-50 dark:text-white dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>📡 7. Storico Reti Analizzate & Audit Clienti</span>
            </div>
            {openSections.networkHistory ? <ChevronUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400" />}
          </button>

          {openSections.networkHistory && (
            <div className="p-4 space-y-4">
              <NetworkHistorySection onSelectSubnetForCalculator={handleSelectSubnetForCalc} />
            </div>
          )}
        </section>
      </main>

      {/* Senior IT Modal Dialog */}
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
