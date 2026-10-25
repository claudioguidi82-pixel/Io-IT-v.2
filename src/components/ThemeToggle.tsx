import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border shadow-sm
        bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50
        dark:bg-[#0b132b] dark:text-cyan-300 dark:border-cyan-500/40 dark:hover:bg-[#141b30] dark:hover:text-cyan-200"
      title={
        theme === 'dark'
          ? 'Passa al tema Chiaro (Ottimale per ambienti luminosi / ufficio)'
          : 'Passa al tema Scuro (Ottimale per datacenter / sale server scarsamente illuminate)'
      }
      aria-label="Selettore Tema"
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline font-mono text-[11px]">Datacenter</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden md:inline font-mono text-[11px]">Ufficio</span>
        </>
      )}
    </button>
  );
}
