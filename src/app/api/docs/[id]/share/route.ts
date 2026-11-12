import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadDocWithAccess } from "@/lib/docs";

type Ctx = { params: Promise<{ id: string }> };

async function requireOwner(id: string) {
  const user = await getCurrentUser();
  if (!user)
    return { error: NextResponse.json({ error: "Not logged in" }, { status: 401 }), user: null, doc: null };

  const { doc, access } = await loadDocWithAccess(id, user.id);
  if (!doc)
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }), user: null, doc: null };
  if (access !== "owner")
    return {
      error: NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 }),
      user: null,
      doc: null,
    };

  return { error: null, user, doc };
}

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await requireOwner(id);
  if (g.error) return g.error;

  const { data: sh } = await db.from("shares").select("user_id").eq("document_id", id);
  const ids = (sh ?? []).map((s) => s.user_id);
  if (!ids.length) return NextResponse.json({ users: [] });
  const { data: users } = await db.from("users").select("id,name,email").in("id", ids);
  return NextResponse.json({ users: users ?? [] });
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await requireOwner(id);
  if (g.error) return g.error;

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { data: target } = await db.from("users").select("id,name,email").eq("email", email).single();
  if (!target) return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  if (target.id === g.user.id)
    return NextResponse.json({ error: "You cannot share a document with yourself" }, { status: 400 });

  const { error } = await db.from("shares").upsert({ document_id: id, user_id: target.id });
  if (error) return NextResponse.json({ error: "Share failed" }, { status: 500 });
  return NextResponse.json({ user: target }, { status: 201 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const g = await requireOwner(id);
  if (g.error) return g.error;

  const userId = Number(new URL(req.url).searchParams.get("userId"));
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  await db.from("shares").delete().eq("document_id", id).eq("user_id", userId);
  return NextResponse.json({ ok: true });
}