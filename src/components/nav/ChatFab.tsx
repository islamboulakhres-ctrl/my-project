import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";

/** Floating entry point to the messaging surface, hidden while chatting. */
export function ChatFab() {
  const { role, user } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const show = !!role && !!user && !path.startsWith("/chat");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40"
        >
          <Link
            to="/chat"
            aria-label="Messages"
            onClick={() => sfx("open")}
            onPointerEnter={() => sfx("hover")}
            className="press glass relative grid size-12 place-items-center rounded-full"
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-primary/25"
              animate={{ scale: [1, 1.4], opacity: [0.45, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeOut" }}
            />
            <MessageCircle className="relative size-5" strokeWidth={2} />
            <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary ring-2 ring-background" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
