import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { loadDocWithAccess } from "@/lib/docs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { doc, access } = await loadDocWithAccess(id, user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });
  return NextResponse.json({ doc, access });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { doc, access } = await loadDocWithAccess(id, user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access) return NextResponse.json({ error: "No access" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, any> = { updated_at: new Date().toISOString() };

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 200)
      return NextResponse.json({ error: "Title must be 1-200 characters" }, { status: 400 });
    update.title = body.title.trim();
  }
  if (body.content !== undefined) {
    if (typeof body.content !== "string")
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    update.content = body.content;
  }

  const { error } = await db.from("documents").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: "Save failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}