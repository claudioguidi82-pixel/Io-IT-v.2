import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';

interface VoiceInputBarProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
}

export default function VoiceInputBar({ onAsk, isLoading }: VoiceInputBarProps) {
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const quickChips = [
    { label: '3CX: No Service', query: 'Telefono 3CX Yealink mostra No Service, cosa controllo?' },
    { label: 'Zucchetti: Sessione Appesa', query: 'Come sblocco una sessione utente bloccata su Zucchetti Infinity e Ad Hoc?' },
    { label: 'Stampante: Errore WSD', query: 'Stampante di rete bloccata su porta WSD, come riavvio lo spooler?' },
    { label: 'Rete: IP 169.254', query: 'PC riceve IP 169.254.x.x e non naviga, passaggi per risolvere?' },
    { label: 'Cavo: Pinout T568B', query: 'Qual è la sequenza colori corretta del cavo RJ45 T568B?' },
  ];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'it-IT';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputVal(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Il tuo browser non supporta il riconoscimento vocale diretto. Usa la digitazione o la tastiera vocale del telefono.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    onAsk(inputVal.trim());
  };

  const handleChipClick = (query: string) => {
    setInputVal(query);
    onAsk(query);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 py-2.5 sm:px-6 shadow-2xl backdrop-blur-md transition-colors border-t-2
      bg-white/95 border-cyan-600 shadow-slate-900/15
      dark:bg-[#0b132b]/95 dark:border-cyan-500 dark:shadow-black/80">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Quick prompt chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 text-cyan-700 dark:text-cyan-400">
            <Sparkles className="w-3 h-3" />
            Rapidi:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.query)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] transition-colors border font-medium
                bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border-slate-200
                dark:bg-[#1c2541] dark:hover:bg-cyan-500/20 dark:text-gray-300 dark:hover:text-cyan-300 dark:border-gray-700 dark:hover:border-cyan-500/40"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Search input bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isListening ? '🎤 Sto ascoltando la tua domanda in italiano...' : 'Chiedi a Senior IT (es. 3CX No Service, Zucchetti bloccato, Spooler)...'}
              disabled={isLoading}
              className={`w-full border text-xs sm:text-sm rounded-xl pl-3 pr-10 py-2.5 focus:outline-none transition-all font-sans ${
                isListening
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50 text-slate-900 dark:bg-[#162038] dark:text-white dark:border-emerald-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white dark:bg-[#1c2541] dark:border-cyan-500 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-cyan-400'
              }`}
            />

            {/* Microphone button inside input */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Ferma dettatura vocale' : 'Attiva dettatura vocale'}
              className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-emerald-500 text-white animate-pulse shadow-md'
                  : 'text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 dark:text-gray-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="flex items-center gap-1.5 font-bold px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md
              bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20
              dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-[#0b132b] dark:shadow-cyan-500/20"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white dark:border-[#0b132b] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Chiedi ➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
