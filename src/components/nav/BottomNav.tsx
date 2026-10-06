import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  House,
  FileText,
  MapPin,
  ChartNoAxesColumn,
  ScanLine,
  Inbox,
  Users,
  LineChart,
  CheckCheck,
} from "lucide-react";
import { useStore } from "@/lib/app-store";
import { sfx } from "@/lib/sfx";

const TAXPAYER = {
  left: [
    { to: "/", label: "Home", icon: House },
    { to: "/documents", label: "Docs", icon: FileText },
  ],
  center: { to: "/scan", label: "Scan", icon: ScanLine },
  right: [
    { to: "/map", label: "Nearby", icon: MapPin },
    { to: "/activity", label: "Insights", icon: ChartNoAxesColumn },
  ],
} as const;

const ACCOUNTANT = {
  left: [
    { to: "/", label: "Home", icon: House },
    { to: "/clients", label: "Clients", icon: Users },
  ],
  center: { to: "/inbox", label: "Inbox", icon: Inbox },
  right: [
    { to: "/practice", label: "Practice", icon: LineChart },
    { to: "/documents", label: "Filed", icon: CheckCheck },
  ],
} as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useStore();
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  if (!role) return null;
  const set = role === "accountant" ? ACCOUNTANT : TAXPAYER;
  const Center = set.center.icon;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5">
      <motion.nav
        key={role}
        initial={{ y: 44, opacity: 0, filter: "blur(14px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 240, damping: 26, delay: 0.12 }}
        className="glass-ink pointer-events-auto flex items-center gap-0.5 rounded-full p-1.5 shadow-[0_18px_50px_-18px_rgba(20,16,14,0.65)]"
      >
        {set.left.map((it) => (
          <NavItem key={it.to} {...it} active={isActive(it.to)} />
        ))}

        <Link
          to={set.center.to}
          aria-label={set.center.label}
          onClick={() => sfx("pop")}
          className="press relative mx-1.5 grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
          style={{ boxShadow: "var(--shadow-accent)" }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/35"
            animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeOut" }}
          />
          <Center className="size-[19px]" strokeWidth={2.1} />
        </Link>

        {set.right.map((it) => (
          <NavItem key={it.to} {...it} active={isActive(it.to)} />
        ))}
      </motion.nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      onClick={() => sfx("tap")}
      onPointerEnter={() => {
        sfx("hover");
        // warm the heavy map chunk before the user lands on it
        if (to === "/map") void import("@/components/map/MapCanvas");
      }}
      className="relative grid h-11 w-[54px] place-items-center rounded-full"
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-ink-foreground/14"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      <motion.span
        animate={{ opacity: active ? 1 : 0.42, scale: active ? 1 : 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className="relative z-10 grid place-items-center gap-[3px] text-ink-foreground"
      >
        <Icon className="size-[17px]" strokeWidth={active ? 2.4 : 1.9} />
        <span className="text-[8px] leading-none font-bold tracking-[0.08em] uppercase">
          {label}
        </span>
      </motion.span>
    </Link>
  );
}
