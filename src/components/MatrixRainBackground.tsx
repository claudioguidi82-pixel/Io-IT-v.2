import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function MatrixRainBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [matrixEnabled, setMatrixEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('io_it_matrix_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!matrixEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastDrawTime = 0;
    const fps = 25; // 25 FPS for smooth look and low CPU usage
    const frameInterval = 1000 / fps;

    // Characters: IT terms, binary, hex, Katakana & symbols
    const chars = '013CXVLANIPDNSDHCPTCPUDP255RJ45POERDSMSCSFCGW101010101ABCDEF0123456789ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');

    const fontSize = 14;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops: number[] = [];

    const initDrops = () => {
      columns = Math.floor(window.innerWidth / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Random start position so rain is already staggered
        drops[i] = Math.floor(Math.random() * -50);
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastDrawTime < frameInterval) return;
      lastDrawTime = currentTime;

      // Semi-transparent overlay to create fading trail effect
      if (isDark) {
        ctx.fillStyle = 'rgba(11, 19, 43, 0.16)'; // matches #0b132b
      } else {
        ctx.fillStyle = 'rgba(241, 245, 249, 0.22)'; // matches light slate-100
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is brighter
        if (Math.random() > 0.88) {
          ctx.fillStyle = isDark ? '#ffffff' : '#0369a1';
        } else {
          // Matrix green / cyan for dark mode, subtle slate-cyan for light mode
          ctx.fillStyle = isDark
            ? i % 4 === 0
              ? '#00b4d8' // Cyan
              : i % 7 === 0
              ? '#2ec4b6' // Teal
              : '#00ff66' // Matrix neon green
            : i % 3 === 0
            ? 'rgba(2, 132, 199, 0.35)'
            : 'rgba(13, 148, 136, 0.30)';
        }

        ctx.fillText(text, x, y);

        // Reset drop to top randomly once it falls off bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [matrixEnabled, isDark]);

  const toggleMatrix = () => {
    setMatrixEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('io_it_matrix_enabled', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {matrixEnabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-35 transition-opacity duration-300"
          style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
        />
      )}

      {/* Floating mini Matrix toggle button at bottom right (above voice bar) */}
      <button
        onClick={toggleMatrix}
        type="button"
        title={matrixEnabled ? 'Disattiva sfondo Matrix' : 'Attiva sfondo Matrix'}
        className={`fixed bottom-24 right-4 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shadow-lg transition-all border backdrop-blur-md ${
          matrixEnabled
            ? isDark
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
            : isDark
            ? 'bg-[#1c2541]/90 text-gray-400 border-gray-700 hover:text-white'
            : 'bg-white/90 text-slate-500 border-slate-300 hover:text-slate-900 shadow-sm'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            matrixEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span>MATRIX {matrixEnabled ? 'ON' : 'OFF'}</span>
      </button>
    </>
  );
}
