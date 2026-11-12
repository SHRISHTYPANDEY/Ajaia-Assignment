import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const COLS = "id,title,updated_at,owner_id";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { data: owned } = await db.from("documents").select(COLS)
    .eq("owner_id", user.id).order("updated_at", { ascending: false });

  const { data: sh } = await db.from("shares").select("document_id").eq("user_id", user.id);
  const ids = (sh ?? []).map((s) => s.document_id);

  let shared: any[] = [];
  if (ids.length) {
    const { data } = await db.from("documents").select(COLS)
      .in("id", ids).order("updated_at", { ascending: false });
    shared = data ?? [];
    // owner ka naam badge me dikhane ke liye
    const ownerIds = [...new Set(shared.map((d) => d.owner_id))];
    const { data: owners } = await db.from("users").select("id,name").in("id", ownerIds);
    shared = shared.map((d) => ({ ...d, owner_name: owners?.find((o) => o.id === d.owner_id)?.name }));
  }
  return NextResponse.json({ owned: owned ?? [], shared });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 200) : "Untitled document";

  const { data, error } = await db.from("documents")
    .insert({ title, owner_id: user.id }).select("id").single();
  if (error) return NextResponse.json({ error: "Could not create document" }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}