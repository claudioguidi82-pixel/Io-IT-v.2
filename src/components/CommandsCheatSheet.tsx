import { useState } from 'react';
import { SAVIOR_COMMANDS } from '../data/itKnowledge';
import { CommandItem } from '../types';
import { Copy, Check, Terminal, Search, ShieldCheck } from 'lucide-react';

export default function CommandsCheatSheet() {
  const [selectedCat, setSelectedCat] = useState<string>('Tutti');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['Tutti', 'Rete', 'Dominio', 'Sistema', 'Diagnostica', 'Storage'];

  const filtered = SAVIOR_COMMANDS.filter((item) => {
    const matchesCat = selectedCat === 'Tutti' || item.category === selectedCat;
    const matchesSearch =
      search.trim() === '' ||
      item.cmd.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const batchRescueScript = `@echo off
echo ========================================================
echo        io IT - SCRIPT DI RIPRISTINO RETE E SPOOLER
echo ========================================================
echo.
echo 1. Svuotamento cache DNS...
ipconfig /flushdns
echo.
echo 2. Rilascio e Rinnovo IP DHCP...
ipconfig /release
ipconfig /renew
echo.
echo 3. Azzeramento Spooler di Stampa...
net stop spooler
del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"
net start spooler
echo.
echo 4. Ripristino Stack Winsock...
netsh winsock reset
echo.
echo [COMPLETATO] Operazioni terminate. Se necessario riavviare il PC.
pause`;

  return (
    <div className="space-y-4">
      {/* Search and Categories Filter */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca comando (es. flushdns, net use, dsa, spooler)..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors
              bg-white border border-slate-300 text-slate-900 focus:border-cyan-600
              dark:bg-[#0b132b] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                selectedCat === cat
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] font-bold shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#0b132b] dark:text-gray-300 dark:hover:text-white dark:border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filtered.map((item: CommandItem) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="p-3 rounded-lg border transition-all flex flex-col justify-between
                bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm
                dark:bg-[#0b132b] dark:border-gray-800 dark:hover:border-cyan-500/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    {item.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
                      item.type === 'powershell'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700'
                        : item.type === 'msc'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/60 dark:text-purple-300 dark:border-purple-700'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <p className="text-xs mb-2 leading-relaxed text-slate-600 dark:text-gray-300">{item.description}</p>
              </div>

              {/* Command row with copy button */}
              <div className="flex items-center justify-between gap-2 bg-slate-900 dark:bg-[#060a17] p-2 rounded border border-slate-800">
                <code className="text-xs font-mono text-teal-300 break-all select-all">{item.cmd}</code>
                <button
                  onClick={() => handleCopy(item.cmd, item.id)}
                  className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors shrink-0 ${
                    isCopied
                      ? 'bg-teal-500 text-[#0b132b] font-bold'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300'
                  }`}
                  title="Copia negli appunti"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Copiato' : 'Copia'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Script Batch Salvavita */}
      <div className="p-3.5 rounded-xl border transition-colors bg-white border-slate-200 shadow-sm dark:bg-[#0b132b]/90 dark:border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 dark:text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Script Batch Pronto all'Uso: "Ripristino Rete & Spooler" (.bat)</span>
          </div>
          <button
            onClick={() => handleCopy(batchRescueScript, 'rescue-script')}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors font-medium
              bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100
              dark:bg-teal-500/20 dark:hover:bg-teal-500/30 dark:text-teal-300 dark:border-teal-500/40"
          >
            {copiedId === 'rescue-script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedId === 'rescue-script' ? 'Script Copiato!' : 'Copia Intero Script'}
          </button>
        </div>
        <pre className="text-[11px] font-mono bg-slate-900 dark:bg-[#060a17] p-2.5 rounded border border-slate-800 text-slate-200 dark:text-gray-300 overflow-x-auto">
          {batchRescueScript}
        </pre>
      </div>
    </div>
  );
}
