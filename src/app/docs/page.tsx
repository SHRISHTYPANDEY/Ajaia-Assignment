"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Doc = { id: string; title: string; updated_at: string; owner_name?: string };

export default function DocsList() {
  const router = useRouter();
  const [owned, setOwned] = useState<Doc[]>([]);
  const [shared, setShared] = useState<Doc[]>([]);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/docs/import", { method: "POST", body: fd });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    const d = await r.json();
    if (!r.ok) return setError(d.error ?? "Upload failed");
    router.push(`/docs/${d.id}`);
  }

  useEffect(() => {
    fetch("/api/docs").then(async (r) => {
      if (r.status === 401) return router.push("/");
      if (!r.ok) return setError("Could not load documents");
      const d = await r.json();
      setOwned(d.owned);
      setShared(d.shared);
    });
  }, [router]);

  async function create() {
    const r = await fetch("/api/docs", { method: "POST", body: JSON.stringify({}) });
    if (!r.ok) return setError("Could not create document");
    const { id } = await r.json();
    router.push(`/docs/${id}`);
  }

  const Row = ({ d, badge }: { d: Doc; badge: string }) => (
    <li style={{ margin: "8px 0" }}>
      <a href={`/docs/${d.id}`}>{d.title}</a>{" "}
      <span style={{ fontSize: 12, background: "#eee", padding: "2px 6px", borderRadius: 4 }}>{badge}</span>
      <small style={{ color: "#888", marginLeft: 8 }}>{new Date(d.updated_at).toLocaleString()}</small>
    </li>
  );

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>My Documents</h1>
      <button
  onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/"); }}
  style={{ padding: "4px 10px", color: "#000", background: "#fff", float: "right" }}
>
  Logout
</button>
      <button onClick={create} style={{ padding: "8px 14px", color: "#000", background: "#fff" }}>+ New document</button>{" "}
      <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: "8px 14px", color: "#000", background: "#fff" }}>
        {uploading ? "Uploading..." : "Upload file"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.docx"
        hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <small style={{ marginLeft: 10, color: "#888" }}>Supported: .txt, .md, .docx (max 2 MB)</small>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Owned by me</h2>
      <ul>{owned.map((d) => <Row key={d.id} d={d} badge="Owned" />)}</ul>
      {!owned.length && <p>No documents yet.</p>}
      <h2>Shared with me</h2>
      <ul>{shared.map((d) => <Row key={d.id} d={d} badge={`Shared by ${d.owner_name ?? "?"}`} />)}</ul>
      {!shared.length && <p>No documents shared with you.</p>}
    </main>
  );
}