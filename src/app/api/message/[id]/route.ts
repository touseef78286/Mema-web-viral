import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { MASTER_ID } from "@/lib/constants";

export const runtime = "nodejs";

const EXPIRES_AFTER_HOURS = 24;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    // Permanent master link: never expires, no DB dependency.
    if (id === MASTER_ID) {
      return NextResponse.json({ expired: false, createdAt: null });
    }

    const supabase = supabaseServer();
    const res = await supabase
      .from("messages")
      .select("created_at")
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

    return NextResponse.json({ expired, createdAt: res.data.created_at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

