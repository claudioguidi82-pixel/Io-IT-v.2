import { useTheme } from '../context/ThemeContext';
import { Terminal } from 'lucide-react';

export default function MatrixToggle() {
  const { matrixEnabled, toggleMatrix, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleMatrix}
      type="button"
      title={
        matrixEnabled
          ? 'Disattiva sfondo pioggia digitale Matrix'
          : 'Attiva sfondo pioggia digitale Matrix'
      }
      aria-label="Interruttore Effetto Sfondo Matrix"
      className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border shadow-xs select-none ${
        matrixEnabled
          ? isDark
            ? 'bg-[#00220a] text-[#00ff66] border-[#00ff66]/60 shadow-[0_0_10px_rgba(0,255,102,0.25)] hover:border-[#00ff66]'
            : 'bg-[#e6f4ea] text-[#137333] border-[#34a853]/40 shadow-xs hover:bg-[#ceead6]'
          : isDark
          ? 'bg-[#0b140e] text-gray-400 border-emerald-950 hover:text-gray-200 hover:border-emerald-800'
          : 'bg-white text-slate-500 border-[#dadce0] hover:text-[#1a73e8] hover:border-[#1a73e8] hover:bg-[#f8f9fa]'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Terminal
          className={`w-3.5 h-3.5 ${
            matrixEnabled
              ? isDark
                ? 'text-[#00ff66]'
                : 'text-[#34a853]'
              : 'text-slate-400 dark:text-gray-500'
          }`}
        />
        <span className="tracking-tight">Matrix</span>
      </div>

      <div className="flex items-center gap-1">
        <span
          className={`text-[9px] uppercase font-mono px-1 py-0.2 rounded ${
            matrixEnabled
              ? isDark
                ? 'bg-[#00ff66]/20 text-[#00ff66]'
                : 'bg-[#34a853]/15 text-[#137333]'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}
        >
          {matrixEnabled ? 'ON' : 'OFF'}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            matrixEnabled
              ? isDark
                ? 'bg-[#00ff66] animate-pulse shadow-[0_0_5px_#00ff66]'
                : 'bg-[#34a853] animate-pulse'
              : 'bg-gray-400'
          }`}
        />
      </div>
    </button>
  );
}
