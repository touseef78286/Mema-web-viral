"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AD_URL, MASTER_ID } from "@/lib/constants";
import { MemeRain } from "@/components/MemeRain";
import { useAudioGain } from "@/lib/useAudioGain";

type VerifyResponse = {
  audioUrl?: string;
  error?: string;
};

const SKETCHES = [
  {
    src: "/stickers/anime1.png",
    alt: "Anime line sketch",
    className: "-left-10 top-10 h-44 w-44 -rotate-12 sm:h-64 sm:w-64",
  },
  {
    src: "/stickers/anime3.png",
    alt: "Anime expression sketch",
    className: "right-0 top-6 h-40 w-40 rotate-12 sm:-right-16 sm:h-72 sm:w-72",
  },
  {
    src: "/stickers/anime5.png",
    alt: "Notebook manga sketch",
    className:
      "bottom-4 left-2 h-44 w-44 rotate-6 sm:bottom-0 sm:left-20 sm:h-60 sm:w-60",
  },
  {
    src: "/stickers/anime6.png",
    alt: "Desk manga sketch",
    className: "bottom-10 right-8 h-36 w-36 -rotate-6 sm:h-56 sm:w-56",
  },
];

const DOODLES = [
  { text: "pencil", className: "left-[8%] top-[18%] text-3xl -rotate-12" },
  { text: "note", className: "right-[14%] top-[24%] text-3xl rotate-12" },
  { text: "!!!", className: "left-[17%] bottom-[23%] text-3xl -rotate-6" },
  { text: ">_<", className: "right-[11%] bottom-[18%] text-4xl rotate-6" },
  { text: "ink", className: "left-[47%] top-[10%] text-2xl -rotate-6" },
];

export default function HomePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [rainActive, setRainActive] = useState(false);
  const [rainKey, setRainKey] = useState(0);
  const [audioFinished, setAudioFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const connectAudioGain = useAudioGain(audioRef, 4);

  const isLocked = !audioUrl;
  const isListening = Boolean(audioUrl) && !audioFinished;
  const isFinished = Boolean(audioUrl) && audioFinished;

  async function onUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAudioFinished(false);

    if (!password.trim()) {
      setError("Password do warna vibes nahi milengi.");
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      return;
    }

    setBusy(true);
    try {
      await connectAudioGain();

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: MASTER_ID, password }),
      });
      const json = (await res.json()) as VerifyResponse;

      if (!res.ok || !json.audioUrl) {
        throw new Error(json.error || "Wrong password.");
      }

      setAudioUrl(json.audioUrl);
      setPassword("");
      setRainKey((key) => key + 1);
      setRainActive(true);
      window.setTimeout(() => setRainActive(false), 2200);

      // Redirect same-window after 1.5 s so the ad impression counts.
      // Audio keeps playing because the browser navigates away after the
      // redirect; the prank effect plays during the brief wait.
      window.setTimeout(() => {
        window.location.href = AD_URL;
      }, 1500);
    } catch (err) {
      setAudioUrl(null);
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      setError(err instanceof Error ? err.message : "Wrong password.");
    } finally {
      setBusy(false);
    }
  }

  function onClone() {
    window.open(AD_URL, "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      router.push("/create");
    }, 120);
  }



  useEffect(() => {
    if (!audioUrl) return;

    void (async () => {
      await connectAudioGain();
      await audioRef.current?.play().catch(() => {
        setError("Audio playback was blocked. Tap unlock again.");
      });
    })();
  }, [audioUrl, connectAudioGain]);

  // Popunder: open AD_URL in a new tab on the very first click anywhere on the
  // page. The { once: true } option auto-removes the listener after it fires,
  // so this happens exactly once per page load with no cleanup required.
  useEffect(() => {
    function handleFirstClick() {
      window.open(AD_URL, "_blank", "noopener,noreferrer");
    }
    document.addEventListener("click", handleFirstClick, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, []);

  return (
    <main className="notebook-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <MemeRain key={rainKey} active={rainActive} />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {SKETCHES.map((sketch) => (
          <Image
            key={sketch.src}
            src={sketch.src}
            alt={sketch.alt}
            width={320}
            height={320}
            className={`manga-bg-sketch absolute object-contain ${sketch.className}`}
            priority={sketch.src === "/stickers/anime1.png"}
          />
        ))}
        <span className="ink-splatter left-[12%] top-[42%]" />
        <span className="ink-splatter right-[17%] top-[58%] scale-75" />
        <span className="ink-splatter left-[62%] bottom-[16%] scale-50" />
        {DOODLES.map((item) => (
          <span
            key={item.text}
            className={`absolute animate-floaty select-none font-marker text-black/45 ${item.className}`}
          >
            {item.text}
          </span>
        ))}
      </div>

      <section className="manga-paper-card torn-paper-shadow taped-paper relative w-full max-w-2xl">
        <div className="torn-paper scribble-card relative bg-white px-6 py-10 text-black sm:px-10 sm:py-12">
          <audio
            ref={audioRef}
            className="hidden"
            autoPlay
            crossOrigin="anonymous"
            preload="metadata"
            src={audioUrl ?? undefined}
            onPlay={() => {
              void connectAudioGain();
            }}
            onEnded={() => setAudioFinished(true)}
          />

          {isLocked ? (
            <form
              onSubmit={onUnlock}
              className={`relative z-10 grid gap-5 ${shake ? "animate-shake" : ""}`}
            >
              <div className="text-center">
                <p className="font-marker text-lg uppercase tracking-[0.18em] text-black/65">
                  master receiver
                </p>
                <h1 className="marker-title mt-2 font-marker text-4xl leading-tight text-black sm:text-6xl">
                  SECRET VOICE MESSAGE
                </h1>
              </div>

              <label className="grid gap-4">
                <span className="pencil-label font-marker">
                  Secret password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                  placeholder="type it here..."
                  className="scribble-input w-full px-1 pb-4 pt-2 font-marker text-2xl text-black outline-none placeholder:text-black/35 disabled:opacity-60"
                />
              </label>

              {error ? (
                <p className="wobbly-note border-4 border-black bg-[#ff7a7a] px-4 py-3 font-marker text-lg text-black shadow-[6px_6px_0_#000]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="btn-press wobbly-button border-4 border-black bg-[#39ff14] px-5 py-5 font-marker text-3xl text-black shadow-[8px_8px_0_0_#000] transition hover:bg-[#ccff00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "CHECKING..." : "UNLOCK"}
              </button>

              <div className="mt-3 grid gap-4">
                <div className="scribble-or text-center font-marker text-xl text-black/55">
                  OR
                </div>
                <button
                  type="button"
                  onClick={onClone}
                  className="btn-press highlighter-clone-button px-5 py-6 font-marker text-3xl leading-tight text-black sm:text-5xl"
                >
                  CLONE THIS CHAOS (CREATE YOUR OWN)
                </button>
              </div>
            </form>
          ) : null}

          {isListening ? (
            <div className="relative z-10 grid min-h-[320px] place-items-center text-center">
              <p className="rotate-[-3deg] font-marker text-2xl uppercase tracking-[0.22em] text-black/55">
                LISTENING...
              </p>
            </div>
          ) : null}

          {isFinished ? (
            <div className="relative z-10 grid min-h-[320px] place-items-center">
              <button
                type="button"
                onClick={onClone}
                className="btn-press highlighter-clone-button px-5 py-8 font-marker text-4xl leading-tight text-black sm:text-6xl"
              >
                CLONE THIS CHAOS (CREATE YOUR OWN)
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
