import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Avatar, Badge, Button, IconBtn, Drawer, DrawerHead } from "./ui";
import { MODULES, NAV_GROUPS, NOTICES, PAY_METHODS, SCHEDULES, UTILITIES, kes, utilityOf } from "./data";
import { useApp } from "./store";

/* ================================================================ Sidebar ================================================================ */

function SideNav({ onNav, active }: { onNav: (key: string, target?: string) => void; active: string }) {
  return (
    <div className="d-flex h-100 flex-column">
      {/* Brand */}
      <div className="d-flex align-items-center gap-25 px-5 pt-5">
        <span className="d-grid h-9 w-9 flex-none place-items-center rounded-11px bg-pmgreen shadow-green-cta">
          <Icon name="bolt" size={19} className="text-white" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="font-display fs-15 fw-extrabold lh-1 tracking-tight text-white">PayMo</p>
          <p className="mt-1 fs-105 fw-semibold text-uppercase tracking-0-14em text-white-40">Business</p>
        </div>
        <Badge tone="dark" className="ms-auto border border-white-10 bg-white-10 fs-10 text-white-70">
          3.6
        </Badge>
      </div>

      {/* Org switcher */}
      <button className="focus-ring mx-3 mt-5 d-flex align-items-center gap-25 rounded-4 border border-white-8 bg-white-04 p-25 text-start transition hover-bg-white-08">
        <span className="d-grid h-8 w-8 flex-none place-items-center rounded-3 bg-pmviolet-25 fs-12 fw-bold text-violet-200">PH</span>
        <span className="min-w-0 flex-1">
          <span className="d-block text-truncate fs-125 fw-bold text-white">PayMo Hardware</span>
          <span className="d-block text-truncate fs-11 text-white-45">Kiambu Rd · 8 meters</span>
        </span>
        <Icon name="chevron-down" size={14} className="text-white-40" />
      </button>

      {/* Nav */}
      <nav className="dark-scroll mt-5 flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-5">
            <p className="mb-2 px-25 fs-10 fw-bold text-uppercase tracking-0-16em text-white-30">{g.title}</p>
            <div className="space-y-05">
              {g.items.map((it) => {
                const on = active === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={() => onNav(it.key, it.target)}
                    className={cn(
                      "group d-flex w-100 align-items-center gap-25 rounded-4 px-25 py-25 text-start fs-13 fw-semibold transition-all duration-150",
                      on ? "bg-white-10 text-white shadow-inset-white" : "text-white-55 hover-bg-white-06 hover-text-white"
                    )}
                  >
                    <Icon name={it.icon} size={17} className={cn("flex-none transition", on ? "text-pmgreen" : "text-white-45 group-hover-text-white-80")} />
                    <span className="flex-1 text-truncate">{it.label}</span>
                    {it.badge && <span className="rounded-2 bg-white-8 px-15 py-05 fs-10 fw-bold text-white-45">{it.badge}</span>}
                    {on && <span className="h-15 w-15 rounded-full bg-pmgreen" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Balance widget */}
        <div className="mx-1 rounded-5 border border-white-8 bg-gradient-to-br from-white-07 to-transparent p-4">
          <div className="d-flex align-items-center gap-2">
            <Icon name="wallet" size={15} className="text-pmgreen" />
            <p className="fs-11 fw-semibold text-uppercase tracking-wider text-white-45">Wallet</p>
          </div>
          <p className="num mt-15 font-display fs-19 fw-extrabold text-white">{kes(24500)}</p>
          <p className="mt-05 fs-11 text-white-40">Zero-fee utility payments</p>
          <button className="focus-ring mt-3 w-100 rounded-3 bg-white-12 py-2 fs-12 fw-bold text-white transition hover-bg-white-20">Top up wallet</button>
        </div>
      </nav>

      {/* Support + user */}
      <div className="border-top border-white-8 p-3">
        <button className="d-flex w-100 align-items-center gap-25 rounded-4 px-25 py-25 text-start fs-13 fw-semibold text-white-55 transition hover-bg-white-06 hover-text-white">
          <Icon name="lifebuoy" size={17} className="text-white-45" />
          Help centre
          <Icon name="external" size={13} className="ms-auto text-white-25" />
        </button>
        <div className="mt-1 d-flex align-items-center gap-25 rounded-4 bg-white-04 p-25">
          <Avatar name="Joseph Mwangi" size={32} tone="green" />
          <div className="min-w-0 flex-1">
            <p className="text-truncate fs-125 fw-bold text-white">Joseph Mwangi</p>
            <p className="text-truncate fs-11 text-white-45">Admin · j@paymo.co.ke</p>
          </div>
          <button aria-label="Sign out" className="d-grid h-7 w-7 place-items-center rounded-3 text-white-40 transition hover-bg-white-10 hover-text-white">
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
    <div className="position-fixed inset-0 z-95 d-flex align-items-start justify-content-center px-4 pt-10vh" role="dialog" aria-modal="true">
      <div className="overlay-fade position-absolute inset-0 bg-side-60 backdrop-blur-3px" onClick={() => setPaletteOpen(false)} />
      <div className="modal-pop position-relative w-100 max-w-560px overflow-hidden rounded-5 border border-line bg-white shadow-pm-lg">
        <div className="d-flex align-items-center gap-3 border-bottom border-line px-4 py-35">
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
            className="w-100 bg-transparent fs-14 fw-medium text-ink outline-none placeholder-text-faint"
          />
          <kbd className="d-none rounded-2 border border-line bg-canvas px-15 py-05 fs-105 fw-bold text-muted d-sm-block">ESC</kbd>
        </div>
        <div className="thin-scroll max-h-52vh overflow-y-auto p-2">
          {flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="fs-13 fw-semibold text-ink">No matches for “{q}”</p>
              <p className="mt-1 fs-12 text-muted">Try “KPLC”, “DSTV”, a meter number or a TXN reference.</p>
            </div>
          )}
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="mb-15">
              <p className="px-25 py-15 fs-10 fw-bold text-uppercase tracking-0-14em text-faint">{g}</p>
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
                    className={cn("d-flex w-100 align-items-center gap-3 rounded-4 px-25 py-25 text-start transition", activeItem ? "bg-canvas" : "hover-bg-paper-3")}
                  >
                    <span className={cn("d-grid h-8 w-8 flex-none place-items-center rounded-3", activeItem ? "bg-white text-ink shadow-sm" : "bg-canvas text-muted")}>
                      <Icon name={i.icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="d-block text-truncate fs-13 fw-semibold text-ink">{i.label}</span>
                      <span className="d-block text-truncate fs-115 text-muted">{i.sub}</span>
                    </span>
                    {activeItem && <Icon name="arrow-right" size={15} className="text-pmgreen" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="d-flex align-items-center justify-content-between border-top border-line bg-paper-2 px-4 py-25 fs-11 text-muted">
          <span className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1">
              <kbd className="rounded border border-line bg-white px-1 py-05 fs-10 fw-bold">↑↓</kbd> navigate
            </span>
            <span className="d-flex align-items-center gap-1">
              <kbd className="rounded border border-line bg-white px-1 py-05 fs-10 fw-bold">↵</kbd> open
            </span>
          </span>
          <span className="d-flex align-items-center gap-15">
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
    <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} width="max-w-420px">
      <DrawerHead
        title="Notifications"
        subtitle="Billing alerts, autopay events and payment receipts"
        icon="bell"
        onClose={() => setNotifOpen(false)}
        actions={
          <button
            onClick={() => toast({ title: "All caught up", msg: "Notifications marked as read.", tone: "success" })}
            className="focus-ring me-1 rounded-3 px-2 py-1 fs-115 fw-bold text-pmgreen-ink transition hover-bg-pmgreen-soft"
          >
            Mark all read
          </button>
        }
      />
      <div className="thin-scroll flex-1 overflow-y-auto p-3">
        <div className="mb-3 rounded-4 border border-line bg-paper-2 p-3">
          <div className="d-flex align-items-center gap-2">
            <span className="live-dot amber" />
            <p className="fs-125 fw-bold text-ink">3 bills due in the next 7 days</p>
          </div>
          <p className="mt-1 fs-115 leading-relaxed text-muted">
            M-KOPA KES 150 · Shop meter KES 6,000 · Office fibre KES 5,999 — total {kes(12149)}.
          </p>
          <Button size="sm" variant="dark" className="mt-25" icon="repeat" onClick={() => open({ kind: "autopay" })}>
            Review schedule
          </Button>
        </div>
        <div className="space-y-2">
          {NOTICES.map((n) => (
            <div key={n.id} className="group d-flex gap-3 rounded-4 border border-line bg-white p-3 transition hover-border-gray-350">
              <span
                className={cn(
                  "d-grid h-9 w-9 flex-none place-items-center rounded-10px",
                  n.tone === "warning" && "bg-warn-soft text-warn-ink",
                  n.tone === "info" && "bg-pmblue-soft text-pmblue-ink",
                  n.tone === "success" && "bg-pmgreen-soft text-pmgreen-ink",
                  n.tone === "danger" && "bg-danger-soft text-danger-ink",
                  n.tone === "muted" && "bg-canvas text-muted"
                )}
              >
                <Icon name={n.icon} size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="d-flex align-items-start gap-2">
                  <p className="flex-1 fs-13 fw-bold text-ink">{n.title}</p>
                  <span className="text-nowrap fs-105 fw-semibold text-faint">{n.time}</span>
                </div>
                <p className="mt-05 fs-12 leading-relaxed text-muted">{n.body}</p>
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
                    className="focus-ring mt-15 d-inline-flex align-items-center gap-1 fs-12 fw-bold text-pmgreen-ink transition hover-gap-15"
                  >
                    {n.cta} <Icon name="arrow-right" size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-top border-line bg-paper-2 px-4 py-3">
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
    <div className="canvas-wash min-vh-100">
      {/* Desktop sidebar */}
      <aside className="side-glow position-fixed inset-y-0 start-0 z-40 d-none w-252px border-end border-white-5 d-lg-block">
        <SideNav onNav={onNav} active={active} />
      </aside>

      <div className="lg-pl-252px">
        {/* Topbar */}
        <header className="position-sticky top-0 z-30 border-bottom border-line bg-white-85 backdrop-blur-xl">
          <div className="d-flex align-items-center gap-3 px-4 py-3 sm-px-6">
            <button onClick={() => setNavOpen(true)} aria-label="Open navigation" className="focus-ring d-grid h-10 w-10 flex-none place-items-center rounded-4 border border-line text-ink d-lg-none">
              <Icon name="menu" size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="d-flex align-items-center gap-15 fs-115 fw-semibold text-faint">
                <span>PayMo Business</span>
                <Icon name="chevron-right" size={12} />
                <span className="text-muted">Utilities</span>
              </div>
              <h1 className="text-truncate font-display fs-155 fw-bold tracking-tight text-ink sm-fs-17">Utility Settings &amp; Automation</h1>
            </div>

            <button
              onClick={() => setPaletteOpen(true)}
              className="focus-ring d-none h-10 align-items-center gap-25 rounded-4 border border-line bg-paper-2 px-3 fs-125 fw-medium text-faint transition hover-border-gray-400 d-md-flex xl-w-320px"
            >
              <Icon name="search" size={16} />
              <span className="flex-1 text-start">Search meters, refs, actions…</span>
              <kbd className="rounded-2 border border-line bg-white px-15 py-05 fs-105 fw-bold text-muted">⌘K</kbd>
            </button>

            <IconBtn icon="search" label="Search" className="d-md-none" onClick={() => setPaletteOpen(true)} />

            <button
              onClick={() => open({ kind: "topup" })}
              className="focus-ring d-none h-10 align-items-center gap-2 rounded-4 border border-pmgreen-25 bg-pmgreen-soft px-3 fs-125 fw-bold text-pmgreen-ink transition hover-bg-pmgreen-hover d-sm-flex"
            >
              <Icon name="wallet" size={16} />
              <span className="num">{kes(balance)}</span>
              <Icon name="plus" size={13} />
            </button>

            <div className="position-relative">
              <IconBtn icon="bell" label="Notifications" onClick={() => setNotifOpen(!notifOpen)} />
              <span className="pe-none position-absolute right-15 top-15 d-grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 fs-95 fw-bold text-white ring-2 ring-white">5</span>
            </div>

            <Button icon="bolt" size="md" className="d-none d-sm-inline-flex" onClick={() => open({ kind: "buy", utility: "electricity" })}>
              Buy utilities
            </Button>

            <button onClick={() => open({ kind: "help" })} aria-label="Account" className="focus-ring d-none d-sm-block">
              <Avatar name="Joseph Mwangi" size={36} />
            </button>
          </div>
        </header>

        <main className="px-4 pb-28 pt-5 sm-px-6 lg-pb-12">{children}</main>

        <footer className="border-top border-line bg-white-60 px-4 py-6 sm-px-6 lg-pb-8">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-4">
            <div className="d-flex align-items-center gap-25">
              <span className="d-grid h-7 w-7 place-items-center rounded-3 bg-ink">
                <Icon name="bolt" size={14} className="text-pmgreen" strokeWidth={2.2} />
              </span>
              <p className="fs-12 text-muted">
                <span className="fw-bold text-ink-2">PayMo Business</span> · Settings 3.6 · Automation rules, guardrails, approvers, notifications and audit
              </p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-4 fs-12 fw-semibold text-muted">
              <button onClick={() => open({ kind: "tariff" })} className="transition hover-text-ink">
                Tariff & fees
              </button>
              <button onClick={() => open({ kind: "help" })} className="transition hover-text-ink">
                Help centre
              </button>
              <button
                onClick={() => toast({ title: "Report exported", msg: "Compliance pack queued — we'll email it in a few minutes.", tone: "success" })}
                className="transition hover-text-ink"
              >
                Compliance pack
              </button>
              <span className="d-flex align-items-center gap-15 rounded-full bg-pmgreen-soft px-25 py-1 fs-11 fw-bold text-pmgreen-ink">
                <span className="live-dot" /> 99.98% uptime
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="position-fixed bottom-0 start-0 end-0 z-30 d-flex align-items-stretch border-top border-line bg-white-95 backdrop-blur-xl d-lg-none">
        {[
          { key: "home", label: "Home", icon: "home" as const, to: "/utility" },
          { key: "electricity", label: "Utilities", icon: "grid" as const, to: "/utility/electricity" },
          { key: "__buy", label: "Buy", icon: "bolt" as const },
          { key: "history", label: "History", icon: "receipt" as const, to: "/utility", target: "sec-history" },
          { key: "water", label: "Water", icon: "droplet" as const, to: "/utility/water" },
        ].map((it) =>
          it.key === "__buy" ? (
            <button key={it.key} onClick={() => open({ kind: "buy", utility: "electricity" })} className="focus-ring d-flex flex-1 flex-column align-items-center justify-content-center gap-1 py-25">
              <span className="d-grid h-9 w-9 place-items-center rounded-4 bg-pmgreen text-white shadow-green-btn">
                <Icon name={it.icon} size={18} strokeWidth={2} />
              </span>
              <span className="fs-10 fw-bold text-pmgreen-ink">{it.label}</span>
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
            }} className="focus-ring d-flex flex-1 flex-column align-items-center justify-content-center gap-1 py-25">
              <Icon name={it.icon} size={19} className={pathname === it.to ? "text-pmgreen" : "text-faint"} />
              <span className={cn("fs-10 fw-bold", pathname === it.to ? "text-ink" : "text-faint")}>{it.label}</span>
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
    <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" width="max-w-280px">
      <SideNav active={active} onNav={onNav} />
    </Drawer>
  );
}

export { MODULES, SCHEDULES, PAY_METHODS };
