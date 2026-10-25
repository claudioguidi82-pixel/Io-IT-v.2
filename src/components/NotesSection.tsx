import { useState, useEffect } from 'react';
import { NoteItem, CategoryType } from '../types';
import { INITIAL_NOTES } from '../data/itKnowledge';
import { Plus, Search, Trash2, Copy, Check, Download, Upload, Tag, Building2, Calendar, FileText } from 'lucide-react';

const STORAGE_KEY = 'io_it_troubleshooting_notes_v1';

export default function NotesSection({
  externalNewNote,
  onClearExternalNote,
}: {
  externalNewNote?: { title: string; solution: string; category?: CategoryType } | null;
  onClearExternalNote?: () => void;
}) {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading notes from localStorage:', e);
    }
    return INITIAL_NOTES;
  });

  const [title, setTitle] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState<CategoryType>('network');
  const [clientRef, setClientRef] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('Tutti');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync external note from Senior IT AI if passed
  useEffect(() => {
    if (externalNewNote) {
      setTitle(externalNewNote.title);
      setSolution(externalNewNote.solution);
      if (externalNewNote.category) setCategory(externalNewNote.category);
      setShowAddForm(true);
      if (onClearExternalNote) onClearExternalNote();
    }
  }, [externalNewNote, onClearExternalNote]);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving notes to localStorage:', e);
    }
  }, [notes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !solution.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title: title.trim(),
      category,
      clientRef: clientRef.trim() || undefined,
      solution: solution.trim(),
      createdAt: formattedDate,
      tags: tags.length > 0 ? tags : undefined,
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setSolution('');
    setClientRef('');
    setTagsInput('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Vuoi davvero eliminare questo appunto?')) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleCopy = (note: NoteItem) => {
    const text = `TITOLO: ${note.title}\nCATEGORIA: ${note.category}\n${
      note.clientRef ? `CLIENTE/TICKET: ${note.clientRef}\n` : ''
    }DATA: ${note.createdAt}\n\nSOLUZIONE:\n${note.solution}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `io_IT_Note_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setNotes([...parsed, ...notes]);
          alert(`${parsed.length} appunti importati con successo!`);
        }
      } catch (err) {
        alert('File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const categories = ['Tutti', 'hardware', 'network', '3cx', 'zucchetti', 'windows', 'altro'];

  const filteredNotes = notes.filter((n) => {
    const matchesCat = filterCat === 'Tutti' || n.category === filterCat;
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      n.title.toLowerCase().includes(q) ||
      n.solution.toLowerCase().includes(q) ||
      (n.clientRef && n.clientRef.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top action bar: add, export, import */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border transition-colors
        bg-white border-slate-200 shadow-sm
        dark:bg-[#0b132b]/80 dark:border-cyan-500/20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors
              bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm
              dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b]"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Chiudi Form' : 'Nuovo Appunto Intervento'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors
              bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200
              dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300 dark:border-gray-700"
            title="Esporta tutti gli appunti salvati in formato JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Esporta JSON
          </button>

          <label className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer
            bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200
            dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300 dark:border-gray-700">
            <Upload className="w-3.5 h-3.5" />
            Importa
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <form onSubmit={handleAddNote} className="p-4 rounded-xl border space-y-3 transition-colors
          bg-white border-slate-300 shadow-md
          dark:bg-[#0b132b] dark:border-cyan-500/40">
          <h4 className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
            <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Registra Risoluzione Intervento
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Titolo Guasto / Intervento *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="es. Stampante di rete offline per errore WSD"
                required
                className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors
                  bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                  dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full rounded-lg px-2.5 py-2 text-xs focus:outline-none transition-colors
                    bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                    dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
                >
                  <option value="network">🌐 Rete</option>
                  <option value="3cx">📞 3CX / VoIP</option>
                  <option value="zucchetti">🏢 Zucchetti</option>
                  <option value="windows">💻 Windows Server</option>
                  <option value="hardware">🛠️ Hardware</option>
                  <option value="altro">📁 Altro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Cliente / Ticket ID</label>
                <input
                  type="text"
                  value={clientRef}
                  onChange={(e) => setClientRef(e.target.value)}
                  placeholder="es. Ticket #4019"
                  className="w-full rounded-lg px-2.5 py-2 text-xs focus:outline-none transition-colors
                    bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                    dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">
              Come hai risolto (passaggi tecnici, comandi, verifiche) *
            </label>
            <textarea
              rows={4}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="1. Verificato ping su IP stampante...&#10;2. Spooler riavviato...&#10;3. Modificata porta da WSD a Standard TCP/IP..."
              required
              className="w-full rounded-lg p-2.5 text-xs font-mono leading-relaxed focus:outline-none transition-colors
                bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1 text-slate-600 dark:text-gray-400">Tag (separati da virgola)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="es. spooler, wsd, hp, tcp/ip"
              className="w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none transition-colors
                bg-slate-50 border border-slate-300 text-slate-900 focus:border-cyan-600
                dark:bg-[#162038] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md text-xs font-bold transition-colors
                bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm
                dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b]"
            >
              + Salva Appunto
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca negli appunti (es. Yealink, Ad Hoc, WSD, Ticket)..."
            className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-colors
              bg-white border border-slate-300 text-slate-900 focus:border-cyan-600
              dark:bg-[#0b132b] dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
                filterCat === cat
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] font-bold shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#0b132b] dark:text-gray-300 dark:hover:text-white dark:border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center rounded-xl border text-xs bg-white border-slate-200 text-slate-500 dark:bg-[#0b132b] dark:border-gray-800 dark:text-gray-400">
            Nessun appunto trovato. Salva una nuova risoluzione per ritrovarla nei prossimi interventi!
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isCopied = copiedId === note.id;
            return (
              <div
                key={note.id}
                className="p-4 rounded-xl border transition-all space-y-2.5
                  bg-white border-slate-200 hover:border-cyan-500/50 shadow-sm
                  dark:bg-[#0b132b] dark:border-gray-800 dark:hover:border-cyan-500/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{note.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] mt-1 text-slate-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-semibold capitalize text-teal-700 dark:text-teal-300">
                        ● {note.category}
                      </span>
                      {note.clientRef && (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                          <Building2 className="w-3 h-3" />
                          {note.clientRef}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400 dark:text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {note.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(note)}
                      className="p-1.5 rounded transition-colors
                        bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900
                        dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300"
                      title="Copia appunti negli appunti"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded transition-colors
                        bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600
                        dark:bg-[#1c2541] dark:hover:bg-rose-500/20 dark:text-gray-300 dark:hover:text-rose-400"
                      title="Elimina appunto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg border text-xs font-mono whitespace-pre-wrap leading-relaxed
                  bg-slate-900 border-slate-800 text-slate-200
                  dark:bg-[#060a17] dark:border-gray-800/80 dark:text-gray-300">
                  {note.solution}
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium
                          bg-cyan-50 text-cyan-800 border border-cyan-200
                          dark:bg-[#1c2541] dark:text-cyan-300 dark:border-cyan-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
