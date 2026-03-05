import { useState, useEffect, useCallback, useRef } from "react";

const GAME_DURATION = 30;
const SPAWN_INTERVAL_MIN = 350;
const SPAWN_INTERVAL_MAX = 700;
const HEART_EMOJIS = ["❤️", "💖", "💗", "💕", "💝", "💘", "💓", "💞", "💟"];

const SCORE_TIERS = [
  { min: 0, max: 5, msg: "Keep trying! My heart is hard to catch! 💫" },
  { min: 6, max: 15, msg: "Not bad! You've got some love in those hands! 💕" },
  { min: 16, max: 25, msg: "Wow, you're a real heart catcher! 💖" },
  { min: 26, max: Infinity, msg: "VALENTINE CHAMPION! You caught ALL the love! 👑💝" },
];

function CatchTheHearts({ onClose }) {
  const [gameState, setGameState] = useState("playing");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hearts, setHearts] = useState([]);
  const nextId = useRef(0);
  const gameAreaRef = useRef(null);
  const containerRef = useRef(null);

  /* ---- Countdown timer ---- */
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  /* ---- End game when time runs out ---- */
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      setGameState("results");
      setHearts([]);
    }
  }, [timeLeft, gameState]);

  /* ---- Spawn hearts ---- */
  useEffect(() => {
    if (gameState !== "playing") return;

    let active = true;
    let timeout;

    const spawnHeart = () => {
      if (!active) return;

      const id = nextId.current++;
      const x = 5 + Math.random() * 82;
      const duration = 2.2 + Math.random() * 2.8;
      const size = 30 + Math.random() * 18;
      const emoji =
        HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      const fallDistance = gameAreaRef.current?.clientHeight || 550;

      setHearts((prev) => [
        ...prev,
        { id, x, duration, size, emoji, fallDistance, caught: false },
      ]);

      const nextDelay =
        SPAWN_INTERVAL_MIN +
        Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
      timeout = setTimeout(spawnHeart, nextDelay);
    };

    timeout = setTimeout(spawnHeart, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [gameState]);

  /* ---- Catch a heart (with pop animation) ---- */
  const catchHeart = useCallback((id) => {
    setHearts((prev) =>
      prev.map((h) => (h.id === id ? { ...h, caught: true } : h))
    );
    setScore((s) => s + 1);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 200);
  }, []);

  /* ---- Heart missed (fell off screen) ---- */
  const missHeart = useCallback((id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  /* ---- Play again ---- */
  const playAgain = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHearts([]);
    nextId.current = 0;
    setGameState("playing");
  }, []);

  /* ---- Escape key closes ---- */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* ---- Focus trap ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstFocusable = container.querySelector("button");
    if (firstFocusable) firstFocusable.focus();

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      const focusableEls = container.querySelectorAll(
        'button, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableEls.length) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [gameState]);

  const getMessage = () =>
    SCORE_TIERS.find((t) => score >= t.min && score <= t.max)?.msg ||
    "Amazing! 💖";

  return (
    <div
      className="minigame-overlay"
      role="dialog"
      aria-label="Catch the Hearts minigame"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="minigame-container" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <button
          className="minigame-close"
          onClick={onClose}
          aria-label="Close minigame"
          type="button"
        >
          ×
        </button>

        {gameState === "playing" ? (
          <>
            <div className="minigame-hud">
              <div className="minigame-score" aria-live="polite" aria-atomic="true">
                💖 {score}
              </div>
              <div className="minigame-timer" role="timer" aria-label={`${timeLeft} seconds remaining`}>
                ⏱️ {timeLeft}s
              </div>
            </div>
            <div className="minigame-area" ref={gameAreaRef}>
              {hearts.map((heart) => (
                <button
                  key={heart.id}
                  className={`falling-heart${heart.caught ? " heart-caught" : ""}`}
                  style={{
                    "--heart-x": `${heart.x}%`,
                    "--heart-size": `${heart.size}px`,
                    "--heart-speed": `${heart.duration}s`,
                    "--heart-fall": `${heart.fallDistance + 60}px`,
                  }}
                  onClick={() => catchHeart(heart.id)}
                  onAnimationEnd={() => {
                    if (!heart.caught) missHeart(heart.id);
                  }}
                  aria-label="Catch this heart"
                  type="button"
                >
                  {heart.emoji}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="minigame-results">
            <h2 className="minigame-results-title">Time&apos;s Up! ⏰</h2>
            <div className="minigame-final-score">{score}</div>
            <p className="minigame-final-label">hearts caught</p>
            <p className="minigame-message">{getMessage()}</p>
            <div className="minigame-results-buttons">
              <button
                className="minigame-btn play-again"
                onClick={playAgain}
                type="button"
              >
                Play Again 🔄
              </button>
              <button
                className="minigame-btn close-game"
                onClick={onClose}
                type="button"
              >
                Close 💌
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatchTheHearts;
