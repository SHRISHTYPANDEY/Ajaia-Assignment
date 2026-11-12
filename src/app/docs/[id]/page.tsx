"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";


function EditorInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [access, setAccess] = useState("");
  const [status, setStatus] = useState("Loaded");
  const [error, setError] = useState("");
  const [sharedWith, setSharedWith] = useState<{ id: number; name: string; email: string }[]>([]);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setStatus("Saving...");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => save({ content: editor.getHTML() }), 800);
    },
  });

  async function save(body: object) {
    const r = await fetch(`/api/docs/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    if (r.ok) { setStatus("Saved"); setError(""); }
    else { setStatus("Error"); setError((await r.json()).error ?? "Save failed"); }
  }
  async function loadShares() {
    const r = await fetch(`/api/docs/${id}/share`);
    if (r.ok) setSharedWith((await r.json()).users);
  }

  async function share() {
    setShareMsg("");
    const r = await fetch(`/api/docs/${id}/share`, { method: "POST", body: JSON.stringify({ email: shareEmail }) });
    const d = await r.json();
    if (!r.ok) return setShareMsg(d.error ?? "Share failed");
    setShareEmail("");
    setShareMsg(`Shared with ${d.user.name}`);
    loadShares();
  }

  async function unshare(userId: number) {
    await fetch(`/api/docs/${id}/share?userId=${userId}`, { method: "DELETE" });
    loadShares();
  }

  useEffect(() => {
    if (!editor) return;
    fetch(`/api/docs/${id}`).then(async (r) => {
      if (r.status === 401) return router.push("/");
      if (!r.ok) return setError((await r.json()).error ?? "Load failed");
      const { doc, access } = await r.json();
      setTitle(doc.title);
      setAccess(access);
      if (access === "owner") loadShares();
      editor.commands.setContent(doc.content || "", { emitUpdate: false });
    });
  }, [editor, id, router]);

  const btn = (label: string, on: () => void, active: boolean) => (
    <button onClick={on} style={{ marginRight: 4, padding: "4px 10px", fontWeight: active ? "bold" : "normal", background: active ? "#ddd" : "#fff", color: "#000" }}>
      {label}
    </button>
  );

  if (error && !editor?.getText() && !title) return <main style={{ padding: 40 }}><p style={{ color: "red" }}>{error}</p><a href="/docs">Back</a></main>;

  return (
    <main style={{ maxWidth: 800, margin: "30px auto", fontFamily: "sans-serif" }}>
      <a href="/docs">← All documents</a>
      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && save({ title })}
          style={{ fontSize: 24, flex: 1, padding: 6 }}
        />
        <small>{access === "owner" ? "Owner" : "Shared with you"} · {status}</small>
      </div>
      {access === "owner" && (
        <div style={{ border: "1px solid #444", padding: 10, marginBottom: 10 }}>
          <strong>Share</strong>{" "}
          <input
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="bob@test.com"
            style={{ padding: 4 }}
          />{" "}
          <button onClick={share} style={{ padding: "4px 10px", color: "#000", background: "#fff" }}>Share</button>
          {shareMsg && <small style={{ marginLeft: 8 }}>{shareMsg}</small>}
          <div style={{ marginTop: 6 }}>
            {sharedWith.map((u) => (
              <span key={u.id} style={{ marginRight: 10, fontSize: 13 }}>
                {u.name} ({u.email}){" "}
                <a href="#" onClick={(e) => { e.preventDefault(); unshare(u.id); }}>remove</a>
              </span>
            ))}
          </div>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {editor && (
        <div style={{ marginBottom: 8 }}>
          {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
          {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
          {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
          {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
          {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
          {btn("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
          {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
        </div>
      )}
      <div style={{ border: "1px solid #ccc", minHeight: 300, padding: 12 }}>
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<p style={{ padding: 20 }}>Loading...</p>}>
      <EditorInner />
    </Suspense>
  );
}