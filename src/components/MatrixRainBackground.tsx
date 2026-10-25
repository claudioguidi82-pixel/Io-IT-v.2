import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function MatrixRainBackground() {
  const { theme, matrixEnabled } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        ctx.fillStyle = 'rgba(5, 11, 7, 0.18)'; // authentic Matrix deep cyber dark
      } else {
        ctx.fillStyle = 'rgba(248, 249, 250, 0.22)'; // Google Workspace clean light
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading character is brighter / high-contrast
        if (Math.random() > 0.88) {
          ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        } else {
          // Dark mode: Authentic Matrix neon phosphor green
          // Light mode: Clean black/charcoal
          ctx.fillStyle = isDark
            ? i % 5 === 0
              ? '#55ff99' // Light phosphor
              : i % 8 === 0
              ? '#a3ffc7' // Bright white-green tip
              : '#00ff66' // Pure Matrix Neon Green
            : i % 4 === 0
            ? '#000000' // Pure Black
            : i % 3 === 0
            ? 'rgba(0, 0, 0, 0.85)' // Solid Dark Black
            : 'rgba(0, 0, 0, 0.65)'; // Crisp Charcoal
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

  if (!matrixEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-45 transition-opacity duration-300"
      style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
    />
  );
}
