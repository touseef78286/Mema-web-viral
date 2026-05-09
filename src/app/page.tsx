"use client";

import { useMemo, useState } from "react";
import { FloatingSticker } from "@/components/FloatingSticker";
import { MemeRain } from "@/components/MemeRain";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [rainActive, setRainActive] = useState(false);

  const shareUrl = useMemo(() => {
    if (!id) return null;
    if (typeof window === "undefined") return `/message/${id}`;
    return `${window.location.origin}/message/${id}`;
  }, [id]);

  async function onGenerate() {
    setError(null);
    setId(null);

    if (!file) {
      setError("Pick an audio file first, legend.");
      return;
    }
    if (!password.trim()) {
      setError("Set a password. Keep it spicy.");
      return;
    }

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("password", password);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        throw new Error(json.error || "Upload failed.");
      }

      setId(json.id);
      setRainActive(true);
      window.setTimeout(() => setRainActive(false), 2200);
      setPassword("");
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something exploded.");
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <main className="notebook-page relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <MemeRain active={rainActive} />

      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <FloatingSticker
          src="/stickers/anime1.png"
          fallback="^_^"
          className="left-2 top-8 h-40 w-40 -rotate-12 sm:h-64 sm:w-64"
          floatClassName="animate-floaty manga-bg-sketch"
        />
        <FloatingSticker
          src="/stickers/anime2.png"
          fallback="!!!"
          className="right-0 top-10 h-40 w-40 rotate-10 sm:h-64 sm:w-64"
          floatClassName="animate-floaty manga-bg-sketch [animation-duration:3.9s]"
        />
        <FloatingSticker
          src="/stickers/anime3.png"
          fallback=">_<"
          className="bottom-8 left-8 h-36 w-36 rotate-[8deg] sm:h-56 sm:w-56"
          floatClassName="animate-floaty manga-bg-sketch [animation-duration:4.4s]"
        />
        <span className="ink-splatter right-[18%] bottom-[28%]" />
      </div>

      <section className="sketchy-card manga-paper-card w-full max-w-xl border-4 border-black bg-white p-2">
        <main className="scribble-card relative w-full bg-white p-6 text-black">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-marker text-4xl leading-none tracking-tight text-black">
                SECRET VOICE MESSAGE
              </h1>
              <p className="mt-2 font-marker text-lg text-black/70">
                Create a hand-written secret voice note.
              </p>
            </div>
            <div className="text-right font-marker text-sm text-black/70">
              <div className="inline-block border-2 border-black bg-[#fff7b8] px-3 py-1 shadow-[4px_4px_0_#000]">
                manga note
              </div>
            </div>
          </div>

          <div className="wobbly-note mt-8 border-4 border-dashed border-black bg-[#fffdf7] px-5 py-4 text-black shadow-[8px_8px_0_0_#000]">
            <h2 className="font-marker text-2xl text-black">CREATE YOUR OWN</h2>
            <p className="mt-2 font-marker text-lg text-black/70">
              Upload your own audio, lock it behind a password, and share the
              secret link.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="font-marker text-lg text-black">
                Upload audio (max 5MB)
              </span>
              <input
                type="file"
                accept="audio/*"
                className="sketchy-input w-full border-4 border-black bg-[#fffdf7] px-3 py-3 font-marker text-black file:mr-4 file:border-2 file:border-black file:bg-[#39ff14] file:px-3 file:py-2 file:font-marker file:text-black"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                disabled={busy}
              />
            </label>

            <label className="grid gap-2">
              <span className="font-marker text-lg text-black">
                Secret password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="something unguessable like: moneymaker420"
                className="sketchy-input w-full border-4 border-black bg-[#fffdf7] px-4 py-3 font-marker text-lg text-black outline-none focus:bg-[#f7ffb8]"
                disabled={busy}
              />
            </label>

            <button
              type="button"
              onClick={onGenerate}
              disabled={busy}
              className="btn-press wobbly-button border-4 border-black bg-[#39ff14] px-4 py-4 font-marker text-2xl text-black shadow-[8px_8px_0_0_#000] disabled:opacity-60"
            >
              {busy ? "DRAWING LINK..." : "GENERATE LINK"}
            </button>

            {error ? (
              <div className="wobbly-note border-4 border-black bg-[#ff7a7a] px-4 py-3 font-marker text-lg text-black shadow-[6px_6px_0_#000]">
                {error}
              </div>
            ) : null}

            {shareUrl ? (
              <div className="wobbly-note border-4 border-black bg-[#fffdf7] px-4 py-3 shadow-[8px_8px_0_0_#000]">
                <div className="font-marker text-lg text-black">
                  Your share link:
                </div>
                <div className="mt-2 break-all border-2 border-black bg-white px-3 py-2 font-marker text-sm text-black">
                  {shareUrl}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="btn-press flex-1 border-4 border-black bg-yellow-300 px-3 py-2 font-marker text-black shadow-[5px_5px_0_#000]"
                  >
                    COPY
                  </button>
                  <a
                    href={shareUrl}
                    className="btn-press flex-1 border-4 border-black bg-cyan-200 px-3 py-2 text-center font-marker text-black shadow-[5px_5px_0_#000]"
                  >
                    OPEN
                  </a>
                </div>
              </div>
            ) : null}

            <div className="pt-2 font-marker text-sm text-black/65">
              Bucket: <span className="font-bold">voice-notes</span> (public) •
              Password is stored hashed • Audio stays hidden until verified
            </div>
          </div>
        </main>
      </section>
    </main>
  );
}
