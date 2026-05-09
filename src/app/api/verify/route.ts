import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabaseServer";
import { MASTER_ID, MASTER_PASSWORD } from "@/lib/constants";

export const runtime = "nodejs";

const EXPIRES_AFTER_HOURS = 24;

type VerifyBody = {
  id?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyBody;
    const id = typeof body.id === "string" ? body.id : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Missing password." }, { status: 400 });
    }

    const supabase = supabaseServer();

    const res = await supabase
      .from("messages")
      .select("password_hash, audio_url, created_at")
      .eq("id", id)
      .single();

    if (res.error) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const createdAt = new Date(res.data.created_at);
    const ageMs = Date.now() - createdAt.getTime();
    const expired = Number.isFinite(ageMs)
      ? ageMs > EXPIRES_AFTER_HOURS * 60 * 60 * 1000
      : false;

    // Master record never expires.
    if (id !== MASTER_ID && expired) {
      // Don't allow unlock, and never send audio_url.
      return NextResponse.json(
        { error: "Expired (self-destructed)." },
        { status: 410 },
      );
    }

    if (id === MASTER_ID && password === MASTER_PASSWORD) {
      return NextResponse.json({ audioUrl: res.data.audio_url });
    }

    const ok = await bcrypt.compare(password, res.data.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Wrong password." }, { status: 401 });
    }

    // Crucial: only return audio URL after password matches.
    return NextResponse.json({ audioUrl: res.data.audio_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

