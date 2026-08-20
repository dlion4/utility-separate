import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { cn } from "./utils/cn";
import { useReveal } from "./utils/useReveal";
import { Badge, Button, Card, Chip, CopyBtn, Donut, Empty, IconBtn, Input, Menu, Progress, Row, SectionHead, Segmented, Select, Spark } from "./ui";
import { TARIFF, kes, num } from "./data";
import { useApp } from "./store";

type MeterStatus = "Healthy" | "Low units" | "Overdue" | "Offline";
type MeterType = "Prepaid" | "Postpaid";

type Meter = {
  id: string;
  meter: string;
  nickname: string;
  location: string;
  type: MeterType;
  owner: string;
  units?: number;
  avgDaily: number;
  daysLeft?: number;
  lastTopup: string;
  lastAmount: number;
  lastToken?: string;
  bill?: number;
  dueDate?: string;
  status: MeterStatus;
  autopay: boolean;
  delivery: string[];
};

type Token = {
  id: string;
  date: string;
  time: string;
  meter: string;
  nickname: string;
  amount: number;
  units: number;
  token: string;
  delivery: string;
  redeemed: "Confirmed" | "Not confirmed" | "Pending";
};

type Outage = {
  id: string;
  area: string;
  title: string;
  window: string;
  affected: string;
  impact: "Low" | "Medium" | "High";
};

const meters: Meter[] = [
  {
    id: "m-home",
    meter: "14825739",
    nickname: "Home",
    location: "Karen · Main house",
    type: "Prepaid",
    owner: "J. Mwangi",
    units: 17,
    avgDaily: 6.3,
    daysLeft: 3,
    lastTopup: "27 Jun 2025",
    lastAmount: 2000,
    lastToken: "4729-8301-5624-9173",
    status: "Low units",
    autopay: true,
    delivery: ["SMS", "App"],
  },
  {
    id: "m-shop",
    meter: "22901847",
    nickname: "Shop",
    location: "Westlands · Hardware store",
    type: "Postpaid",
    owner: "J.K. Holdings Ltd",
    avgDaily: 19.8,
    lastTopup: "15 Jun 2025",
    lastAmount: 8400,
    bill: 8400,
    dueDate: "25 Jun 2025",
    status: "Overdue",
    autopay: false,
    delivery: ["Email", "App"],
  },
  {
    id: "m-parent",
    meter: "55128201",
    nickname: "Parent Home",
    location: "Nyeri · Rural home",
    type: "Prepaid",
    owner: "M. Mwangi",
    units: 48,
    avgDaily: 3.4,
    daysLeft: 14,
    lastTopup: "24 Jun 2025",
    lastAmount: 1500,
    lastToken: "8831-2204-1794-0068",
    status: "Healthy",
    autopay: true,
    delivery: ["WhatsApp"],
  },
  {
    id: "m-rental",
    meter: "33741092",
    nickname: "Rental A",
    location: "Ruiru · Apartment 4A",
    type: "Prepaid",
    owner: "PayMo Rentals",
    units: 92,
    avgDaily: 5.1,
    daysLeft: 18,
    lastTopup: "20 Jun 2025",
    lastAmount: 3000,
    lastToken: "1093-7711-5520-6631",
    status: "Healthy",
    autopay: false,
    delivery: ["Email", "App"],
  },
  {
    id: "m-borehole",
    meter: "80291284",
    nickname: "Borehole",
    location: "Kiambu · Pump house",
    type: "Prepaid",
    owner: "J.K. Holdings Ltd",
    units: 9,
    avgDaily: 4.6,
    daysLeft: 2,
    lastTopup: "18 Jun 2025",
    lastAmount: 1000,
    lastToken: "4403-1882-6023-0044",
    status: "Low units",
    autopay: true,
    delivery: ["SMS"],
  },
  {
    id: "m-coldroom",
    meter: "66018429",
    nickname: "Cold Room",
    location: "Industrial Area · Warehouse",
    type: "Postpaid",
    owner: "PayMo Foods Ltd",
    avgDaily: 42.4,
    lastTopup: "01 Jun 2025",
    lastAmount: 18750,
    bill: 27640,
    dueDate: "04 Jul 2025",
    status: "Healthy",
    autopay: true,
    delivery: ["Email", "App"],
  },
];

