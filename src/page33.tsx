import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import { cn } from "./utils/cn";
import { useReveal } from "./utils/useReveal";
import { Badge, Button, Card, Chip, Donut, Empty, IconBtn, Input, Menu, Progress, Row, SectionHead, Segmented, Select, Spark } from "./ui";
import { kes, num } from "./data";
import { useApp } from "./store";

type AccountStatus = "Due soon" | "Paid" | "High use" | "Overdue";
type ProviderType = "County water" | "Borehole" | "Commercial";

type WaterAccount = {
  id: string;
  number: string;
  nickname: string;
  provider: string;
  location: string;
  type: ProviderType;
  owner: string;
  balance: number;
  dueDate: string;
  dueDays: number;
  avgM3: number;
  currentM3: number;
  lastReading: string;
  lastPaid: string;
  lastAmount: number;
  status: AccountStatus;
  autopay: boolean;
  alerts: boolean;
};

type WaterPayment = {
  id: string;
  date: string;
  time: string;
  provider: string;
  account: string;
  nickname: string;
  amount: number;
  method: string;
  ref: string;
  status: "Success" | "Pending" | "Failed";
  receipt: string;
};

type ServiceNotice = {
  id: string;
  area: string;
  title: string;
  window: string;
  impact: "Low" | "Medium" | "High";
  affected: string;
};

const accounts: WaterAccount[] = [
  { id: "w-home", number: "290081", nickname: "Home water", provider: "Nairobi Water (NCWSC)", location: "Karen, Nairobi", type: "County water", owner: "J. Mwangi", balance: 3200, dueDate: "28 Jun 2025", dueDays: 1, avgM3: 18.4, currentM3: 17.8, lastReading: "26 Jun 2025", lastPaid: "25 Jun 2025", lastAmount: 3200, status: "Due soon", autopay: true, alerts: true },
  { id: "w-shop", number: "NW-882901", nickname: "Shop washrooms", provider: "Nairobi Water (NCWSC)", location: "Westlands, Nairobi", type: "Commercial", owner: "J.K. Holdings Ltd", balance: 6850, dueDate: "30 Jun 2025", dueDays: 3, avgM3: 41.2, currentM3: 45.1, lastReading: "25 Jun 2025", lastPaid: "28 May 2025", lastAmount: 5900, status: "High use", autopay: false, alerts: true },
  { id: "w-rental", number: "KI-204818", nickname: "Rental A water", provider: "Kiambu Water", location: "Ruiru, Kiambu", type: "County water", owner: "PayMo Rentals", balance: 1450, dueDate: "05 Jul 2025", dueDays: 8, avgM3: 11.3, currentM3: 10.7, lastReading: "24 Jun 2025", lastPaid: "04 Jun 2025", lastAmount: 1350, status: "Paid", autopay: true, alerts: false },
  { id: "w-borehole", number: "BH-001488", nickname: "Borehole permit", provider: "WRA / Borehole", location: "Kiambu pump house", type: "Borehole", owner: "J.K. Holdings Ltd", balance: 9800, dueDate: "22 Jun 2025", dueDays: -5, avgM3: 63.8, currentM3: 69.5, lastReading: "22 Jun 2025", lastPaid: "21 May 2025", lastAmount: 8400, status: "Overdue", autopay: false, alerts: true },
  { id: "w-office", number: "NC-909182", nickname: "Office kitchenette", provider: "Nairobi Water (NCWSC)", location: "Kilimani, Nairobi", type: "Commercial", owner: "PayMo Hardware", balance: 870, dueDate: "10 Jul 2025", dueDays: 13, avgM3: 6.8, currentM3: 6.3, lastReading: "20 Jun 2025", lastPaid: "10 Jun 2025", lastAmount: 820, status: "Paid", autopay: true, alerts: false },
];

