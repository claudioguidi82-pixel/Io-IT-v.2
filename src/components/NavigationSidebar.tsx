import { useState } from 'react';
import { ModuleId } from '../types';
import ThemeToggle from './ThemeToggle';
import MatrixToggle from './MatrixToggle';
import {
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavigationSidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  casesCountByCategory?: Record<string, number>;
}

export default function NavigationSidebar({
  activeModule,
  onSelectModule,
  casesCountByCategory = {},
}: NavigationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navGroups = [
    {
      groupTitle: 'Sistemistica & Reti',
      items: [
        {
          id: 'hardware' as ModuleId,
          label: 'Hardware, Cavi & Reti',
          shortLabel: 'Hardware',
          icon: Wrench,
          badge: casesCountByCategory['hardware'] || null,
          color: 'text-[#34a853] dark:text-[#00ff66]',
        },
        {
          id: 'voip' as ModuleId,
          label: '3CX & Telefonia VoIP',
          shortLabel: '3CX VoIP',
          icon: Phone,
          badge: casesCountByCategory['voip'] || null,
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
        },
        {
          id: 'zucchetti' as ModuleId,
          label: 'Spazio ERP Zucchetti',
          shortLabel: 'Zucchetti',
          icon: Building,
          badge: casesCountByCategory['zucchetti'] || null,
          color: 'text-[#ea4335] dark:text-[#00ff66]',
        },
        {
          id: 'windows' as ModuleId,
          label: 'Server & Windows AD',
          shortLabel: 'Windows',
          icon: Server,
          badge: casesCountByCategory['windows'] || null,
          color: 'text-[#fbbc04] dark:text-[#00ff66]',
        },
      ],
    },
    {
      groupTitle: 'Diagnostica & Test',
      items: [
        {
          id: 'tools' as ModuleId,
          label: 'Speedtest Banda & Latenza',
          shortLabel: 'Speedtest',
          icon: Zap,
          badge: 'Ookla',
          color: 'text-[#fbbc04] dark:text-[#00ff66]',
        },
        {
          id: 'networkHistory' as ModuleId,
          label: 'Storico Reti & Audit',
          shortLabel: 'Audit Reti',
          icon: Network,
          badge: casesCountByCategory['network'] || null,
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
        },
        {
          id: 'systemLog' as ModuleId,
          label: 'Console Log Sistema',
          shortLabel: 'Console Log',
          icon: Terminal,
          badge: 'Live',
          color: 'text-[#34a853] dark:text-[#00ff66]',
        },
      ],
    },
    {
      groupTitle: 'Gestione & Knowledge',
      items: [
        {
          id: 'lavori' as ModuleId,
          label: 'Lavori Svolti & Rapportini',
          shortLabel: 'Rapportini',
          icon: Briefcase,
          badge: 'Ad Hoc',
          color: 'text-[#1a73e8] dark:text-[#00ff66]',
        },
        {
          id: 'notes' as ModuleId,
          label: 'Blocco Note Risoluzioni',
          shortLabel: 'Note KB',
          icon: NotebookPen,
          badge: null,
          color: 'text-[#ea4335] dark:text-[#00ff66]',
        },
        {
          id: 'dictionary' as ModuleId,
          label: 'Dizionario IT Zero Dubbi',
          shortLabel: 'Dizionario',
          icon: BookOpen,
          badge: null,
          color: 'text-[#34a853] dark:text-[#00ff66]',
        },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r select-none transition-all duration-300 z-30
        bg-white border-[#dadce0]
        dark:bg-[#070e09] dark:border-[#00ff66]/20 ${
          isCollapsed ? 'w-20' : 'w-64 lg:w-72'
        }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[#dadce0] dark:border-[#00ff66]/20 flex items-center justify-between">
        <div
          onClick={() => onSelectModule('overview')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          title="Torna alla Dashboard"
        >
          <div className="relative shrink-0">
            <img
              src="/assets/aistudio/1792888079906_d7414e2f.jpg"
              alt="io IT Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-[#1a73e8]/30 dark:border-[#00ff66]/40"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34a853] dark:bg-[#00ff66] border border-white dark:border-[#070e09]" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900 dark:text-white truncate">
                <span className="text-[#ea4335]">io</span>{' '}
                <span className="text-[#1a73e8] dark:text-[#00ff66]">IT</span>
              </h1>
              <span className="text-xs font-semibold text-slate-800 dark:text-gray-300 truncate">
                Guidi Claudio
              </span>
              <div className="pt-0.5">
                <img
                  src="/assets/aistudio/cropped-newlogo_dac22d97.png"
                  alt="System Byte"
                  className="h-3 w-auto object-contain dark:bg-white/95 dark:px-1 dark:rounded-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Espandi Sidebar' : 'Riduci Sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-[#00ff66] dark:hover:bg-[#00ff66]/10 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs font-sans">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#00ff66]/60">
                {group.groupTitle}
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    title={item.label}
                    className={`w-full flex items-center rounded-xl px-2.5 py-2 text-left font-medium transition-all group ${
                      isActive
                        ? 'bg-[#e8f0fe] text-[#1967d2] font-bold shadow-xs dark:bg-[#00220a] dark:text-[#00ff66] dark:border dark:border-[#00ff66]/30'
                        : 'text-slate-700 hover:bg-[#f1f3f4] dark:text-gray-300 dark:hover:bg-[#00ff66]/5 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#1a73e8] dark:text-[#00ff66]' : item.color
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1 ml-2.5 min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isActive
                                ? 'bg-[#1a73e8] text-white dark:bg-[#00ff66] dark:text-[#050b07]'
                                : 'bg-slate-200 text-slate-700 dark:bg-[#021307] dark:text-[#00ff66] dark:border dark:border-[#00ff66]/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Settings & Theme Toggles */}
      <div className="p-3 border-t border-[#dadce0] dark:border-[#00ff66]/20 space-y-2 bg-[#f8f9fa] dark:bg-[#050b07]">
        {!isCollapsed ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#00ff66]/70 pb-1 border-b border-slate-200 dark:border-[#00ff66]/10">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#fbbc04]" />
                IO-IT v3.8 Active
              </span>
              <span className="w-2 h-2 rounded-full bg-[#34a853] dark:bg-[#00ff66] animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <ThemeToggle />
              <MatrixToggle />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34a853] dark:bg-[#00ff66]" />
          </div>
        )}
      </div>
    </aside>
  );
}
