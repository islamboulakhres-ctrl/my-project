import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Paperclip,
  Radio,
  Search,
  Send,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, Chip, Live } from "@/components/kit";
import { useStore } from "@/lib/app-store";
import { QUICK_MESSAGES, clock } from "@/lib/chat";
import { sfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Messages — Fisco" },
      {
        name: "description",
        content:
          "Talk to your accountant or your clients: threaded chat with one-click hybrid messages you can broadcast everywhere.",
      },
      { property: "og:title", content: "Messages — Fisco" },
      {
        property: "og:description",
        content: "Threaded chat with one-click hybrid messages for every conversation.",
      },
    ],
  }),
  component: ChatPage,
});

const EASE = [0.16, 1, 0.3, 1] as const;

function ChatPage() {
  const { role, threads, messages, sendMessage, broadcast } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const quicks = QUICK_MESSAGES[role ?? "taxpayer"];
  const thread = threads.find((t) => t.id === openId) ?? null;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return threads
      .map((t) => {
        const mine = messages.filter((m) => m.threadId === t.id);
        return { ...t, last: mine[mine.length - 1], count: mine.length };
      })
      .filter((t) => !term || t.name.toLowerCase().includes(term) || t.sub.toLowerCase().includes(term))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [threads, messages, q]);

  const convo = messages.filter((m) => m.threadId === openId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convo.length, openId]);

  const send = (text: string, quick?: boolean) => {
    if (!openId || !text.trim()) return;
    sfx("confirm");
    sendMessage(openId, text.trim(), quick);
    setDraft("");
  };

  const doBroadcast = (text: string) => {
    sfx("whoosh");
    broadcast(text);
    setFlash(text);
    setQuickOpen(false);
    window.setTimeout(() => setFlash(null), 2200);
  };

  return (
    <div className="min-h-[100dvh] pb-32">
      <PageHeader title="Messages" />

      <div className="mx-auto w-full max-w-[560px] px-4 pt-3">
        {/* search */}
        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="glass flex items-center gap-2.5 rounded-full px-4 py-2.5"
        >
          <Search className="size-4 opacity-45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-[13.5px] font-semibold outline-none placeholder:text-muted-foreground/70"
          />
        </motion.div>

        {/* hybrid message rail */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
          className="mt-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-50">
              Hybrid messages
            </span>
            <button
              onClick={() => {
                sfx(quickOpen ? "close" : "open");
                setQuickOpen((v) => !v);
              }}
              onPointerEnter={() => sfx("hover")}
              className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-ink-foreground"
            >
              <Zap className="size-3.5" /> {quickOpen ? "Close" : "Broadcast"}
            </button>
          </div>

          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {quicks.map((qm, i) => (
              <motion.button
                key={qm.id}
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: EASE }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onPointerEnter={() => sfx("hover")}
                onClick={() => (openId ? send(qm.text, true) : doBroadcast(qm.text))}
                className="glass press shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold whitespace-nowrap"
              >
                {qm.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="glass mt-2.5 grid gap-1.5 rounded-3xl p-3">
                  <div className="flex items-center gap-2 px-1 pb-1">
                    <Radio className="size-3.5 text-primary" />
                    <span className="text-[11.5px] font-bold">
                      One click · sends to all {threads.length} threads
                    </span>
                  </div>
                  {quicks.map((qm, i) => (
                    <motion.button
                      key={qm.id}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.45, ease: EASE }}
                      whileTap={{ scale: 0.98 }}
                      onPointerEnter={() => sfx("hover")}
                      onClick={() => doBroadcast(qm.text)}
                      className="press flex items-center gap-2.5 rounded-2xl bg-card/70 p-3 text-left"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                        <Zap className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-extrabold">{qm.label}</span>
                        <span className="block truncate text-[11.5px] font-semibold text-muted-foreground">
                          {qm.text}
                        </span>
                      </span>
                      <Send className="size-4 opacity-40" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* threads */}
        <div className="mt-4 grid gap-2">
          {list.map((t, i) => (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.12 + i * 0.06, ease: EASE }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onPointerEnter={() => sfx("hover")}
              onClick={() => {
                sfx("open");
                setOpenId(t.id);
              }}
              className="glass press flex items-center gap-3 rounded-[26px] p-3 text-left"
            >
              <div className="relative">
                <Avatar src={t.photo} initials={t.initials} size={46} />
                {t.online && <span className="absolute right-0 bottom-0"><Live /></span>}
              </div>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[14.5px] font-extrabold">{t.name}</span>
                  {t.pinned && <Chip tone="accent">Pinned</Chip>}
                </span>
                <span className="block truncate text-[12px] font-semibold text-muted-foreground">
                  {t.last?.text ?? t.sub}
                </span>
              </span>
              <span className="shrink-0 text-[10.5px] font-bold opacity-45">
                {t.last ? clock(t.last.at) : ""}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* broadcast toast */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 16, filter: "blur(12px)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="glass-ink fixed inset-x-4 bottom-28 z-[60] mx-auto max-w-[420px] rounded-3xl px-4 py-3 text-[12.5px] font-bold"
          >
            Broadcast sent to all threads — “{flash}”
          </motion.div>
        )}
      </AnimatePresence>

      {/* conversation */}
      <AnimatePresence>
        {thread && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-background/80 backdrop-blur-2xl"
            initial={{ opacity: 0, y: 40, filter: "blur(20px)", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: 30, filter: "blur(18px)", scale: 0.985 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="glass flex items-center gap-3 rounded-none px-4 py-3">
              <button
                onClick={() => {
                  sfx("close");
                  setOpenId(null);
                }}
                aria-label="Back"
                className="press grid size-9 place-items-center rounded-full bg-foreground/6"
              >
                <ArrowLeft className="size-4" />
              </button>
              <Avatar src={thread.photo} initials={thread.initials} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-extrabold">{thread.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                  {thread.online ? <Live /> : null}
                  {thread.online ? "Online" : thread.sub}
                </div>
              </div>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
              <div className="mx-auto grid max-w-[560px] gap-2">
                {convo.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3), ease: EASE }}
                    className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-[22px] px-3.5 py-2.5 text-[13.5px] font-semibold",
                        m.from === "me"
                          ? "bg-primary text-primary-foreground"
                          : "glass text-foreground",
                      )}
                      style={m.from === "me" ? { boxShadow: "var(--shadow-accent)" } : undefined}
                    >
                      {m.text}
                      <span
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[10px] font-bold",
                          m.from === "me" ? "opacity-70" : "opacity-45",
                        )}
                      >
                        {m.quick && <Zap className="size-3" />}
                        {clock(m.at)}
                        {m.from === "me" &&
                          (m.status === "read" ? (
                            <CheckCheck className="size-3" />
                          ) : (
                            <Check className="size-3" />
                          ))}
                      </span>
                    </div>
                  </motion.div>
                ))}
                <div ref={endRef} />
              </div>
            </div>

            {/* composer */}
            <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto max-w-[560px]">
                <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
                  {quicks.map((qm) => (
                    <motion.button
                      key={qm.id}
                      whileTap={{ scale: 0.95 }}
                      onPointerEnter={() => sfx("hover")}
                      onClick={() => send(qm.text, true)}
                      className="glass press shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold whitespace-nowrap"
                    >
                      {qm.label}
                    </motion.button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                  }}
                  className="glass flex items-center gap-2 rounded-full p-1.5 pl-4"
                >
                  <Paperclip className="size-4 shrink-0 opacity-40" />
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message"
                    className="min-w-0 flex-1 bg-transparent py-2 text-[13.5px] font-semibold outline-none placeholder:text-muted-foreground/70"
                  />
                  <motion.button
                    type="submit"
                    disabled={!draft.trim()}
                    whileTap={{ scale: 0.92 }}
                    className="press grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
                    style={{ boxShadow: "var(--shadow-accent)" }}
                    aria-label="Send"
                  >
                    <Send className="size-4" />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