const tokens: Token[] = [
  { id: "t1", date: "27 Jun", time: "14:32", meter: "14825739", nickname: "Home", amount: 2000, units: 141.8, token: "4729-8301-5624-9173", delivery: "SMS + App", redeemed: "Confirmed" },
  { id: "t2", date: "24 Jun", time: "07:48", meter: "55128201", nickname: "Parent Home", amount: 1500, units: 106.2, token: "8831-2204-1794-0068", delivery: "WhatsApp", redeemed: "Not confirmed" },
  { id: "t3", date: "20 Jun", time: "11:05", meter: "33741092", nickname: "Rental A", amount: 3000, units: 212.8, token: "1093-7711-5520-6631", delivery: "Email + App", redeemed: "Confirmed" },
  { id: "t4", date: "18 Jun", time: "18:41", meter: "80291284", nickname: "Borehole", amount: 1000, units: 70.9, token: "4403-1882-6023-0044", delivery: "SMS", redeemed: "Pending" },
  { id: "t5", date: "15 Jun", time: "10:12", meter: "14825739", nickname: "Home", amount: 3000, units: 212.7, token: "5510-2298-7412-0093", delivery: "SMS + App", redeemed: "Confirmed" },
  { id: "t6", date: "10 Jun", time: "08:15", meter: "33741092", nickname: "Rental A", amount: 2000, units: 141.8, token: "9183-2041-9087-4512", delivery: "Email", redeemed: "Confirmed" },
];

const outages: Outage[] = [
  { id: "o1", area: "Karen / Hardy", title: "Planned transformer maintenance", window: "Sat 29 Jun · 09:00-15:00", affected: "Home meter may be offline", impact: "Medium" },
  { id: "o2", area: "Industrial Area", title: "Feeder load balancing", window: "Sun 30 Jun · 22:00-02:00", affected: "Cold Room backup advised", impact: "High" },
  { id: "o3", area: "Ruiru", title: "No active interruption", window: "Live grid normal", affected: "Rental A clear", impact: "Low" },
];

const spendMix = [
  { label: "Home", value: 5000, color: "#12b76a" },
  { label: "Shop", value: 8400, color: "#f79009" },
  { label: "Rental A", value: 5000, color: "#2e90fa" },
  { label: "Borehole", value: 1000, color: "#7a5af8" },
  { label: "Cold Room", value: 18750, color: "#0e9384" },
];

const usageTrend = [128, 141, 135, 152, 144, 168, 181, 176, 192, 204, 198, 216];
const costTrend = [9200, 11800, 10300, 14600, 13200, 18400, 19900, 21100, 23800, 26600, 24100, 29100];
const hourly = [22, 18, 14, 12, 16, 28, 38, 44, 41, 37, 34, 39, 48, 53, 49, 46, 55, 72, 84, 76, 62, 48, 36, 28];

function statusTone(status: MeterStatus) {
  if (status === "Healthy") return "success" as const;
  if (status === "Low units") return "warning" as const;
  if (status === "Overdue") return "danger" as const;
  return "muted" as const;
}

function tokenTone(status: Token["redeemed"]) {
  if (status === "Confirmed") return "success" as const;
  if (status === "Pending") return "warning" as const;
  return "muted" as const;
}

