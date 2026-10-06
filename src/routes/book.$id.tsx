import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlurFade } from "@/components/motion/BlurFade";
import { Avatar, Btn, Card, Label } from "@/components/kit";
import { ACCOUNTANTS } from "@/lib/data";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/book/$id")({
  loader: ({ params }) => {
    const accountant = ACCOUNTANTS.find((a) => a.id === params.id);
    if (!accountant) throw notFound();
    return { accountant };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Booking unavailable — Fisco" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const a = loaderData.accountant;
    const description = `Pick a day and time with ${a.name} at ${a.firm}.`;
    return {
      meta: [
        { title: `Book ${a.firm} — Fisco` },
        { name: "description", content: description },
        { property: "og:title", content: `Book ${a.firm} — Fisco` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Book,
});

const DAYS = ["Today", "Tomorrow", "Wed", "Thu", "Sun"] as const;
const SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "16:30", "18:00"] as const;

function Book() {
  const { accountant } = Route.useLoaderData();
  const navigate = useNavigate();
  const { setAppointment, appointment } = useStore();
  const [day, setDay] = useState<string>(appointment?.day ?? "Today");
  const [slot, setSlot] = useState<string | null>(appointment?.slot ?? null);
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    if (!slot) return;
    setAppointment({ accountantId: accountant.id, day, slot });
    setConfirmed(true);
    window.setTimeout(() => navigate({ to: "/" }), 1300);
  };

  return (
    <div>
      <PageHeader title="Book an appointment" back />
      <div className="mx-auto w-full max-w-[720px] px-4 pb-32">
        <BlurFade>
          <Card tone="ink" className="flex items-center gap-3 p-5">
            <Avatar src={accountant.photo} initials={accountant.initials} size={50} />
            <div className="min-w-0">
              <div className="truncate text-[16px] font-bold">{accountant.firm}</div>
              <div className="text-[12.5px] text-ink-foreground/55">
                {accountant.hours}
              </div>
            </div>
          </Card>
        </BlurFade>

        <BlurFade delay={0.08} className="mt-5">
          <Label>Pick a day</Label>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`press shrink-0 rounded-2xl px-4 py-3 text-[13.5px] font-bold ${
                  day === d ? "bg-ink text-ink-foreground" : "bg-secondary"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </BlurFade>

        <BlurFade delay={0.12} className="mt-5">
          <Label>Available times</Label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {SLOTS.map((s, i) => {
              const on = slot === s;
              return (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.03 * i, duration: 0.4 }}
                  onClick={() => setSlot(s)}
                  className={`press num rounded-2xl py-3.5 text-[14px] font-bold ${
                    on
                      ? "bg-primary text-primary-foreground"
                      : "bg-card shadow-soft text-foreground"
                  }`}
                >
                  {s}
                </motion.button>
              );
            })}
          </div>
        </BlurFade>

        <BlurFade delay={0.16} className="mt-6">
          <Btn size="lg" className="w-full" onClick={confirm} disabled={!slot || confirmed}>
            <AnimatePresence mode="wait" initial={false}>
              {confirmed ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="size-4" strokeWidth={3} /> Confirmed
                </motion.span>
              ) : (
                <motion.span
                  key="book"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <CalendarCheck className="size-4" />
                  {slot ? `Confirm ${day} · ${slot}` : "Select a time"}
                </motion.span>
              )}
            </AnimatePresence>
          </Btn>
        </BlurFade>
      </div>
    </div>
  );
}
