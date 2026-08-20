import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ACCOUNTS, TXNS, type Account, type Txn, type UtilityId } from "./data";
import type { ToastItem } from "./ui";

export type Dialog =
  | { kind: "none" }
  | { kind: "buy"; utility: UtilityId; accountId?: string; amount?: number; bundleId?: string }
  | { kind: "addAccount"; utility?: UtilityId }
  | { kind: "txn"; txn: Txn }
  | { kind: "history" }
  | { kind: "export" }
  | { kind: "autopay"; accountId?: string }
  | { kind: "rename"; account: Account }
  | { kind: "remove"; account: Account }
  | { kind: "module"; moduleKey: string }
  | { kind: "help" }
  | { kind: "tariff" }
  | { kind: "topup" }
  | { kind: "report"; txn: Txn };

type Ctx = {
  dialog: Dialog;
  open: (d: Dialog) => void;
  close: () => void;
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: number) => void;
  accounts: Account[];
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  addAccount: (a: Account) => void;
  txns: Txn[];
  pushTxn: (t: Txn) => void;
  balance: number;
  setBalance: (n: number) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<Dialog>({ kind: "none" });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS);
  const [txns, setTxns] = useState<Txn[]>(TXNS);
  const [balance, setBalance] = useState(24500);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
      window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4600);
    },
    []
  );

  const open = useCallback((d: Dialog) => {
    setNavOpen(false);
    setPaletteOpen(false);
    setDialog(d);
  }, []);

  const close = useCallback(() => setDialog({ kind: "none" }), []);

  const updateAccount = useCallback((id: string, patch: Partial<Account>) => setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))), []);
  const removeAccount = useCallback((id: string) => setAccounts((prev) => prev.filter((a) => a.id !== id)), []);
  const addAccount = useCallback((a: Account) => setAccounts((prev) => [a, ...prev]), []);
  const pushTxn = useCallback((t: Txn) => setTxns((prev) => [t, ...prev]), []);

  const value = useMemo<Ctx>(
    () => ({
      dialog,
      open,
      close,
      toasts,
      toast,
      dismiss,
      accounts,
      updateAccount,
      removeAccount,
      addAccount,
      txns,
      pushTxn,
      balance,
      setBalance,
      notifOpen,
      setNotifOpen,
      paletteOpen,
      setPaletteOpen,
      navOpen,
      setNavOpen,
    }),
    [dialog, open, close, toasts, toast, dismiss, accounts, updateAccount, removeAccount, addAccount, txns, pushTxn, balance, notifOpen, paletteOpen, navOpen]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