export function ElectricityPage() {
  const { open, toast, balance } = useApp();
  const [meterFilter, setMeterFilter] = useState<"all" | "prepaid" | "postpaid" | "attention">("all");
  const [tokenQuery, setTokenQuery] = useState("");
  const [tokenStatus, setTokenStatus] = useState<"all" | Token["redeemed"]>("all");
  const [selectedMeter, setSelectedMeter] = useState<Meter>(meters[0]);
  const [range, setRange] = useState<"week" | "month">("month");

  useReveal([meterFilter, tokenStatus, tokenQuery]);

  const prepaidMeters = meters.filter((m) => m.type === "Prepaid");
  const postpaidMeters = meters.filter((m) => m.type === "Postpaid");
  const lowMeters = meters.filter((m) => m.status === "Low units");
  const overdueMeters = meters.filter((m) => m.status === "Overdue");
  const totalUnits = prepaidMeters.reduce((sum, m) => sum + (m.units ?? 0), 0);
  const activeBill = postpaidMeters.reduce((sum, m) => sum + (m.bill ?? 0), 0);
  const monthlySpend = tokens.reduce((sum, t) => sum + t.amount, 0) + postpaidMeters.reduce((sum, m) => sum + m.lastAmount, 0);
  const estimatedUnits = Math.round((2000 / TARIFF) * 10) / 10;

  const shownMeters = useMemo(() => {
    if (meterFilter === "prepaid") return meters.filter((m) => m.type === "Prepaid");
    if (meterFilter === "postpaid") return meters.filter((m) => m.type === "Postpaid");
    if (meterFilter === "attention") return meters.filter((m) => ["Low units", "Overdue", "Offline"].includes(m.status));
    return meters;
  }, [meterFilter]);

  const shownTokens = useMemo(() => {
    let rows = tokens;
    if (tokenStatus !== "all") rows = rows.filter((t) => t.redeemed === tokenStatus);
    if (tokenQuery.trim()) {
      const q = tokenQuery.toLowerCase();
      rows = rows.filter((t) => `${t.meter} ${t.nickname} ${t.token} ${t.delivery}`.toLowerCase().includes(q));
    }
    return rows;
  }, [tokenQuery, tokenStatus]);

  return (
    <div className="mx-auto max-w-1320px">
      <section className="pm-hero position-relative overflow-hidden rounded-3xl p-5 sm-p-7 lg-p-9">
        <div className="pm-hero-dots pe-none position-absolute inset-0" />
        <div className="position-relative d-grid gap-6 xl-grid-cols-1-15fr-0-85fr xl-gap-10">
          <div>
            <span className="d-inline-flex align-items-center gap-2 rounded-full border border-white-15 bg-white-10 px-3 py-15 fs-115 fw-semibold text-white-80 backdrop-blur">
              <span className="live-dot" /> KPLC prepaid token and postpaid bill gateway live
            </span>
            <h2 className="mt-4 font-display fs-27 fw-extrabold leading-1-08 tracking-tight text-white sm-fs-36 lg-fs-42">
              Electricity management,
              <br className="d-none d-sm-block" /> built for zero blackout risk.
            </h2>
            <p className="mt-3 max-w-56ch fs-135 leading-relaxed text-white-70 sm-fs-145">
              Buy KPLC prepaid tokens, settle postpaid accounts, track units, confirm token redemption and automate low-balance top-ups from one PayMo Business page.
            </p>

            <div className="mt-5 d-flex flex-column gap-25 flex-sm-row">
              <Button size="lg" icon="bolt" onClick={() => open({ kind: "buy", utility: "electricity", accountId: "acc-1", amount: 2000 })}>
                Buy prepaid token
              </Button>
              <Button size="lg" variant="white" icon="receipt" onClick={() => open({ kind: "buy", utility: "electricity", accountId: "acc-2", amount: 8400 })}>
                Pay postpaid bill
              </Button>
              <Button size="lg" variant="white" icon="download" onClick={() => open({ kind: "export" })}>
                Export tokens
              </Button>
            </div>

            <div className="mt-5 d-grid gap-2 sm-grid-cols-3">
              {[
                { k: "Prepaid balance", v: `${num(totalUnits, 0)} kWh`, s: `${lowMeters.length} low-balance meters`, icon: "gauge" as const },
                { k: "Postpaid due", v: kes(activeBill), s: `${overdueMeters.length} overdue account`, icon: "receipt" as const },
                { k: "Wallet available", v: kes(balance), s: "Zero-fee KPLC payments", icon: "wallet" as const },
              ].map((x) => (
                <div key={x.k} className="rounded-5 border border-white-10 bg-white-06 p-35 backdrop-blur">
                  <Icon name={x.icon} size={16} className="text-pmgreen" />
                  <p className="num mt-2 font-display fs-18 fw-extrabold text-white">{x.v}</p>
                  <p className="mt-05 fs-11 fw-semibold text-uppercase tracking-wide text-white-40">{x.k}</p>
                  <p className="mt-1 fs-11 text-white-55">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-sheen position-relative overflow-hidden rounded-5 border border-white-12 bg-white-06 p-5 backdrop-blur">
            <div className="d-flex align-items-start gap-3">
              <span className="d-grid h-11 w-11 flex-none place-items-center rounded-13px bg-warn-20 text-warn">
                <Icon name="bolt" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-white-45">Fast token estimate</p>
                <p className="mt-1 font-display fs-18 fw-extrabold text-white">KES 2,000 gives ~{num(estimatedUnits)} kWh</p>
                <p className="mt-1 fs-115 leading-relaxed text-white-55">At KES {TARIFF.toFixed(2)}/kWh before fixed charges. Delivery: SMS + App by default.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {meters.slice(0, 4).map((m) => (
                <button key={m.id} onClick={() => setSelectedMeter(m)} className={cn("d-flex w-100 align-items-center gap-3 rounded-4 border p-25 text-start transition", selectedMeter.id === m.id ? "border-pmgreen-60 bg-pmgreen-10" : "border-white-10 bg-white-04 hover-bg-white-08") }>
                  <span className="d-grid h-8 w-8 flex-none place-items-center rounded-3 bg-white-10 text-white">
                    <Icon name={m.type === "Prepaid" ? "bolt" : "receipt"} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="d-block text-truncate fs-12 fw-bold text-white">{m.nickname}</span>
                    <span className="num d-block text-truncate fs-105 text-white-45">{m.meter} · {m.type}</span>
                  </span>
                  <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-4 border border-white-10 bg-ink-20 p-3">
              <Row k={<span className="text-white-55">Selected meter</span>} v={<span className="text-white">{selectedMeter.nickname}</span>} />
              <Row k={<span className="text-white-55">Meter number</span>} v={<span className="text-white">{selectedMeter.meter}</span>} />
              <Row k={<span className="text-white-55">Status</span>} v={<Badge tone={statusTone(selectedMeter.status)}>{selectedMeter.status}</Badge>} />
              <Button
                className="mt-2"
                full
                icon={selectedMeter.type === "Prepaid" ? "bolt" : "receipt"}
                onClick={() => open({ kind: "buy", utility: "electricity", accountId: selectedMeter.meter === "14825739" ? "acc-1" : selectedMeter.meter === "22901847" ? "acc-2" : undefined, amount: selectedMeter.bill ?? selectedMeter.lastAmount })}
              >
                {selectedMeter.type === "Prepaid" ? "Buy token for this meter" : "Pay this postpaid bill"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 d-grid gap-3 sm-grid-cols-2 xl-grid-cols-4" data-reveal>
        <Kpi label="Electric spend" value={kes(monthlySpend)} sub="June token + bill payments" icon="wallet" tone="info" spark={<Spark points={costTrend} stroke="#2e90fa" />} />
        <Kpi label="Units delivered" value={`${num(tokens.reduce((s, t) => s + t.units, 0), 0)} kWh`} sub="Across 6 recent tokens" icon="gauge" tone="warning" spark={<Spark points={usageTrend} stroke="#f79009" />} />
        <Kpi label="At-risk supply" value={`${lowMeters.length + overdueMeters.length} meters`} sub="Low units or overdue bills" icon="alert" tone="danger" progress={66} />
        <Kpi label="Automated meters" value={`${meters.filter((m) => m.autopay).length}/${meters.length}`} sub="Autopay rules active" icon="repeat" tone="success" progress={(meters.filter((m) => m.autopay).length / meters.length) * 100} />
      </section>

      <SectionHead no="3.2" id="sec-meters" title="Electricity meters" sub="Prepaid and postpaid meters in one operational view, with payment, delivery and risk status.">
        <div className="d-flex flex-wrap gap-2">
          <Chip on={meterFilter === "all"} onClick={() => setMeterFilter("all")} count={meters.length}>All</Chip>
          <Chip on={meterFilter === "prepaid"} onClick={() => setMeterFilter("prepaid")} count={prepaidMeters.length}>Prepaid</Chip>
          <Chip on={meterFilter === "postpaid"} onClick={() => setMeterFilter("postpaid")} count={postpaidMeters.length}>Postpaid</Chip>
          <Chip on={meterFilter === "attention"} onClick={() => setMeterFilter("attention")} count={lowMeters.length + overdueMeters.length}>Needs attention</Chip>
        </div>
      </SectionHead>

      {shownMeters.length === 0 ? (
        <Card>
          <Empty icon="bolt" title="No meters match that filter" sub="Switch filters or add another KPLC meter to this workspace." action={<Button icon="plus" onClick={() => open({ kind: "addAccount", utility: "electricity" })}>Add meter</Button>} />
        </Card>
      ) : (
        <div className="d-grid gap-3 sm-grid-cols-2 xl-grid-cols-3">
          {shownMeters.map((m, i) => (
            <MeterCard key={m.id} meter={m} delay={i * 45} />
          ))}
          <button onClick={() => open({ kind: "addAccount", utility: "electricity" })} data-reveal className="d-flex min-h-264px flex-column align-items-center justify-content-center gap-25 rounded-5 border-2 border-dashed border-line bg-white-70 p-5 text-center transition hover-border-pmgreen-50 hover-bg-pmgreen-soft-20">
            <span className="d-grid h-12 w-12 place-items-center rounded-5 bg-canvas text-muted">
              <Icon name="plus" size={22} />
            </span>
            <p className="fs-135 fw-bold text-ink">Add another KPLC meter</p>
            <p className="max-w-30ch fs-115 leading-relaxed text-muted">Verify prepaid or postpaid accounts, assign a nickname and set delivery channels.</p>
          </button>
        </div>
      )}

      <SectionHead no="3.2A" id="sec-token-flow" title="Token and bill workflows" sub="The original 3.2 modals redesigned as guided, secure PayMo actions.">
        <Button variant="outline" size="sm" icon="gauge" onClick={() => open({ kind: "tariff" })}>Tariff</Button>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <p className="font-display fs-15 fw-bold tracking-tight text-ink">Prepaid token purchase</p>
              <p className="mt-05 fs-12 leading-relaxed text-muted">Choose a saved meter, delivery channel, amount, payment method and secure PIN authorisation.</p>
            </div>
            <Badge tone="success" dot>Median token 6s</Badge>
          </div>
          <div className="mt-4 d-grid gap-3 md-grid-cols-4">
            {[
              { no: "1", t: "Choose meter", d: "Saved meter, type and delivery", i: "bolt" as const },
              { no: "2", t: "Set amount", d: "Quick chips + unit estimator", i: "gauge" as const },
              { no: "3", t: "Pay securely", d: "M-Pesa, wallet or bank", i: "lock" as const },
              { no: "4", t: "Receive token", d: "Copy, SMS, WhatsApp or email", i: "check-circle" as const },
            ].map((s) => (
              <div key={s.no} className="rounded-5 border border-line bg-paper-2 p-35">
                <span className="d-grid h-8 w-8 place-items-center rounded-3 bg-ink font-display fs-11 fw-bold text-white">{s.no}</span>
                <Icon name={s.i} size={16} className="mt-3 text-pmgreen" />
                <p className="mt-2 fs-125 fw-bold text-ink">{s.t}</p>
                <p className="mt-05 fs-115 leading-relaxed text-muted">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 d-grid gap-3 sm-grid-cols-3">
            {[500, 2000, 5000].map((amount) => (
              <button key={amount} onClick={() => open({ kind: "buy", utility: "electricity", accountId: "acc-1", amount })} className="rounded-4 border border-line bg-white p-3 text-start transition hover-border-pmgreen-50 hover-bg-pmgreen-soft-20">
                <p className="num font-display fs-18 fw-extrabold text-ink">{kes(amount)}</p>
                <p className="mt-05 fs-115 text-muted">~{num(amount / TARIFF)} kWh · SMS + App</p>
              </button>
            ))}
          </div>
          <Button className="mt-4" icon="bolt" onClick={() => open({ kind: "buy", utility: "electricity", accountId: "acc-1", amount: 2000 })}>Open token purchase modal</Button>
        </Card>

        <Card hover>
          <div className="d-flex align-items-center gap-2">
            <Icon name="receipt" size={16} className="text-warn" />
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Postpaid bill protection</p>
          </div>
          <div className="mt-3 rounded-5 border border-danger-25 bg-danger-soft-45 p-4">
            <Badge tone="danger" dot>Overdue</Badge>
            <p className="mt-2 fs-125 fw-bold text-ink">Shop · 22901847</p>
            <p className="num mt-1 font-display fs-24 fw-extrabold text-ink">{kes(8400)}</p>
            <p className="mt-05 fs-115 text-danger-ink">Due 25 Jun 2025 · large bill approval enabled.</p>
          </div>
          <div className="mt-3 rounded-4 bg-paper-2 p-3">
            <Row k="Base charge" v={kes(6220)} />
            <Row k="Tax & levies" v={kes(1330)} />
            <Row k="Adjustments" v={kes(850)} />
            <div className="my-1 h-px bg-line" />
            <Row k="Outstanding" v={kes(8400)} strong />
          </div>
          <Button className="mt-3" full icon="receipt" onClick={() => open({ kind: "buy", utility: "electricity", accountId: "acc-2", amount: 8400 })}>Pay postpaid bill</Button>
        </Card>
      </div>

      <SectionHead no="3.2B" id="sec-consumption" title="Usage, tariff and outage intelligence" sub="Live risk indicators for supply continuity and cost control.">
        <Segmented value={range} onChange={setRange} size="sm" options={[{ value: "week", label: "7 days" }, { value: "month", label: "30 days" }]} />
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <p className="font-display fs-15 fw-bold tracking-tight text-ink">Hourly load profile</p>
              <p className="mt-05 fs-12 text-muted">Warehouse and shop demand spikes after 17:00. Consider staggered operations.</p>
            </div>
            <Badge tone="warning" icon="trend-up">Peak 84 kWh</Badge>
          </div>
          <div className="mt-5 d-flex h-220px align-items-end gap-15 sm-gap-2">
            {hourly.map((h, i) => (
              <div key={i} className="group position-relative d-flex h-100 flex-1 align-items-end">
                <div className="bar-grow w-100 rounded-t-md bg-gradient-to-t from-pmgreen to-warn" style={{ height: `${(h / Math.max(...hourly)) * 100}%`, animationDelay: `${i * 25}ms` }} />
                <span className="pe-none position-absolute bottom-full left-1-2 mb-2 d-none translate-x-n1-2 text-nowrap rounded-3 bg-ink px-2 py-1 fs-105 fw-bold text-white group-hover-d-block">
                  {String(i).padStart(2, "0")}:00 · {h} kWh
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 d-flex justify-content-between fs-105 fw-semibold text-muted">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
          <div className="mt-4 d-grid gap-2 border-top border-line pt-4 sm-grid-cols-3">
            {[
              { k: "Projected bill", v: kes(range === "month" ? 43800 : 10150) },
              { k: "Avg daily", v: `${num(27.4)} kWh` },
              { k: "Potential saving", v: kes(5200) },
            ].map((x) => (
              <div key={x.k} className="rounded-4 bg-paper-2 p-3">
                <p className="fs-105 fw-bold text-uppercase tracking-wide text-faint">{x.k}</p>
                <p className="num mt-05 font-display fs-15 fw-extrabold text-ink">{x.v}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Card hover>
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Spend by meter</p>
            <div className="mt-4 d-flex flex-column align-items-center gap-4 flex-sm-row flex-lg-column flex-xl-row">
              <Donut data={spendMix} center={<><p className="num font-display fs-16 fw-extrabold text-ink">{kes(spendMix.reduce((s, x) => s + x.value, 0))}</p><p className="fs-105 fw-semibold text-muted">June</p></>} />
              <div className="w-100 flex-1 space-y-2">
                {spendMix.map((s) => (
                  <div key={s.label} className="d-flex align-items-center gap-2">
                    <span className="h-25 w-25 flex-none rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 text-truncate fs-12 fw-semibold text-ink-2">{s.label}</span>
                    <span className="num fs-12 fw-bold text-ink">{kes(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="d-flex align-items-center gap-2">
              <Icon name="map-pin" size={16} className="text-pmgreen" />
              <p className="font-display fs-15 fw-bold tracking-tight text-ink">KPLC outage watch</p>
            </div>
            <div className="mt-3 space-y-2">
              {outages.map((o) => (
                <div key={o.id} className="rounded-4 border border-line bg-paper-2 p-3">
                  <div className="d-flex align-items-start gap-2">
                    <Badge tone={o.impact === "High" ? "danger" : o.impact === "Medium" ? "warning" : "success"}>{o.impact}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="fs-125 fw-bold text-ink">{o.area}</p>
                      <p className="mt-05 fs-115 leading-relaxed text-muted">{o.title}</p>
                    </div>
                  </div>
                  <p className="mt-2 fs-11 fw-semibold text-ink-2">{o.window}</p>
                  <p className="mt-05 fs-11 text-muted">{o.affected}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <SectionHead no="3.2C" id="sec-history" title="Token history" sub="The original token-history table redesigned for search, copy, confirmation and export.">
        <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export</Button>
      </SectionHead>

      <Card className="p-0">
        <div className="space-y-3 border-bottom border-line p-4">
          <div className="d-flex flex-wrap gap-2">
            <div className="min-w-220px flex-1">
              <Input icon="search" placeholder="Search meter, nickname or token…" value={tokenQuery} onChange={(e) => setTokenQuery(e.target.value)} />
            </div>
            <Select value={tokenStatus} onChange={(e) => setTokenStatus(e.target.value as typeof tokenStatus)} className="w-auto">
              <option value="all">All redemption states</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Not confirmed">Not confirmed</option>
              <option value="Pending">Pending</option>
            </Select>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {(["all", "Confirmed", "Not confirmed", "Pending"] as const).map((s) => (
              <Chip key={s} on={tokenStatus === s} onClick={() => setTokenStatus(s)} count={s === "all" ? tokens.length : tokens.filter((t) => t.redeemed === s).length}>{s === "all" ? "All" : s}</Chip>
            ))}
            <span className="ms-auto fs-115 fw-semibold text-muted">{shownTokens.length} of {tokens.length} shown</span>
          </div>
        </div>

        {shownTokens.length === 0 ? (
          <Empty icon="search" title="No tokens match that search" sub="Try a meter number like 14825739 or a token segment like 4729." action={<Button variant="outline" icon="refresh" onClick={() => { setTokenQuery(""); setTokenStatus("all"); }}>Reset search</Button>} />
        ) : (
          <>
            <div className="d-none overflow-x-auto d-lg-block">
              <table className="w-100 min-w-940px">
                <thead className="bg-paper-2">
                  <tr className="text-start fs-105 fw-bold text-uppercase tracking-0-1em text-faint">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Meter</th>
                    <th className="px-4 py-3">Nickname</th>
                    <th className="px-4 py-3 text-end">Amount</th>
                    <th className="px-4 py-3 text-end">Units</th>
                    <th className="px-4 py-3">Token number</th>
                    <th className="px-4 py-3">Delivery</th>
                    <th className="px-4 py-3">Redeemed</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shownTokens.map((t) => (
                    <tr key={t.id} className="transition hover-bg-paper-3">
                      <td className="text-nowrap px-4 py-3 fs-12 fw-semibold text-ink-2">{t.date}<span className="ms-15 fs-11 fw-normal text-faint">{t.time}</span></td>
                      <td className="num px-4 py-3 fs-125 fw-bold text-ink">{t.meter}</td>
                      <td className="px-4 py-3 fs-125 text-muted">{t.nickname}</td>
                      <td className="num px-4 py-3 text-end fs-125 fw-bold text-ink">{kes(t.amount)}</td>
                      <td className="num px-4 py-3 text-end fs-125 fw-bold text-ink">{num(t.units)} kWh</td>
                      <td className="px-4 py-3"><code className="num rounded-2 bg-canvas px-2 py-1 fs-115 fw-bold text-ink">{t.token}</code></td>
                      <td className="px-4 py-3 fs-12 text-muted">{t.delivery}</td>
                      <td className="px-4 py-3"><Badge tone={tokenTone(t.redeemed)} dot>{t.redeemed}</Badge></td>
                      <td className="px-4 py-3 text-end"><CopyBtn text={t.token} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-line d-lg-none">
              {shownTokens.map((t) => (
                <div key={t.id} className="p-35">
                  <div className="d-flex align-items-start gap-3">
                    <span className="d-grid h-10 w-10 flex-none place-items-center rounded-4 bg-warn-soft text-warn-ink"><Icon name="bolt" size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="d-flex align-items-center justify-content-between gap-2">
                        <p className="text-truncate fs-13 fw-bold text-ink">{t.nickname}</p>
                        <p className="num fs-13 fw-extrabold text-ink">{kes(t.amount)}</p>
                      </div>
                      <p className="num mt-05 fs-115 text-muted">{t.date} · {t.meter} · {num(t.units)} kWh</p>
                      <code className="num mt-2 d-block rounded-3 bg-canvas px-2 py-15 fs-115 fw-bold text-ink">{t.token}</code>
                      <div className="mt-2 d-flex flex-wrap align-items-center gap-2">
                        <Badge tone={tokenTone(t.redeemed)} dot>{t.redeemed}</Badge>
                        <Badge tone="muted">{t.delivery}</Badge>
                        <CopyBtn text={t.token} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <section className="mt-6 d-grid gap-3 lg-grid-cols-3" data-reveal>
        <Card className="lg-col-span-2 bg-gradient-to-br from-ink via-0f2233 to-0d5c38 text-white" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
            <div className="max-w-52ch">
              <Badge tone="dark" className="border border-white-15 bg-white-10 text-white-80">Operations</Badge>
              <h3 className="mt-3 font-display fs-19 fw-extrabold tracking-tight">Large-bill approval and outage playbooks</h3>
              <p className="mt-2 fs-13 leading-relaxed text-white-65">Postpaid accounts over KES 7,500 require a payment summary before execution. Critical sites can trigger backup-generator reminders during KPLC outage windows.</p>
              <div className="mt-4 d-flex flex-wrap gap-2">
                <Button variant="white" icon="shield" onClick={() => toast({ title: "Approval policy opened", msg: "Large bills now require Admin + Finance approval.", tone: "info" })}>Approval policy</Button>
                <Button variant="white" icon="bell" onClick={() => toast({ title: "Outage alerts enabled", msg: "Critical meter alerts will go to WhatsApp and email.", tone: "success" })}>Enable alerts</Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>KPLC help</Button>
              </div>
            </div>
            <div className="d-grid grid-cols-2 gap-2 sm-grid-cols-1">
              {[
                { k: "Approval SLA", v: "7 min", i: "clock" as const },
                { k: "Auto-reversals", v: "100%", i: "refresh" as const },
                { k: "Token delivery", v: "99.98%", i: "send" as const },
              ].map((s) => (
                <div key={s.k} className="d-flex align-items-center gap-25 rounded-4 border border-white-10 bg-white-06 p-3">
                  <Icon name={s.i} size={16} className="text-pmgreen" />
                  <div>
                    <p className="num font-display fs-15 fw-extrabold lh-1">{s.v}</p>
                    <p className="mt-1 fs-105 text-white-50">{s.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="d-flex align-items-center gap-2">
            <Icon name="sparkle" size={16} className="text-pmviolet" />
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Suggested optimisations</p>
          </div>
          <div className="mt-3 space-y-25">
            {[
              { t: "Auto-buy Home at 10 kWh", v: "Avoid 3-day blackout risk" },
              { t: "Split Cold Room bill approval", v: "Finance + Site Manager" },
              { t: "Move Borehole delivery to WhatsApp", v: "Tenant confirmation faster" },
            ].map((x) => (
              <div key={x.t} className="d-flex align-items-start gap-25 rounded-4 border border-line bg-paper-2 p-3">
                <Icon name="check-circle" size={16} className="mt-05 flex-none text-pmgreen" />
                <div className="min-w-0 flex-1">
                  <p className="fs-125 fw-bold text-ink">{x.t}</p>
                  <p className="mt-05 fs-115 text-muted">{x.v}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="repeat" onClick={() => open({ kind: "autopay", accountId: "acc-1" })}>Apply smart rules</Button>
        </Card>
      </section>
    </div>
  );
}

function MeterCard({ meter, delay }: { meter: Meter; delay: number }) {
  const { open, toast } = useApp();
  const low = meter.status === "Low units";
  const overdue = meter.status === "Overdue";
  const unitsPct = meter.type === "Prepaid" ? Math.min(((meter.units ?? 0) / 100) * 100, 100) : 0;
  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover position-relative d-flex flex-column rounded-5 border border-line bg-white p-4 shadow-pm">
      <div className="d-flex align-items-start gap-3">
        <span className={cn("d-grid h-11 w-11 flex-none place-items-center rounded-13px", meter.type === "Prepaid" ? "bg-warn-soft text-warn-ink" : "bg-pmblue-soft text-pmblue-ink") }>
          <Icon name={meter.type === "Prepaid" ? "bolt" : "receipt"} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="d-flex flex-wrap align-items-center gap-15">
            <p className="text-truncate fs-135 fw-bold text-ink">{meter.nickname}</p>
            <Badge tone={meter.type === "Prepaid" ? "warning" : "info"}>{meter.type}</Badge>
          </div>
          <p className="num mt-05 fs-115 text-muted">{meter.meter} · {meter.location}</p>
        </div>
        <Menu
          trigger={() => <span className="d-grid h-8 w-8 place-items-center rounded-3 text-muted transition hover-bg-canvas hover-text-ink"><Icon name="more" size={16} /></span>}
          items={[
            { label: meter.type === "Prepaid" ? "Buy token" : "Pay bill", icon: meter.type === "Prepaid" ? "bolt" : "receipt", onClick: () => open({ kind: "buy", utility: "electricity", accountId: meter.meter === "14825739" ? "acc-1" : meter.meter === "22901847" ? "acc-2" : undefined, amount: meter.bill ?? meter.lastAmount }) },
            { label: "Set autopay rule", icon: "repeat", onClick: () => open({ kind: "autopay" }) },
            { label: "Delivery channels", icon: "send", onClick: () => toast({ title: "Delivery channels", msg: `${meter.delivery.join(" + ")} selected for ${meter.nickname}.`, tone: "info" }) },
            { label: "Report KPLC issue", icon: "alert", onClick: () => toast({ title: "KPLC issue captured", msg: "We will attach meter diagnostics and contact support.", tone: "warn" }) },
          ]}
        />
      </div>

      <div className="mt-3 d-flex flex-wrap align-items-center gap-15">
        <Badge tone={statusTone(meter.status)} dot>{meter.status}</Badge>
        {meter.autopay && <Badge tone="success" icon="repeat">Autopay</Badge>}
        {meter.delivery.map((d) => <Badge key={d} tone="muted">{d}</Badge>)}
      </div>

      <div className={cn("mt-3 rounded-4 p-3", overdue ? "bg-danger-soft-50" : low ? "bg-warn-soft-50" : "bg-paper-2") }>
        {meter.type === "Prepaid" ? (
          <>
            <Row k="Current estimate" v={`${num(meter.units ?? 0)} kWh`} strong />
            <Row k="Avg daily use" v={`${num(meter.avgDaily)} kWh`} />
            <Row k="Days left" v={`${meter.daysLeft ?? 0} days`} />
            <Progress value={unitsPct} tone={low ? "amber" : "green"} className="mt-2" />
          </>
        ) : (
          <>
            <Row k="Current bill" v={kes(meter.bill ?? 0)} strong />
            <Row k="Due date" v={meter.dueDate ?? "—"} />
            <Row k="Last payment" v={`${kes(meter.lastAmount)} · ${meter.lastTopup}`} />
          </>
        )}
      </div>

      {meter.lastToken && (
        <div className="mt-3 rounded-4 border border-line bg-white p-3">
          <p className="fs-105 fw-bold text-uppercase tracking-wide text-faint">Last token</p>
          <p className="num mt-1 text-truncate font-display fs-135 fw-extrabold text-ink">{meter.lastToken}</p>
          <div className="mt-2 d-flex flex-wrap gap-2">
            <CopyBtn text={meter.lastToken} />
            <Button size="sm" variant="outline" icon="send" onClick={() => toast({ title: "Token re-sent", msg: `${meter.lastToken} delivered via ${meter.delivery.join(" + ")}.`, tone: "success" })}>Re-send</Button>
          </div>
        </div>
      )}

      <div className="mt-3 d-flex gap-2">
        <Button className="flex-1" icon={meter.type === "Prepaid" ? "bolt" : "receipt"} onClick={() => open({ kind: "buy", utility: "electricity", accountId: meter.meter === "14825739" ? "acc-1" : meter.meter === "22901847" ? "acc-2" : undefined, amount: meter.bill ?? meter.lastAmount })}>
          {meter.type === "Prepaid" ? "Buy token" : "Pay bill"}
        </Button>
        <IconBtn icon="repeat" label="Autopay" tone="outline" onClick={() => open({ kind: "autopay" })} />
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon, tone, spark, progress }: { label: string; value: string; sub: string; icon: Parameters<typeof Icon>[0]["name"]; tone: "success" | "warning" | "danger" | "info"; spark?: React.ReactNode; progress?: number }) {
  const toneCls = {
    success: "bg-pmgreen-soft text-pmgreen-ink",
    warning: "bg-warn-soft text-warn-ink",
    danger: "bg-danger-soft text-danger-ink",
    info: "bg-pmblue-soft text-pmblue-ink",
  }[tone];
  return (
    <div className="card-hover rounded-5 border border-line bg-white p-4 shadow-pm">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="min-w-0">
          <p className="fs-11 fw-bold text-uppercase tracking-0-12em text-faint">{label}</p>
          <p className="num mt-15 font-display fs-21 fw-extrabold lh-1 tracking-tight text-ink">{value}</p>
          <p className="mt-15 text-truncate fs-11 leading-relaxed text-muted">{sub}</p>
        </div>
        <span className={cn("d-grid h-9 w-9 flex-none place-items-center rounded-11px", toneCls)}><Icon name={icon} size={17} /></span>
      </div>
      <div className="mt-3 d-flex align-items-end justify-content-end">{spark}</div>
      {progress !== undefined && <Progress value={progress} tone={tone === "danger" ? "red" : tone === "warning" ? "amber" : "green"} className="mt-3" />}
    </div>
  );
}