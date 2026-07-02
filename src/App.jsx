import React, { useMemo, useRef, useState } from "react";
import "./App.css";

const GOOGLE_REVIEW_URL = "https://g.page/r/CQQNSFTPqWbqEBM/review";

const prizes = [
  { label: "🌸 Parfum offert", probability: 20 },
  { label: "🧴 Boîte de cire offerte", probability: 15 },
  { label: "🧴 Boîte de gel offerte", probability: 15 },
  { label: "❤️ Merci pour votre soutien, à la prochaine !", probability: 50 },
];

function pickPrize() {
  const total = prizes.reduce((sum, prize) => sum + prize.probability, 0);
  let random = Math.random() * total;

  for (const prize of prizes) {
    random -= prize.probability;
    if (random <= 0) return prize;
  }

  return prizes[0];
}

export default function App() {
  const [step, setStep] = useState("start");
  const [hasClickedReview, setHasClickedReview] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [canPlay, setCanPlay] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [alreadyPlayed, setAlreadyPlayed] = useState(() => {
    return localStorage.getItem("alreadyPlayed") === "true";
  });

  const playedRef = useRef(false);

  const colors = useMemo(
    () => ["#000000", "#333333", "#666666", "#999999"],
    []
  );

  const handleReviewClick = () => {
    setShowModal(true);
  };

  const handleConfirmReview = () => {
    setShowModal(false);
    setHasClickedReview(true);
    window.open(GOOGLE_REVIEW_URL, "_blank");

    let seconds = 10;
    setCountdown(seconds);
    setCanPlay(false);

    const timer = setInterval(() => {
      seconds--;
      setCountdown(seconds);

      if (seconds <= 0) {
        clearInterval(timer);
        setCanPlay(true);
      }
    }, 1000);
  };

  const handleCancelReview = () => {
    setShowModal(false);
  };

  const handleSpin = () => {
    if (alreadyPlayed || playedRef.current || isSpinning) return;

    const prize = pickPrize();
    const prizeIndex = prizes.findIndex((p) => p.label === prize.label);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 - prizeIndex * segmentAngle - segmentAngle / 2;
    const spins = 5 * 360;
    const finalRotation = rotation + spins + targetAngle;

    playedRef.current = true;
    setIsSpinning(true);
    setRotation(finalRotation);

    setTimeout(() => {
      setResult(prize);
      setIsSpinning(false);
      setStep("result");

      localStorage.setItem("alreadyPlayed", "true");
      setAlreadyPlayed(true);
    }, 4000);
  };

  // Bloque accès si déjà joué
  if (alreadyPlayed && step !== "result") {
    return (
      <div className="app-container">
        <header className="header">
          <h1>✂️ BEST BARBER SHOP ✂️</h1>
          <p className="header-subtitle">Votre salon de barbier de référence</p>
        </header>

        <div className="main-content">
          <div className="content-section blocked-message">
            <h2>🎁 Merci !</h2>
            <p>Vous avez déjà participé à la roue de la chance.</p>
            <p style={{ marginTop: "20px", color: "#777" }}>
              À très bientôt au salon !
            </p>
          </div>
        </div>

        <footer className="footer">
          <p>© 2026 Best Barber Shop - Votre style, notre passion</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>✂️ BEST BARBER SHOP ✂️</h1>
        <p className="header-subtitle">Roue de la chance - Laissez un avis et gagnez !</p>
      </header>

      <div className="main-content">
        {step === "start" && (
          <div className="content-section">
            <h2>🎯 Participez à notre roue !</h2>
            <p>
              Vous avez apprécié votre visite ? Laissez-nous un avis Google
              honnête et tentez de remporter l'un de nos lots !
            </p>

            <div style={{ marginTop: "30px" }}>
              <button onClick={handleReviewClick}>
                ⭐ Laisser un avis Google
              </button>

              <br />

              <button
                disabled={!canPlay}
                onClick={() => setStep("wheel")}
              >
                {canPlay
                  ? "🎯 J'ai laissé mon avis, jouer !"
                  : `⏳ Disponible dans ${countdown}s`}
              </button>
            </div>
          </div>
        )}

        {step === "wheel" && (
          <div className="content-section">
            <h2>🎪 Tournez la roue !</h2>
            <p>Bonne chance ! 🍀</p>

            <div className="wheel-container">
              <div className="wheel-wrapper">
                <div
                  className="wheel"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(${prizes
                      .map((_, i) => {
                        const start = (i * 360) / prizes.length;
                        const end = ((i + 1) * 360) / prizes.length;
                        return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                      })
                      .join(",")})`,
                  }}
                />
              </div>

              <button onClick={handleSpin} disabled={isSpinning}>
                {isSpinning ? "⏳ Ça tourne..." : "🎯 TOURNER LA ROUE"}
              </button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="content-section result-container">
            <h2>🎉 Félicitations !</h2>
            <div className="prize">{result.label}</div>
            <p className="instructions">
              📱 Montrez cet écran à la caisse pour valider votre prix.
            </p>
            <p style={{ color: "#999", fontSize: "0.95rem", marginTop: "20px" }}>
              Merci pour votre confiance !
            </p>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>© 2026 Best Barber Shop - Votre style, notre passion</p>
      </footer>

      {showModal && (
        <div className="modal-overlay" onClick={handleCancelReview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📋 Laisser un avis</h2>
            <p>Merci de prendre un moment pour partager votre expérience !</p>
            <p style={{ fontSize: "0.95rem", color: "#777" }}>
              Votre avis honnête nous aide à améliorer nos services et à remercier nos clients fidèles.
            </p>
            <div className="modal-actions">
              <button className="modal-button" onClick={handleConfirmReview}>
                ✅ Oui, laisser un avis
              </button>
              <button className="modal-button secondary" onClick={handleCancelReview}>
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}