const payments: WaterPayment[] = [
  { id: "wp1", date: "25 Jun", time: "09:14", provider: "NCWSC", account: "290081", nickname: "Home water", amount: 3200, method: "Wallet", ref: "WTR-7721", status: "Success", receipt: "NCWSC-09257821" },
  { id: "wp2", date: "19 Jun", time: "11:30", provider: "Kiambu Water", account: "KI-204818", nickname: "Rental A water", amount: 1350, method: "M-Pesa", ref: "WTR-7108", status: "Success", receipt: "KW-435212" },
  { id: "wp3", date: "10 Jun", time: "14:02", provider: "NCWSC", account: "NC-909182", nickname: "Office kitchenette", amount: 820, method: "Wallet", ref: "WTR-6644", status: "Success", receipt: "NCWSC-0966644" },
  { id: "wp4", date: "05 Jun", time: "12:22", provider: "WRA / Borehole", account: "BH-001488", nickname: "Borehole permit", amount: 8400, method: "Bank", ref: "WTR-5920", status: "Failed", receipt: "WRA-ACK-5920" },
  { id: "wp5", date: "28 May", time: "17:09", provider: "NCWSC", account: "NW-882901", nickname: "Shop washrooms", amount: 5900, method: "M-Pesa", ref: "WTR-5501", status: "Success", receipt: "NCWSC-095501" },
  { id: "wp6", date: "23 May", time: "08:45", provider: "NCWSC", account: "290081", nickname: "Home water", amount: 2800, method: "M-Pesa", ref: "WTR-5021", status: "Pending", receipt: "NCWSC-095021" },
];

const serviceNotices: ServiceNotice[] = [
  { id: "s1", area: "Karen / Langata", title: "Trunk main valve maintenance", window: "Sat 29 Jun, 08:00 - 16:00", impact: "Medium", affected: "Home water account may have reduced supply" },
  { id: "s2", area: "Westlands", title: "No active interruption", window: "Network operating normally", impact: "Low", affected: "Shop washrooms clear" },
  { id: "s3", area: "Ruiru", title: "Pressure testing", window: "Sun 30 Jun, 22:00 - 03:00", impact: "Low", affected: "Rental A may see lower pressure" },
];

const monthlyUsage = [52, 61, 58, 63, 68, 71, 73, 78, 82, 79, 91, 87];
const monthlyCost = [7800, 9300, 8700, 10300, 10800, 11800, 12200, 13900, 15100, 14500, 17800, 16520];
const dailyUse = [15, 18, 17, 19, 20, 26, 32, 41, 48, 44, 36, 28, 24, 20];
const accountMix = [
  { label: "Home water", value: 3200, color: "#2e90fa" },
  { label: "Shop washrooms", value: 6850, color: "#0e9384" },
  { label: "Rental A", value: 1450, color: "#12b76a" },
  { label: "Borehole", value: 9800, color: "#7a5af8" },
  { label: "Office", value: 870, color: "#f79009" },
];

function accountTone(status: AccountStatus) {
  if (status === "Paid") return "success" as const;
  if (status === "Due soon") return "warning" as const;
  if (status === "High use" || status === "Overdue") return "danger" as const;
  return "muted" as const;
}

function paymentTone(status: WaterPayment["status"]) {
  if (status === "Success") return "success" as const;
  if (status === "Pending") return "warning" as const;
  return "danger" as const;
}

