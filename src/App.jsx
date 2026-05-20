import React, { useEffect, useMemo, useRef, useState } from "react";
import cardsData from "../map_relation_cards_data_v2.json";

const SLOT_LABELS = [
  {
    id: 1,
    title: "相手の中のあなた",
    summaryTitle: "今の距離感",
    icon: "♡",
    guide: "相手があなたをどう感じているか",
  },
  {
    id: 2,
    title: "今の関係の流れ",
    summaryTitle: "関係の流れ",
    icon: "〜",
    guide: "関係が動いているのか、整っているのか",
  },
  {
    id: 3,
    title: "これからの関わり方",
    summaryTitle: "これからのヒント",
    icon: "✧",
    guide: "どう関わると流れが整いやすいか",
  },
];

const STATE_COLORS = {
  A: "#12a992",
  U: "#2f9fe6",
  B: "#4f86cf",
  D: "#6f83b8",
  O: "#ef7f68",
  I: "#5b9ca8",
  S: "#6b9fdc",
  C: "#25b9a5",
};

const ATTRIBUTE_ICON = {
  MIND: "✦",
  DRIVE: "↗",
  EMOTION: "♡",
  THINKING: "〜",
  REALITY: "❧",
};

const ATTRIBUTE_IMAGE_SRC = {
  MIND: "/mind.png",
  EMOTION: "/emotion.png",
  DRIVE: "/drive.png",
  THINKING: "/thinking.png",
  REALITY: "/reality.png",
};

const ATTRIBUTE_DISPLAY_LABEL = {
  MIND: "状態",
  EMOTION: "感情",
  DRIVE: "行動",
  THINKING: "思考",
  REALITY: "現実",
};

function drawThreeCards() {
  const pool = [...cardsData];
  const result = [];

  for (let i = 0; i < 3; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    const card = pool.splice(index, 1)[0];
    const direction = Math.random() < 0.5 ? "upright" : "reversed";
    result.push({ card, direction, slot: SLOT_LABELS[i] });
  }

  return result;
}

function getReading(item) {
  return item.card[item.direction];
}

function makeHistoryItem(draw) {
  return {
    id: Date.now(),
    date: new Date().toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    draw,
  };
}

function ResultCard({ item, index }) {
  const reading = getReading(item);
  const stateColor = STATE_COLORS[reading.stateCode] || "#49b6c8";
  const attributeIcon = ATTRIBUTE_ICON[item.card.attribute] || "✦";

  return (
    <article className="result-card" style={{ "--state-color": stateColor }}>
      <div className="number-badge">{index + 1}</div>
      <h3>{item.slot.title}</h3>
      <p className="slot-guide">{item.slot.guide}</p>

      <div className="attribute-line">
        <span>{ATTRIBUTE_DISPLAY_LABEL[item.card.attribute] || item.card.attributeLabel}</span>
        <span>|</span>
        <span>{item.card.attribute}</span>
      </div>

      <div className="card-visual">
 <img
  src={ATTRIBUTE_IMAGE_SRC[item.card.attribute]}
  alt={item.card.attribute}
  className="card-visual-image"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    borderRadius: "24px",
  }}
/>
</div>

      <p className="card-no">No.{String(item.card.numberInAttribute).padStart(2, "0")}</p>
      <h4>{reading.title}</h4>
      <p className="card-comment">{reading.comment}</p>

      <div className="state-pill">
        <span className="state-dot" />
        {reading.stateCode}｜{reading.stateLabel}
      </div>
    </article>
  );
}

