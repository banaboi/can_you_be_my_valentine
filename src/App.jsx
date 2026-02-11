import { useEffect, useMemo, useState } from "react";
import gifUrl from "../mind-blown-shocked.gif";
import catUrl from "../cat.jpg";

const getSafeBounds = () => {
  const windowWidth = window.innerWidth - 90;
  const windowHeight = window.innerHeight - 55;
  const margin = 12;

  return {
    min: margin,
    maxX: Math.max(margin, windowWidth),
    maxY: Math.max(margin, windowHeight)
  };
};

function App() {
  const [accepted, setAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const { min, maxX, maxY } = getSafeBounds();
    const startX = Math.min(maxX, Math.max(min, Math.floor(window.innerWidth / 2) + 150));
    const startY = Math.min(maxY, Math.max(min, Math.floor(window.innerHeight / 2) + 10));
    setNoPosition({ x: startX, y: startY });
  }, []);

  const noButtonStyle = useMemo(
    () => ({
      left: `${noPosition.x}px`,
      top: `${noPosition.y}px`
    }),
    [noPosition]
  );

  const moveNoButton = () => {
    const { min, maxX, maxY } = getSafeBounds();
    const randomX = Math.floor(Math.random() * (maxX - min + 1)) + min;
    const randomY = Math.floor(Math.random() * (maxY - min + 1)) + min;
    setNoPosition({ x: randomX, y: randomY });
  };

  return (
    <main className="page">
      <div className="glow glowOne" />
      <div className="glow glowTwo" />
      <section className="card">
        <img src={catUrl} alt="Cute cat" className="catPhoto" />
        <h1 className="title">martina will you be my valentine</h1>

        {!accepted ? (
          <div className="buttonArea">
            <button type="button" className="yesButton" onClick={() => setAccepted(true)}>
              Yes
            </button>
          </div>
        ) : (
          <section className="success">
            <h2 className="yay">YAY!!! 🤯</h2>
            <img src={gifUrl} alt="Mind blown celebration" className="celebrationGif" />
          </section>
        )}
      </section>

      {!accepted ? (
        <button type="button" className="noButton" style={noButtonStyle} onMouseEnter={moveNoButton}>
          No
        </button>
      ) : null}
    </main>
  );
}

export default App;
