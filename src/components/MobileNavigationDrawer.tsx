import { ModuleId } from '../types';
import ThemeToggle from './ThemeToggle';
import MatrixToggle from './MatrixToggle';
import {
  X,
  LayoutDashboard,
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
  Sparkles,
} from 'lucide-react';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  casesCountByCategory?: Record<string, number>;
}

export default function MobileNavigationDrawer({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
  casesCountByCategory = {},
}: MobileNavigationDrawerProps) {
  if (!isOpen) return null;

  const navCategories = [
    {
      title: 'Sistemistica & Telecomunicazioni',
      items: [
        {
          id: 'hardware' as ModuleId,
          label: 'Hardware & Reti',
          sub: 'Cavi RJ45, PoE & Switch',
          icon: Wrench,
          color: 'text-[#34a853] dark:text-[#00ff66]',
          badge: casesCountByCategory['hardware'] || null,
        },
        {
          id: 'voip' as ModuleId,
          label: '3CX & VoIP',
          sub: 'SBC, Telefoni IP & RTP',
          icon: Phone,
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
          badge: casesCountByCategory['voip'] || null,
        },
        {
          id: 'zucchetti' as ModuleId,
          label: 'Spazio Zucchetti',
          sub: 'Infinity, Ad Hoc, Tomcat',
          icon: Building,
          color: 'text-[#ea4335] dark:text-[#00ff66]',
          badge: casesCountByCategory['zucchetti'] || null,
        },
        {
          id: 'windows' as ModuleId,
          label: 'Server & AD',
          sub: 'Active Directory & GPO',
          icon: Server,
          color: 'text-[#fbbc04] dark:text-[#00ff66]',
          badge: casesCountByCategory['windows'] || null,
        },
      ],
    },
    {
      title: 'Diagnostica & Test',
      items: [
        {
          id: 'tools' as ModuleId,
          label: 'Speedtest Ookla',
          sub: 'Test Banda DL/UL & Jitter',
          icon: Zap,
          color: 'text-[#fbbc04] dark:text-[#00ff66]',
          badge: 'Ookla',
        },
        {
          id: 'networkHistory' as ModuleId,
          label: 'Audit & Storico Reti',
          sub: 'Configurazioni clienti',
          icon: Network,
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
          badge: casesCountByCategory['network'] || null,
        },
        {
          id: 'systemLog' as ModuleId,
          label: 'Console Log IO-IT',
          sub: 'Live Debugger eventi',
          icon: Terminal,
          color: 'text-[#34a853] dark:text-[#00ff66]',
          badge: 'Live',
        },
      ],
    },
    {
      title: 'Gestione & Knowledge Base',
      items: [
        {
          id: 'lavori' as ModuleId,
          label: 'Lavori Svolti',
          sub: 'Rapportini Ad Hoc Zucchetti',
          icon: Briefcase,
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
          badge: 'Ad Hoc',
        },
        {
          id: 'notes' as ModuleId,
          label: 'Blocco Note KB',
          sub: 'Come ho risolto il guasto',
          icon: NotebookPen,
          color: 'text-[#ea4335] dark:text-[#00ff66]',
          badge: null,
        },
        {
          id: 'dictionary' as ModuleId,
          label: 'Dizionario IT',
          sub: 'Zero dubbi sistemistici',
          icon: BookOpen,
          color: 'text-[#34a853] dark:text-[#00ff66]',
          badge: null,
        },
      ],
    },
  ];

  const handleSelect = (id: ModuleId) => {
    onSelectModule(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 md:hidden">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-up bottom sheet */}
      <div className="w-full max-h-[85vh] rounded-t-3xl border-t flex flex-col shadow-2xl overflow-hidden transition-colors
        bg-white border-[#dadce0]
        dark:bg-[#08120c] dark:border-[#00ff66]/30 animate-in slide-in-from-bottom duration-300">
        {/* Drawer Handle & Header */}
        <div className="p-4 border-b border-[#dadce0] dark:border-[#00ff66]/20 flex items-center justify-between
          bg-[#f8f9fa] dark:bg-[#050b07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#00220a] dark:text-[#00ff66]">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Menù Moduli IT</h3>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">Seleziona un modulo operativo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-gray-400 dark:hover:text-[#00ff66] dark:hover:bg-[#00ff66]/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list with macro-areas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {navCategories.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#00ff66]/70 px-1">
                {cat.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`p-3 rounded-xl flex items-center justify-between text-left transition-all border ${
                        isActive
                          ? 'bg-[#e8f0fe] text-[#1967d2] border-[#aecbfa] font-bold dark:bg-[#00220a] dark:text-[#00ff66] dark:border-[#00ff66]/50'
                          : 'bg-[#f8f9fa] text-slate-700 border-[#dadce0] hover:bg-slate-100 dark:bg-[#061009] dark:text-gray-300 dark:border-[#00ff66]/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a73e8] dark:text-[#00ff66]' : item.color}`} />
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{item.sub}</div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0 bg-slate-200 dark:bg-[#02200c] text-slate-800 dark:text-[#00ff66]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer toggles inside drawer */}
        <div className="p-3 border-t border-[#dadce0] dark:border-[#00ff66]/20 flex items-center justify-between bg-[#f8f9fa] dark:bg-[#050b07]">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MatrixToggle />
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-[#00220a] dark:text-[#00ff66] dark:border dark:border-[#00ff66]/40"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
