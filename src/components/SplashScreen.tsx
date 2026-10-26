import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out at 1.4s
    const timerFade = setTimeout(() => {
      setFading(true);
    }, 1400);

    // Completely unmount at 1.9s
    const timerDone = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 1900);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, [onFinish]);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-[#040805] text-white select-none transition-opacity duration-500 ease-out cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      title="Tocca per entrare"
    >
      {/* Background Matrix-like subtle grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00ff66]/10 via-[#040805]/80 to-[#020503] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Full-screen App Icon */}
        <div className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#1a73e8]/30 via-[#00ff66]/40 to-[#34a853]/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <img
            src="/assets/aistudio/1792888079906_d7414e2f.jpg"
            alt="io IT Icona Ufficiale"
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover shadow-2xl border-2 border-[#00ff66]/50 shadow-[#00ff66]/20 transition-transform duration-300 transform scale-100"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#040805] shadow-sm animate-ping" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00ff66] border-2 border-[#040805]" />
        </div>

        {/* Branding Info */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white drop-shadow-md">
            <span className="text-[#ea4335]">io</span>{' '}
            <span className="text-[#00ff66]">IT</span>
          </h1>
          <p className="text-sm font-semibold tracking-wide text-gray-200">
            Guidi Claudio
          </p>
          <div className="flex items-center justify-center pt-1">
            <img
              src="/assets/aistudio/cropped-newlogo_dac22d97.png"
              alt="System Byte"
              className="h-5 w-auto object-contain bg-white/95 px-2 py-0.5 rounded shadow-sm"
            />
          </div>
        </div>

        {/* Sleek Loading Line */}
        <div className="w-48 sm:w-56 space-y-2 pt-2">
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#1a73e8] via-[#00ff66] to-[#34a853] rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
          </div>
          <p className="text-[11px] font-mono tracking-widest text-[#00ff66]/80 uppercase">
            Inizializzazione IO-IT...
          </p>
        </div>

        <span className="text-[10px] text-gray-500 font-sans tracking-tight">
          Tocca lo schermo per accedere
        </span>
      </div>
    </div>
  );
}
