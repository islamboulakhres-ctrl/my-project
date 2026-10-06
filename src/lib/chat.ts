/** Local, in-memory chat model for the Fisco messaging surface. */

export type ChatMsg = {
  id: string;
  threadId: string;
  from: "me" | "them";
  text: string;
  at: number;
  /** true when the message came from a one-click hybrid template */
  quick?: boolean;
  status?: "sent" | "read";
};

export type ChatThread = {
  id: string;
  name: string;
  sub: string;
  initials: string;
  photo?: string;
  online: boolean;
  pinned?: boolean;
};

export const THREADS: Record<"taxpayer" | "accountant", ChatThread[]> = {
  taxpayer: [
    {
      id: "el-amel",
      name: "Nadia Belkacem",
      sub: "Cabinet El Amel",
      initials: "NB",
      photo:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80&auto=format&fit=crop&crop=faces",
      online: true,
      pinned: true,
    },
    {
      id: "meziane",
      name: "Yacine Meziane",
      sub: "Meziane & Associés",
      initials: "YM",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=faces",
      online: false,
    },
    { id: "support", name: "Fisco Support", sub: "Always on", initials: "FS", online: true },
  ],
  accountant: [
    { id: "amine", name: "Amine Kadri", sub: "Freelance · VAT Q3", initials: "AK", online: true, pinned: true },
    { id: "sara", name: "Sara Hamdi", sub: "Micro-enterprise", initials: "SH", online: true },
    { id: "omar", name: "Omar Bensalah", sub: "SARL · Payroll", initials: "OB", online: false },
    { id: "lina", name: "Lina Toumi", sub: "Freelance · IRG", initials: "LT", online: false },
  ],
};

export const QUICK_MESSAGES: Record<"taxpayer" | "accountant", { id: string; label: string; text: string }[]> = {
  taxpayer: [
    { id: "q1", label: "Sent docs", text: "I just sent this month's documents — could you confirm?" },
    { id: "q2", label: "Deadline?", text: "What's the next filing deadline I should prepare for?" },
    { id: "q3", label: "Need receipt", text: "Could you send me the receipt for the last filing?" },
    { id: "q4", label: "Thanks", text: "Thank you, appreciated!" },
    { id: "q5", label: "Call me", text: "Are you free for a quick call today?" },
  ],
  accountant: [
    { id: "q1", label: "Docs received", text: "Documents received — I'll review and get back to you." },
    { id: "q2", label: "Missing invoice", text: "One invoice is missing for this period. Could you upload it?" },
    { id: "q3", label: "Filed ✅", text: "Your filing is submitted. Confirmation is attached." },
    { id: "q4", label: "Reminder", text: "Friendly reminder: the deadline is in 3 days." },
    { id: "q5", label: "Fees", text: "I've sent the fee note for this quarter." },
  ],
};

const t = (min: number) => Date.now() - min * 60000;

export const SEED_MESSAGES: Record<"taxpayer" | "accountant", ChatMsg[]> = {
  taxpayer: [
    { id: "m1", threadId: "el-amel", from: "them", text: "Hi! I received your invoices for August.", at: t(240) },
    { id: "m2", threadId: "el-amel", from: "me", text: "Great — anything missing?", at: t(232), status: "read" },
    { id: "m3", threadId: "el-amel", from: "them", text: "Just the fuel receipts. Send them when you can.", at: t(228) },
    { id: "m4", threadId: "meziane", from: "them", text: "Happy to take a look at your payroll setup.", at: t(1400) },
    { id: "m5", threadId: "support", from: "them", text: "Welcome to Fisco 👋 Ask us anything.", at: t(3000) },
  ],
  accountant: [
    { id: "m1", threadId: "amine", from: "them", text: "Uploaded the Q3 invoices, thanks!", at: t(120) },
    { id: "m2", threadId: "amine", from: "me", text: "Perfect, reviewing now.", at: t(112), status: "read" },
    { id: "m3", threadId: "sara", from: "them", text: "Do I need to declare this month?", at: t(300) },
    { id: "m4", threadId: "omar", from: "them", text: "Payroll file is ready on my side.", at: t(900) },
    { id: "m5", threadId: "lina", from: "them", text: "Can we push the appointment?", at: t(2600) },
  ],
};

export const clock = (at: number) =>
  new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
