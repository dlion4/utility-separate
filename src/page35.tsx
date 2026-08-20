import { useMemo, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "./utils/cn";
import { useReveal } from "./utils/useReveal";
import {
  Badge,
  Button,
  Card,
  Chip,
  CopyBtn,
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
  Toggle,
  type Tone,
} from "./ui";
import { kes, num } from "./data";
import { useApp } from "./store";

/* ===================================================================== */
/*                              TYPES                                    */
/* ===================================================================== */

type LineStatus = "Healthy" | "Low data" | "Expiring" | "Paused";
type Network = "Safaricom" | "Airtel" | "Telkom";

interface SimLine {
  id: string;
  network: Network;
  msisdn: string;
  nickname: string;
  holder: string;
  status: LineStatus;
  bundle: string;
  dataLeft: number;
  dataTotal: number;
  airtime: number;
  minutes: string;
  sms: string;
  expiryDays: number;
  autoRenew: boolean;
  monthlySpend: number;
  trend: number[];
  primary: boolean;
}

interface MoneyAction {
  id: string;
  label: string;
  desc: string;
  icon: IconName;
  tone: Tone;
  fee: string;
  limit: string;
}

interface Bundle {
  id: string;
  network: Network;
  name: string;
  price: number;
  allowance: string;
  validity: string;
  badge?: string;
  category: "Data" | "Airtime" | "Data + Minutes" | "Unlimited";
}

interface AutoRule {
  id: string;
  lineId: string;
  network: Network;
  msisdn: string;
  nickname: string;
  bundle: string;
  amount: number;
  trigger: string;
  walletFirst: boolean;
  active: boolean;
  lastRun: string;
  nextRun: string;
}

interface MomoTxn {
  id: string;
  date: string;
  time: string;
  type: string;
  ref: string;
  counterparty: string;
  amount: number;
  direction: "in" | "out";
  channel: string;
  status: "Success" | "Pending" | "Failed";
  code: string;
}

/* ===================================================================== */
/*                              DATA                                     */
/* ===================================================================== */

const simLines: SimLine[] = [
  {
    id: "l-saf-1",
    network: "Safaricom",
    msisdn: "0712 *** 890",
    nickname: "Personal line",
    holder: "J. Mwangi",
    status: "Healthy",
    bundle: "12 GB + 600 min",
    dataLeft: 8.4,
    dataTotal: 12,
    airtime: 320,
    minutes: "412 min left",
    sms: "180 SMS left",
    expiryDays: 18,
    autoRenew: true,
    monthlySpend: 1000,
    trend: [2.1, 3.4, 2.8, 4.2, 3.9, 5.1, 4.6],
    primary: true,
  },
  {
    id: "l-airtel",
    network: "Airtel",
    msisdn: "0733 *** 456",
    nickname: "Team line",
    holder: "Sales desk",
    status: "Low data",
    bundle: "5 GB daily",
    dataLeft: 0.42,
    dataTotal: 5,
    airtime: 45,
    minutes: "0 min left",
    sms: "12 SMS left",
    expiryDays: 1,
    autoRenew: false,
    monthlySpend: 500,
    trend: [1.2, 1.8, 1.4, 2.6, 3.1, 4.4, 4.8],
    primary: false,
  },
  {
    id: "l-saf-2",
    network: "Safaricom",
    msisdn: "0722 *** 114",
    nickname: "Field ops line",
    holder: "Field technician",
    status: "Expiring",
    bundle: "8 GB + 300 min",
    dataLeft: 1.9,
    dataTotal: 8,
    airtime: 18,
    minutes: "44 min left",
    sms: "60 SMS left",
    expiryDays: 2,
    autoRenew: true,
    monthlySpend: 800,
    trend: [3.2, 2.4, 3.8, 2.9, 3.4, 4.1, 3.6],
    primary: false,
  },
  {
    id: "l-telkom",
    network: "Telkom",
    msisdn: "0770 *** 221",
    nickname: "Router backup",
    holder: "Office router",
    status: "Paused",
    bundle: "No active bundle",
    dataLeft: 0,
    dataTotal: 0,
    airtime: 0,
    minutes: "—",
    sms: "—",
    expiryDays: 0,
    autoRenew: false,
    monthlySpend: 0,
    trend: [0.4, 0.2, 0.3, 0.1, 0.2, 0, 0],
    primary: false,
  },
];

const moneyActions: MoneyAction[] = [
  { id: "ma-send", label: "Send money", desc: "To any M-Pesa, Airtel Money or bank account", icon: "send", tone: "success", fee: "Free to 3/day", limit: "KES 150,000 / day" },
  { id: "ma-pochi", label: "Pochi la Biashara", desc: "Collect business payments on your till", icon: "wallet", tone: "info", fee: "Free to receive", limit: "KES 300,000 / day" },
  { id: "ma-buygoods", label: "Buy Goods & Till", desc: "Pay a Lipa na M-Pesa till or paybill", icon: "tag", tone: "violet", fee: "Free", limit: "KES 500,000 / day" },
  { id: "ma-withdraw", label: "Withdraw cash", desc: "At any agent or ATM countrywide", icon: "bank", tone: "warning", fee: "From KES 29", limit: "KES 70,000 / txn" },
  { id: "ma-fuliza", label: "Fuliza repay", desc: "Clear overdraft, unlock limit instantly", icon: "repeat", tone: "danger", fee: "1% access fee", limit: "KES 2,000 limit" },
  { id: "ma-mali", label: "Mali invest", desc: "Money market fund, 8.9% net p.a.", icon: "trend-up", tone: "teal", fee: "0% entry fee", limit: "KES 250 min" },
];

const bundles: Bundle[] = [
  { id: "b-saf-1", network: "Safaricom", name: "5 GB Data", price: 250, allowance: "5 GB", validity: "30 days", category: "Data" },
  { id: "b-saf-2", network: "Safaricom", name: "12 GB + 600 min", price: 1000, allowance: "12 GB · 600 min", validity: "30 days", badge: "Popular", category: "Data + Minutes" },
  { id: "b-saf-3", network: "Safaricom", name: "25 GB + Unlimited Nights", price: 2000, allowance: "25 GB", validity: "30 days", badge: "Best value", category: "Unlimited" },
  { id: "b-saf-4", network: "Safaricom", name: "Airtime KES 100", price: 100, allowance: "KES 100 talk time", validity: "No expiry", category: "Airtime" },
  { id: "b-airtel-1", network: "Airtel", name: "Daily 1 GB", price: 99, allowance: "1 GB", validity: "24 hours", category: "Data" },
  { id: "b-airtel-2", network: "Airtel", name: "12 GB + 400 min", price: 1000, allowance: "12 GB · 400 min", validity: "30 days", badge: "Popular", category: "Data + Minutes" },
  { id: "b-airtel-3", network: "Airtel", name: "Unlimited Everything", price: 2500, allowance: "Truly unlimited", validity: "30 days", badge: "Best value", category: "Unlimited" },
  { id: "b-telkom-1", network: "Telkom", name: "10 GB Data", price: 500, allowance: "10 GB", validity: "30 days", category: "Data" },
  { id: "b-telkom-2", network: "Telkom", name: "Airtime KES 200", price: 200, allowance: "KES 200 talk time", validity: "No expiry", category: "Airtime" },
];

const autoRules: AutoRule[] = [
  { id: "ar-1", lineId: "l-saf-1", network: "Safaricom", msisdn: "0712 *** 890", nickname: "Personal line", bundle: "12 GB + 600 min", amount: 1000, trigger: "When data < 1 GB", walletFirst: true, active: true, lastRun: "10 Jun · 09:31", nextRun: "22 Jul · 08:00" },
  { id: "ar-2", lineId: "l-saf-2", network: "Safaricom", msisdn: "0722 *** 114", nickname: "Field ops line", bundle: "8 GB + 300 min", amount: 800, trigger: "3 days before expiry", walletFirst: true, active: true, lastRun: "20 Jun · 08:00", nextRun: "29 Jun · 08:00" },
  { id: "ar-3", lineId: "l-airtel", network: "Airtel", msisdn: "0733 *** 456", nickname: "Team line", bundle: "5 GB daily", amount: 500, trigger: "When data < 500 MB", walletFirst: false, active: false, lastRun: "28 May · 11:45", nextRun: "Paused" },
];

const momoTxns: MomoTxn[] = [
  { id: "mt-1", date: "27 Jun", time: "14:32", type: "Send Money", ref: "SMD-QK91X2", counterparty: "John Doe", amount: 1500, direction: "out", channel: "M-Pesa", status: "Success", code: "QK91X27BVC" },
  { id: "mt-2", date: "27 Jun", time: "11:08", type: "Data Bundle", ref: "DBT-PM-5501", counterparty: "Safaricom", amount: 1000, direction: "out", channel: "PayMo", status: "Success", code: "5501ZK4LMN" },
  { id: "mt-3", date: "26 Jun", time: "16:44", type: "Pochi Payment", ref: "PCH-8821RT", counterparty: "Jane Smith", amount: 4500, direction: "in", channel: "M-Pesa", status: "Success", code: "8821RTQW3A" },
  { id: "mt-4", date: "25 Jun", time: "09:14", type: "Fuliza Repay", ref: "FLZ-3320QM", counterparty: "Auto repayment", amount: 500, direction: "out", channel: "M-Pesa", status: "Success", code: "3320QMN8KL" },
  { id: "mt-5", date: "24 Jun", time: "18:20", type: "Buy Airtime", ref: "AIR-7712PL", counterparty: "Airtel 0733 ***", amount: 250, direction: "out", channel: "PayMo", status: "Success", code: "7712PLKO92" },
  { id: "mt-6", date: "22 Jun", time: "12:02", type: "Withdrawal", ref: "WDR-44512AG", counterparty: "Agent #44512", amount: 5000, direction: "out", channel: "Agent", status: "Success", code: "44512AGB7C" },
  { id: "mt-7", date: "21 Jun", time: "10:35", type: "Mali Invest", ref: "MLI-9011ZV", counterparty: "Unit Trust · MMF", amount: 10000, direction: "out", channel: "Mali", status: "Success", code: "9011ZVX3PL" },
  { id: "mt-8", date: "20 Jun", time: "08:00", type: "Buy Goods", ref: "BGT-2210KD", counterparty: "Naivas Westlands", amount: 3820, direction: "out", channel: "M-Pesa", status: "Success", code: "2210KDF9MQ" },
  { id: "mt-9", date: "19 Jun", time: "15:47", type: "Pochi Payment", ref: "PCH-6621LP", counterparty: "Kamau Hardware", amount: 12800, direction: "in", channel: "M-Pesa", status: "Pending", code: "6621LPD4WX" },
  { id: "mt-10", date: "18 Jun", time: "13:12", type: "Send Money", ref: "SMD-1109VC", counterparty: "A. Njeri", amount: 2200, direction: "out", channel: "M-Pesa", status: "Failed", code: "1109VCQ7ZT" },
];

const momoDaily = [1.2, 2.4, 1.8, 3.2, 4.5, 2.1, 1.6, 2.8, 3.9, 5.2, 4.1, 2.9, 3.4, 4.8];
const airtimeTrend = [1800, 2100, 1950, 2400, 2600, 2300, 2800, 3050, 2900, 3300, 3100, 3550];

const typeMix = [
  { label: "Send Money", value: 3700, color: "#12b76a" },
  { label: "Data & airtime", value: 1250, color: "#2e90fa" },
  { label: "Buy Goods", value: 3820, color: "#7a5af8" },
  { label: "Withdrawals", value: 5000, color: "#f79009" },
  { label: "Mali invest", value: 10000, color: "#0e9384" },
];

/* ===================================================================== */
/*                              HELPERS                                  */
/* ===================================================================== */

function lineTone(s: LineStatus): Tone {
  if (s === "Healthy") return "success";
  if (s === "Low data") return "danger";
  if (s === "Expiring") return "warning";
  return "muted";
}

function networkTone(n: Network): Tone {
  if (n === "Safaricom") return "success";
  if (n === "Airtel") return "danger";
  return "info";
}

function txnTone(s: MomoTxn["status"]): Tone {
  if (s === "Success") return "success";
  if (s === "Pending") return "warning";
  return "danger";
}

const TXN_TYPES = ["Send Money", "Data Bundle", "Pochi Payment", "Fuliza Repay", "Buy Airtime", "Withdrawal", "Mali Invest", "Buy Goods"] as const;

/* ===================================================================== */
/*                              PAGE                                     */
/* ===================================================================== */

export function MobileMoneyPage() {
  const { open, toast, balance } = useApp();
  const [lineFilter, setLineFilter] = useState<"all" | "active" | "attention" | "auto">("all");
  const [bundleNetwork, setBundleNetwork] = useState<"all" | Network>("all");
  const [bundleCat, setBundleCat] = useState<"all" | Bundle["category"]>("all");
  const [txnQuery, setTxnQuery] = useState("");
  const [txnType, setTxnType] = useState<"all" | (typeof TXN_TYPES)[number]>("all");
  const [txnStatus, setTxnStatus] = useState<"all" | MomoTxn["status"]>("all");
  const [txnDir, setTxnDir] = useState<"all" | "in" | "out">("all");
  const [range, setRange] = useState<"7" | "30">("30");
  const [rules, setRules] = useState(autoRules);

  useReveal([lineFilter, bundleNetwork, bundleCat, txnQuery, txnType, txnStatus]);

  const mpesaBalance = 18450;
  const fulizaUsed = 500;
  const fulizaLimit = 2000;
  const maliValue = 46200;

  const attentionLines = simLines.filter((l) => ["Low data", "Expiring"].includes(l.status));
  const autoLines = simLines.filter((l) => l.autoRenew);
  const activeRules = rules.filter((r) => r.active);

  const shownLines = useMemo(() => {
    if (lineFilter === "active") return simLines.filter((l) => l.status !== "Paused");
    if (lineFilter === "attention") return attentionLines;
    if (lineFilter === "auto") return autoLines;
    return simLines;
  }, [lineFilter, attentionLines, autoLines]);

  const shownBundles = useMemo(() => {
    let rows = bundles;
    if (bundleNetwork !== "all") rows = rows.filter((b) => b.network === bundleNetwork);
    if (bundleCat !== "all") rows = rows.filter((b) => b.category === bundleCat);
    return rows;
  }, [bundleNetwork, bundleCat]);

  const shownTxns = useMemo(() => {
    let rows = momoTxns;
    if (txnType !== "all") rows = rows.filter((t) => t.type === txnType);
    if (txnStatus !== "all") rows = rows.filter((t) => t.status === txnStatus);
    if (txnDir !== "all") rows = rows.filter((t) => t.direction === txnDir);
    if (txnQuery.trim()) {
      const q = txnQuery.toLowerCase();
      rows = rows.filter((t) => `${t.type} ${t.counterparty} ${t.ref} ${t.code} ${t.channel} ${kes(t.amount)}`.toLowerCase().includes(q));
    }
    return rows;
  }, [txnType, txnStatus, txnDir, txnQuery]);

  const moneyIn = momoTxns.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const moneyOut = momoTxns.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);
  const airtimeSpend = simLines.reduce((s, l) => s + l.monthlySpend, 0);
  const walletShare = Math.round((balance / (balance + mpesaBalance)) * 100);

  return (
    <div className="mx-auto max-w-[1320px]">
      {/* ========================= HERO ========================= */}
      <section className="pm-hero relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-9">
        <div className="pm-hero-dots pointer-events-none absolute inset-0" />
        <div className="relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-10">
          {/* left */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 backdrop-blur">
              <span className="live-dot" /> M-Pesa, Airtel Money &amp; Telkom rails connected · 4 lines linked
            </span>
            <h2 className="mt-4 font-display text-[27px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[36px] lg:text-[42px]">
              Mobile money &amp; airtime,
              <br className="hidden sm:block" /> one intelligent hub.
            </h2>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
              Send money, collect on Pochi, withdraw, clear Fuliza, grow Mali and keep every line topped up — with auto-renew rules that charge the wallet first and fall back to M-Pesa.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" icon="phone" onClick={() => open({ kind: "buy", utility: "airtime" })}>
                Buy airtime &amp; data
              </Button>
              <Button size="lg" variant="white" icon="send" onClick={() => toast({ title: "Send money", msg: "Recipient lookup opens — search by name, number or bank.", tone: "info" })}>
                Send money
              </Button>
              <Button size="lg" variant="white" icon="download" onClick={() => open({ kind: "export" })}>
                Export history
              </Button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {[
                { k: "M-Pesa", v: kes(mpesaBalance), s: "0712 *** 890", icon: "smartphone" as IconName },
                { k: "PayMo wallet", v: kes(balance), s: `${walletShare}% of float`, icon: "wallet" as IconName },
                { k: "Fuliza used", v: kes(fulizaUsed), s: `of ${kes(fulizaLimit)}`, icon: "repeat" as IconName },
                { k: "Mali fund", v: kes(maliValue), s: "8.9% net p.a.", icon: "trend-up" as IconName },
              ].map((x) => (
                <div key={x.k} className="card-sheen relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur">
                  <Icon name={x.icon} size={15} className="text-pmgreen" />
                  <p className="num mt-2 font-display text-[17px] font-extrabold text-white">{x.v}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-white/40">{x.k}</p>
                  <p className="mt-1 text-[10.5px] text-white/55">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right — balances + quick actions */}
          <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold text-white">Quick actions</p>
              <Badge tone="dark" className="border border-white/15 bg-white/10 text-white/70">Frequent</Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {moneyActions.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    if (a.id === "ma-mali" || a.id === "ma-send" || a.id === "ma-pochi" || a.id === "ma-withdraw" || a.id === "ma-buygoods" || a.id === "ma-fuliza") {
                      toast({ title: a.label, msg: `${a.desc} · ${a.fee}`, tone: "info" });
                    }
                  }}
                  className="group flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition hover:border-white/25 hover:bg-white/[0.09]"
                >
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/10 text-pmgreen">
                    <Icon name={a.icon} size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-bold text-white">{a.label}</span>
                    <span className="block truncate text-[10.5px] text-white/45">{a.fee}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Fuliza gauge */}
            <div className="mt-4 rounded-xl border border-white/10 bg-ink/25 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">Fuliza overdraft</p>
                <Badge tone="warning">{Math.round((fulizaUsed / fulizaLimit) * 100)}% used</Badge>
              </div>
              <div className="mt-2.5 h-[6px] w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-warn transition-[width] duration-500" style={{ width: `${(fulizaUsed / fulizaLimit) * 100}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="num text-white">{kes(fulizaUsed)} drawn</span>
                <span className="num text-white/55">{kes(fulizaLimit - fulizaUsed)} available</span>
              </div>
              <Button
                variant="white"
                size="sm"
                full
                className="mt-2.5"
                icon="repeat"
                onClick={() => toast({ title: "Fuliza repayment", msg: `${kes(fulizaUsed)} will clear from wallet. Limit restored instantly.`, tone: "success" })}
              >
                Repay {kes(fulizaUsed)}
              </Button>
            </div>

            {/* Mali card */}
            <div className="mt-3 rounded-xl border border-white/10 bg-gradient-to-br from-pmgreen/15 to-transparent p-3.5">
              <div className="flex items-center gap-2">
                <Icon name="trend-up" size={15} className="text-pmgreen" />
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Mali investment</p>
              </div>
              <p className="num mt-1.5 font-display text-[20px] font-extrabold text-white">{kes(maliValue)}</p>
              <p className="mt-0.5 text-[10.5px] text-white/50">+KES 3,410 this month · 8.9% net p.a.</p>
              <Button variant="white" size="sm" full className="mt-2.5" icon="plus" onClick={() => toast({ title: "Top up Mali", msg: "Money market fund purchase from KES 250.", tone: "success" })}>
                Invest more
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= KPIs ========================= */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-reveal>
        <Kpi label="Money out (30d)" value={kes(moneyOut)} sub={`${momoTxns.filter((t) => t.direction === "out").length} outgoing transfers`} icon="arrow-up-right" tone="danger" spark={<Spark points={momoDaily} stroke="#f04438" />} />
        <Kpi label="Money in (30d)" value={kes(moneyIn)} sub="Pochi & till collections" icon="arrow-down" tone="success" spark={<Spark points={[3.1, 2.4, 4.2, 3.8, 5.1, 4.4, 6.2]} stroke="#12b76a" />} />
        <Kpi label="Airtime & data" value={kes(airtimeSpend)} sub={`${simLines.filter((l) => l.status !== "Paused").length} active lines`} icon="phone" tone="info" spark={<Spark points={airtimeTrend} stroke="#2e90fa" />} />
        <Kpi label="Auto-renew rules" value={`${activeRules.length}/${rules.length}`} sub="Wallet first, M-Pesa fallback" icon="repeat" tone="violet" progress={(activeRules.length / rules.length) * 100} />
      </section>

      {/* ========================= 3.5 — SIM LINES ========================= */}
      <SectionHead no="3.5" id="sec-lines" title="Lines, bundles & balances" sub="Every SIM in the business with live data, airtime, minutes and renewal state.">
        <div className="flex flex-wrap gap-2">
          <Chip on={lineFilter === "all"} onClick={() => setLineFilter("all")} count={simLines.length}>All lines</Chip>
          <Chip on={lineFilter === "active"} onClick={() => setLineFilter("active")} count={simLines.filter((l) => l.status !== "Paused").length}>Active</Chip>
          <Chip on={lineFilter === "attention"} onClick={() => setLineFilter("attention")} count={attentionLines.length}>Needs attention</Chip>
          <Chip on={lineFilter === "auto"} onClick={() => setLineFilter("auto")} count={autoLines.length}>Auto-renew</Chip>
        </div>
      </SectionHead>

      {shownLines.length === 0 ? (
        <Card>
          <Empty icon="phone" title="No lines match that filter" sub="Switch filters or register a new Safaricom, Airtel or Telkom line." action={<Button icon="plus" onClick={() => open({ kind: "addAccount", utility: "airtime" })}>Add a line</Button>} />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shownLines.map((l, i) => (
            <LineCard key={l.id} line={l} delay={i * 45} />
          ))}
          <button data-reveal onClick={() => open({ kind: "addAccount", utility: "airtime" })} className="flex min-h-[300px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-white/70 p-5 text-center transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/20">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted"><Icon name="plus" size={22} /></span>
            <p className="text-[13.5px] font-bold text-ink">Register another line</p>
            <p className="max-w-[30ch] text-[11.5px] leading-relaxed text-muted">Safaricom, Airtel or Telkom — verified by OTP in under 30 seconds.</p>
          </button>
        </div>
      )}

      {/* ========================= 3.5A — MONEY ACTIONS ========================= */}
      <SectionHead no="3.5A" id="sec-money" title="Mobile money actions" sub="Every M-Pesa workflow your business runs, with transparent fees and daily limits.">
        <Segmented value={range} onChange={setRange} size="sm" options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
      </SectionHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {moneyActions.map((a, i) => (
          <div key={a.id} data-reveal style={{ animationDelay: `${i * 40}ms` }} className="card-hover flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="flex items-start gap-3">
              <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", toneBg(a.tone))}>
                <Icon name={a.icon} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-ink">{a.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{a.desc}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-[#fafbfd] p-3">
              <Row k="Fee" v={a.fee} />
              <Row k="Daily limit" v={a.limit} />
              <Row k="Settles" v="Instantly" />
            </div>
            <Button className="mt-3" full icon={a.icon} onClick={() => toast({ title: a.label, msg: `${a.desc}`, tone: "info" })}>
              Open {a.label.toLowerCase()}
            </Button>
          </div>
        ))}
      </div>

      {/* ========================= 3.5B — BUNDLE MARKETPLACE ========================= */}
      <SectionHead no="3.5B" id="sec-bundles" title="Bundle marketplace" sub="Compare Safaricom, Airtel and Telkom packages side by side and buy instantly.">
        <div className="flex flex-wrap gap-2">
          {(["all", "Safaricom", "Airtel", "Telkom"] as const).map((n) => (
            <Chip key={n} on={bundleNetwork === n} onClick={() => setBundleNetwork(n)} count={n === "all" ? bundles.length : bundles.filter((b) => b.network === n).length}>
              {n === "all" ? "All networks" : n}
            </Chip>
          ))}
        </div>
      </SectionHead>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "Data", "Airtime", "Data + Minutes", "Unlimited"] as const).map((c) => (
          <Chip key={c} on={bundleCat === c} onClick={() => setBundleCat(c)} count={c === "all" ? bundles.length : bundles.filter((b) => b.category === c).length}>
            {c === "all" ? "All types" : c}
          </Chip>
        ))}
      </div>

      {shownBundles.length === 0 ? (
        <Card>
          <Empty icon="tag" title="No bundles match those filters" sub="Try a different network or bundle type." action={<Button variant="outline" icon="refresh" onClick={() => { setBundleNetwork("all"); setBundleCat("all"); }}>Clear filters</Button>} />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shownBundles.map((b, i) => (
            <button
              key={b.id}
              data-reveal
              style={{ animationDelay: `${i * 35}ms` }}
              onClick={() => open({ kind: "buy", utility: "airtime", amount: b.price })}
              className="card-hover group flex flex-col rounded-2xl border border-line bg-white p-4 text-left shadow-pm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-[12px]", toneBg(networkTone(b.network)))}>
                  <Icon name="phone" size={18} />
                </span>
                {b.badge && <Badge tone={b.badge === "Best value" ? "success" : "violet"}>{b.badge}</Badge>}
              </div>
              <p className="mt-3 text-[13.5px] font-bold text-ink">{b.name}</p>
              <p className="mt-0.5 text-[11.5px] text-muted">{b.allowance}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone={networkTone(b.network)}>{b.network}</Badge>
                <Badge tone="muted">{b.validity}</Badge>
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                <span className="num font-display text-[18px] font-extrabold text-ink">{kes(b.price)}</span>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-canvas text-muted transition group-hover:bg-ink group-hover:text-white">
                  <Icon name="arrow-up-right" size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ========================= 3.5C — AUTO-RENEW RULES ========================= */}
      <SectionHead no="3.5C" id="sec-autorenew" title="Auto-renew & trigger rules" sub="Charge the PayMo wallet first and fall back to M-Pesa only when the wallet is short — never run dry mid-call.">
        <Button variant="outline" size="sm" icon="sliders" onClick={() => open({ kind: "autopay" })}>Open autopay centre</Button>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Active line rules</p>
              <p className="mt-0.5 text-[12px] text-muted">Each rule fires on a data or expiry trigger you define.</p>
            </div>
            <Badge tone={activeRules.length > 0 ? "success" : "warning"} dot>{activeRules.length} running</Badge>
          </div>

          <div className="mt-3 space-y-2.5">
            {rules.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-[#fafbfd] p-3.5">
                <div className="flex flex-wrap items-start gap-3">
                  <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", toneBg(networkTone(r.network)))}>
                    <Icon name="phone" size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[13px] font-bold text-ink">{r.nickname}</p>
                      <Badge tone={r.active ? "success" : "muted"} dot>{r.active ? "Active" : "Paused"}</Badge>
                    </div>
                    <p className="num mt-0.5 text-[11.5px] text-muted">{r.msisdn} · {r.bundle}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-2">
                      <Icon name="clock" size={12} className="text-faint" /> {r.trigger}
                    </p>
                  </div>
                  <Toggle
                    on={r.active}
                    label={`Auto-renew ${r.nickname}`}
                    onChange={(v) => {
                      setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: v } : x)));
                      toast({ title: v ? "Rule resumed" : "Rule paused", msg: `${r.nickname} · ${r.bundle}`, tone: v ? "success" : "info" });
                    }}
                  />
                </div>

                <div className="mt-3 grid gap-2 border-t border-line pt-3 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">Bundle amount</p>
                    <Select
                      value={r.amount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, amount: val } : x)));
                      }}
                    >
                      {[250, 500, 800, 1000, 2000, r.amount].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b).map((v) => (
                        <option key={v} value={v}>{kes(v)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">Trigger rule</p>
                    <Select
                      value={r.trigger}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, trigger: val } : x)));
                      }}
                    >
                      {["When data < 500 MB", "When data < 1 GB", "3 days before expiry", "Weekly · Monday 8am", "Monthly on the 1st"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <label className="mt-2.5 flex items-center gap-3 rounded-xl border border-line bg-white p-2.5">
                  <Toggle
                    on={r.walletFirst}
                    label={`Wallet first for ${r.nickname}`}
                    onChange={(v) => {
                      setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, walletFirst: v } : x)));
                      toast({ title: v ? "Wallet-first enabled" : "M-Pesa direct", msg: `${r.nickname} funding preference updated.`, tone: "info" });
                    }}
                  />
                  <span className="text-[11.5px] font-medium text-ink-2">
                    Charge PayMo wallet first, fallback to M-Pesa
                    <span className="mt-0.5 block text-[10.5px] text-muted">Avoids M-Pesa shortfall failures on auto-renew.</span>
                  </span>
                </label>

                <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-faint">Last run</p>
                    <p className="num mt-0.5 text-[12px] font-semibold text-ink-2">{r.lastRun}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-faint">Next run</p>
                    <p className="num mt-0.5 text-[12px] font-semibold text-ink-2">{r.nextRun}</p>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Button size="sm" icon="phone" onClick={() => open({ kind: "buy", utility: "airtime", amount: r.amount })}>Run now</Button>
                  <Button size="sm" variant="outline" icon="repeat" onClick={() => open({ kind: "autopay" })}>Advanced settings</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon="trash"
                    onClick={() => {
                      setRules((prev) => prev.filter((x) => x.id !== r.id));
                      toast({ title: "Rule deleted", msg: `${r.nickname} will no longer auto-renew.`, tone: "warn" });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="mt-3"
            full
            icon="plus"
            onClick={() => {
              const paused = simLines.find((l) => !rules.some((r) => r.lineId === l.id));
              if (!paused) {
                toast({ title: "All lines covered", msg: "Every registered line already has a rule.", tone: "info" });
                return;
              }
              setRules((prev) => [
                ...prev,
                {
                  id: `ar-${Date.now()}`,
                  lineId: paused.id,
                  network: paused.network,
                  msisdn: paused.msisdn,
                  nickname: paused.nickname,
                  bundle: paused.bundle,
                  amount: Math.max(paused.monthlySpend, 250),
                  trigger: "When data < 1 GB",
                  walletFirst: true,
                  active: true,
                  lastRun: "Never",
                  nextRun: "Tomorrow 08:00",
                },
              ]);
              toast({ title: "Auto-renew created", msg: `${paused.nickname} will renew at ${kes(Math.max(paused.monthlySpend, 250))}.`, tone: "success" });
            }}
          >
            New auto-renew rule
          </Button>
        </Card>

        <div className="space-y-3">
          <Card hover className="bg-gradient-to-br from-ink to-[#123a2c] text-white">
            <div className="flex items-center gap-2">
              <Icon name="wallet" size={17} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight">Funding waterfall</p>
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">How PayMo picks the channel for every auto-renew and manual purchase.</p>
            <div className="mt-3 space-y-2">
              {[
                { n: "1", t: "PayMo wallet", d: `${kes(balance)} · zero fee`, on: true },
                { n: "2", t: "M-Pesa STK", d: "0712 *** 890 · free", on: true },
                { n: "3", t: "Fuliza overdraft", d: `${kes(fulizaLimit - fulizaUsed)} left · 1%`, on: false },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] p-2.5">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-white/10 font-display text-[11px] font-bold text-white">{s.n}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-bold text-white">{s.t}</span>
                    <span className="num block text-[10.5px] text-white/50">{s.d}</span>
                  </span>
                  {s.on ? <span className="live-dot" /> : <Icon name="pause-circle" size={15} className="text-white/35" />}
                </div>
              ))}
            </div>
            <Button variant="white" full className="mt-3" icon="sliders" onClick={() => open({ kind: "topup" })}>Top up wallet</Button>
          </Card>

          <Card hover>
            <div className="flex items-center gap-2">
              <Icon name="chart" size={16} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Spend by action</p>
            </div>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <Donut data={typeMix} center={<><p className="num font-display text-[15px] font-extrabold text-ink">{kes(typeMix.reduce((s, x) => s + x.value, 0))}</p><p className="text-[10.5px] font-semibold text-muted">outgoing</p></>} />
              <div className="w-full flex-1 space-y-2">
                {typeMix.map((x) => (
                  <div key={x.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: x.color }} />
                    <span className="flex-1 truncate text-[12px] font-semibold text-ink-2">{x.label}</span>
                    <span className="num text-[12px] font-bold text-ink">{kes(x.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================= 3.5D — HISTORY ========================= */}
      <SectionHead no="3.5D" id="sec-history" title="Mobile money history" sub="Every send, collection, withdrawal, bundle and investment with its M-Pesa confirmation code.">
        <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export</Button>
      </SectionHead>

      <Card className="p-0">
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[210px] flex-1">
              <Input icon="search" placeholder="Search type, name, reference or code…" value={txnQuery} onChange={(e) => setTxnQuery(e.target.value)} />
            </div>
            <Select value={txnType} onChange={(e) => setTxnType(e.target.value as typeof txnType)} className="w-auto">
              <option value="all">All types</option>
              {TXN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Select value={txnDir} onChange={(e) => setTxnDir(e.target.value as typeof txnDir)} className="w-auto">
              <option value="all">In &amp; out</option>
              <option value="in">Money in</option>
              <option value="out">Money out</option>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "Success", "Pending", "Failed"] as const).map((s) => (
              <Chip key={s} on={txnStatus === s} onClick={() => setTxnStatus(s)} count={s === "all" ? momoTxns.length : momoTxns.filter((t) => t.status === s).length}>
                {s === "all" ? "All" : s}
              </Chip>
            ))}
            <span className="ml-auto text-[11.5px] font-semibold text-muted">{shownTxns.length} of {momoTxns.length}</span>
          </div>
        </div>

        {shownTxns.length === 0 ? (
          <Empty icon="search" title="No transactions match" sub="Try a name like John Doe, a type like Fuliza, or a code like QK91X27BVC." action={<Button variant="outline" icon="refresh" onClick={() => { setTxnQuery(""); setTxnType("all"); setTxnStatus("all"); setTxnDir("all"); }}>Reset filters</Button>} />
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px]">
                <thead className="bg-[#fafbfd]">
                  <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Ref / Name</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">M-Pesa code</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shownTxns.map((t) => (
                    <tr key={t.id} className="transition hover:bg-[#f7f9fc]">
                      <td className="whitespace-nowrap px-4 py-3 text-[12px] font-semibold text-ink-2">{t.date}<span className="ml-1.5 text-[11px] font-normal text-faint">{t.time}</span></td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className={cn("grid h-7 w-7 flex-none place-items-center rounded-lg", t.direction === "in" ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}>
                            <Icon name={t.direction === "in" ? "arrow-down" : "arrow-up-right"} size={13} />
                          </span>
                          <span className="text-[12.5px] font-semibold text-ink">{t.type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12.5px] font-semibold text-ink-2">{t.counterparty}</span>
                        <span className="num block text-[11px] text-faint">{t.ref}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted">{t.channel}</td>
                      <td className={cn("num px-4 py-3 text-right text-[12.5px] font-bold", t.direction === "in" ? "text-[#067647]" : "text-ink")}>
                        {t.direction === "in" ? "+" : "−"}{kes(t.amount)}
                      </td>
                      <td className="px-4 py-3"><code className="num rounded-md bg-canvas px-2 py-1 text-[11px] font-bold text-ink-2">{t.code}</code></td>
                      <td className="px-4 py-3"><Badge tone={txnTone(t.status)} dot>{t.status}</Badge></td>
                      <td className="px-4 py-3 text-right"><CopyBtn text={t.code} label="" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile list */}
            <div className="divide-y divide-line lg:hidden">
              {shownTxns.map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3.5">
                  <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", t.direction === "in" ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}>
                    <Icon name={t.direction === "in" ? "arrow-down" : "arrow-up-right"} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-ink">{t.type}</span>
                      <span className={cn("num text-[13px] font-extrabold", t.direction === "in" ? "text-[#067647]" : "text-ink")}>
                        {t.direction === "in" ? "+" : "−"}{kes(t.amount)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="num truncate text-[11.5px] text-muted">{t.date} · {t.counterparty}</span>
                      <Badge tone={txnTone(t.status)}>{t.status}</Badge>
                    </div>
                    <code className="num mt-1.5 inline-block rounded-lg bg-canvas px-2 py-1 text-[11px] font-bold text-ink-2">{t.code}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#fafbfd] px-4 py-3.5">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11.5px]">
                <span className="text-muted">In <span className="num font-bold text-[#067647]">{kes(moneyIn)}</span></span>
                <span className="text-muted">Out <span className="num font-bold text-ink">{kes(moneyOut)}</span></span>
                <span className="text-muted">Net <span className="num font-bold text-ink">{kes(moneyIn - moneyOut)}</span></span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export CSV</Button>
                <Button size="sm" variant="dark" icon="receipt" onClick={() => open({ kind: "history" })}>Full history</Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ========================= SUPPORT ========================= */}
      <section className="mt-6 grid gap-3 lg:grid-cols-3" data-reveal>
        <Card className="lg:col-span-2 bg-gradient-to-br from-ink via-[#0f2233] to-[#0d5c38] text-white" hover>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[52ch]">
              <Badge tone="dark" className="border border-white/15 bg-white/10 text-white/80">Controls</Badge>
              <h3 className="mt-3 font-display text-[19px] font-extrabold tracking-tight">Spend caps, approvals and instant reversal</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                Set per-line monthly caps, require dual approval for transfers above KES 20,000, and reverse any failed send automatically — with the M-Pesa code preserved for reconciliation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="white" icon="shield" onClick={() => toast({ title: "Approval policy set", msg: "Transfers above KES 20,000 now need a second approver.", tone: "info" })}>Approval policy</Button>
                <Button variant="white" icon="sliders" onClick={() => toast({ title: "Spend caps", msg: "Per-line caps editable for all 4 registered lines.", tone: "info" })}>Spend caps</Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>Mobile money help</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              {[
                { k: "Auto-reversal", v: "100%", i: "refresh" as IconName },
                { k: "Failed sends", v: "1 / 10", i: "alert" as IconName },
                { k: "Avg settlement", v: "1.8s", i: "clock" as IconName },
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
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Smart optimisations</p>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { t: "Move Team line to monthly", d: "Daily bundles cost 20% more.", s: "KES 1,200 / yr" },
              { t: "Resume Airtel auto-renew", d: "Line hit 420 MB with no rule active.", s: "Avoid downtime" },
              { t: "Invest idle wallet float", d: `${kes(Math.max(balance - 5000, 0))} could earn 8.9% in Mali.`, s: "KES 217 / mo" },
              { t: "Clear Fuliza today", d: "Access fee accrues daily on KES 500.", s: "Stop 1% fee" },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3">
                <Icon name="check-circle" size={16} className="mt-0.5 flex-none text-pmgreen" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{x.t}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{x.d}</p>
                  <p className="num mt-1 text-[11px] font-bold text-[#067647]">{x.s}</p>
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
/*                             LINE CARD                                 */
/* ===================================================================== */

function LineCard({ line, delay }: { line: SimLine; delay: number }) {
  const { open, toast } = useApp();
  const risk = ["Low data", "Expiring"].includes(line.status);
  const paused = line.status === "Paused";
  const dataPct = line.dataTotal > 0 ? Math.round(((line.dataTotal - line.dataLeft) / line.dataTotal) * 100) : 0;

  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start gap-3">
        <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", paused ? "bg-canvas text-faint" : toneBg(networkTone(line.network)))}>
          <Icon name="smartphone" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13.5px] font-bold text-ink">{line.nickname}</p>
            {line.primary && <Icon name="star" size={13} className="text-warn" />}
          </div>
          <p className="num mt-0.5 text-[11.5px] text-muted">{line.msisdn} · {line.holder}</p>
        </div>
        <Menu
          trigger={() => <span className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="more" size={16} /></span>}
          items={[
            { label: "Buy data / airtime", icon: "phone", onClick: () => open({ kind: "buy", utility: "airtime" }) },
            { label: line.autoRenew ? "Edit auto-renew" : "Set auto-renew", icon: "repeat", onClick: () => open({ kind: "autopay" }) },
            { label: "Bundle history", icon: "receipt", onClick: () => open({ kind: "history" }) },
            { label: paused ? "Reactivate line" : "Freeze line", icon: paused ? "play" : "pause-circle", onClick: () => toast({ title: paused ? "Line reactivated" : "Line frozen", msg: `${line.nickname} · ${line.msisdn}`, tone: paused ? "success" : "warn" }) },
          ]}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={networkTone(line.network)}>{line.network}</Badge>
        <Badge tone={lineTone(line.status)} dot>{line.status}</Badge>
        {line.autoRenew && <Badge tone="success" icon="repeat">Auto</Badge>}
      </div>

      <div className={cn("mt-3 rounded-xl p-3", paused ? "bg-canvas/70" : risk ? "bg-danger-soft/50" : "bg-[#fafbfd]")}>
        <Row k="Active bundle" v={line.bundle} />
        {!paused && (
          <>
            <Row k="Data remaining" v={`${num(line.dataLeft)} GB`} strong />
            <Progress value={dataPct} tone={dataPct > 85 ? "red" : dataPct > 60 ? "amber" : "green"} className="mt-2" />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
              <span>{num(line.dataTotal - line.dataLeft)} GB used</span>
              <span>{line.dataTotal} GB total</span>
            </div>
          </>
        )}
        <Row k="Airtime balance" v={line.airtime > 0 ? kes(line.airtime) : "—"} />
        <Row k="Minutes / SMS" v={paused ? "—" : `${line.minutes} · ${line.sms}`} />
        {!paused && <Row k="Expires in" v={`${line.expiryDays} day${line.expiryDays === 1 ? "" : "s"}`} />}
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white p-3">
        <Row k="Monthly spend" v={line.monthlySpend > 0 ? kes(line.monthlySpend) : "—"} />
        <Row k="Usage trend" v={<Spark points={line.trend} stroke={line.network === "Safaricom" ? "#12b76a" : line.network === "Airtel" ? "#f04438" : "#2e90fa"} w={72} h={22} />} />
      </div>

      <div className="mt-3 flex gap-2">
        <Button className="flex-1" icon="phone" disabled={paused} onClick={() => open({ kind: "buy", utility: "airtime" })}>
          {paused ? "Reactivate" : "Top up"}
        </Button>
        <IconBtn icon="repeat" label="Auto-renew" tone="outline" onClick={() => open({ kind: "autopay" })} />
      </div>
    </div>
  );
}

/* ===================================================================== */
/*                              KPI CARD                                 */
/* ===================================================================== */

function toneBg(tone: Tone) {
  const map: Record<Tone, string> = {
    success: "bg-pmgreen-soft text-[#067647]",
    warning: "bg-warn-soft text-[#93370d]",
    danger: "bg-danger-soft text-[#b42318]",
    info: "bg-pmblue-soft text-[#175cd3]",
    violet: "bg-pmviolet-soft text-[#5925dc]",
    teal: "bg-pmteal-soft text-[#07615a]",
    muted: "bg-canvas text-muted",
    dark: "bg-ink text-white",
  };
  return map[tone];
}

function Kpi({ label, value, sub, icon, tone, spark, progress }: { label: string; value: string; sub: string; icon: IconName; tone: Tone; spark?: ReactNode; progress?: number }) {
  return (
    <div className="card-hover rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">{label}</p>
          <p className="num mt-1.5 font-display text-[21px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
          <p className="mt-1.5 truncate text-[11px] leading-relaxed text-muted">{sub}</p>
        </div>
        <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[11px]", toneBg(tone))}>
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-end">{spark}</div>
      {progress !== undefined && <Progress value={progress} tone={tone === "danger" ? "red" : tone === "warning" ? "amber" : tone === "info" ? "blue" : "green"} className="mt-3" />}
    </div>
  );
}
