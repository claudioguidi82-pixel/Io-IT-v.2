import { useState } from 'react';
import { IT_DICTIONARY } from '../data/itKnowledge';
import { Search, BookOpen, Copy, Check } from 'lucide-react';

export default function DictionarySection() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Tutti');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

  const categories = ['Tutti', 'Reti', 'VoIP', 'Hardware', 'Windows'];

  const filtered = IT_DICTIONARY.filter((item) => {
    const matchesCat = selectedCat === 'Tutti' || item.category === selectedCat;
    const matchesSearch =
      search.trim() === '' ||
      item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
      item.fullDesc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (term: string, desc: string) => {
    navigator.clipboard.writeText(`${term}: ${desc}`);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 1800);
  };

  return (
    <div className="space-y-3">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca termine nel dizionario (es. PoE, SBC, APIPA, VLAN, WSD)..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {filtered.map((item) => {
          const isCopied = copiedTerm === item.term;
          return (
            <div
              key={item.term}
              className="p-3 rounded-lg border transition-all flex flex-col justify-between
                bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm
                dark:bg-[#0b132b] dark:border-gray-800 dark:hover:border-cyan-500/30"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    {item.term}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium
                    bg-slate-100 border border-slate-200 text-slate-600
                    dark:bg-[#1c2541] dark:border-gray-700 dark:text-gray-300">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-1.5 leading-snug text-slate-900 dark:text-gray-200">{item.shortDesc}</p>
                <p className="text-[11.5px] leading-relaxed text-slate-600 dark:text-gray-400">{item.fullDesc}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t flex justify-end border-slate-100 dark:border-gray-800/80">
                <button
                  onClick={() => handleCopy(item.term, item.fullDesc)}
                  className="flex items-center gap-1 text-[11px] transition-colors
                    text-slate-400 hover:text-cyan-700 dark:text-gray-400 dark:hover:text-cyan-300"
                >
                  {isCopied ? <Check className="w-3 h-3 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Definizione Copiata' : 'Copia'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
