import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACCOUNTANTS, DOCUMENTS, FALLBACK_CENTER, type Doc } from "./data";
import { distanceKm, type LngLat } from "./geo";
import { SEED_MESSAGES, THREADS, type ChatMsg, type ChatThread } from "./chat";
import {
  DEFAULT_PROFILE,
  readProfile,
  writeProfile,
  type PracticeProfile,
} from "./practice-profile";

type Appointment = { accountantId: string; day: string; slot: string } | null;

export type Role = "taxpayer" | "accountant";

export type User = { name: string; email: string; initials: string };

const ROLE_KEY = "fisco.role";

type Store = {
  position: LngLat;
  located: boolean;
  locating: boolean;
  requestLocation: () => void;
  chosenId: string | null;
  choose: (id: string) => void;
  docs: Doc[];
  addDoc: (d: Doc) => void;
  markSent: (ids: string[]) => void;
  appointment: Appointment;
  setAppointment: (a: Appointment) => void;
  role: Role | null;
  roleReady: boolean;
  setRole: (r: Role | null) => void;
  user: User | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  practice: PracticeProfile;
  savePractice: (p: PracticeProfile) => void;
  practiceSetupOpen: boolean;
  skipPracticeSetup: () => void;
  threads: ChatThread[];
  messages: ChatMsg[];
  sendMessage: (threadId: string, text: string, quick?: boolean) => void;
  broadcast: (text: string) => void;
  ranked: (typeof ACCOUNTANTS)[number] extends never
    ? never
    : ((typeof ACCOUNTANTS)[number] & { km: number })[];
};

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<LngLat>(FALLBACK_CENTER);
  const [located, setLocated] = useState(false);
  const [locating, setLocating] = useState(false);
  const [chosenId, setChosenId] = useState<string | null>("el-amel");
  const [docs, setDocs] = useState<Doc[]>(DOCUMENTS);
  const [appointment, setAppointment] = useState<Appointment>(null);
  const [role, setRoleState] = useState<Role | null>(null);
  const [roleReady, setRoleReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);

  /* each world gets its own conversation seed */
  useEffect(() => {
    setMsgs(role ? SEED_MESSAGES[role] : []);
  }, [role]);

  const [practice, setPractice] = useState<PracticeProfile>(DEFAULT_PROFILE);
  const [practiceSetupOpen, setPracticeSetupOpen] = useState(true);

  /* stored practice profile is restored after hydration */
  useEffect(() => {
    setPractice(readProfile());
  }, []);

  const savePractice = useCallback((p: PracticeProfile) => {
    setPractice(p);
    writeProfile(p);
  }, []);

  const skipPracticeSetup = useCallback(() => setPracticeSetupOpen(false), []);

  const signIn = useCallback((email: string, name?: string) => {
    const label = (name?.trim() || email.split("@")[0] || "You").replace(/[._-]+/g, " ");
    const initials = label
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("");
    const display = label.replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ name: display, email, initials });
    setPractice((prev) => (prev.name ? prev : { ...prev, name: display }));
    setPracticeSetupOpen(true);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const push = useCallback((m: ChatMsg) => setMsgs((prev) => [...prev, m]), []);

  const sendMessage = useCallback(
    (threadId: string, text: string, quick?: boolean) => {
      const id = `${threadId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      push({ id, threadId, from: "me", text, at: Date.now(), status: "sent", ...(quick ? { quick: true } : {}) });
      window.setTimeout(() => {
        setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
      }, 1400);
    },
    [push],
  );

  const broadcast = useCallback(
    (text: string) => {
      if (!role) return;
      THREADS[role].forEach((t, i) => {
        window.setTimeout(() => sendMessage(t.id, text, true), i * 140);
      });
    },
    [role, sendMessage],
  );

  /* the role picker greets every session start */
  useEffect(() => {
    try {
      window.localStorage.removeItem(ROLE_KEY);
    } catch {
      /* ignore */
    }
    setRoleReady(true);
  }, []);


  const setRole = useCallback((r: Role | null) => {
    setRoleState(r);
    try {
      if (r) window.localStorage.setItem(ROLE_KEY, r);
      else window.localStorage.removeItem(ROLE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lng: p.coords.longitude, lat: p.coords.latitude });
        setLocated(true);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const value = useMemo<Store>(() => {
    const ranked = ACCOUNTANTS.map((a) => ({
      ...a,
      km: distanceKm(position, { lng: a.lng, lat: a.lat }),
    })).sort((x, y) => x.km - y.km);

    return {
      position,
      located,
      locating,
      requestLocation,
      chosenId,
      choose: setChosenId,
      docs,
      addDoc: (d) => setDocs((prev) => [d, ...prev]),
      markSent: (ids) =>
        setDocs((prev) =>
          prev.map((d) => (ids.includes(d.id) ? { ...d, status: "sent" } : d)),
        ),
      appointment,
      setAppointment,
      role,
      roleReady,
      setRole,
      user,
      signIn,
      signOut,
      practice,
      savePractice,
      practiceSetupOpen,
      skipPracticeSetup,
      threads: role ? THREADS[role] : [],
      messages: msgs,
      sendMessage,
      broadcast,
      ranked,
    } as Store;
  }, [
    position,
    located,
    locating,
    requestLocation,
    chosenId,
    docs,
    appointment,
    role,
    roleReady,
    setRole,
    user,
    signIn,
    signOut,
    practice,
    savePractice,
    practiceSetupOpen,
    skipPracticeSetup,
    msgs,
    sendMessage,
    broadcast,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}