export function WaterPage() {
  const { open, toast, balance } = useApp();
  const [filter, setFilter] = useState<"all" | "due" | "auto" | "attention">("all");
  const [selected, setSelected] = useState(accounts[0]);
  const [range, setRange] = useState<"7" | "30">("30");
  const [query, setQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"all" | WaterPayment["status"]>("all");

  useReveal([filter, paymentStatus, query]);

  const dueAccounts = accounts.filter((a) => a.dueDays <= 3 && a.status !== "Paid");
  const attentionAccounts = accounts.filter((a) => ["High use", "Overdue"].includes(a.status));
  const outstanding = accounts.reduce((sum, a) => sum + a.balance, 0);
  const autoCount = accounts.filter((a) => a.autopay).length;
  const shownAccounts = useMemo(() => {
    if (filter === "due") return accounts.filter((a) => a.dueDays <= 3 && a.status !== "Paid");
    if (filter === "auto") return accounts.filter((a) => a.autopay);
    if (filter === "attention") return attentionAccounts;
    return accounts;
  }, [filter, attentionAccounts]);
  const shownPayments = useMemo(() => {
    let rows = payments;
    if (paymentStatus !== "all") rows = rows.filter((p) => p.status === paymentStatus);
    if (query.trim()) {
      const term = query.toLowerCase();
      rows = rows.filter((p) => `${p.provider} ${p.account} ${p.nickname} ${p.ref} ${p.receipt}`.toLowerCase().includes(term));
    }
    return rows;
  }, [paymentStatus, query]);

  return (
    <div className="mx-auto max-w-[1320px]">
      <section className="pm-hero relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-9">
        <div className="pm-hero-dots pointer-events-none absolute inset-0" />
        <div className="relative grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:gap-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 backdrop-blur">
              <span className="live-dot" /> NCWSC, county water and borehole payment rails operational
            </span>
            <h2 className="mt-4 font-display text-[27px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[36px] lg:text-[42px]">
              Water bills under control,
              <br className="hidden sm:block" /> from tap to audit trail.
            </h2>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
              Pay county water bills, monitor consumption, surface abnormal use, protect critical sites from service interruptions and automate every monthly renewal from PayMo Business.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" icon="droplet" onClick={() => open({ kind: "buy", utility: "water", accountId: "acc-3", amount: 3200 })}>Pay water bill</Button>
              <Button size="lg" variant="white" icon="repeat" onClick={() => open({ kind: "autopay", accountId: "acc-3" })}>Set up autopay</Button>
              <Button size="lg" variant="white" icon="download" onClick={() => open({ kind: "export" })}>Export payments</Button>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                { k: "Outstanding water", v: kes(outstanding), s: `${dueAccounts.length} due within 3 days`, i: "receipt" as const },
                { k: "Automated bills", v: `${autoCount}/${accounts.length}`, s: "autopay rules active", i: "repeat" as const },
                { k: "Wallet ready", v: kes(balance), s: "zero-fee bill settlement", i: "wallet" as const },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
                  <Icon name={x.i} size={16} className="text-pmgreen" />
                  <p className="num mt-2 font-display text-[18px] font-extrabold text-white">{x.v}</p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-white/40">{x.k}</p>
                  <p className="mt-1 text-[11px] text-white/55">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-[13px] bg-pmblue/20 text-pmblue"><Icon name="droplet" size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">Next priority</p>
                <p className="mt-1 font-display text-[18px] font-extrabold text-white">Home water due tomorrow</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/55">Settle KES 3,200 from wallet and receive the official NCWSC receipt instantly.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {accounts.slice(0, 4).map((a) => (
                <button key={a.id} onClick={() => setSelected(a)} className={cn("flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition", selected.id === a.id ? "border-pmgreen/60 bg-pmgreen/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]")}>
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/10 text-white"><Icon name={a.type === "Borehole" ? "gauge" : "droplet"} size={15} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold text-white">{a.nickname}</span><span className="num block truncate text-[10.5px] text-white/45">{a.number} · {a.provider}</span></span>
                  <Badge tone={accountTone(a.status)}>{a.status}</Badge>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-ink/20 p-3">
              <Row k={<span className="text-white/55">Selected account</span>} v={<span className="text-white">{selected.nickname}</span>} />
              <Row k={<span className="text-white/55">Bill balance</span>} v={<span className="text-white">{kes(selected.balance)}</span>} />
              <Row k={<span className="text-white/55">Due</span>} v={<span className="text-white">{selected.dueDays < 0 ? `${Math.abs(selected.dueDays)} days overdue` : `${selected.dueDays} days`}</span>} />
              <Button className="mt-2" full icon="droplet" onClick={() => open({ kind: "buy", utility: "water", accountId: selected.number === "290081" ? "acc-3" : undefined, amount: selected.balance })}>Pay selected account</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-reveal>
        <Kpi label="Water spend" value={kes(payments.reduce((sum, p) => sum + p.amount, 0))} sub="Recent settlement value" icon="wallet" tone="info" spark={<Spark points={monthlyCost} stroke="#2e90fa" />} />
        <Kpi label="Consumption" value={`${num(monthlyUsage[monthlyUsage.length - 1], 0)} m3`} sub="Metered sites this month" icon="gauge" tone="warning" spark={<Spark points={monthlyUsage} stroke="#0e9384" />} />
        <Kpi label="Needs review" value={`${attentionAccounts.length} accounts`} sub="High usage or overdue" icon="alert" tone="danger" progress={40} />
        <Kpi label="Autopay coverage" value={`${autoCount}/${accounts.length}`} sub="Monthly bills automated" icon="repeat" tone="success" progress={(autoCount / accounts.length) * 100} />
      </section>

      <SectionHead no="3.3" id="sec-accounts" title="Water accounts" sub="County water, commercial sites and borehole obligations in one billing view.">
        <div className="flex flex-wrap gap-2">
          <Chip on={filter === "all"} onClick={() => setFilter("all")} count={accounts.length}>All accounts</Chip>
          <Chip on={filter === "due"} onClick={() => setFilter("due")} count={dueAccounts.length}>Due soon</Chip>
          <Chip on={filter === "auto"} onClick={() => setFilter("auto")} count={autoCount}>On autopay</Chip>
          <Chip on={filter === "attention"} onClick={() => setFilter("attention")} count={attentionAccounts.length}>Needs review</Chip>
        </div>
      </SectionHead>

      {shownAccounts.length === 0 ? <Card><Empty icon="droplet" title="No accounts match that filter" sub="Switch filters or link a new water account to continue." action={<Button icon="plus" onClick={() => open({ kind: "addAccount", utility: "water" })}>Add water account</Button>} /></Card> : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shownAccounts.map((a, i) => <AccountCard key={a.id} account={a} delay={i * 40} />)}
          <button data-reveal onClick={() => open({ kind: "addAccount", utility: "water" })} className="flex min-h-[268px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-white/70 p-5 text-center transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/20">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted"><Icon name="plus" size={22} /></span>
            <p className="text-[13.5px] font-bold text-ink">Add a water account</p>
            <p className="max-w-[30ch] text-[11.5px] leading-relaxed text-muted">NCWSC, county water, commercial meters and borehole accounts can all be verified in seconds.</p>
          </button>
        </div>
      )}

      <SectionHead no="3.3A" id="sec-pay-flow" title="Pay water bills with confidence" sub="The original 3.3 modal flow expanded into a clear account, amount and authorisation journey.">
        <Button size="sm" variant="outline" icon="plus" onClick={() => open({ kind: "addAccount", utility: "water" })}>Link account</Button>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" hover>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-display text-[15px] font-bold tracking-tight text-ink">Water bill settlement</p><p className="mt-0.5 text-[12px] leading-relaxed text-muted">The PayMo payment journey validates the account, lets you split or overpay the balance, and stores the biller receipt.</p></div><Badge tone="success" dot>NCWSC acknowledgement live</Badge></div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { no: "1", title: "Select account", body: "Saved account and current bill", icon: "droplet" as const },
              { no: "2", title: "Set payment", body: "Full, partial or extra credit", icon: "wallet" as const },
              { no: "3", title: "Authorise", body: "M-Pesa, wallet or bank PIN", icon: "lock" as const },
              { no: "4", title: "Store receipt", body: "Biller ref plus PayMo audit trail", icon: "check-circle" as const },
            ].map((s) => <div key={s.no} className="rounded-2xl border border-line bg-[#fafbfd] p-3.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-[11px] font-bold text-white">{s.no}</span><Icon name={s.icon} size={16} className="mt-3 text-pmgreen" /><p className="mt-2 text-[12.5px] font-bold text-ink">{s.title}</p><p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{s.body}</p></div>)}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[{ label: "Full bill", amount: 3200, note: "Clears Home water" }, { label: "Half bill", amount: 1600, note: "Partial settlement" }, { label: "Overpay", amount: 5000, note: "Carry credit forward" }].map((x) => <button key={x.label} onClick={() => open({ kind: "buy", utility: "water", accountId: "acc-3", amount: x.amount })} className="rounded-xl border border-line bg-white p-3 text-left transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/20"><p className="text-[11px] font-bold uppercase tracking-wide text-faint">{x.label}</p><p className="num mt-1 font-display text-[18px] font-extrabold text-ink">{kes(x.amount)}</p><p className="mt-0.5 text-[11.5px] text-muted">{x.note}</p></button>)}
          </div>
          <Button className="mt-4" icon="droplet" onClick={() => open({ kind: "buy", utility: "water", accountId: "acc-3", amount: 3200 })}>Open water payment modal</Button>
        </Card>

        <Card hover>
          <div className="flex items-center gap-2"><Icon name="target" size={16} className="text-pmviolet" /><p className="font-display text-[15px] font-bold tracking-tight text-ink">Smart payment guardrails</p></div>
          <div className="mt-3 space-y-2.5">
            {[
              { icon: "check-circle" as const, title: "Bill validation", body: "We show current balance before payment." },
              { icon: "repeat" as const, title: "Credit-aware autopay", body: "Skip the rule if your account is in credit." },
              { icon: "shield" as const, title: "Large-bill controls", body: "Approval required above KES 7,500." },
              { icon: "refresh" as const, title: "Auto-reversal", body: "Unacknowledged payments are traced and reversed." },
            ].map((x) => <div key={x.title} className="flex gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3"><Icon name={x.icon} size={16} className="mt-0.5 flex-none text-pmgreen" /><div><p className="text-[12.5px] font-bold text-ink">{x.title}</p><p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{x.body}</p></div></div>)}
          </div>
          <Button full className="mt-3" variant="soft" icon="sliders" onClick={() => open({ kind: "autopay", accountId: "acc-3" })}>Tune guardrails</Button>
        </Card>
      </div>

      <SectionHead no="3.3B" id="sec-usage" title="Consumption and service intelligence" sub="See abnormal consumption, plan around supply notices and find opportunities to reduce the next bill.">
        <Segmented value={range} onChange={setRange} size="sm" options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2" hover>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-display text-[15px] font-bold tracking-tight text-ink">Daily consumption anomaly watch</p><p className="mt-0.5 text-[12px] text-muted">Shop washrooms rose 18% above baseline on Wed - likely cleaning or a leak.</p></div><Badge tone="danger" icon="trend-up">+18% vs baseline</Badge></div>
          <div className="mt-5 flex h-[210px] items-end gap-2 sm:gap-3">
            {dailyUse.map((v, i) => <div key={i} className="group relative flex h-full flex-1 items-end"><div className={cn("bar-grow w-full rounded-t-md", i === 8 ? "bg-danger" : i >= 6 ? "bg-warn" : "bg-pmblue")} style={{ height: `${(v / Math.max(...dailyUse)) * 100}%`, animationDelay: `${i * 35}ms` }} /><span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10.5px] font-bold text-white group-hover:block">Day {i + 1} - {v} m3</span></div>)}
          </div>
          <div className="mt-3 flex justify-between text-[10.5px] font-semibold text-muted"><span>14 Jun</span><span>18 Jun</span><span>22 Jun</span><span>26 Jun</span></div>
          <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-3">
            {[{ k: "Expected month", v: `${num(87, 0)} m3` }, { k: "Projected bill", v: kes(range === "30" ? 18400 : 4280) }, { k: "Leak saving potential", v: kes(2250) }].map((x) => <div key={x.k} className="rounded-xl bg-[#fafbfd] p-3"><p className="text-[10.5px] font-bold uppercase tracking-wide text-faint">{x.k}</p><p className="num mt-0.5 font-display text-[15px] font-extrabold text-ink">{x.v}</p></div>)}
          </div>
        </Card>

        <div className="space-y-3">
          <Card hover>
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Spend by account</p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Donut data={accountMix} center={<><p className="num font-display text-[16px] font-extrabold text-ink">{kes(accountMix.reduce((s, x) => s + x.value, 0))}</p><p className="text-[10.5px] font-semibold text-muted">due now</p></>} />
              <div className="w-full flex-1 space-y-2">{accountMix.map((x) => <div key={x.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: x.color }} /><span className="flex-1 truncate text-[12px] font-semibold text-ink-2">{x.label}</span><span className="num text-[12px] font-bold text-ink">{kes(x.value)}</span></div>)}</div>
            </div>
          </Card>
          <Card hover>
            <div className="flex items-center gap-2"><Icon name="map-pin" size={16} className="text-pmgreen" /><p className="font-display text-[15px] font-bold tracking-tight text-ink">Service interruption watch</p></div>
            <div className="mt-3 space-y-2">{serviceNotices.map((x) => <div key={x.id} className="rounded-xl border border-line bg-[#fafbfd] p-3"><div className="flex items-start gap-2"><Badge tone={x.impact === "High" ? "danger" : x.impact === "Medium" ? "warning" : "success"}>{x.impact}</Badge><div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">{x.area}</p><p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{x.title}</p></div></div><p className="mt-2 text-[11px] font-semibold text-ink-2">{x.window}</p><p className="mt-0.5 text-[11px] text-muted">{x.affected}</p></div>)}</div>
          </Card>
        </div>
      </div>

      <SectionHead no="3.3C" id="sec-history" title="Water payment history" sub="Every county water settlement carries both the biller receipt reference and PayMo audit reference.">
        <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export</Button>
      </SectionHead>

      <Card className="p-0">
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-2"><div className="min-w-[220px] flex-1"><Input icon="search" placeholder="Search account, provider, payment or receipt..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)} className="w-auto"><option value="all">All payment states</option><option value="Success">Success</option><option value="Pending">Pending</option><option value="Failed">Failed</option></Select></div>
          <div className="flex flex-wrap items-center gap-2">{(["all", "Success", "Pending", "Failed"] as const).map((s) => <Chip key={s} on={paymentStatus === s} onClick={() => setPaymentStatus(s)} count={s === "all" ? payments.length : payments.filter((p) => p.status === s).length}>{s === "all" ? "All" : s}</Chip>)}<span className="ml-auto text-[11.5px] font-semibold text-muted">{shownPayments.length} of {payments.length} shown</span></div>
        </div>
        {shownPayments.length === 0 ? <Empty icon="search" title="No water payments match that search" sub="Try an account number like 290081 or a reference like WTR-7721." action={<Button variant="outline" icon="refresh" onClick={() => { setQuery(""); setPaymentStatus("all"); }}>Reset search</Button>} /> : <>
          <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[900px]"><thead className="bg-[#fafbfd]"><tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Account</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">PayMo reference</th><th className="px-4 py-3">Biller receipt</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-line">{shownPayments.map((p) => <tr key={p.id} className="transition hover:bg-[#f7f9fc]"><td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-ink-2">{p.date}<span className="ml-1.5 text-[11px] font-normal text-faint">{p.time}</span></td><td className="px-4 py-3 text-[12.5px] font-semibold text-ink">{p.provider}</td><td className="px-4 py-3"><span className="num text-[12px] text-muted">{p.account}</span><span className="block text-[11px] text-faint">{p.nickname}</span></td><td className="num px-4 py-3 text-right text-[12.5px] font-bold text-ink">{kes(p.amount)}</td><td className="px-4 py-3 text-[12px] text-muted">{p.method}</td><td className="num px-4 py-3 text-[11.5px] font-semibold text-muted">{p.ref}</td><td className="num px-4 py-3 text-[11.5px] font-semibold text-muted">{p.receipt}</td><td className="px-4 py-3"><Badge tone={paymentTone(p.status)} dot>{p.status}</Badge></td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" icon="receipt" onClick={() => toast({ title: "Receipt opened", msg: `${p.receipt} and ${p.ref} are ready to share.`, tone: "info" })}>Receipt</Button></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-line lg:hidden">{shownPayments.map((p) => <button key={p.id} onClick={() => toast({ title: "Receipt opened", msg: `${p.receipt} and ${p.ref} are ready to share.`, tone: "info" })} className="flex w-full items-center gap-3 p-3.5 text-left transition active:bg-[#f7f9fc]"><span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-pmblue-soft text-[#175cd3]"><Icon name="droplet" size={18} /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-bold text-ink">{p.nickname}</span><span className="num text-[13px] font-extrabold text-ink">{kes(p.amount)}</span></span><span className="mt-0.5 flex items-center justify-between gap-2"><span className="num truncate text-[11.5px] text-muted">{p.date} · {p.account}</span><Badge tone={paymentTone(p.status)}>{p.status}</Badge></span><span className="num mt-0.5 block text-[11px] text-faint">{p.ref} · {p.receipt}</span></span><Icon name="chevron-right" size={15} className="flex-none text-faint" /></button>)}</div>
        </>}
      </Card>

      <section className="mt-6 grid gap-3 lg:grid-cols-3" data-reveal>
        <Card className="lg:col-span-2 bg-gradient-to-br from-ink via-[#0f2233] to-[#0d5c38] text-white" hover>
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-[52ch]"><Badge tone="dark" className="border border-white/15 bg-white/10 text-white/80">Operations</Badge><h3 className="mt-3 font-display text-[19px] font-extrabold tracking-tight">Protect supply, catch leaks and pay before service stops</h3><p className="mt-2 text-[13px] leading-relaxed text-white/65">Set site-level use thresholds, route water interruption notices to the facilities team, and require finance approval for large commercial or borehole obligations.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="white" icon="bell" onClick={() => toast({ title: "Water alerts enabled", msg: "Facilities will receive usage and service notices on WhatsApp.", tone: "success" })}>Enable alerts</Button><Button variant="white" icon="shield" onClick={() => toast({ title: "Approval policy updated", msg: "Bills over KES 7,500 now require Finance approval.", tone: "info" })}>Approval policy</Button><Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>Water support</Button></div></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-1">{[{ k: "Leak detection", v: "18%", i: "gauge" as const }, { k: "Receipts linked", v: "100%", i: "check-circle" as const }, { k: "Auto-reversals", v: "100%", i: "refresh" as const }].map((x) => <div key={x.k} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-3"><Icon name={x.i} size={16} className="text-pmgreen" /><div><p className="num font-display text-[15px] font-extrabold leading-none">{x.v}</p><p className="mt-1 text-[10.5px] text-white/50">{x.k}</p></div></div>)}</div></div>
        </Card>
        <Card hover><div className="flex items-center gap-2"><Icon name="sparkle" size={16} className="text-pmviolet" /><p className="font-display text-[15px] font-bold tracking-tight text-ink">Recommended actions</p></div><div className="mt-3 space-y-2.5">{[{ title: "Autopay Shop washrooms", body: "Avoid the KES 6,850 bill falling overdue." }, { title: "Inspect Shop use spike", body: "41 m3 Wednesday suggests a possible leak." }, { title: "Clear borehole permit", body: "KES 9,800 is now 5 days overdue." }].map((x) => <div key={x.title} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3"><Icon name="check-circle" size={16} className="mt-0.5 flex-none text-pmgreen" /><div><p className="text-[12.5px] font-bold text-ink">{x.title}</p><p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{x.body}</p></div></div>)}</div><Button className="mt-3" full variant="soft" icon="repeat" onClick={() => open({ kind: "autopay", accountId: "acc-3" })}>Apply smart rules</Button></Card>
      </section>
    </div>
  );
}

function AccountCard({ account, delay }: { account: WaterAccount; delay: number }) {
  const { open, toast } = useApp();
  const risk = account.status === "High use" || account.status === "Overdue";
  const due = account.status === "Due soon";
  const useRate = Math.min((account.currentM3 / Math.max(account.avgM3, 1)) * 50, 100);
  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start gap-3"><span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", account.type === "Borehole" ? "bg-pmviolet-soft text-[#5925dc]" : "bg-pmblue-soft text-[#175cd3]")}><Icon name={account.type === "Borehole" ? "gauge" : "droplet"} size={20} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><p className="truncate text-[13.5px] font-bold text-ink">{account.nickname}</p><Badge tone={accountTone(account.status)}>{account.status}</Badge></div><p className="num mt-0.5 text-[11.5px] text-muted">{account.number} · {account.location}</p></div><Menu trigger={() => <span className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="more" size={16} /></span>} items={[{ label: "Pay this bill", icon: "droplet", onClick: () => open({ kind: "buy", utility: "water", accountId: account.number === "290081" ? "acc-3" : undefined, amount: account.balance }) }, { label: "Manage autopay", icon: "repeat", onClick: () => open({ kind: "autopay", accountId: account.number === "290081" ? "acc-3" : undefined }) }, { label: "Edit account", icon: "edit", onClick: () => toast({ title: "Account settings", msg: `Reading alerts and contacts for ${account.nickname}.`, tone: "info" }) }, { label: "Report a supply issue", icon: "alert", onClick: () => toast({ title: "Supply issue captured", msg: "PayMo will attach account diagnostics and contact the provider.", tone: "warn" }) }]} /></div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">{account.autopay && <Badge tone="success" icon="repeat">Autopay</Badge>}{account.alerts && <Badge tone="info" icon="bell">Usage alerts</Badge>}<Badge tone="muted">{account.type}</Badge></div>
      <div className={cn("mt-3 rounded-xl p-3", risk ? "bg-danger-soft/50" : due ? "bg-warn-soft/50" : "bg-[#fafbfd]")}><Row k="Current bill" v={kes(account.balance)} strong /><Row k="Due date" v={account.dueDate} /><Row k="Last reading" v={`${num(account.currentM3)} m3`} /><Row k="Average use" v={`${num(account.avgM3)} m3 / month`} /><Progress value={useRate} tone={risk ? "red" : due ? "amber" : "blue"} className="mt-2" /></div>
      <div className="mt-3 rounded-xl border border-line bg-white p-3"><Row k="Last payment" v={kes(account.lastAmount)} /><Row k="Payment date" v={account.lastPaid} /><Row k="Account owner" v={account.owner} /></div>
      <div className="mt-3 flex gap-2"><Button className="flex-1" icon="droplet" onClick={() => open({ kind: "buy", utility: "water", accountId: account.number === "290081" ? "acc-3" : undefined, amount: account.balance })}>Pay {kes(account.balance)}</Button><IconBtn icon="repeat" label="Manage autopay" tone="outline" onClick={() => open({ kind: "autopay", accountId: account.number === "290081" ? "acc-3" : undefined })} /></div>
    </div>
  );
}

function Kpi({ label, value, sub, icon, tone, spark, progress }: { label: string; value: string; sub: string; icon: Parameters<typeof Icon>[0]["name"]; tone: "success" | "warning" | "danger" | "info"; spark?: ReactNode; progress?: number }) {
  const toneCls = { success: "bg-pmgreen-soft text-[#067647]", warning: "bg-warn-soft text-[#93370d]", danger: "bg-danger-soft text-[#b42318]", info: "bg-pmblue-soft text-[#175cd3]" }[tone];
  return <div className="card-hover rounded-2xl border border-line bg-white p-4 shadow-pm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p><p className="num mt-1.5 font-display text-[21px] font-extrabold leading-none tracking-tight text-ink">{value}</p><p className="mt-1.5 truncate text-[11px] leading-relaxed text-muted">{sub}</p></div><span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[11px]", toneCls)}><Icon name={icon} size={17} /></span></div><div className="mt-3 flex items-end justify-end">{spark}</div>{progress !== undefined && <Progress value={progress} tone={tone === "danger" ? "red" : tone === "warning" ? "amber" : tone === "info" ? "blue" : "green"} className="mt-3" />}</div>;
}