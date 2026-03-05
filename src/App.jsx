import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import gifUrl from "../mind-blown-shocked.gif";
import catUrl from "../cat.jpg";
import CatchTheHearts from "./CatchTheHearts";

/* ---- constants ---- */
const NO_BUTTON_WIDTH = 76;
const NO_BUTTON_HEIGHT = 40;
const NO_BUTTON_MARGIN = 12;

/* ---- helpers ---- */
const getSafeBounds = () => ({
  min: NO_BUTTON_MARGIN,
  maxX: Math.max(NO_BUTTON_MARGIN, window.innerWidth - NO_BUTTON_WIDTH - NO_BUTTON_MARGIN),
  maxY: Math.max(NO_BUTTON_MARGIN, window.innerHeight - NO_BUTTON_HEIGHT - NO_BUTTON_MARGIN),
});

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- floating background particles (static config) ---- */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ["💕", "💗", "✨", "💖", "♥️", "💫", "🌸", "⭐", "💝"][i % 9],
  style: {
    "--particle-left": `${(i * 5.7 + 2) % 96}%`,
    "--particle-duration": `${10 + ((i * 2.3) % 14)}s`,
    "--particle-delay": `${-((i * 1.7) % 12)}s`,
    "--particle-size": `${0.65 + (i % 5) * 0.2}rem`,
    "--particle-opacity": 0.12 + (i % 4) * 0.06,
  },
}));

function App() {
  const [accepted, setAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [minigameOpen, setMinigameOpen] = useState(false);
  const [noWobble, setNoWobble] = useState(false);
  const confettiTimers = useRef([]);

  /* ---- initial No-button placement ---- */
  useEffect(() => {
    const { min, maxX, maxY } = getSafeBounds();
    const startX = Math.min(
      maxX,
      Math.max(min, Math.floor(window.innerWidth / 2) + 150)
    );
    const startY = Math.min(
      maxY,
      Math.max(min, Math.floor(window.innerHeight / 2) + 10)
    );
    setNoPosition({ x: startX, y: startY });
  }, []);

  /* ---- clamp No button on resize ---- */
  useEffect(() => {
    const handleResize = () => {
      setNoPosition((prev) => {
        const { min, maxX, maxY } = getSafeBounds();
        return {
          x: Math.min(maxX, Math.max(min, prev.x)),
          y: Math.min(maxY, Math.max(min, prev.y)),
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const noButtonStyle = useMemo(
    () => ({
      left: `${noPosition.x}px`,
      top: `${noPosition.y}px`,
    }),
    [noPosition]
  );

  const moveNoButton = useCallback(() => {
    setNoWobble(true);
    const { min, maxX, maxY } = getSafeBounds();
    const randomX = Math.floor(Math.random() * (maxX - min + 1)) + min;
    const randomY = Math.floor(Math.random() * (maxY - min + 1)) + min;
    setNoPosition({ x: randomX, y: randomY });
    setTimeout(() => setNoWobble(false), 400);
  }, []);

  const closeMinigame = useCallback(() => setMinigameOpen(false), []);

  /* ---- celebration + confetti ---- */
  const handleYes = useCallback(() => {
    setAccepted(true);

    confettiTimers.current.forEach(clearTimeout);
    confettiTimers.current = [];

    if (prefersReducedMotion()) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff1744", "#ff4081", "#f50057", "#ff80ab", "#ff6090", "#e91e63"],
    });
    confettiTimers.current.push(
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.5, x: 0.3 },
          colors: ["#ff1744", "#ff4081", "#f50057", "#ff80ab"],
        });
      }, 250)
    );
    confettiTimers.current.push(
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
          colors: ["#ff1744", "#ff4081", "#f50057", "#ff80ab"],
        });
      }, 400)
    );
  }, []);

  useEffect(() => {
    return () => confettiTimers.current.forEach(clearTimeout);
  }, []);

  return (
    <main className="page">
      {/* Background particles */}
      <div className="particles-container" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span key={p.id} className="particle" style={p.style}>
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="glow glowOne" />
      <div className="glow glowTwo" />

      <section className="card">
        <img src={catUrl} alt="Cute cat" className="catPhoto" />
        <h1 className="title">Martina, will you be my valentine? 💌</h1>

        {!accepted ? (
          <div className="buttonArea">
            <button type="button" className="yesButton" onClick={handleYes}>
              Yes 💖
            </button>
          </div>
        ) : (
          <section className="success">
            <h2 className="yay">YAY!!! 🤯</h2>
            <div className="celebration-wrapper">
              <span className="sparkle sparkle-1" aria-hidden="true">✨</span>
              <span className="sparkle sparkle-2" aria-hidden="true">💫</span>
              <span className="sparkle sparkle-3" aria-hidden="true">⭐</span>
              <span className="sparkle sparkle-4" aria-hidden="true">✨</span>
              <img
                src={gifUrl}
                alt="Mind blown celebration"
                className="celebrationGif"
              />
            </div>
          </section>
        )}

        {/* Hidden minigame trigger — disguised as a tiny decorative flourish */}
        <span
          className="secret-trigger"
          onClick={() => setMinigameOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Hidden surprise"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMinigameOpen(true);
            }
          }}
        >
          💝
        </span>
      </section>

      {/* Runaway No button — now with smooth transition + mobile support */}
      {!accepted && (
        <button
          type="button"
          className={`noButton${noWobble ? " no-wobble" : ""}`}
          style={noButtonStyle}
          onMouseEnter={moveNoButton}
          onTouchStart={(e) => {
            e.preventDefault();
            moveNoButton();
          }}
        >
          No
        </button>
      )}

      {/* Hidden minigame */}
      {minigameOpen && (
        <CatchTheHearts onClose={closeMinigame} />
      )}
    </main>
  );
}

export default App;