function SummaryFlow({ draw }) {
  return (
    <section className="summary-section">
      <div className="section-title-row">
        <span>〜</span>
        <h2>総合リーディング</h2>
        <span>〜</span>
      </div>

      <div className="flow-list">
        {draw.map((item, index) => {
          const reading = getReading(item);
          const stateColor = STATE_COLORS[reading.stateCode] || "#49b6c8";
          return (
            <div className="flow-item" key={`${item.card.id}-${index}`} style={{ "--state-color": stateColor }}>
              <div className="flow-icon">{item.slot.icon}</div>
              <div className="flow-text">
                <h3>{item.slot.summaryTitle}</h3>
                <p>{reading.comment}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="notice">
        この観測は、未来や相手の気持ちを断定するものではありません。今の関係に出ている距離感・反応・流れを整理するためのヒントとしてご覧ください。
      </p>
    </section>
  );
}

function HistoryPanel({ history, onRestore, onClear }) {
  if (!history.length) {
    return <p className="empty-history">まだ履歴はありません。</p>;
  }

  return (
    <div className="history-list">
      {history.map((item) => (
        <button className="history-item" key={item.id} onClick={() => onRestore(item.draw)}>
          <span>{item.date}</span>
          <strong>
            {item.draw.map((drawItem) => getReading(drawItem).stateCode).join(" / ")}
          </strong>
        </button>
      ))}
      <button className="clear-history" onClick={onClear}>履歴をクリア</button>
    </div>
  );
}

export default function App() {
  const [draw, setDraw] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mapRelationV2History") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState("reading");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const bgmRef = useRef(null);
  const observeSoundRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("mapRelationV2History", JSON.stringify(history.slice(0, 12)));
  }, [history]);

  useEffect(() => {
    if (!bgmRef.current) return;
    bgmRef.current.volume = 0.18;
    bgmRef.current.loop = true;
  }, []);

  useEffect(() => {
    if (!observeSoundRef.current) return;
    observeSoundRef.current.volume = 0.38;
  }, []);

  const playObserveSound = () => {
    if (!soundEnabled || !observeSoundRef.current) return;
    observeSoundRef.current.currentTime = 0;
    observeSoundRef.current.play().catch(() => {});
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);

    if (!bgmRef.current) return;

    if (next) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
  }; 

  const stateLine = useMemo(() => {
    if (!draw) return "";
    return draw.map((item) => getReading(item).stateLabel).join(" ・ ");
  }, [draw]);

  const observeAgain = () => {
    playObserveSound();
    const nextDraw = drawThreeCards();
    setDraw(nextDraw);
    setHistory((prev) => [makeHistoryItem(nextDraw), ...prev].slice(0, 12));
    setActiveTab("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restoreHistory = (historyDraw) => {
    setDraw(historyDraw);
    setActiveTab("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <main className="phone-frame">
        <audio ref={bgmRef} src="/sounds/bgm_relation_v2.mp3" preload="auto" />
        <audio ref={observeSoundRef} src="/sounds/sound_observe.mp3" preload="auto" />
        <header className="app-header">
          <button className="round-button" aria-label="メニュー">☰</button>
          <div>
            <h1>MAP Relation Model v2</h1>
            <p>気になるあの人との距離感を、やさしく観測</p>
          </div>
          <button
            className={`round-button ${soundEnabled ? "sound-on" : ""}`}
            aria-label={soundEnabled ? "音をオフ" : "音をオン"}
            onClick={toggleSound}
          >
            {soundEnabled ? "♪" : "♩"}
          </button>
        </header>

        <section className="hero-question">
          <p>あの人は今、あなたとの関係をどう感じている？</p>
        </section>

        {activeTab === "reading" && (
          <>
            {!draw ? (
              <section className="start-panel">
                <div className="start-stream" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <h2>今の関係の流れを観測します</h2>
                <p>
                  「あの人は今、あなたとの関係をどう感じている？」と心の中でそっと問いかけてから、観測ボタンを押してください。
                </p>
                <button className="primary-button" onClick={observeAgain}>
                  <span>✦</span>
                  観測をはじめる
                  <span>›</span>
                </button>
              </section>
            ) : (
              <>
                <section className="cards-grid">
                  {draw.map((item, index) => (
                    <ResultCard key={`${item.card.id}-${item.direction}-${index}`} item={item} index={index} />
                  ))}
                </section>

                <div className="state-line">今回の流れ：{stateLine}</div>

                <SummaryFlow draw={draw} />

                <button className="primary-button" onClick={observeAgain}>
                  <span>✦</span>
                  もう一度観測する
                  <span>›</span>
                </button>
              </>
            )}
          </>
        )}

        {activeTab === "history" && (
          <section className="history-section">
            <h2>観測履歴</h2>
            <HistoryPanel
              history={history}
              onRestore={restoreHistory}
              onClear={() => setHistory([])}
            />
          </section>
        )}

        {activeTab === "favorite" && (
          <section className="simple-section">
            <h2>お気に入り</h2>
            <p>気になる観測結果を保存する機能は、次の更新候補です。</p>
          </section>
        )}

        {activeTab === "menu" && (
          <section className="simple-section">
            <h2>MAP Relation Model について</h2>
            <p>
              このアプリは、関係性の空気感・距離感・流れを整理するための状態観測ツールです。
              相手の気持ちや未来を断定するものではありません。
            </p>
          </section>
        )}

        <nav className="bottom-nav">
          <button className={activeTab === "reading" ? "active" : ""} onClick={() => setActiveTab("reading")}>
            <span>✦</span>リーディング
          </button>
          <button className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>
            <span>◷</span>履歴
          </button>
          <button className={activeTab === "favorite" ? "active" : ""} onClick={() => setActiveTab("favorite")}>
            <span>♡</span>お気に入り
          </button>
          <button className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}>
            <span>☰</span>メニュー
          </button>
        </nav>
      </main>

      <style>{`
        :root {
          font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
          color: #173e55;
          background: #dff6ff;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-height: 100vh;
          background:
            radial-gradient(circle at 15% 8%, rgba(255,255,255,0.95), transparent 26%),
            radial-gradient(circle at 90% 18%, rgba(179,236,255,0.6), transparent 28%),
            linear-gradient(160deg, #f7fdff 0%, #d9f5ff 44%, #cff4e9 100%);
        }

        button {
          font-family: inherit;
        }

        .app-shell {
          position: relative;
          min-height: 100vh;
          padding: 28px 14px;
          overflow: hidden;
        }

        .ambient {
          position: fixed;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(8px);
          opacity: 0.55;
        }

        .ambient-one {
          width: 360px;
          height: 360px;
          left: -140px;
          top: 120px;
          background: radial-gradient(circle, rgba(47,202,194,0.42), transparent 68%);
        }

        .ambient-two {
          width: 420px;
          height: 420px;
          right: -180px;
          bottom: 120px;
          background: radial-gradient(circle, rgba(67,174,238,0.42), transparent 68%);
        }

        .phone-frame {
          position: relative;
          max-width: 980px;
          margin: 0 auto;
          padding: 28px 22px 96px;
          border: 1px solid rgba(56, 174, 205, 0.42);
          border-radius: 38px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,253,255,0.9)),
            repeating-linear-gradient(145deg, rgba(50,174,214,0.075) 0 8px, transparent 8px 34px);
          box-shadow: 0 30px 86px rgba(40, 128, 165, 0.3);
          backdrop-filter: blur(20px);
        }

        .phone-frame::before {
          content: "";
          position: absolute;
          inset: 128px 0 auto;
          height: 240px;
          background: linear-gradient(115deg, transparent 10%, rgba(93, 190, 215, 0.11), transparent 60%);
          clip-path: ellipse(58% 34% at 50% 50%);
          pointer-events: none;
        }

        .app-header {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 48px 1fr 48px;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .app-header h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(1.65rem, 4vw, 2.5rem);
          letter-spacing: 0.04em;
          color: #087cc0;
        }

        .app-header p {
          margin: 8px 0 0;
          font-size: 0.95rem;
          color: #238fbe;
        }

        .round-button {
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 50%;
          color: #087cc0;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 8px 24px rgba(42, 139, 174, 0.22);
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .round-button:active {
          transform: scale(0.96);
        }

        .round-button.sound-on {
          color: white;
          background: linear-gradient(135deg, #65d3bb, #4bb5d5);
        }

        .hero-question {
          position: relative;
          z-index: 1;
          margin: 34px auto 26px;
          max-width: 720px;
          padding: 18px 22px;
          border-radius: 999px;
          text-align: center;
          color: #008eaa;
          font-weight: 800;
          letter-spacing: 0.08em;
          background: rgba(255,255,255,0.92);
          box-shadow: inset 0 0 0 1px rgba(55, 190, 214, 0.26), 0 18px 36px rgba(60, 158, 190, 0.18);
        }

        .cards-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-top: 16px;
        }

        .result-card {
          position: relative;
          min-height: 430px;
          padding: 30px 18px 20px;
          border-radius: 28px;
          border: 1px solid rgba(64, 184, 205, 0.34);
          background: rgba(255,255,255,0.92);
          box-shadow: 0 20px 42px rgba(56, 142, 174, 0.2);
          overflow: hidden;
        }

        .result-card::after {
          content: "";
          position: absolute;
          inset: auto -20px -40px;
          height: 120px;
          background: radial-gradient(circle, color-mix(in srgb, var(--state-color) 26%, transparent), transparent 66%);
          pointer-events: none;
        }

        .number-badge {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg, var(--state-color), #72c9ed);
          box-shadow: 0 8px 18px rgba(40, 146, 184, 0.38);
          font-weight: 700;
        }

        .result-card h3 {
          margin: 0;
          text-align: center;
          color: var(--state-color);
          font-size: 1.05rem;
        }

        .slot-guide {
          min-height: 34px;
          margin: 8px 0 14px;
          text-align: center;
          color: #526f7e;
          font-size: 0.74rem;
          line-height: 1.55;
        }

        .attribute-line {
          display: flex;
          justify-content: center;
          gap: 8px;
          color: var(--state-color);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.03em;
        }

        .card-visual {
          position: relative;
          display: grid;
          place-items: center;
          height: 110px;
          margin: 16px 0 10px;
          border-radius: 24px;
          color: white;
          font-size: 2.7rem;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(58,212,205,0.72), rgba(72,169,233,0.6));
          box-shadow: inset 0 0 28px rgba(255,255,255,0.55), 0 10px 22px rgba(64, 156, 186, 0.16);
        }

        .card-visual::before,
        .card-visual::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .card-visual::before {
          opacity: 0.9;
        }

        .card-visual::after {
          background-image:
            radial-gradient(circle at 18% 22%, rgba(255,255,255,0.92) 0 1.5px, transparent 2px),
            radial-gradient(circle at 72% 18%, rgba(255,255,255,0.82) 0 1.5px, transparent 2px),
            radial-gradient(circle at 84% 74%, rgba(255,255,255,0.76) 0 1.5px, transparent 2px),
            radial-gradient(circle at 35% 82%, rgba(255,255,255,0.72) 0 1px, transparent 1.5px);
          opacity: 0.9;
        }

        .visual-symbol {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 0 14px rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.18);
          box-shadow: inset 0 0 22px rgba(255,255,255,0.35);
        }

        .image-emotion {
          background: linear-gradient(145deg, #9ef3e9, #28c8df 52%, #bff0c8);
        }

        .image-emotion::before {
          background:
            radial-gradient(circle at 50% 44%, rgba(255,255,255,0.92) 0 21%, transparent 22%),
            radial-gradient(circle at 39% 37%, rgba(255,255,255,0.9) 0 17%, transparent 18%),
            radial-gradient(circle at 61% 37%, rgba(255,255,255,0.9) 0 17%, transparent 18%),
            radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.28) 0 45%, transparent 46%),
            linear-gradient(160deg, transparent 0 45%, rgba(255,255,255,0.36) 46% 50%, transparent 51% 100%);
          clip-path: polygon(50% 82%, 15% 44%, 28% 20%, 50% 33%, 72% 20%, 85% 44%);
          transform: scale(1.1);
        }

        .image-mind {
          background: linear-gradient(145deg, #c8f0ff, #39aeea 56%, #e4fbff);
        }

        .image-mind::before {
          background:
            radial-gradient(ellipse at 72% 20%, rgba(255,255,255,0.55), transparent 35%),
            repeating-radial-gradient(ellipse at 18% 72%, rgba(255,255,255,0.58) 0 8px, transparent 9px 20px),
            linear-gradient(135deg, transparent 0 28%, rgba(255,255,255,0.52) 29% 36%, transparent 37% 100%);
          transform: skewY(-8deg) scale(1.18);
        }

        .image-drive {
          background: linear-gradient(145deg, #ffd2b0, #ff9f5f 52%, #ffe783);
        }

        .image-drive::before {
          background:
            linear-gradient(128deg, transparent 0 28%, rgba(255,255,255,0.38) 29% 35%, transparent 36% 100%),
            linear-gradient(128deg, transparent 0 42%, rgba(255,255,255,0.58) 43% 49%, transparent 50% 100%),
            linear-gradient(128deg, transparent 0 56%, rgba(255,255,255,0.48) 57% 63%, transparent 64% 100%);
          clip-path: polygon(8% 84%, 62% 20%, 92% 10%, 76% 32%, 98% 28%, 70% 48%, 48% 78%);
          transform: scale(1.05);
        }

        .image-thinking {
          background: linear-gradient(145deg, #cbd3ff, #9f85f6 48%, #efdcff);
        }

        .image-thinking::before {
          background:
            radial-gradient(circle at 50% 62%, rgba(255,255,255,0.82) 0 3px, transparent 4px),
            radial-gradient(circle at 28% 35%, rgba(255,255,255,0.7) 0 2.5px, transparent 3.5px),
            radial-gradient(circle at 72% 35%, rgba(255,255,255,0.7) 0 2.5px, transparent 3.5px),
            repeating-radial-gradient(ellipse at 50% 62%, transparent 0 18px, rgba(255,255,255,0.32) 19px 21px, transparent 22px 42px),
            linear-gradient(35deg, transparent 0 40%, rgba(255,255,255,0.42) 41% 43%, transparent 44% 100%);
          transform: scale(1.16);
        }

        .image-reality {
          background: linear-gradient(145deg, #d6ffba, #48ceb0 48%, #c7ef8d);
        }

        .image-reality::before {
          background:
            radial-gradient(ellipse at 54% 40%, rgba(255,255,255,0.75) 0 14%, transparent 15%),
            radial-gradient(ellipse at 42% 52%, rgba(255,255,255,0.7) 0 10%, transparent 11%),
            radial-gradient(ellipse at 62% 62%, rgba(255,255,255,0.66) 0 9%, transparent 10%),
            linear-gradient(115deg, transparent 0 47%, rgba(255,255,255,0.74) 48% 50%, transparent 51% 100%);
          clip-path: polygon(49% 90%, 49% 22%, 54% 22%, 54% 90%, 100% 90%, 100% 100%, 0 100%, 0 90%);
          transform: rotate(-5deg) scale(1.12);
        }

        .visual-drive { background: linear-gradient(145deg, rgba(95, 211, 196, 0.48), rgba(149, 208, 237, 0.34)); }
        .visual-emotion { background: linear-gradient(145deg, rgba(92, 224, 219, 0.5), rgba(111, 191, 236, 0.36)); }
        .visual-thinking { background: linear-gradient(145deg, rgba(127, 201, 242, 0.5), rgba(209, 244, 255, 0.58)); }
        .visual-reality { background: linear-gradient(145deg, rgba(110, 222, 182, 0.5), rgba(198, 246, 226, 0.58)); }

        .card-no {
          margin: 0;
          text-align: center;
          color: #087cc0;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 700;
        }

        .result-card h4 {
          margin: 12px 0 8px;
          color: var(--state-color);
          text-align: center;
          font-size: 0.98rem;
        }

        .card-comment {
          margin: 0;
          color: #263f4d;
          font-size: 0.84rem;
          line-height: 1.8;
        }

        .state-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 16px auto 0;
          padding: 8px 14px;
          border-radius: 999px;
          color: var(--state-color);
          background: color-mix(in srgb, var(--state-color) 18%, white);
          font-weight: 700;
          font-size: 0.82rem;
        }

        .state-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--state-color);
        }

        .state-line {
          margin: 20px auto 0;
          padding: 12px 16px;
          width: fit-content;
          max-width: 100%;
          border-radius: 999px;
          color: #217c9d;
          background: rgba(255,255,255,0.88);
          font-size: 0.88rem;
        }

        .start-panel,
        .summary-section,
        .history-section,
        .simple-section {
          position: relative;
          z-index: 1;
          margin-top: 34px;
          padding: 26px;
          border-radius: 30px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(77, 190, 212, 0.32);
          box-shadow: 0 20px 50px rgba(54, 145, 178, 0.2);
        }

        .start-panel {
          display: grid;
          justify-items: center;
          text-align: center;
          gap: 18px;
          min-height: 380px;
          align-content: center;
        }

        .start-panel h2 {
          margin: 0;
          color: #087cc0;
          letter-spacing: 0.08em;
        }

        .start-panel p {
          max-width: 560px;
          margin: 0;
          color: #3f6374;
          line-height: 1.9;
        }

        .start-stream {
          position: relative;
          width: 190px;
          height: 110px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 22% 44%, rgba(255,255,255,0.95) 0 6px, transparent 7px),
            radial-gradient(circle at 52% 58%, rgba(255,255,255,0.9) 0 5px, transparent 6px),
            radial-gradient(circle at 78% 40%, rgba(255,255,255,0.88) 0 6px, transparent 7px),
            linear-gradient(135deg, rgba(43,205,180,0.52), rgba(35,159,215,0.46));
          box-shadow: inset 0 0 28px rgba(255,255,255,0.66), 0 18px 38px rgba(56,145,178,0.2);
          overflow: hidden;
        }

        .start-stream::before {
          content: "";
          position: absolute;
          inset: 22px -10px;
          border-radius: 50%;
          border-top: 3px solid rgba(255,255,255,0.72);
          transform: rotate(-8deg);
        }

        .start-stream span {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.88);
        }

        .start-stream span:nth-child(1) { left: 42px; top: 35px; }
        .start-stream span:nth-child(2) { left: 92px; top: 56px; }
        .start-stream span:nth-child(3) { left: 140px; top: 38px; }

        .section-title-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          color: #148bc8;
        }

        .section-title-row h2,
        .history-section h2,
        .simple-section h2 {
          margin: 0;
          text-align: center;
          color: #3d91c7;
          letter-spacing: 0.1em;
        }

        .flow-list {
          position: relative;
          display: grid;
          gap: 18px;
          margin-top: 22px;
        }

        .flow-list::before {
          content: "";
          position: absolute;
          left: -10px;
          top: 4px;
          bottom: 4px;
          width: 250px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 250 520' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='river' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%2327c7d9' stop-opacity='0.78'/%3E%3Cstop offset='48%25' stop-color='%235bbcf0' stop-opacity='0.68'/%3E%3Cstop offset='100%25' stop-color='%232fd0b4' stop-opacity='0.76'/%3E%3C/linearGradient%3E%3Cfilter id='soft'%3E%3CfeGaussianBlur stdDeviation='1.6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M68 4 C18 74, 210 102, 116 178 C38 241, 205 280, 82 358 C20 398, 62 470, 30 516' stroke='url(%23river)' stroke-width='62' fill='none' stroke-linecap='round' filter='url(%23soft)'/%3E%3Cpath d='M70 10 C26 78, 200 104, 116 176 C46 238, 190 282, 84 354 C26 396, 64 462, 36 510' stroke='white' stroke-opacity='0.52' stroke-width='18' fill='none' stroke-linecap='round'/%3E%3Cpath d='M78 28 C54 88, 176 118, 122 174 C78 222, 142 286, 98 346 C58 398, 70 452, 48 498' stroke='white' stroke-opacity='0.55' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3Ccircle cx='63' cy='65' r='3' fill='white' opacity='0.9'/%3E%3Ccircle cx='157' cy='170' r='2.5' fill='white' opacity='0.82'/%3E%3Ccircle cx='70' cy='322' r='3' fill='white' opacity='0.9'/%3E%3Ccircle cx='38' cy='460' r='2.6' fill='white' opacity='0.86'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: 100% 100%;
          opacity: 0.95;
          pointer-events: none;
        }

        .flow-list::after {
          content: "";
          position: absolute;
          left: 16px;
          top: 18px;
          bottom: 18px;
          width: 220px;
          background:
            radial-gradient(circle at 28% 13%, rgba(255,255,255,0.95) 0 3px, transparent 4px),
            radial-gradient(circle at 72% 36%, rgba(255,255,255,0.86) 0 2px, transparent 3px),
            radial-gradient(circle at 22% 65%, rgba(255,255,255,0.92) 0 3px, transparent 4px),
            radial-gradient(circle at 14% 88%, rgba(255,255,255,0.82) 0 2px, transparent 3px);
          pointer-events: none;
          opacity: 0.9;
        }

        .flow-item {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 16px;
          align-items: center;
          padding: 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.92);
          box-shadow: inset 0 0 0 1px rgba(58, 174, 204, 0.2), 0 10px 24px rgba(58, 145, 176, 0.12);
        }

        .flow-item:nth-child(1) {
          margin-left: 18px;
          margin-right: 0;
        }

        .flow-item:nth-child(2) {
          margin-left: 92px;
          margin-right: 0;
        }

        .flow-item:nth-child(3) {
          margin-left: 30px;
          margin-right: 0;
        }

        .flow-icon {
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg, var(--state-color), #39cfe2);
          font-size: 1.8rem;
          box-shadow: 0 12px 24px rgba(45, 151, 188, 0.34);
        }

        .flow-text h3 {
          margin: 0 0 8px;
          color: var(--state-color);
        }

        .flow-text p {
          margin: 0;
          color: #263f4d;
          line-height: 1.8;
          font-size: 0.92rem;
        }

        .notice {
          margin: 22px 0 0;
          color: #526f7e;
          line-height: 1.8;
          font-size: 0.86rem;
        }

        .primary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          width: min(420px, 92%);
          margin: 28px auto 0;
          padding: 16px 22px;
          border: 0;
          border-radius: 999px;
          color: white;
          background: linear-gradient(135deg, #20c6ad, #149bd6);
          box-shadow: 0 16px 32px rgba(42, 151, 190, 0.36);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
        }

        .history-list {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .history-item,
        .clear-history {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 14px 16px;
          border: 0;
          border-radius: 18px;
          background: rgba(255,255,255,0.74);
          color: #376174;
          cursor: pointer;
        }

        .history-item strong {
          color: #4aaec5;
        }

        .clear-history {
          justify-content: center;
          color: #7a95a3;
        }

        .empty-history,
        .simple-section p {
          color: #5b7685;
          line-height: 1.8;
        }

        .bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          width: min(760px, calc(100% - 28px));
          padding: 8px;
          border-radius: 24px;
          background: rgba(255,255,255,0.94);
          box-shadow: 0 14px 40px rgba(50, 131, 164, 0.28);
          backdrop-filter: blur(18px);
        }

        .bottom-nav button {
          display: grid;
          gap: 3px;
          justify-items: center;
          border: 0;
          border-radius: 18px;
          padding: 8px 6px;
          color: #5f7785;
          background: transparent;
          font-size: 0.72rem;
          cursor: pointer;
        }

        .bottom-nav button span {
          font-size: 1.25rem;
        }

        .bottom-nav button.active {
          color: #087cc0;
          background: rgba(43, 196, 214, 0.18);
        }

        @media (max-width: 820px) {
          .phone-frame {
            padding: 24px 14px 94px;
            border-radius: 28px;
          }

          .app-header {
            grid-template-columns: 40px 1fr 40px;
          }

          .round-button {
            width: 40px;
            height: 40px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .result-card {
            min-height: auto;
          }

          .flow-item {
            grid-template-columns: 58px 1fr;
            align-items: start;
            border-radius: 24px;
          }

          .flow-icon {
            width: 52px;
            height: 52px;
          }

          .flow-list::before {
            left: -28px;
            width: 180px;
          }

          .flow-list::after {
            left: -12px;
            width: 150px;
          }

          .flow-item:nth-child(1),
          .flow-item:nth-child(2),
          .flow-item:nth-child(3) {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
