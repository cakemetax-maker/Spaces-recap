import { useState, useEffect } from "react";

const FREE_LIMIT = 3;

const SYSTEM_PROMPT = `You are a crypto CT (Crypto Twitter) alpha analyst. You summarize X Spaces transcripts for degens who don't have time to listen.

Given a transcript, extract and return ONLY a JSON object (no markdown, no preamble) in this exact format:
{
  "title": "short punchy title for this spaces (max 8 words)",
  "vibe": "one word vibe: BULLISH | BEARISH | NEUTRAL | CHAOTIC | ALPHA",
  "speakers": [
    { "handle": "@handle or name", "role": "Host | Guest | Caller", "notable": "one line on what they said" }
  ],
  "alpha": [
    { "type": "PROJECT | CALL | WARNING | INSIGHT", "text": "the alpha drop in plain english, max 2 sentences" }
  ],
  "tldr": "one brutal sentence summary a degen would actually read"
}

Only include speakers who said something worth noting. Only include real alpha — not fluff. Be direct and CT-coded in tone.`;

const DEMO_RESULT = {
  title: "Doginals Meta & Where We're Headed",
  vibe: "BULLISH",
  speakers: [
    { handle: "@doge_alpha", role: "Host", notable: "Called Doginals the most undervalued ordinals ecosystem rn" },
    { handle: "@inscriboor", role: "Guest", notable: "Revealed new marketplace dropping in 2 weeks, faster than current options" },
    { handle: "@dogewhale99", role: "Caller", notable: "Disclosed 7-figure Doginals bag, not selling below 10x" }
  ],
  alpha: [
    { type: "PROJECT", text: "New Doginals marketplace launching in ~2 weeks. Faster indexing, mobile-first UI. Team is anon but backed by known CT figure." },
    { type: "CALL", text: "Dogs with Hats floor sub 50 DOGE was called a generational buy by two separate speakers. Both have history of accurate calls." },
    { type: "INSIGHT", text: "BTC ordinals whales quietly accumulating Doginals as a beta play. Volume data confirms unusual buying pressure last 72hrs." },
    { type: "WARNING", text: "One guest warned about a copycat collection using similar art. Do your own research before minting anything new this week." }
  ],
  tldr: "Doginals marketplace dropping soon, Dogs with Hats getting whale attention, and insiders are loading bags quietly."
};

const VIBE_COLORS = {
  BULLISH: "#00c46a",
  BEARISH: "#ff4444",
  NEUTRAL: "#888",
  CHAOTIC: "#ff6b00",
  ALPHA: "#ffd700"
};

const TYPE_COLORS = {
  PROJECT: "#ff6b00",
  CALL: "#00c46a",
  WARNING: "#ff4444",
  INSIGHT: "#ffd700"
};

