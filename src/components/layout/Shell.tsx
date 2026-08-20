import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils/cn";
import { Icon } from "../ui/icons";
import { Avatar, Badge, Button, IconBtn, Drawer, DrawerHead } from "../ui";
import { MODULES, NAV_GROUPS, NOTICES, PAY_METHODS, SCHEDULES, UTILITIES, kes, utilityOf } from "../../lib/data";
import { useApp } from "../../lib/store";

/* ================================================================ Sidebar ================================================================ */

function SideNav({ onNav, active }: { onNav: (key: string, target?: string) => void; active: string }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[11px] bg-pmgreen shadow-[0_8px_20px_-8px_rgba(18,183,106,0.9)]">
          <Icon name="bolt" size={19} className="text-white" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[15px] font-extrabold leading-none tracking-tight text-white">PayMo</p>
          <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40">Business</p>
        </div>
        <Badge tone="dark" className="ml-auto border border-white/10 bg-white/10 text-[10px] text-white/70">
          3.6
        </Badge>
      </div>

      {/* Org switcher */}
      <button className="focus-ring mx-3 mt-5 flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-pmviolet/25 text-[12px] font-bold text-[#cdc2ff]">PH</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-bold text-white">PayMo Hardware</span>
          <span className="block truncate text-[11px] text-white/45">Kiambu Rd · 8 meters</span>
        </span>
        <Icon name="chevron-down" size={14} className="text-white/40" />
      </button>

      {/* Nav */}
      <nav className="dark-scroll mt-5 flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const on = active === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={() => onNav(it.key, it.target)}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] font-semibold transition-all duration-150",
                      on ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon name={it.icon} size={17} className={cn("flex-none transition", on ? "text-pmgreen" : "text-white/45 group-hover:text-white/80")} />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge && <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-white/45">{it.badge}</span>}
                    {on && <span className="h-1.5 w-1.5 rounded-full bg-pmgreen" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Balance widget */}
        <div className="mx-1 rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.07] to-transparent p-4">
          <div className="flex items-center gap-2">
            <Icon name="wallet" size={15} className="text-pmgreen" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">Wallet</p>
          </div>
          <p className="num mt-1.5 font-display text-[19px] font-extrabold text-white">{kes(24500)}</p>
          <p className="mt-0.5 text-[11px] text-white/40">Zero-fee utility payments</p>
          <button className="focus-ring mt-3 w-full rounded-lg bg-white/12 py-2 text-[12px] font-bold text-white transition hover:bg-white/20">Top up wallet</button>
        </div>
      </nav>

      {/* Support + user */}
      <div className="border-t border-white/8 p-3">
        <button className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[13px] font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white">
          <Icon name="lifebuoy" size={17} className="text-white/45" />
          Help centre
          <Icon name="external" size={13} className="ml-auto text-white/25" />
        </button>
        <div className="mt-1 flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
          <Avatar name="Joseph Mwangi" size={32} tone="green" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold text-white">Joseph Mwangi</p>
            <p className="truncate text-[11px] text-white/45">Admin · j@paymo.co.ke</p>
          </div>
          <button aria-label="Sign out" className="grid h-7 w-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white">
            <Icon name="logout" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ Command palette ================================================================ */

function Palette() {
  const { paletteOpen, setPaletteOpen, open, accounts, txns } = useApp();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!paletteOpen) {
      setQ("");
      setIdx(0);
    }
  }, [paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [paletteOpen, setPaletteOpen]);

  type Item = { id: string; label: string; sub: string; icon: Parameters<typeof Icon>[0]["name"]; group: string; run: () => void };

  const items = useMemo<Item[]>(() => {
    const acts: Item[] = [
      { id: "a1", label: "Buy electricity tokens", sub: "KPLC prepaid · instant", icon: "bolt", group: "Quick actions", run: () => open({ kind: "buy", utility: "electricity" }) },
      { id: "a2", label: "Pay water bill", sub: "NCWSC / county", icon: "droplet", group: "Quick actions", run: () => open({ kind: "buy", utility: "water" }) },
      { id: "a3", label: "Renew DSTV", sub: "MultiChoice packages", icon: "tv", group: "Quick actions", run: () => open({ kind: "buy", utility: "tv" }) },
      { id: "a4", label: "Top up airtime", sub: "Safaricom · Airtel", icon: "phone", group: "Quick actions", run: () => open({ kind: "buy", utility: "airtime" }) },
      { id: "a5", label: "Add a new meter or account", sub: "Verify in seconds", icon: "plus", group: "Quick actions", run: () => open({ kind: "addAccount" }) },
      { id: "a6", label: "Export transaction history", sub: "CSV · PDF · XLS", icon: "download", group: "Quick actions", run: () => open({ kind: "export" }) },
      { id: "a7", label: "Manage autopay rules", sub: "4 rules configured", icon: "repeat", group: "Quick actions", run: () => open({ kind: "autopay" }) },
      { id: "a8", label: "Top up PayMo wallet", sub: "Free from M-Pesa", icon: "wallet", group: "Quick actions", run: () => open({ kind: "topup" }) },
    ];
    const utils: Item[] = UTILITIES.map((u) => ({
      id: `u-${u.id}`,
      label: u.name,
      sub: u.short,
      icon: u.icon,
      group: "Utilities",
      run: () => open({ kind: "buy", utility: u.id }),
    }));
    const accs: Item[] = accounts.map((a) => ({
      id: `acc-${a.id}`,
      label: a.nickname,
      sub: `${a.provider} · ${a.ref}`,
      icon: utilityOf(a.utility).icon,
      group: "Saved accounts",
      run: () => open({ kind: "buy", utility: a.utility, accountId: a.id }),
    }));
    const txnItems: Item[] = txns.slice(0, 10).map((t) => ({
      id: `t-${t.id}`,
      label: `${t.ref} · ${kes(t.amount)}`,
      sub: `${t.provider} · ${t.account}`,
      icon: "receipt",
      group: "Transactions",
      run: () => open({ kind: "txn", txn: t }),
    }));
    const all = [...acts, ...utils, ...accs, ...txnItems];
    if (!q.trim()) return all.slice(0, 12);
    const s = q.toLowerCase();
    return all.filter((i) => `${i.label} ${i.sub} ${i.group}`.toLowerCase().includes(s)).slice(0, 12);
  }, [q, open, accounts, txns]);

  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    items.forEach((i) => {
      g[i.group] = g[i.group] ?? [];
      g[i.group].push(i);
    });
    return g;
  }, [items]);

  const flat = Object.values(groups).flat();

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true">
      <div className="overlay-fade absolute inset-0 bg-[#0b1322]/60 backdrop-blur-[3px]" onClick={() => setPaletteOpen(false)} />
      <div className="modal-pop relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-white shadow-pm-lg">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Icon name="search" size={18} className="text-faint" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, flat.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter") flat[idx]?.run(), setPaletteOpen(false);
            }}
            placeholder="Search meters, providers, references or actions…"
            className="w-full bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-faint"
          />
          <kbd className="hidden rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10.5px] font-bold text-muted sm:block">ESC</kbd>
        </div>
        <div className="thin-scroll max-h-[52vh] overflow-y-auto p-2">
          {flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] font-semibold text-ink">No matches for “{q}”</p>
              <p className="mt-1 text-[12px] text-muted">Try “KPLC”, “DSTV”, a meter number or a TXN reference.</p>
            </div>
          )}
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="mb-1.5">
              <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">{g}</p>
              {list.map((i) => {
                const activeItem = flat[idx]?.id === i.id;
                return (
                  <button
                    key={i.id}
                    onMouseEnter={() => setIdx(flat.findIndex((x) => x.id === i.id))}
                    onClick={() => {
                      i.run();
                      setPaletteOpen(false);
                    }}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition", activeItem ? "bg-canvas" : "hover:bg-[#f7f9fc]")}
                  >
                    <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-lg", activeItem ? "bg-white text-ink shadow-sm" : "bg-canvas text-muted")}>
                      <Icon name={i.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink">{i.label}</span>
                      <span className="block truncate text-[11.5px] text-muted">{i.sub}</span>
                    </span>
                    {activeItem && <Icon name="arrow-right" size={15} className="text-pmgreen" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line bg-[#fafbfd] px-4 py-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-white px-1 py-0.5 text-[10px] font-bold">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-white px-1 py-0.5 text-[10px] font-bold">↵</kbd> open
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="live-dot" /> PayMo services operational
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ Notifications ================================================================ */

function NotifDrawer() {
  const { notifOpen, setNotifOpen, open, toast, txns } = useApp();
  return (
    <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} width="max-w-[420px]">
      <DrawerHead
        title="Notifications"
        subtitle="Billing alerts, autopay events and payment receipts"
        icon="bell"
        onClose={() => setNotifOpen(false)}
        actions={
          <button
            onClick={() => toast({ title: "All caught up", msg: "Notifications marked as read.", tone: "success" })}
            className="focus-ring mr-1 rounded-lg px-2 py-1 text-[11.5px] font-bold text-[#067647] transition hover:bg-pmgreen-soft"
          >
            Mark all read
          </button>
        }
      />
      <div className="thin-scroll flex-1 overflow-y-auto p-3">
        <div className="mb-3 rounded-xl border border-line bg-[#fafbfd] p-3">
          <div className="flex items-center gap-2">
            <span className="live-dot amber" />
            <p className="text-[12.5px] font-bold text-ink">3 bills due in the next 7 days</p>
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
            M-KOPA KES 150 · Shop meter KES 6,000 · Office fibre KES 5,999 — total {kes(12149)}.
          </p>
          <Button size="sm" variant="dark" className="mt-2.5" icon="repeat" onClick={() => open({ kind: "autopay" })}>
            Review schedule
          </Button>
        </div>
        <div className="space-y-2">
          {NOTICES.map((n) => (
            <div key={n.id} className="group flex gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-[#d4dae4]">
              <span
                className={cn(
                  "grid h-9 w-9 flex-none place-items-center rounded-[10px]",
                  n.tone === "warning" && "bg-warn-soft text-[#93370d]",
                  n.tone === "info" && "bg-pmblue-soft text-[#175cd3]",
                  n.tone === "success" && "bg-pmgreen-soft text-[#067647]",
                  n.tone === "danger" && "bg-danger-soft text-[#b42318]",
                  n.tone === "muted" && "bg-canvas text-muted"
                )}
              >
                <Icon name={n.icon} size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-[13px] font-bold text-ink">{n.title}</p>
                  <span className="whitespace-nowrap text-[10.5px] font-semibold text-faint">{n.time}</span>
                </div>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{n.body}</p>
                {n.cta && (
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      if (n.id === "n1") open({ kind: "buy", utility: "electricity", accountId: "acc-1" });
                      else if (n.id === "n2") {
                        const pending = txns.find((t) => t.ref === "TXN-4490");
                        if (pending) open({ kind: "txn", txn: pending });
                      }
                      else if (n.id === "n5") open({ kind: "buy", utility: "water", accountId: "acc-3" });
                      else toast({ title: n.cta ?? "Opening", msg: "Loading details…", tone: "info" });
                    }}
                    className="focus-ring mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-[#067647] transition hover:gap-1.5"
                  >
                    {n.cta} <Icon name="arrow-right" size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line bg-[#fafbfd] px-4 py-3">
        <Button variant="outline" full icon="sliders" onClick={() => toast({ title: "Notification settings", msg: "Choose channels: SMS, email, in-app push.", tone: "info" })}>
          Notification preferences
        </Button>
      </div>
    </Drawer>
  );
}

/* ================================================================ Shell ================================================================ */

export function Shell({ children }: { children: ReactNode }) {
  const { setNavOpen, setPaletteOpen, setNotifOpen, notifOpen, open, toast, balance } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (st) => st.location.pathname });

  const active = pathname === "/utility/settings" ? "utilities" : pathname.replace("/utility/", "") || "home";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setPaletteOpen]);

  const onNav = (key: string, target?: string) => {
    setNavOpen(false);
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // find the nav item to check for a route
    const item = NAV_GROUPS.flatMap((g) => g.items).find((it) => it.key === key);
    if (item?.to) {
      navigate({ to: item.to });
      if (target) {
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else {
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
      }
      return;
    }
    if (target) {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
  };

  return (
    <div className="canvas-wash min-h-screen">
      {/* Desktop sidebar */}
      <aside className="side-glow fixed inset-y-0 left-0 z-40 hidden w-[252px] border-r border-white/5 lg:block">
        <SideNav onNav={onNav} active={active} />
      </aside>

      <div className="lg:pl-[252px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setNavOpen(true)} aria-label="Open navigation" className="focus-ring grid h-10 w-10 flex-none place-items-center rounded-xl border border-line text-ink lg:hidden">
              <Icon name="menu" size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-faint">
                <span>PayMo Business</span>
                <Icon name="chevron-right" size={12} />
                <span className="text-muted">Utilities</span>
              </div>
              <h1 className="truncate font-display text-[15.5px] font-bold tracking-tight text-ink sm:text-[17px]">Utility Settings &amp; Automation</h1>
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="focus-ring hidden h-10 items-center gap-2.5 rounded-xl border border-line bg-[#fafbfd] px-3 text-[12.5px] font-medium text-faint transition hover:border-[#c4c9d4] md:flex xl:w-[320px]"
            >
              <Icon name="search" size={16} />
              <span className="flex-1 text-left">Search meters, refs, actions…</span>
              <kbd className="rounded-md border border-line bg-white px-1.5 py-0.5 text-[10.5px] font-bold text-muted">⌘K</kbd>
            </button>

            <IconBtn icon="search" label="Search" className="md:hidden" onClick={() => setPaletteOpen(true)} />

            <button
              onClick={() => open({ kind: "topup" })}
              className="focus-ring hidden h-10 items-center gap-2 rounded-xl border border-pmgreen/25 bg-pmgreen-soft px-3 text-[12.5px] font-bold text-[#067647] transition hover:bg-[#d3f1e2] sm:flex"
            >
              <Icon name="wallet" size={16} />
              <span className="num">{kes(balance)}</span>
              <Icon name="plus" size={13} />
            </button>

            <div className="relative">
              <IconBtn icon="bell" label="Notifications" onClick={() => setNotifOpen(!notifOpen)} />
              <span className="pointer-events-none absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white ring-2 ring-white">5</span>
            </div>

            <Button icon="bolt" size="md" className="hidden sm:inline-flex" onClick={() => open({ kind: "buy", utility: "electricity" })}>
              Buy utilities
            </Button>

            <button onClick={() => open({ kind: "help" })} aria-label="Account" className="focus-ring hidden sm:block">
              <Avatar name="Joseph Mwangi" size={36} />
            </button>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm:px-6 lg:pb-12">{children}</main>

        <footer className="border-t border-line bg-white/60 px-4 py-6 sm:px-6 lg:pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink">
                <Icon name="bolt" size={14} className="text-pmgreen" strokeWidth={2.2} />
              </span>
              <p className="text-[12px] text-muted">
                <span className="font-bold text-ink-2">PayMo Business</span> · Settings 3.6 · Automation rules, guardrails, approvers, notifications and audit
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-muted">
              <button onClick={() => open({ kind: "tariff" })} className="transition hover:text-ink">
                Tariff & fees
              </button>
              <button onClick={() => open({ kind: "help" })} className="transition hover:text-ink">
                Help centre
              </button>
              <button
                onClick={() => toast({ title: "Report exported", msg: "Compliance pack queued — we'll email it in a few minutes.", tone: "success" })}
                className="transition hover:text-ink"
              >
                Compliance pack
              </button>
              <span className="flex items-center gap-1.5 rounded-full bg-pmgreen-soft px-2.5 py-1 text-[11px] font-bold text-[#067647]">
                <span className="live-dot" /> 99.98% uptime
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-line bg-white/95 backdrop-blur-xl lg:hidden">
        {[
          { key: "home", label: "Home", icon: "home" as const, to: "/utility" },
          { key: "electricity", label: "Utilities", icon: "grid" as const, to: "/utility/electricity" },
          { key: "__buy", label: "Buy", icon: "bolt" as const },
          { key: "history", label: "History", icon: "receipt" as const, to: "/utility", target: "sec-history" },
          { key: "water", label: "Water", icon: "droplet" as const, to: "/utility/water" },
        ].map((it) =>
          it.key === "__buy" ? (
            <button key={it.key} onClick={() => open({ kind: "buy", utility: "electricity" })} className="focus-ring flex flex-1 flex-col items-center justify-center gap-1 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-pmgreen text-white shadow-[0_8px_18px_-8px_rgba(18,183,106,0.9)]">
                <Icon name={it.icon} size={18} strokeWidth={2} />
              </span>
              <span className="text-[10px] font-bold text-[#067647]">{it.label}</span>
            </button>
          ) : (
            <button key={it.key} onClick={() => {
              if (it.to) {
                setNavOpen(false);
                navigate({ to: it.to });
                if (it.target) {
                  setTimeout(() => {
                    const el = document.getElementById(it.target!);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 120);
                } else {
                  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
                }
              }
            }} className="focus-ring flex flex-1 flex-col items-center justify-center gap-1 py-2.5">
              <Icon name={it.icon} size={19} className={pathname === it.to ? "text-pmgreen" : "text-faint"} />
              <span className={cn("text-[10px] font-bold", pathname === it.to ? "text-ink" : "text-faint")}>{it.label}</span>
            </button>
          )
        )}
      </nav>

      <Palette />
      <NotifDrawer />
      <MobileNavDrawer onNav={onNav} active={active} />
    </div>
  );

}

/* Mobile drawer nav */
function MobileNavDrawer({ onNav, active }: { onNav: (key: string, target?: string) => void; active: string }) {
  const { navOpen, setNavOpen } = useApp();
  return (
    <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" width="max-w-[280px]">
      <SideNav active={active} onNav={onNav} />
    </Drawer>
  );
}

export { MODULES, SCHEDULES, PAY_METHODS };
