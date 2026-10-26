import { ModuleId } from '../types';
import { CustomCase } from './SectionCustomCases';
import {
  Wrench,
  Phone,
  Building,
  Server,
  Zap,
  Network,
  Terminal,
  Briefcase,
  NotebookPen,
  BookOpen,
  ArrowRight,
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (id: ModuleId) => void;
  customCases: CustomCase[];
}

export default function DashboardOverview({
  onSelectModule,
  customCases,
}: DashboardOverviewProps) {
  const cards = [
    {
      id: 'hardware' as ModuleId,
      title: 'Hardware, Cavi & Reti',
      desc: 'Pinout RJ45 T568B/A, PoE 802.3af/at, Subnetting CIDR e isolamento guasti.',
      icon: Wrench,
      color: 'text-[#34a853] dark:text-[#00ff66]',
      bgAccent: 'from-[#34a853]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Cablaggio & IP',
    },
    {
      id: 'voip' as ModuleId,
      title: '3CX & Telefonia VoIP',
      desc: '3CX SBC, provisioning Yealink/Fanvil, disabilitazione SIP ALG e range RTP.',
      icon: Phone,
      color: 'text-[#1a73e8] dark:text-[#00ff66]',
      bgAccent: 'from-[#1a73e8]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'SBC & Telefoni',
    },
    {
      id: 'zucchetti' as ModuleId,
      title: 'Spazio ERP Zucchetti',
      desc: 'Infinity DMS, Ad Hoc Revolution, Apache Tomcat, sblocco sessioni e DB locks.',
      icon: Building,
      color: 'text-[#ea4335] dark:text-[#00ff66]',
      bgAccent: 'from-[#ea4335]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Infinity & Ad Hoc',
    },
    {
      id: 'windows' as ModuleId,
      title: 'Server & Windows AD',
      desc: 'Active Directory, GPO gpupdate, Spooler di stampa, Kerberos skew e comandi.',
      icon: Server,
      color: 'text-[#fbbc04] dark:text-[#00ff66]',
      bgAccent: 'from-[#fbbc04]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Active Directory',
    },
    {
      id: 'tools' as ModuleId,
      title: 'Speedtest Banda & Latenza',
      desc: 'Motore Ookla-Style con Gauge interattivo: Download, Upload, Ping e Jitter.',
      icon: Zap,
      color: 'text-[#fbbc04] dark:text-[#00ff66]',
      bgAccent: 'from-[#fbbc04]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Ookla Engine',
    },
    {
      id: 'lavori' as ModuleId,
      title: 'Lavori Svolti & Rapportini',
      desc: 'Anagrafiche clienti, ore di lavoro, attività e download per Zucchetti Ad Hoc.',
      icon: Briefcase,
      color: 'text-[#1a73e8] dark:text-[#00ff66]',
      bgAccent: 'from-[#1a73e8]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Export Zucchetti',
    },
    {
      id: 'networkHistory' as ModuleId,
      title: 'Storico Reti & Audit Clienti',
      desc: 'Archivio schede tecniche di rete, gateway, DNS, apparati e subnet memorizzate.',
      icon: Network,
      color: 'text-[#1a73e8] dark:text-[#00ff66]',
      bgAccent: 'from-[#1a73e8]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Audit & Schede',
    },
    {
      id: 'systemLog' as ModuleId,
      title: 'Console Log Sistema IO-IT',
      desc: 'Live Debugger in tempo reale con registrazione eventi, chiamate API e note.',
      icon: Terminal,
      color: 'text-[#34a853] dark:text-[#00ff66]',
      bgAccent: 'from-[#34a853]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Live Debugger',
    },
    {
      id: 'notes' as ModuleId,
      title: 'Blocco Note "Come ho risolto"',
      desc: 'Knowledge base personale con soluzioni pronte, tag e documentazione rapida.',
      icon: NotebookPen,
      color: 'text-[#ea4335] dark:text-[#00ff66]',
      bgAccent: 'from-[#ea4335]/10 to-transparent dark:from-[#00ff66]/10',
      badge: 'Knowledge Base',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl p-5 sm:p-6 overflow-hidden border transition-all
        bg-white border-[#dadce0] shadow-sm
        dark:bg-[#08120c] dark:border-[#00ff66]/25">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold
                bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#00220a] dark:text-[#00ff66] border border-[#aecbfa] dark:border-[#00ff66]/40">
                Command Center Tecnico
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#34a853] dark:text-[#00ff66]">
                <span className="w-2 h-2 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
                IO-IT Online
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Piattaforma di Intervento & Diagnostica IT
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Prontuario operativo specialistico per telecomunicazioni 3CX, gestionali Zucchetti, networking e sistemistica Windows. Seleziona un modulo o interroga l'assistente per iniziare.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-[#040905] border-slate-200 dark:border-[#00ff66]/20 text-center">
              <div className="text-lg font-mono font-bold text-slate-900 dark:text-[#00ff66]">
                {customCases.length}
              </div>
              <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-gray-400">
                Casi IO-IT
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl border bg-slate-50 dark:bg-[#040905] border-slate-200 dark:border-[#00ff66]/20 text-center">
              <div className="text-lg font-mono font-bold text-[#1a73e8] dark:text-[#00ff66]">
                9
              </div>
              <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-gray-400">
                Moduli IT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Interactive Modules */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#1a73e8] dark:text-[#00ff66]" />
            Moduli di Intervento & Strumenti Rapidi
          </h3>
          <span className="text-[11px] font-sans text-slate-500 dark:text-[#00ff66]/70">
            Accesso istantaneo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onSelectModule(card.id)}
                className="group relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between overflow-hidden
                  bg-white border-[#dadce0] hover:border-[#1a73e8] hover:shadow-md
                  dark:bg-[#08120c] dark:border-[#00ff66]/20 dark:hover:border-[#00ff66]/50 dark:hover:shadow-black/60"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.bgAccent} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 border
                      bg-slate-50 border-slate-200 dark:bg-[#040905] dark:border-[#00ff66]/30">
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold
                      bg-slate-100 text-slate-700 dark:bg-[#021808] dark:text-[#00ff66] border border-slate-200 dark:border-[#00ff66]/30">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#1a73e8] dark:group-hover:text-[#00ff66] transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-[#00ff66]/10 flex items-center justify-between text-xs font-semibold
                  text-[#1a73e8] dark:text-[#00ff66]">
                  <span>Apri modulo</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Custom Cases from IO-IT */}
      {customCases.length > 0 && (
        <div className="rounded-2xl p-4 sm:p-5 border transition-all
          bg-white border-[#dadce0]
          dark:bg-[#08120c] dark:border-[#00ff66]/25">
          <div className="flex items-center justify-between border-b pb-3 mb-3 border-[#dadce0] dark:border-[#00ff66]/20">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#1a73e8] dark:text-[#00ff66]" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ultime Casistiche Risolte da IO-IT
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#1a73e8] dark:text-[#00ff66]">
              Archiviate automaticamente
            </span>
          </div>

          <div className="space-y-2">
            {customCases.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  const target = item.category === 'network' ? 'networkHistory' : item.category;
                  onSelectModule(target as ModuleId);
                }}
                className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all
                  bg-slate-50 border-slate-200 hover:bg-slate-100
                  dark:bg-[#040a06] dark:border-[#00ff66]/15 dark:hover:border-[#00ff66]/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#fbbc04] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                      {item.question}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase">
                      Categoria: [{item.category}] • {item.source}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#1a73e8] dark:text-[#00ff66] flex items-center gap-1 shrink-0">
                  Vedi diagnosi <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
