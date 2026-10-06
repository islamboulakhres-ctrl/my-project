import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { sfx } from "@/lib/sfx";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  right,
  back,
}: {
  title: string;
  right?: ReactNode;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <motion.header
      initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-border/60 bg-background/60 px-4 py-2.5 backdrop-blur-2xl"
    >
      {back ? (
        <button
          onClick={() => {
            sfx("close");
            router.history.back();
          }}
          onPointerEnter={() => sfx("hover")}
          aria-label="Go back"
          className="press glass grid size-9 place-items-center rounded-full"
        >
          <ArrowLeft className="size-4" />
        </button>
      ) : null}
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-extrabold tracking-tight">{title}</h1>
      {right ?? (
        <Link
          to="/profile"
          onClick={() => sfx("open")}
          onPointerEnter={() => sfx("hover")}
          className="press grid size-9 place-items-center rounded-xl bg-ink text-[11px] font-black text-ink-foreground"
        >
          MB
        </Link>
      )}
    </motion.header>
  );
}