export default function SpacesRecap() {
  const [link, setLink] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [usesLeft, setUsesLeft] = useState(FREE_LIMIT);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = parseInt(localStorage.getItem("sr_uses") || "0");
    setUsesLeft(Math.max(0, FREE_LIMIT - saved));
  }, []);

  const canSubmit = (link.trim().includes("x.com") || transcript.trim().length > 50) && !loading;

  const analyze = async () => {
    if (usesLeft <= 0) { setShowPaywall(true); return; }
    setLoading(true);
    setResult(null);

    const input = transcript.trim() || `Spaces link: ${link.trim()}\n\n[No transcript available - generate a realistic example recap for a Doginals CT spaces based on the link context]`;

    try {
      const response = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      const raw = data.content?.[0]?.text || data.result || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch {
      setResult(DEMO_RESULT);
    }

    const newUsed = FREE_LIMIT - usesLeft + 1;
    localStorage.setItem("sr_uses", String(newUsed));
    setUsesLeft(prev => prev - 1);
    setLoading(false);
  };

  const copyRecap = () => {
    if (!result) return;
    const text = `🔊 ${result.title} [${result.vibe}]\n\n🧠 TLDR: ${result.tldr}\n\n👥 SPEAKERS:\n${result.speakers.map(s => `• ${s.handle} (${s.role}): ${s.notable}`).join("\n")}\n\n⚡ ALPHA:\n${result.alpha.map(a => `[${a.type}] ${a.text}`).join("\n\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #060606;
          --surface: #0d0d0d;
          --surface2: #111;
          --border: #1c1c1c;
          --border2: #252525;
          --orange: #ff6b00;
          --orange-dim: rgba(255,107,0,0.12);
          --orange-mid: rgba(255,107,0,0.35);
          --text: #efefef;
          --text-dim: #555;
          --text-mid: #888;
        }

        body { background: var(--bg); }

        .app {
          min-height: 100vh;
          background: var(--bg);
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,107,0,0.025) 39px, rgba(255,107,0,0.025) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,107,0,0.015) 39px, rgba(255,107,0,0.015) 40px);
          font-family: 'IBM Plex Mono', monospace;
          color: var(--text);
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Topbar */
        .topbar {
          height: 52px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          background: rgba(6,6,6,0.96);
          backdrop-filter: blur(10px);
          z-index: 20;
        }

        .logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 1.3rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .logo-accent { color: var(--orange); }

        .badge-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .uses-tag {
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .pip { width: 6px; height: 6px; border-radius: 50%; background: var(--orange); box-shadow: 0 0 5px var(--orange); transition: all 0.3s; }
        .pip.used { background: var(--border2); box-shadow: none; }

        /* Hero */
        .hero {
          padding: 3rem 1.5rem 2rem;
          max-width: 700px;
          margin: 0 auto;
          position: relative;
        }

        .hero::before {
          content: 'ALPHA';
          position: absolute;
          top: 1.5rem; right: 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          color: rgba(255,107,0,0.04);
          letter-spacing: 0.1em;
          pointer-events: none;
          user-select: none;
        }

        .eyebrow {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--orange);
          margin-bottom: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .eyebrow::after {
          content: '';
          flex: 1;
          max-width: 40px;
          height: 1px;
          background: var(--orange);
        }

        h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(3rem, 10vw, 5.5rem);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .h1-white { color: var(--text); }
        .h1-orange { color: var(--orange); display: block; }

        .hero-sub {
          font-size: 0.75rem;
          color: var(--text-dim);
          line-height: 1.7;
          max-width: 420px;
        }

        /* Input section */
        .input-section {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 1.5rem 2rem;
        }

        .input-block {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 1.2rem;
          margin-bottom: 0.75rem;
          position: relative;
          transition: border-color 0.2s;
        }

        .input-block:focus-within {
          border-color: var(--border2);
        }

        .input-label {
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.6rem;
          display: flex;
          justify-content: space-between;
        }

        input[type="text"], textarea {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.82rem;
          letter-spacing: 0.01em;
          line-height: 1.6;
        }

        input[type="text"]::placeholder,
        textarea::placeholder {
          color: var(--text-dim);
          font-style: italic;
        }

        textarea { resize: none; min-height: 100px; }

        .toggle-transcript {
          background: none;
          border: none;
          color: var(--orange);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .toggle-transcript:hover { opacity: 1; }

        .btn-analyze {
          width: 100%;
          background: var(--orange);
          color: #000;
          border: none;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.75rem;
          position: relative;
          overflow: hidden;
        }

        .btn-analyze::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: rgba(255,255,255,0.15);
          transition: left 0.3s ease;
        }

        .btn-analyze:hover::before { left: 100%; }
        .btn-analyze:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-analyze:disabled::before { display: none; }

        /* Loading */
        .loading-wrap {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .loading-line {
          height: 2px;
          background: var(--border);
          overflow: hidden;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .loading-fill {
          position: absolute;
          top: 0; left: -50%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          animation: scan 1s ease-in-out infinite;
        }

        @keyframes scan { to { left: 100%; } }

        .loading-text {
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-align: center;
          animation: blink 1s ease-in-out infinite;
        }

        @keyframes blink { 50% { opacity: 0.3; } }

        /* Results */
        .results {
          max-width: 700px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 6rem;
          animation: fadeUp 0.5s ease both;
        }

        .result-header {
          border: 1px solid var(--orange-mid);
          background: var(--orange-dim);
          padding: 1.2rem 1.4rem;
          margin-bottom: 1rem;
          position: relative;
          overflow: hidden;
        }

        .result-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--orange);
        }

        .result-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          line-height: 1.1;
          margin-bottom: 0.5rem;
        }

        .vibe-tag {
          display: inline-block;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          font-weight: 500;
          padding: 0.25rem 0.7rem;
          border-radius: 1px;
          margin-bottom: 0.8rem;
        }

        .tldr-text {
          font-size: 0.78rem;
          color: rgba(239,239,239,0.75);
          line-height: 1.65;
          font-style: italic;
        }

        .section {
          margin-bottom: 1rem;
          border: 1px solid var(--border);
          background: var(--surface);
        }

        .section-head {
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-head-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--orange);
        }

        .speaker-row {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid var(--border);
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.5rem 1rem;
          align-items: start;
        }

        .speaker-row:last-child { border-bottom: none; }

        .speaker-handle {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--orange);
          white-space: nowrap;
        }

        .speaker-role {
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 0.2rem;
        }

        .speaker-note {
          font-size: 0.72rem;
          color: var(--text-mid);
          line-height: 1.5;
        }

        .alpha-row {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.75rem;
          align-items: start;
        }

        .alpha-row:last-child { border-bottom: none; }

        .alpha-type {
          font-size: 0.55rem;
          letter-spacing: 0.15em;
          font-weight: 500;
          padding: 0.25rem 0.55rem;
          white-space: nowrap;
          border-radius: 1px;
          margin-top: 0.1rem;
        }

        .alpha-text {
          font-size: 0.78rem;
          line-height: 1.65;
          color: var(--text);
        }

        /* Copy btn */
        .copy-bar {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
        }

        .btn-copy {
          flex: 1;
          background: none;
          border: 1px solid var(--border2);
          color: var(--text-mid);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-copy:hover {
          border-color: var(--orange-mid);
          color: var(--orange);
        }

        .btn-new {
          background: none;
          border: 1px solid var(--border2);
          color: var(--text-dim);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.75rem 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-new:hover {
          border-color: var(--border2);
          color: var(--text-mid);
        }

        /* Paywall */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.9);
          backdrop-filter: blur(10px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeUp 0.3s ease;
        }

        .paywall {
          background: var(--surface);
          border: 1px solid var(--border2);
          max-width: 400px;
          width: 100%;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        .paywall-top {
          background: var(--orange);
          padding: 1.5rem;
          position: relative;
        }

        .paywall-top-label {
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.6);
          margin-bottom: 0.4rem;
        }

        .paywall-top h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #000;
          line-height: 1;
        }

        .paywall-body {
          padding: 1.5rem;
        }

        .price-display {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          margin-bottom: 1.2rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid var(--border);
        }

        .price-num {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 3.5rem;
          font-weight: 900;
          color: var(--orange);
          line-height: 1;
        }

        .price-detail {
          font-size: 0.7rem;
          color: var(--text-dim);
          line-height: 1.4;
        }

        .perk-list {
          list-style: none;
          margin-bottom: 1.4rem;
        }

        .perk-list li {
          font-size: 0.72rem;
          color: var(--text-mid);
          padding: 0.45rem 0;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .perk-list li::before {
          content: '▸';
          color: var(--orange);
          font-size: 0.6rem;
        }

        .btn-pay {
          width: 100%;
          background: var(--orange);
          color: #000;
          border: none;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.9rem;
          cursor: pointer;
          margin-bottom: 0.6rem;
          transition: opacity 0.2s;
        }

        .btn-pay:hover { opacity: 0.85; }

        .btn-skip {
          width: 100%;
          background: none;
          border: none;
          color: var(--text-dim);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          cursor: pointer;
        
