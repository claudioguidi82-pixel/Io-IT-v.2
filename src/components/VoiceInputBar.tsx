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
      bg-white/95 border-[#1a73e8] shadow-slate-900/15
      dark:bg-[#08120c]/95 dark:border-[#00ff66]/50 dark:shadow-[0_-4px_25px_rgba(0,255,102,0.12)]">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Search input bar */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isListening ? '🎤 Sto ascoltando la tua domanda in italiano...' : 'Chiedi a IO-IT (es. 3CX No Service, Zucchetti bloccato, Spooler)...'}
              disabled={isLoading}
              style={{ color: '#000000', backgroundColor: '#ffffff' }}
              className={`w-full border-2 text-xs sm:text-sm rounded-xl pl-3 pr-10 py-2.5 focus:outline-none transition-all font-sans font-medium text-black dark:text-black bg-white dark:bg-white placeholder:text-slate-500 dark:placeholder:text-slate-500 caret-[#1a73e8] dark:caret-[#00ff66] ${
                isListening
                  ? 'border-[#34a853] ring-2 ring-[#34a853]/30'
                  : 'border-[#dadce0] dark:border-[#00ff66]/60 focus:border-[#1a73e8] dark:focus:border-[#00ff66] focus:ring-2 focus:ring-[#1a73e8]/20 dark:focus:ring-[#00ff66]/20'
              }`}
            />

            {/* Microphone button inside input */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Ferma dettatura vocale' : 'Attiva dettatura vocale'}
              className={`absolute right-2 p-1.5 rounded-lg transition-all ${
                isListening
                  ? 'bg-[#34a853] dark:bg-[#00ff66] text-white dark:text-[#050b07] animate-pulse shadow-md'
                  : 'text-slate-600 hover:text-[#1a73e8] hover:bg-slate-100 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="flex items-center gap-1.5 font-bold px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md
              bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-[#1a73e8]/20
              dark:bg-[#00ff66] dark:hover:bg-[#33ff85] dark:text-[#050b07] dark:shadow-[0_0_15px_rgba(0,255,102,0.3)]"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white dark:border-[#050b07] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Chiedi ➤</span>
          </button>
        </form>

        {/* Quick prompt chips - placed on bottom / last row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-xs">
          <span className="text-[10px] uppercase font-bold shrink-0 flex items-center gap-1 text-[#1a73e8] dark:text-[#00ff66]">
            <Sparkles className="w-3 h-3 text-[#fbbc04] dark:text-[#00ff66]" />
            Rapidi:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.query)}
              disabled={isLoading}
              className="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] transition-colors border font-medium
                bg-[#f1f3f4] hover:bg-[#e8f0fe] text-slate-700 hover:text-[#1967d2] border-[#dadce0] hover:border-[#aecbfa]
                dark:bg-[#050c07] dark:hover:bg-[#00250d] dark:text-gray-300 dark:hover:text-[#00ff66] dark:border-[#00ff66]/30 dark:hover:border-[#00ff66]/60"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
