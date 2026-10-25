import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border shadow-xs select-none
        bg-white text-slate-700 hover:text-[#1a73e8] border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa]
        dark:bg-[#0b140e] dark:text-[#00ff66] dark:border-[#00ff66]/40 dark:hover:bg-[#102416] dark:hover:border-[#00ff66] dark:shadow-[0_0_8px_rgba(0,255,102,0.2)]"
      title={
        isDark
          ? 'Tema Scuro attivo. Clicca per passare al Tema Chiaro'
          : 'Tema Chiaro attivo. Clicca per passare al Tema Scuro'
      }
      aria-label="Selettore Tema Chiaro / Scuro"
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 text-[#00ff66]" />
          <span className="font-mono text-[11px] text-[#00ff66]">Tema Scuro</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-[#fbbc04]" />
          <span className="font-sans text-[11px] text-slate-700 font-medium">Tema Chiaro</span>
        </>
      )}
    </button>
  );
}
