import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock3, FileText, Inbox as InboxIcon, Undo2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { Avatar, Btn, Card, Chip, Label } from "@/components/kit";
import { ACCOUNTANTS, DOCUMENTS, eur } from "@/lib/data";
import { sfx } from "@/lib/sfx";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Client inbox — review incoming documents" },
      {
        name: "description",
        content:
          "Every document your clients sent, queued for review, acceptance or return.",
      },
      { property: "og:title", content: "Client inbox — Fisco for accountants" },
      {
        property: "og:description",
        content: "Review, accept or return client documents in one queue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InboxScreen,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const TABS = ["To review", "Accepted", "Returned"] as const;

function InboxScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("To review");
  const [state, setState] = useState<Record<string, "accepted" | "returned">>({});

  const rows = useMemo(
    () =>
      DOCUMENTS.map((d, i) => ({
        ...d,
        client: ACCOUNTANTS[(i + 1) % ACCOUNTANTS.length]!,
      })),
    [],
  );

  const visible = rows.filter((r) =>
    tab === "To review"
      ? !state[r.id]
      : tab === "Accepted"
        ? state[r.id] === "accepted"
        : state[r.id] === "returned",
  );

  const act = (id: string, next: "accepted" | "returned") => {
    sfx(next === "accepted" ? "confirm" : "swipe");
    setState((prev) => ({ ...prev, [id]: next }));
  };

  return (
    <div>
      <PageHeader title="Client inbox" right={<span />} />
      <div className="mx-auto w-full max-w-[900px] px-4 pt-4 pb-32">
        <BlurFade>
          <Card tone="ink" className="grid grid-cols-3 gap-3 p-5">
            {[
              { k: "In queue", v: rows.filter((r) => !state[r.id]).length },
              {
                k: "Accepted",
                v: Object.values(state).filter((s) => s === "accepted").length,
              },
              { k: "Clients", v: ACCOUNTANTS.length },
            ].map((s) => (
              <div key={s.k}>
                <div className="num text-[26px] leading-none">{s.v}</div>
                <div className="mt-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-ink-foreground/45">
                  {s.k}
                </div>
              </div>
            ))}
          </Card>
        </BlurFade>

        <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                sfx("pop");
                setTab(t);
              }}
              className={`press relative shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
                t === tab ? "text-primary-foreground" : "bg-secondary/70 text-foreground/70"
              }`}
            >
              {t === tab && (
                <motion.span
                  layoutId="inbox-tab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 440, damping: 34 }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                transition={{ delay: 0.03 * i, duration: 0.45, ease: EASE }}
              >
                <Card className="h-full p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.client.photo} initials={r.client.initials} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-extrabold">
                        {r.client.firm}
                      </div>
                      <div className="truncate text-[11.5px] text-muted-foreground">
                        {r.merchant} · {r.date}
                      </div>
                    </div>
                    <span className="num text-[13.5px] font-bold">
                      {r.amount === 0 ? "—" : eur(r.amount)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Chip>
                      <FileText className="size-3" /> {r.pages} pages
                    </Chip>
                    <Chip tone={r.status === "sent" ? "accent" : "light"}>{r.category}</Chip>
                  </div>
                  {state[r.id] ? (
                    <div className="mt-3 flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {state[r.id] === "accepted" ? "Filed to ledger" : "Returned to client"}
                      <button
                        onClick={() => {
                          sfx("tap");
                          setState((p) => {
                            const n = { ...p };
                            delete n[r.id];
                            return n;
                          });
                        }}
                        className="ml-auto inline-flex items-center gap-1 text-primary"
                      >
                        <Undo2 className="size-3.5" /> Undo
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Btn variant="ghost" size="sm" onClick={() => act(r.id, "returned")}>
                        Return
                      </Btn>
                      <Btn variant="accent" size="sm" onClick={() => act(r.id, "accepted")}>
                        <Check className="size-4" /> Accept
                      </Btn>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visible.length === 0 && (
          <Card className="mt-3 grid place-items-center gap-2 p-10 text-center">
            <InboxIcon className="size-6 opacity-40" />
            <Label>Nothing here</Label>
            <Link to="/clients" className="text-[12.5px] font-bold text-primary">
              Open clients
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
