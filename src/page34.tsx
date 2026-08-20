import { useMemo, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "./utils/cn";
import { useReveal } from "./utils/useReveal";
import {
  Badge,
  Button,
  Card,
  Chip,
  Donut,
  Empty,
  IconBtn,
  Input,
  Menu,
  Progress,
  Row,
  SectionHead,
  Segmented,
  Select,
  Spark,
  type Tone,
} from "./ui";
import { kes } from "./data";
import { useApp } from "./store";

/* ===================================================================== */
/*                              TYPES                                    */
/* ===================================================================== */

type ConnStatus = "Active" | "Expiring" | "Low data" | "Paused" | "Outage";
type ConnKind = "Fibre" | "Mobile" | "Satellite";

interface Connection {
  id: string;
  provider: string;
  providerShort: string;
  account: string;
  nickname: string;
  location: string;
  kind: ConnKind;
  plan: string;
  speed?: string;
  status: ConnStatus;
  balance?: string;
  dataUsed?: string;
  dataTotal?: string;
  dataPct?: number;
  nextBill: number;
  dueDate: string;
  dueDays: number;
  autopay: boolean;
  latency?: string;
  uptime?: string;
}

interface Renewal {
  id: string;
  provider: string;
  plan: string;
  amount: number;
  date: string;
  active: boolean;
  connectionId: string;
}

interface NetPayment {
  id: string;
  date: string;
  time: string;
  provider: string;
  account: string;
  nickname: string;
  plan: string;
  amount: number;
  method: string;
  ref: string;
  status: "Success" | "Pending" | "Failed";
}

interface NetNotice {
  id: string;
  provider: string;
  title: string;
  body: string;
  time: string;
  tone: Tone;
  icon: IconName;
  cta?: string;
}

interface Suggestion {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  saving?: string;
  tone: Tone;
}

interface NetOutage {
  id: string;
  provider: string;
  area: string;
  title: string;
  window: string;
  impact: "Low" | "Medium" | "High";
}

/* ===================================================================== */
/*                              DATA                                     */
/* ===================================================================== */

const connections: Connection[] = [
  {
    id: "c-saf-fibre",
    provider: "Safaricom Home Fibre",
    providerShort: "Safaricom",
    account: "SF-40812",
    nickname: "Home fibre",
    location: "Karen · Main house",
    kind: "Fibre",
    plan: "Gold 40 Mbps",
    speed: "40 Mbps",
    status: "Expiring",
    dataUsed: "812 GB",
    dataTotal: "Unlimited",
    dataPct: 100,
    nextBill: 5999,
    dueDate: "01 Jul 2025",
    dueDays: 3,
    autopay: true,
    latency: "4 ms",
    uptime: "99.97%",
  },
  {
    id: "c-zuku",
    provider: "Zuku Fibre",
    providerShort: "Zuku",
    account: "ZK-882041",
    nickname: "Shop internet",
    location: "Westlands · Hardware store",
    kind: "Fibre",
    plan: "Business 20 Mbps",
    speed: "20 Mbps",
    status: "Outage",
    dataUsed: "241 GB",
    dataTotal: "Unlimited",
    dataPct: 100,
    nextBill: 3850,
    dueDate: "05 Jul 2025",
    dueDays: 8,
    autopay: false,
    latency: "8 ms",
    uptime: "94.3%",
  },
  {
    id: "c-starlink",
    provider: "Starlink",
    providerShort: "Starlink",
    account: "SL-KE-0941",
    nickname: "Starlink roam",
    location: "Kiambu · Pump house backup",
    kind: "Satellite",
    plan: "Regional Roam",
    speed: "100 Mbps",
    status: "Active",
    dataUsed: "98 GB",
    dataTotal: "1 TB priority",
    dataPct: 10,
    nextBill: 6500,
    dueDate: "15 Jul 2025",
    dueDays: 18,
    autopay: true,
    latency: "45 ms",
    uptime: "99.8%",
  },
  {
    id: "c-saf-sim1",
    provider: "Safaricom",
    providerShort: "Safaricom",
    account: "0712***890",
    nickname: "Personal SIM",
    location: "Handset · J. Mwangi",
    kind: "Mobile",
    plan: "12 GB + 600 min",
    status: "Active",
    balance: "8.4 GB left",
    dataUsed: "3.6 GB",
    dataTotal: "12 GB",
    dataPct: 30,
    nextBill: 1000,
    dueDate: "22 Jul 2025",
    dueDays: 25,
    autopay: true,
    latency: "28 ms",
  },
  {
    id: "c-airtel",
    provider: "Airtel",
    providerShort: "Airtel",
    account: "0733***456",
    nickname: "Team SIM",
    location: "Handset · Sales desk",
    kind: "Mobile",
    plan: "5 GB Daily",
    status: "Low data",
    balance: "420 MB left",
    dataUsed: "4.6 GB",
    dataTotal: "5 GB",
    dataPct: 92,
    nextBill: 500,
    dueDate: "28 Jun 2025",
    dueDays: 1,
    autopay: false,
    latency: "32 ms",
  },
  {
    id: "c-telkom",
    provider: "Telkom",
    providerShort: "Telkom",
    account: "0770***221",
    nickname: "Backup SIM",
    location: "Handset · Office router",
    kind: "Mobile",
    plan: "Paused · No active bundle",
    status: "Paused",
    balance: "0 MB",
    dataUsed: "0 GB",
    dataTotal: "0 GB",
    dataPct: 0,
    nextBill: 0,
    dueDate: "—",
    dueDays: 99,
    autopay: false,
    latency: "—",
  },
];

const renewals: Renewal[] = [
  { id: "r1", provider: "Safaricom Home Fibre", plan: "Gold 40 Mbps", amount: 5999, date: "1st of month", active: true, connectionId: "c-saf-fibre" },
  { id: "r2", provider: "Starlink", plan: "Regional Roam", amount: 6500, date: "15th of month", active: true, connectionId: "c-starlink" },
  { id: "r3", provider: "Airtel", plan: "12 GB monthly", amount: 1000, date: "Monthly auto", active: false, connectionId: "c-airtel" },
  { id: "r4", provider: "Safaricom", plan: "12 GB + 600 min", amount: 1000, date: "22nd of month", active: true, connectionId: "c-saf-sim1" },
];

const netPayments: NetPayment[] = [
  { id: "np1", date: "20 Jun", time: "12:20", provider: "Safaricom Fibre", account: "SF-40812", nickname: "Home fibre", plan: "Gold 40 Mbps", amount: 5999, method: "Bank", ref: "NET-4490", status: "Pending" },
  { id: "np2", date: "15 Jun", time: "08:00", provider: "Starlink", account: "SL-KE-0941", nickname: "Starlink roam", plan: "Regional Roam", amount: 6500, method: "M-Pesa", ref: "NET-3821", status: "Success" },
  { id: "np3", date: "10 Jun", time: "09:31", provider: "Safaricom", account: "0712***890", nickname: "Personal SIM", plan: "12 GB + 600 min", amount: 1000, method: "M-Pesa", ref: "NET-3102", status: "Success" },
  { id: "np4", date: "05 Jun", time: "14:12", provider: "Zuku Fibre", account: "ZK-882041", nickname: "Shop internet", plan: "Business 20 Mbps", amount: 3850, method: "Wallet", ref: "NET-2741", status: "Success" },
  { id: "np5", date: "01 Jun", time: "08:00", provider: "Safaricom Fibre", account: "SF-40812", nickname: "Home fibre", plan: "Gold 40 Mbps", amount: 5999, method: "Wallet", ref: "NET-2210", status: "Success" },
  { id: "np6", date: "28 May", time: "11:45", provider: "Airtel", account: "0733***456", nickname: "Team SIM", plan: "5 GB Daily", amount: 500, method: "M-Pesa", ref: "NET-1809", status: "Failed" },
];

const notices: NetNotice[] = [
  { id: "n1", provider: "Safaricom", title: "Home Fibre expires in 3 days", body: "Acc #SF-40812 · KES 5,999 renewal due 01 Jul", time: "2 hrs ago", tone: "warning", icon: "wifi", cta: "Renew now" },
  { id: "n2", provider: "Airtel", title: "Team SIM data below 500 MB", body: "0733***456 · auto-renew is paused · manual buy recommended", time: "5 hrs ago", tone: "danger", icon: "phone", cta: "Buy data" },
  { id: "n3", provider: "Zuku", title: "Area outage reported in Kilimani", body: "Degraded speeds · expected fix by 16:00 today", time: "8 hrs ago", tone: "danger", icon: "wifi", cta: "View status" },
  { id: "n4", provider: "Starlink", title: "Firmware update deployed", body: "Latency improved to 45 ms · no downtime required", time: "1 day ago", tone: "info", icon: "sparkle" },
];

const suggestions: Suggestion[] = [
  { id: "s1", icon: "trend-up", title: "Upgrade to Faiba 40 Mbps", body: "Save KES 2,149/mo vs current Safaricom Gold plan for equivalent speed.", saving: "KES 2,149/mo", tone: "success" },
  { id: "s2", icon: "repeat", title: "Switch to 30-day data bundle", body: "Your daily Airtel bundles cost 20% more than a single monthly package.", saving: "KES 1,200/yr", tone: "warning" },
  { id: "s3", icon: "sliders", title: "Automate Airtel Team SIM", body: "Never run out mid-call — auto-renew at 500 MB remaining.", tone: "info" },
  { id: "s4", icon: "pause-circle", title: "Freeze Telkom Backup SIM", body: "No bundle active for 42 days. Freeze the line to avoid minimum charges.", tone: "muted" },
];

const outages: NetOutage[] = [
  { id: "o1", provider: "Safaricom Fibre", area: "Karen", title: "No active interruption", window: "100% uptime last 7 days", impact: "Low" },
  { id: "o2", provider: "Zuku Fibre", area: "Kilimani / Westlands", title: "Degraded speeds in area", window: "Expected fix 16:00 today", impact: "High" },
  { id: "o3", provider: "Starlink", area: "Kiambu", title: "Normal operation", window: "45 ms latency · firmware v2.6", impact: "Low" },
];

const monthlyGB = [148, 162, 174, 192, 205, 218, 232, 248, 264, 278, 296, 312];
const monthlyCost = [9500, 10200, 11800, 13400, 14200, 15349, 16100, 17200, 18600, 19800, 21400, 22349];
const dailyGBs = [6.2, 7.1, 6.8, 8.4, 9.1, 12.3, 14.8, 11.2, 8.9, 7.6, 6.9, 8.1, 9.4, 10.2];



const usageMix = [
  { label: "Streaming", value: 68, color: "#7a5af8" },
  { label: "Work / Cloud", value: 18, color: "#2e90fa" },
  { label: "Social", value: 9, color: "#12b76a" },
  { label: "Other", value: 5, color: "#98a2b3" },
];

/* ===================================================================== */
/*                              HELPERS                                  */
/* ===================================================================== */

function statusTone(s: ConnStatus): Tone {
  if (s === "Active") return "success";
  if (s === "Expiring") return "warning";
  if (s === "Low data") return "danger";
  if (s === "Outage") return "danger";
  return "muted";
}

function kindIcon(k: ConnKind): IconName {
  if (k === "Fibre") return "wifi";
  if (k === "Mobile") return "phone";
  return "sparkle";
}

function paymentTone(s: NetPayment["status"]): Tone {
  if (s === "Success") return "success";
  if (s === "Pending") return "warning";
  return "danger";
}

/* ===================================================================== */
/*                           MAIN PAGE                                   */
/* ===================================================================== */

export function InternetPage() {
  const { open, toast, balance } = useApp();
  const [filter, setFilter] = useState<"all" | "fibre" | "mobile" | "attention">("all");
  const [range, setRange] = useState<"7" | "30">("30");
  const [query, setQuery] = useState("");
  const [payStatus, setPayStatus] = useState<"all" | NetPayment["status"]>("all");


  useReveal([filter, payStatus, query]);

  const fibreConns = connections.filter((c) => c.kind === "Fibre" || c.kind === "Satellite");
  const mobileConns = connections.filter((c) => c.kind === "Mobile");
  const attentionConns = connections.filter((c) => ["Expiring", "Low data", "Outage"].includes(c.status));
  const totalMonthly = connections.reduce((s, c) => s + c.nextBill, 0);
  const renewalsDue = connections.filter((c) => c.dueDays <= 7 && c.status !== "Paused").length;
  const autoCount = renewals.filter((r) => r.active).length;
  const totalDataTB = "1.2 TB";

  const shownConns = useMemo(() => {
    if (filter === "fibre") return fibreConns;
    if (filter === "mobile") return mobileConns;
    if (filter === "attention") return attentionConns;
    return connections;
  }, [filter]);

  const shownPayments = useMemo(() => {
    let rows = netPayments;
    if (payStatus !== "all") rows = rows.filter((p) => p.status === payStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((p) => `${p.provider} ${p.account} ${p.nickname} ${p.plan} ${p.ref}`.toLowerCase().includes(q));
    }
    return rows;
  }, [payStatus, query]);

  return (
    <div className="mx-auto max-w-[1320px]">
      {/* ========================= HERO ========================= */}
      <section className="pm-hero relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-9">
        <div className="pm-hero-dots pointer-events-none absolute inset-0" />
        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-10">
          {/* left */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 backdrop-blur">
              <span className="live-dot" /> Connectivity hub online · Safaricom, Zuku, Starlink gateways operational
            </span>
            <h2 className="mt-4 font-display text-[27px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[36px] lg:text-[42px]">
              Internet &amp; connectivity,
              <br className="hidden sm:block" /> every link in one hub.
            </h2>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
              Manage home fibre, office broadband, satellite backups and mobile SIMs from one PayMo Business page. Renew, track data, catch outages and automate every subscription.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" icon="wifi" onClick={() => open({ kind: "buy", utility: "internet", accountId: "acc-5", amount: 5999 })}>
                Renew fibre
              </Button>
              <Button size="lg" variant="white" icon="phone" onClick={() => open({ kind: "buy", utility: "airtime" })}>
                Buy data bundle
              </Button>
              <Button size="lg" variant="white" icon="download" onClick={() => open({ kind: "export" })}>
                Export history
              </Button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {[
                { k: "Monthly data", v: totalDataTB, s: "92% from fibre", icon: "gauge" as IconName },
                { k: "Renewals in 7d", v: kes(connections.filter((c) => c.dueDays <= 7 && c.status !== "Paused").reduce((s, c) => s + c.nextBill, 0)), s: `${renewalsDue} subscriptions`, icon: "calendar" as IconName },
                { k: "Auto-renewals", v: `${autoCount} rules`, s: "Next: tomorrow 8 AM", icon: "repeat" as IconName },
                { k: "Wallet", v: kes(balance), s: "Zero-fee renewal", icon: "wallet" as IconName },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
                  <Icon name={x.icon} size={15} className="text-pmgreen" />
                  <p className="num mt-2 font-display text-[17px] font-extrabold text-white">{x.v}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white/40">{x.k}</p>
                  <p className="mt-1 text-[10.5px] text-white/55">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — live feed + quick actions */}
          <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="live-dot amber" />
              <p className="text-[12px] font-bold text-white">Live connectivity feed</p>
            </div>
            <div className="mt-3 space-y-2">
              {notices.slice(0, 3).map((n) => (
                <button
                  key={n.id}
                  className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]"
                  onClick={() => {
                    if (n.cta === "Renew now") open({ kind: "buy", utility: "internet", accountId: "acc-5", amount: 5999 });
                    else if (n.cta === "Buy data") open({ kind: "buy", utility: "airtime" });
                    else toast({ title: n.title, msg: n.body, tone: n.tone === "danger" ? "warn" : "info" });
                  }}
                >
                  <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/10 text-white/70">
                    <Icon name={n.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold text-white">{n.title}</span>
                    <span className="block truncate text-[10.5px] text-white/50">{n.body}</span>
                  </span>
                  <Badge tone={n.tone} className="flex-none">{n.provider}</Badge>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-ink/20 p-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                <Icon name="sparkle" size={13} className="text-pmgreen" /> Smart suggestions
              </div>
              <div className="mt-2 space-y-1.5">
                {suggestions.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex items-start gap-2.5 rounded-lg bg-white/[0.04] p-2">
                    <Icon name={s.icon} size={14} className="mt-0.5 text-pmgreen" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11.5px] font-bold text-white">{s.title}</span>
                      <span className="block text-[10.5px] text-white/50">{s.body}</span>
                    </span>
                    {s.saving && <span className="whitespace-nowrap text-[10.5px] font-bold text-pmgreen">{s.saving}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Renew fibre", icon: "wifi" as IconName, onClick: () => open({ kind: "buy", utility: "internet", accountId: "acc-5", amount: 5999 }) },
                { label: "Buy SIM data", icon: "phone" as IconName, onClick: () => open({ kind: "buy", utility: "airtime" }) },
                { label: "Manage autopay", icon: "repeat" as IconName, onClick: () => open({ kind: "autopay" }) },
                { label: "Report outage", icon: "alert" as IconName, onClick: () => toast({ title: "Outage report", msg: "Zuku Kilimani issue has been escalated.", tone: "warn" }) },
              ].map((x) => (
                <button key={x.label} onClick={x.onClick} className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition hover:border-white/25 hover:bg-white/[0.09]">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/10 text-white/70"><Icon name={x.icon} size={15} /></span>
                  <span className="text-[12px] font-bold text-white">{x.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================= KPIs ========================= */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-reveal>
        <Kpi label="Monthly internet cost" value={kes(totalMonthly)} sub={`${connections.length} active subscriptions`} icon="wallet" tone="info" spark={<Spark points={monthlyCost} stroke="#2e90fa" />} />
        <Kpi label="Data consumed" value={totalDataTB} sub="Across fibre, satellite & mobile" icon="gauge" tone="teal" spark={<Spark points={monthlyGB} stroke="#0e9384" />} />
        <Kpi label="Needs attention" value={`${attentionConns.length} links`} sub="Expiring, low data or outage" icon="alert" tone="danger" progress={Math.round((attentionConns.length / connections.length) * 100)} />
        <Kpi label="Auto-renew coverage" value={`${autoCount}/${renewals.length}`} sub="Active renewal rules" icon="repeat" tone="success" progress={Math.round((autoCount / renewals.length) * 100)} />
      </section>

      {/* ========================= 3.4.1 — CONNECTIONS ========================= */}
      <SectionHead no="3.4" id="sec-connections" title="Broadband, mobile & satellite connections" sub="Fibre, mobile SIMs and satellite links in one operational view with speed, data, status and renewal info.">
        <div className="flex flex-wrap gap-2">
          <Chip on={filter === "all"} onClick={() => setFilter("all")} count={connections.length}>All</Chip>
          <Chip on={filter === "fibre"} onClick={() => setFilter("fibre")} count={fibreConns.length}>Fibre & satellite</Chip>
          <Chip on={filter === "mobile"} onClick={() => setFilter("mobile")} count={mobileConns.length}>Mobile SIMs</Chip>
          <Chip on={filter === "attention"} onClick={() => setFilter("attention")} count={attentionConns.length}>Needs attention</Chip>
        </div>
      </SectionHead>

      {shownConns.length === 0 ? (
        <Card>
          <Empty icon="wifi" title="No connections match that filter" sub="Switch filters or add a new broadband, SIM or satellite account." action={<Button icon="plus" onClick={() => open({ kind: "addAccount", utility: "internet" })}>Add connection</Button>} />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shownConns.map((c, i) => (
            <ConnectionCard key={c.id} conn={c} delay={i * 45} />
          ))}
          <button data-reveal onClick={() => open({ kind: "addAccount", utility: "internet" })} className="flex min-h-[280px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-white/70 p-5 text-center transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/20">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted"><Icon name="plus" size={22} /></span>
            <p className="text-[13.5px] font-bold text-ink">Add a connection</p>
            <p className="max-w-[30ch] text-[11.5px] leading-relaxed text-muted">Safaricom Fibre, Zuku, Faiba, Starlink or any Kenyan mobile SIM — verified in seconds.</p>
          </button>
        </div>
      )}

      {/* ========================= 3.4A — FIBRE TABLE ========================= */}
      <SectionHead no="3.4A" id="sec-fibre-table" title="Broadband & fiber connections" sub="Fixed connections with speed, uptime, latency and billing in one table.">
        <Button size="sm" variant="outline" icon="plus" onClick={() => open({ kind: "addAccount", utility: "internet" })}>Add broadband</Button>
      </SectionHead>

      <Card className="overflow-hidden p-0">
        {/* desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[920px]">
            <thead className="bg-[#fafbfd]">
              <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Location / Plan</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Next bill</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {fibreConns.map((c) => (
                <tr key={c.id} className="transition hover:bg-[#f7f9fc]">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name={kindIcon(c.kind)} size={15} /></span>
                      <span className="text-[12.5px] font-bold text-ink">{c.provider}</span>
                    </span>
                  </td>
                  <td className="num px-4 py-3 text-[12px] font-semibold text-ink-2">{c.account}</td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-ink-2">{c.location}</span>
                    <span className="block text-[11px] text-faint">{c.plan}</span>
                  </td>
                  <td className="num px-4 py-3 text-[12.5px] font-bold text-ink">{c.speed}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(c.status)} dot>{c.status}</Badge></td>
                  <td className="num px-4 py-3 text-right">
                    <span className="text-[12.5px] font-bold text-ink">{kes(c.nextBill)}</span>
                    <span className="block text-[11px] text-faint">{c.dueDate}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Button size="sm" icon="wifi" onClick={() => open({ kind: "buy", utility: "internet", accountId: c.account === "SF-40812" ? "acc-5" : undefined, amount: c.nextBill })}>Renew</Button>
                      <IconBtn icon="sliders" label="Manage" tone="outline" onClick={() => open({ kind: "autopay" })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* mobile cards for fibre */}
        <div className="divide-y divide-line lg:hidden">
          {fibreConns.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3.5">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-canvas text-muted"><Icon name={kindIcon(c.kind)} size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-ink">{c.provider}</span>
                  <span className="num text-[13px] font-extrabold text-ink">{kes(c.nextBill)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[11.5px] text-muted">{c.plan} · {c.speed}</span>
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </div>
              </div>
              <IconBtn icon="chevron-right" label="Open" tone="ghost" onClick={() => open({ kind: "buy", utility: "internet", accountId: c.account === "SF-40812" ? "acc-5" : undefined, amount: c.nextBill })} />
            </div>
          ))}
        </div>
      </Card>

      {/* ========================= 3.4B — MOBILE SIMs ========================= */}
      <SectionHead no="3.4B" id="sec-mobile" title="Mobile data & airtime management" sub="Track data balances across SIMs, automate bundle renewals and catch low-data warnings before calls drop.">
        <Button size="sm" variant="outline" icon="phone" onClick={() => open({ kind: "buy", utility: "airtime" })}>Buy airtime / data</Button>
      </SectionHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {mobileConns.map((c) => (
          <Card key={c.id} hover className="relative" >
            <div className="flex items-start gap-3">
              <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", c.status === "Paused" ? "bg-canvas text-faint" : "bg-pmgreen-soft text-[#067647]")}><Icon name="phone" size={20} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[13.5px] font-bold text-ink">{c.nickname}</p>
                  <Badge tone={statusTone(c.status)} dot>{c.status}</Badge>
                </div>
                <p className="num mt-0.5 text-[11.5px] text-muted">{c.account} · {c.providerShort}</p>
              </div>
              <Menu trigger={() => <span className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="more" size={16} /></span>} items={[
                { label: "Buy data / airtime", icon: "phone", onClick: () => open({ kind: "buy", utility: "airtime" }) },
                { label: "Set auto-renew", icon: "repeat", onClick: () => open({ kind: "autopay" }) },
                { label: "View usage", icon: "chart", onClick: () => toast({ title: "Usage report", msg: `${c.nickname} usage breakdown loading…`, tone: "info" }) },
                { label: "Freeze line", icon: "pause-circle", onClick: () => toast({ title: "Line frozen", msg: `${c.nickname} paused until re-activation.`, tone: "warn" }) },
              ]} />
            </div>

            <div className={cn("mt-3 rounded-xl p-3", c.status === "Low data" ? "bg-danger-soft/50" : c.status === "Paused" ? "bg-canvas/70" : "bg-[#fafbfd]")}>
              <Row k="Plan" v={c.plan} />
              <Row k="Data remaining" v={c.balance ?? "—"} strong />
              {c.dataPct !== undefined && <Progress value={c.dataPct} tone={c.dataPct > 80 ? "red" : c.dataPct > 50 ? "amber" : "green"} className="mt-2" />}
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                <span>{c.dataUsed} used</span>
                <span>{c.dataTotal} total</span>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-line bg-white p-3">
              <Row k="Next renewal" v={c.nextBill > 0 ? kes(c.nextBill) : "—"} />
              <Row k="Due" v={c.dueDate} />
              <Row k="Latency" v={c.latency ?? "—"} />
            </div>

            <div className="mt-3 flex gap-2">
              <Button className="flex-1" icon="phone" disabled={c.status === "Paused"} onClick={() => open({ kind: "buy", utility: "airtime" })}>
                {c.status === "Paused" ? "Reactivate first" : "Buy data"}
              </Button>
              <IconBtn icon="repeat" label="Auto-renew" tone="outline" onClick={() => open({ kind: "autopay" })} />
            </div>
          </Card>
        ))}
      </div>

      {/* ========================= 3.4C — ANALYTICS ========================= */}
      <SectionHead no="3.4C" id="sec-analytics" title="Analytics, subscriptions & automation" sub="Bandwidth trends, auto-renew schedules, network outages and cost-saving intelligence.">
        <Segmented value={range} onChange={setRange} size="sm" options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* data usage chart */}
        <Card className="lg:col-span-2" hover>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Total data usage (GB)</p>
              <p className="mt-0.5 text-[12px] text-muted">Daily breakdown · peak streaming at 68% of traffic.</p>
            </div>
            <Badge tone="teal" icon="trend-up">1.2 TB this month</Badge>
          </div>
          <div className="mt-5 flex h-[210px] items-end gap-2 sm:gap-3">
            {dailyGBs.map((v, i) => (
              <div key={i} className="group relative flex h-full flex-1 items-end">
                <div className={cn("bar-grow w-full rounded-t-md", v >= 12 ? "bg-pmviolet" : v >= 9 ? "bg-pmblue" : "bg-pmgreen")} style={{ height: `${(v / Math.max(...dailyGBs)) * 100}%`, animationDelay: `${i * 30}ms` }} />
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10.5px] font-bold text-white group-hover:block">
                  Day {i + 1} · {v} GB
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10.5px] font-semibold text-muted">
            <span>14 Jun</span><span>18 Jun</span><span>22 Jun</span><span>27 Jun</span>
          </div>
          <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
            {[
              { k: "Total this period", v: totalDataTB },
              { k: "Peak category", v: "Streaming (68%)" },
              { k: "Monthly cost", v: kes(totalMonthly) },
            ].map((x) => (
              <div key={x.k} className="rounded-xl bg-[#fafbfd] p-3">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-faint">{x.k}</p>
                <p className="num mt-0.5 font-display text-[15px] font-extrabold text-ink">{x.v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* donut + renewals + outages */}
        <div className="space-y-3">
          <Card hover>
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Usage by category</p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Donut data={usageMix} center={<><p className="num font-display text-[16px] font-extrabold text-ink">1.2 TB</p><p className="text-[10.5px] font-semibold text-muted">total</p></>} />
              <div className="w-full flex-1 space-y-2">
                {usageMix.map((x) => (
                  <div key={x.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: x.color }} />
                    <span className="flex-1 truncate text-[12px] font-semibold text-ink-2">{x.label}</span>
                    <span className="num text-[12px] font-bold text-ink">{x.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-2">
              <Icon name="repeat" size={16} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Auto-renewals</p>
            </div>
            <div className="mt-3 space-y-2">
              {renewals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-line bg-[#fafbfd] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{r.provider}</p>
                    <p className="num mt-0.5 text-[11px] text-muted">{r.plan} · {kes(r.amount)} on {r.date}</p>
                  </div>
                  <Badge tone={r.active ? "success" : "muted"} dot>{r.active ? "Active" : "Paused"}</Badge>
                </div>
              ))}
            </div>
            <Button className="mt-3" full variant="outline" icon="sliders" onClick={() => open({ kind: "autopay" })}>Manage all rules</Button>
          </Card>

          <Card hover>
            <div className="flex items-center gap-2">
              <Icon name="map-pin" size={16} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Network status & outages</p>
            </div>
            <div className="mt-3 space-y-2">
              {outages.map((o) => (
                <div key={o.id} className="rounded-xl border border-line bg-[#fafbfd] p-3">
                  <div className="flex items-start gap-2">
                    <span className={cn("mt-0.5 h-2 w-2 flex-none rounded-full", o.impact === "High" ? "bg-danger" : o.impact === "Medium" ? "bg-warn" : "bg-pmgreen")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-bold text-ink">{o.provider}</p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{o.title}</p>
                      <p className="mt-1 text-[11px] font-semibold text-ink-2">{o.window}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ========================= PAYMENT HISTORY ========================= */}
      <SectionHead no="3.4D" id="sec-history" title="Internet payment history" sub="Every fibre, satellite and mobile renewal, receipted and reconciled with PayMo references.">
        <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export</Button>
      </SectionHead>

      <Card className="p-0">
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[220px] flex-1">
              <Input icon="search" placeholder="Search provider, account, plan or reference…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value as typeof payStatus)} className="w-auto">
              <option value="all">All payment states</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "Success", "Pending", "Failed"] as const).map((s) => (
              <Chip key={s} on={payStatus === s} onClick={() => setPayStatus(s)} count={s === "all" ? netPayments.length : netPayments.filter((p) => p.status === s).length}>
                {s === "all" ? "All" : s}
              </Chip>
            ))}
            <span className="ml-auto text-[11.5px] font-semibold text-muted">{shownPayments.length} of {netPayments.length}</span>
          </div>
        </div>

        {shownPayments.length === 0 ? (
          <Empty icon="search" title="No payments match that search" sub="Try a reference like NET-4490 or a provider name." action={<Button variant="outline" icon="refresh" onClick={() => { setQuery(""); setPayStatus("all"); }}>Reset search</Button>} />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#fafbfd]">
                  <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shownPayments.map((p) => (
                    <tr key={p.id} className="cursor-pointer transition hover:bg-[#f7f9fc]" onClick={() => toast({ title: `Receipt for ${p.ref}`, msg: `${p.provider} · ${kes(p.amount)} · ${p.method}`, tone: "info" })}>
                      <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-ink-2">{p.date}<span className="ml-1.5 text-[11px] font-normal text-faint">{p.time}</span></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name="wifi" size={14} /></span>
                          <span className="text-[12.5px] font-semibold text-ink">{p.provider}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className="num text-[12px] text-muted">{p.account}</span><span className="block text-[11px] text-faint">{p.nickname}</span></td>
                      <td className="px-4 py-3 text-[12px] text-muted">{p.plan}</td>
                      <td className="num px-4 py-3 text-right text-[12.5px] font-bold text-ink">{kes(p.amount)}</td>
                      <td className="px-4 py-3 text-[12px] text-muted">{p.method}</td>
                      <td className="num px-4 py-3 text-[11.5px] font-semibold text-muted">{p.ref}</td>
                      <td className="px-4 py-3"><Badge tone={paymentTone(p.status)} dot>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* mobile list */}
            <div className="divide-y divide-line lg:hidden">
              {shownPayments.map((p) => (
                <button key={p.id} onClick={() => toast({ title: `Receipt for ${p.ref}`, msg: `${p.provider} · ${kes(p.amount)} · ${p.method}`, tone: "info" })} className="flex w-full items-center gap-3 p-3.5 text-left transition active:bg-[#f7f9fc]">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-canvas text-muted"><Icon name="wifi" size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-ink">{p.provider}</span>
                      <span className="num text-[13px] font-extrabold text-ink">{kes(p.amount)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="num truncate text-[11.5px] text-muted">{p.date} · {p.plan}</span>
                      <Badge tone={paymentTone(p.status)}>{p.status}</Badge>
                    </span>
                  </span>
                  <Icon name="chevron-right" size={15} className="flex-none text-faint" />
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* ========================= SUPPORT STRIP ========================= */}
      <section className="mt-6 grid gap-3 lg:grid-cols-3" data-reveal>
        <Card className="lg:col-span-2 bg-gradient-to-br from-ink via-[#0f2233] to-[#0d5c38] text-white" hover>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[52ch]">
              <Badge tone="dark" className="border border-white/15 bg-white/10 text-white/80">Operations</Badge>
              <h3 className="mt-3 font-display text-[19px] font-extrabold tracking-tight">Uptime SLAs, outage playbooks and failover</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                Route Zuku outage alerts to the facilities team, auto-switch critical traffic to Starlink when fibre drops, and require approval for subscriptions above KES 5,000/month.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="white" icon="bell" onClick={() => toast({ title: "Outage alerts enabled", msg: "Facilities team will receive WhatsApp and email notifications.", tone: "success" })}>Enable alerts</Button>
                <Button variant="white" icon="shield" onClick={() => toast({ title: "Approval policy set", msg: "Subscriptions above KES 5,000/mo require Finance sign-off.", tone: "info" })}>Approval policy</Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>ISP support</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              {[
                { k: "Fibre uptime", v: "99.97%", i: "check-circle" as IconName },
                { k: "Avg latency", v: "4 ms", i: "gauge" as IconName },
                { k: "Auto-failover", v: "Ready", i: "refresh" as IconName },
              ].map((x) => (
                <div key={x.k} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-3">
                  <Icon name={x.i} size={16} className="text-pmgreen" />
                  <div>
                    <p className="num font-display text-[15px] font-extrabold leading-none">{x.v}</p>
                    <p className="mt-1 text-[10.5px] text-white/50">{x.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-2">
            <Icon name="sparkle" size={16} className="text-pmviolet" />
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Cost-saving suggestions</p>
          </div>
          <div className="mt-3 space-y-2.5">
            {suggestions.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3">
                <Icon name={s.icon} size={16} className="mt-0.5 flex-none text-pmgreen" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{s.body}</p>
                  {s.saving && <p className="num mt-1 text-[11.5px] font-bold text-[#067647]">Save {s.saving}</p>}
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="repeat" onClick={() => open({ kind: "autopay" })}>Apply smart rules</Button>
        </Card>
      </section>
    </div>
  );
}

/* ===================================================================== */
/*                       CONNECTION CARD                                 */
/* ===================================================================== */

function ConnectionCard({ conn, delay }: { conn: Connection; delay: number }) {
  const { open, toast } = useApp();
  const risk = ["Low data", "Outage", "Expiring"].includes(conn.status);
  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start gap-3">
        <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", conn.kind === "Mobile" ? "bg-pmgreen-soft text-[#067647]" : conn.kind === "Satellite" ? "bg-pmblue-soft text-[#175cd3]" : "bg-pmviolet-soft text-[#5925dc]")}>
          <Icon name={kindIcon(conn.kind)} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13.5px] font-bold text-ink">{conn.nickname}</p>
            <Badge tone={statusTone(conn.status)} dot>{conn.status}</Badge>
          </div>
          <p className="num mt-0.5 text-[11.5px] text-muted">{conn.account} · {conn.providerShort}</p>
        </div>
        <Menu trigger={() => <span className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="more" size={16} /></span>} items={[
          { label: conn.kind === "Mobile" ? "Buy data" : "Renew plan", icon: conn.kind === "Mobile" ? "phone" : "wifi", onClick: () => open({ kind: "buy", utility: conn.kind === "Mobile" ? "airtime" : "internet", amount: conn.nextBill }) },
          { label: "Set auto-renew", icon: "repeat", onClick: () => open({ kind: "autopay" }) },
          { label: "Usage report", icon: "chart", onClick: () => toast({ title: "Usage report", msg: `${conn.nickname} usage breakdown loading…`, tone: "info" }) },
          { label: conn.status === "Outage" ? "Track outage" : "Report issue", icon: "alert", onClick: () => toast({ title: conn.status === "Outage" ? "Outage tracked" : "Issue reported", msg: `Escalation created for ${conn.provider}.`, tone: "warn" }) },
        ]} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="muted">{conn.kind}</Badge>
        {conn.speed && <Badge tone="muted" icon="gauge">{conn.speed}</Badge>}
        {conn.autopay && <Badge tone="success" icon="repeat">Autopay</Badge>}
      </div>

      <div className={cn("mt-3 rounded-xl p-3", risk ? (conn.status === "Outage" ? "bg-danger-soft/50" : "bg-warn-soft/50") : "bg-[#fafbfd]")}>
        <Row k="Plan" v={conn.plan} />
        {conn.kind === "Mobile" ? (
          <Row k="Data remaining" v={conn.balance ?? "—"} strong />
        ) : (
          <Row k="Data used" v={conn.dataUsed ?? "—"} />
        )}
        {conn.dataPct !== undefined && conn.dataPct > 0 && (
          <Progress value={conn.dataPct} tone={conn.dataPct > 80 ? "red" : conn.dataPct > 50 ? "amber" : "green"} className="mt-2" />
        )}
        <Row k="Latency" v={conn.latency ?? "—"} />
        {conn.uptime && <Row k="Uptime (7d)" v={conn.uptime} />}
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white p-3">
        <Row k="Next bill" v={conn.nextBill > 0 ? kes(conn.nextBill) : "—"} strong />
        <Row k="Due" v={conn.dueDate} />
        <Row k="Location" v={conn.location} />
      </div>

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" icon={conn.kind === "Mobile" ? "phone" : "wifi"} disabled={conn.status === "Paused"} onClick={() => open({ kind: "buy", utility: conn.kind === "Mobile" ? "airtime" : "internet", accountId: conn.account === "SF-40812" ? "acc-5" : undefined, amount: conn.nextBill })}>
          {conn.status === "Paused" ? "Reactivate" : conn.kind === "Mobile" ? "Buy data" : "Renew plan"}
        </Button>
        <IconBtn icon="repeat" label="Auto-renew" tone="outline" onClick={() => open({ kind: "autopay" })} />
      </div>
    </div>
  );
}

/* ===================================================================== */
/*                              KPI CARD                                 */
/* ===================================================================== */

function Kpi({ label, value, sub, icon, tone, spark, progress }: { label: string; value: string; sub: string; icon: IconName; tone: Tone; spark?: ReactNode; progress?: number }) {
  const toneCls: Record<string, string> = {
    success: "bg-pmgreen-soft text-[#067647]",
    warning: "bg-warn-soft text-[#93370d]",
    danger: "bg-danger-soft text-[#b42318]",
    info: "bg-pmblue-soft text-[#175cd3]",
    teal: "bg-pmteal-soft text-[#07615a]",
    violet: "bg-pmviolet-soft text-[#5925dc]",
    muted: "bg-canvas text-muted",
    dark: "bg-ink text-white",
  };
  return (
    <div className="card-hover rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p>
          <p className="num mt-1.5 font-display text-[21px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
          <p className="mt-1.5 truncate text-[11px] leading-relaxed text-muted">{sub}</p>
        </div>
        <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[11px]", toneCls[tone])}>
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-end">{spark}</div>
      {progress !== undefined && <Progress value={progress} tone={tone === "danger" ? "red" : tone === "warning" ? "amber" : tone === "info" ? "blue" : "green"} className="mt-3" />}
    </div>
  );
}
