import { useState, useEffect } from 'react';
import { T568B_PINS, T568A_PINS } from '../data/itKnowledge';
import { WirePin } from '../types';
import { Check, Copy, Play, RotateCcw } from 'lucide-react';

export default function Rj45Visualizer() {
  const [standard, setStandard] = useState<'T568B' | 'T568A'>('T568B');
  const [copied, setCopied] = useState(false);
  const [activeTesterPin, setActiveTesterPin] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const pins: WirePin[] = standard === 'T568B' ? T568B_PINS : T568A_PINS;

  // Simulator for RJ45 cable tester LEDs (1 to 8 sequential pulse)
  useEffect(() => {
    if (!isTesting) {
      setActiveTesterPin(null);
      return;
    }
    let current = 1;
    setActiveTesterPin(1);
    const interval = setInterval(() => {
      current = current >= 8 ? 1 : current + 1;
      setActiveTesterPin(current);
    }, 450);
    return () => clearInterval(interval);
  }, [isTesting]);

  const copySequence = () => {
    const text = pins.map((p) => `${p.pin}. ${p.colorName} (${p.functionDesc})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border transition-colors bg-white border-slate-200 dark:bg-[#0b132b]/80 dark:border-cyan-500/30">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-cyan-700 dark:text-cyan-400">
            Standard Crimpatura
          </span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => setStandard('T568B')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                standard === 'T568B'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-[#1c2541] dark:text-gray-300 dark:hover:text-white dark:border-gray-700'
              }`}
            >
              T568B (Standard Italia/Aziendale)
            </button>
            <button
              onClick={() => setStandard('T568A')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                standard === 'T568A'
                  ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-[#0b132b] shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-[#1c2541] dark:text-gray-300 dark:hover:text-white dark:border-gray-700'
              }`}
            >
              T568A (Residenziale/USA)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTesting(!isTesting)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium border transition-colors ${
              isTesting
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-[#1c2541] dark:border-gray-700 dark:text-gray-300 dark:hover:text-white'
            }`}
            title="Simula il lampeggio di un tester di cavi rete"
          >
            {isTesting ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
            {isTesting ? 'Ferma Tester' : 'Simula Tester LED'}
          </button>

          <button
            onClick={copySequence}
            className="flex items-center gap-1 text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 px-3 py-1.5 rounded-md transition-colors font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiato!' : 'Copia Sequenza'}
          </button>
        </div>
      </div>

      {/* Visual Connector Wire Pins Diagram */}
      <div className="p-4 rounded-xl border overflow-x-auto transition-colors bg-slate-50 border-slate-200 dark:bg-[#0b132b] dark:border-cyan-500/20">
        <div className="flex items-center justify-between text-xs mb-3 px-1 text-slate-600 dark:text-gray-400">
          <span>Vista Connettore: <strong className="text-slate-900 dark:text-gray-200">Linguetta trasparente RIVOLTA IN BASSO (dietro)</strong></span>
          <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">Pin 1 (SX) ➔ Pin 8 (DX)</span>
        </div>

        {/* Pinout wire strip visualizer */}
        <div className="grid grid-cols-8 gap-2 min-w-[500px]">
          {pins.map((p) => {
            const isLedLit = activeTesterPin === p.pin;
            return (
              <div
                key={p.pin}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all duration-200 ${
                  isLedLit
                    ? 'border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-400 dark:bg-emerald-950/40 dark:shadow-emerald-500/30 scale-105'
                    : 'bg-white border-slate-200 dark:border-gray-800 dark:bg-[#162038]'
                }`}
              >
                {/* Tester LED indicator */}
                <div className="flex items-center gap-1 mb-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full border ${
                      isLedLit
                        ? 'bg-emerald-500 border-white shadow-[0_0_8px_#10b981] dark:bg-emerald-400 dark:shadow-[0_0_8px_#34d399]'
                        : 'bg-slate-200 border-slate-300 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  />
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-gray-300">P{p.pin}</span>
                </div>

                {/* Wire representation */}
                <div className="w-7 h-24 rounded-md relative overflow-hidden shadow-inner flex items-center justify-center border border-black/40">
                  {p.isStripe ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: p.stripeColor,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 6px, ${
                          p.bgClass.includes('orange')
                            ? '#f97316'
                            : p.bgClass.includes('emerald')
                            ? '#10b981'
                            : p.bgClass.includes('blue')
                            ? '#2563eb'
                            : '#78350f'
                        } 6px, ${
                          p.bgClass.includes('orange')
                            ? '#f97316'
                            : p.bgClass.includes('emerald')
                            ? '#10b981'
                            : p.bgClass.includes('blue')
                            ? '#2563eb'
                            : '#78350f'
                        } 12px)`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: p.bgClass.includes('orange')
                          ? '#f97316'
                          : p.bgClass.includes('emerald')
                          ? '#10b981'
                          : p.bgClass.includes('blue')
                          ? '#2563eb'
                          : '#78350f',
                      }}
                    />
                  )}
                  {/* Copper tip shine */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-amber-300/80 border-b border-amber-500/50" />
                </div>

                <div className="mt-2 text-center">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-gray-200 leading-tight">{p.colorName}</p>
                  <p className="text-[9px] text-slate-500 dark:text-gray-400 font-mono mt-0.5">Coppia {p.pair}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Crimping Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg border transition-colors bg-white border-slate-200 text-slate-700 dark:bg-[#0b132b]/60 dark:border-gray-800 dark:text-gray-300">
          <h5 className="font-bold mb-1.5 flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
            <span>⚡ Regole d'Oro per la Crimpatura</span>
          </h5>
          <ul className="space-y-1 list-disc list-inside text-slate-600 dark:text-gray-400">
            <li>Sguaina la guaina esterna per circa <strong className="text-slate-800 dark:text-gray-200">2-3 cm</strong> per distendere le 4 coppie.</li>
            <li>Raddrizza i fili con le dita e disponili nell'ordine corretto da 1 a 8.</li>
            <li>Taglia i conduttori dritti e pareggiati lasciando circa <strong className="text-slate-800 dark:text-gray-200">12-14 mm</strong> scoperti.</li>
            <li>Infila nel plug fino a vedere le estremità in rame toccare il fondo della plastica frontale.</li>
            <li>Assicurati che la guaina esterna del cavo entri dentro il plug sotto il fermo di blocco prima di stringere.</li>
          </ul>
        </div>

        <div className="p-3 rounded-lg border transition-colors bg-white border-slate-200 text-slate-700 dark:bg-[#0b132b]/60 dark:border-gray-800 dark:text-gray-300">
          <h5 className="font-bold mb-1.5 flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
            <span>🔌 Cavo Diretto vs Cavo Incrociato (Crossover)</span>
          </h5>
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
            • <strong>Cavo Diretto:</strong> Entrambe le estremità con T568B (oppure entrambe T568A). Si usa per collegare PC a Switch, Stampante a Switch, Telefono 3CX a presa a muro.<br />
            • <strong>Cavo Cross:</strong> Una punta T568A e una punta T568B. Serviva per collegare PC a PC direttamente, ma gli switch moderni hanno <strong className="text-slate-800 dark:text-gray-200">Auto MDI-X</strong> e invertono automaticamente i canali di trasmissione.
          </p>
        </div>
      </div>
    </div>
  );
}
