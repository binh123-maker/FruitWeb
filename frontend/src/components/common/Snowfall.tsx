import React, { useMemo } from 'react';

interface Flake {
  id: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

export const Snowfall: React.FC = () => {
  // Generate a fixed, deterministic set of gentle flakes to avoid re-renders
  const flakes: Flake[] = useMemo(() => {
    const count = 28;
    return Array.from({ length: count }, (_, i) => {
      // Deterministic pseudo-random distribution
      const pseudo = (seed: number) => {
        const x = Math.sin(seed + i * 997) * 10000;
        return x - Math.floor(x);
      };

      return {
        id: i,
        left: Math.round(pseudo(1) * 98 * 10) / 10, // 0% to 98%
        size: Math.round((2 + pseudo(2) * 3) * 10) / 10, // 2px - 5px
        opacity: Math.round((0.25 + pseudo(3) * 0.45) * 100) / 100, // 0.25 - 0.7
        duration: Math.round((9 + pseudo(4) * 10) * 10) / 10, // 9s - 19s
        delay: Math.round(pseudo(5) * -15 * 10) / 10, // negative delay for continuous flow
        drift: Math.round((-20 + pseudo(6) * 40) * 10) / 10, // -20px to +20px drift
      };
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes snowfall-fall {
          0% {
            transform: translate3d(0, -10px, 0);
          }
          50% {
            transform: translate3d(var(--drift), 50vh, 0);
          }
          100% {
            transform: translate3d(0, 105vh, 0);
          }
        }

        .snowfall-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          user-select: none;
          z-index: 1;
          overflow: hidden;
        }

        .snowfall-flake {
          position: absolute;
          top: -10px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(209, 250, 229, 0.6) 60%, rgba(255, 255, 255, 0) 100%);
          box-shadow: 0 0 4px rgba(16, 185, 129, 0.25);
          animation-name: snowfall-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @media (max-width: 640px) {
          .snowfall-flake:nth-child(even) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .snowfall-container {
            display: none !important;
          }
        }
      `}</style>
      <div className="snowfall-container" aria-hidden="true">
        {flakes.map((f) => (
          <span
            key={f.id}
            className="snowfall-flake"
            style={
              {
                left: `${f.left}%`,
                width: `${f.size}px`,
                height: `${f.size}px`,
                opacity: f.opacity,
                animationDuration: `${f.duration}s`,
                animationDelay: `${f.delay}s`,
                '--drift': `${f.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
};
