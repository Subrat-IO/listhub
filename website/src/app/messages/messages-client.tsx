"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { apiOrigin } from "@/lib/env";
import { useMe } from "@/hooks/useMe";
import formStyles from "@/styles/forms.module.css";
import pageStyles from "./messages.module.css";

type Conversation = {
  id: string;
  updatedAt: string;
  listing?: { id: string; title: string } | null;
  messages: { id: string; body: string; createdAt: string }[];
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { profile?: { displayName?: string | null } | null };
};

function MessagesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useMe();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => params.get("conversationId"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const socket = useMemo<Socket | null>(() => {
    if (!user) return null;
    return io(apiOrigin, { withCredentials: true });
  }, [user]);

  useEffect(() => {
    const cid = params.get("conversationId");
    if (cid) setActiveId(cid);
  }, [params]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=/messages");
      return;
    }
    void (async () => {
      try {
        const res = await apiFetch<{ conversations: Conversation[] }>(`/conversations`);
        setConversations(res.conversations);
      } catch {
        setError("Could not load conversations (is the API running?)");
      }
    })();
  }, [loading, user, router]);

  useEffect(() => {
    if (!socket || !activeId) return;
    socket.emit("join_conversation", activeId);
    void (async () => {
      try {
        const res = await apiFetch<{ messages: Message[] }>(`/conversations/${activeId}/messages`);
        setMessages(res.messages);
      } catch {
        setError("Could not load messages");
      }
    })();

    const onNew = (payload: { conversationId: string; message: Message }) => {
      if (payload.conversationId !== activeId) return;
      setMessages((prev) => [...prev, payload.message]);
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [socket, activeId]);

  async function send() {
    if (!activeId) return;
    setError(null);
    const body = draft.trim();
    if (!body) return;
    try {
      await apiFetch(`/conversations/${activeId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    }
  }

  const active = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className={pageStyles.layout}>
      <div className={pageStyles.panel}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Conversations</div>
        {conversations.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>No conversations yet. Open a listing and message the seller.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {conversations.map((c) => {
              const preview = c.messages[0]?.body ?? "—";
              const title = c.listing?.title ?? "Direct message";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: c.id === activeId ? "1px solid color-mix(in oklab, var(--brand) 55%, var(--border))" : "1px solid var(--border)",
                    padding: 10,
                    background: "var(--surface2)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 750, fontSize: 13 }}>{title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {preview}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={pageStyles.panel}>
        {!activeId ? (
          <div style={{ color: "var(--muted)" }}>Select a conversation.</div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
              <div style={{ fontWeight: 900 }}>
                {active?.listing ? (
                  <Link href={`/listing/${active.listing.id}`} style={{ textDecoration: "underline" }}>
                    {active.listing.title}
                  </Link>
                ) : (
                  "Conversation"
                )}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{activeId}</div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10, maxHeight: 520, overflow: "auto", paddingRight: 6 }}>
              {messages.map((m) => (
                <div key={m.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 10, background: "var(--surface2)" }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {m.sender.profile?.displayName ?? "User"} · {new Date(m.createdAt).toLocaleString()}
                  </div>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.45 }}>{m.body}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <textarea className={formStyles.textarea} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" />
              <button className={formStyles.btn} type="button" onClick={() => void send()}>
                Send
              </button>
            </div>
          </>
        )}

        {error ? <div className={formStyles.error}>{error}</div> : null}
      </div>
    </div>
  );
}

export function MessagesClient() {
  return (
    <Suspense fallback={<div style={{ color: "var(--muted)" }}>Loading messages…</div>}>
      <MessagesInner />
    </Suspense>
  );
}
