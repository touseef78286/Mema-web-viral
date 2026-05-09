import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { supabaseServer } from "@/lib/supabaseServer";
import { MAX_AUDIO_BYTES, STORAGE_BUCKET } from "@/lib/constants";

export const runtime = "nodejs";

function safeExt(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return "bin";
  const ext = name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "bin";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const password = form.get("password");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
    }
    if (typeof password !== "string" || password.trim().length < 1) {
      return NextResponse.json({ error: "Missing password." }, { status: 400 });
    }
    if (file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 413 },
      );
    }

    const id = randomUUID();
    const ext = safeExt(file.name);
    const objectPath = `${id}/secret.${ext}`;
    const contentType = file.type || "application/octet-stream";
    const bytes = Buffer.from(await file.arrayBuffer());

    const supabase = supabaseServer();

    const uploadRes = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, bytes, { contentType, upsert: false });

    if (uploadRes.error) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadRes.error.message}` },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(objectPath);

    const audioUrl = publicUrlData.publicUrl;
    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await supabase
      .from("messages")
      .insert({ id, audio_url: audioUrl, password_hash: passwordHash })
      .select("id")
      .single();

    if (insertRes.error) {
      return NextResponse.json(
        { error: `DB insert failed: ${insertRes.error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: insertRes.data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

