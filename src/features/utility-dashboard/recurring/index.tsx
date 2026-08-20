import { useMemo, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../../../components/ui/icons";
import { cn } from "../../../lib/utils/cn";
import { useReveal } from "../../../lib/utils/useReveal";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  CopyBtn,
  Donut,
  Drawer,
  DrawerHead,
  Empty,
  Field,
  IconBtn,
  Input,
  Menu,
  Modal,
  Progress,
  Row,
  SectionHead,
  Segmented,
  Select,
  Spark,
  Stepper,
  Toggle,
  downloadCSV,
  type Tone,
} from "../../../components/ui";
import { kes } from "../../../lib/data";
import { useApp } from "../../../store";

type Category = "rent" | "litter" | "gas" | "other";
type DestKind = "bank" | "mpesa" | "paymo" | "cash";
type Cadence = "Weekly" | "Monthly" | "Quarterly" | "On request";
type BillStatus = "Due soon" | "Scheduled" | "Overdue" | "Paused" | "Paid";

type Destination = {
  id: string;
  kind: DestKind;
  label: string;
  detail: string;
  holder: string;
  verified: boolean;
  paymoUser?: boolean;
};

type RecurringBill = {
  id: string;
  category: Category;
  name: string;
  customLabel?: string;
  property: string;
  provider: string;
  amount: number;
  cadence: Cadence;
  nextDate: string;
  dueDays: number;
  lastPaid: string;
  lastAmount: number;
  destId: string;
  status: BillStatus;
  autopay: boolean;
  notify: boolean;
  contact: string;
  channel: "SMS" | "WhatsApp" | "PayMo";
  notes: string;
};

type HouseholdReceipt = {
  id: string;
  date: string;
  time: string;
  billId: string;
  name: string;
  category: Category;
  amount: number;
  dest: string;
  method: string;
  ref: string;
  status: "Success" | "Pending" | "Failed";
  ack: string;
};

type HouseholdAlert = {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: Tone;
  icon: IconName;
  billId?: string;
};

type Thread = {
  id: string;
  provider: string;
  billId: string;
  channel: "SMS" | "WhatsApp" | "PayMo";
  last: string;
  unread: number;
  preview: string;
};

const destinationsSeed: Destination[] = [
  { id: "d-bank-jane", kind: "bank", label: "Equity Bank", detail: "···· 4521 · KES RTGS", holder: "Jane Wanjiku", verified: true },
  { id: "d-mpesa-taka", kind: "mpesa", label: "M-Pesa Till", detail: "Till 834291 · TakaTaka", holder: "TakaTaka Solutions", verified: true },
  { id: "d-paymo-jk", kind: "paymo", label: "PayMo ID", detail: "@jkholdings", holder: "J.K. Holdings Ltd", verified: true, paymoUser: true },
  { id: "d-mpesa-kgas", kind: "mpesa", label: "M-Pesa", detail: "0722 *** 118", holder: "K-Gas rider · Ali", verified: true },
  { id: "d-cash-care", kind: "cash", label: "Cash collection", detail: "Envelope · caretaker desk", holder: "Peter Otieno", verified: false },
  { id: "d-bank-kcb", kind: "bank", label: "KCB", detail: "···· 8810", holder: "GreenGuard Security", verified: true },
];

const billsSeed: RecurringBill[] = [
  { id: "b-rent-home", category: "rent", name: "Home rent · Karen", property: "Karen bungalow", provider: "Jane Wanjiku", amount: 45000, cadence: "Monthly", nextDate: "05 Jul 2025", dueDays: 8, lastPaid: "05 Jun 2025", lastAmount: 45000, destId: "d-bank-jane", status: "Scheduled", autopay: true, notify: true, contact: "0712 *** 440", channel: "WhatsApp", notes: "Standing order on the 5th. Receipt emailed to landlord." },
  { id: "b-rent-shop", category: "rent", name: "Shop rent · Westlands", property: "Westlands hardware", provider: "J.K. Holdings Ltd", amount: 85000, cadence: "Monthly", nextDate: "01 Jul 2025", dueDays: 4, lastPaid: "01 Jun 2025", lastAmount: 85000, destId: "d-paymo-jk", status: "Due soon", autopay: true, notify: true, contact: "@jkholdings", channel: "PayMo", notes: "PayMo-to-PayMo. Dual approval above KES 50,000." },
  { id: "b-litter", category: "litter", name: "Garbage collection", property: "Karen bungalow", provider: "TakaTaka Solutions", amount: 1500, cadence: "Monthly", nextDate: "28 Jun 2025", dueDays: 1, lastPaid: "28 May 2025", lastAmount: 1500, destId: "d-mpesa-taka", status: "Due soon", autopay: true, notify: true, contact: "0700 *** 221", channel: "SMS", notes: "Weekly pickup Tue/Fri. Missed pickup waived next month." },
  { id: "b-gas", category: "gas", name: "Kitchen 13kg refill", property: "Karen bungalow", provider: "K-Gas · Ali", amount: 2850, cadence: "On request", nextDate: "On empty", dueDays: 0, lastPaid: "18 Jun 2025", lastAmount: 2850, destId: "d-mpesa-kgas", status: "Scheduled", autopay: false, notify: true, contact: "0722 *** 118", channel: "WhatsApp", notes: "Message Ali when the gauge hits red. Same-day delivery." },
  { id: "b-sec", category: "other", name: "Night security", customLabel: "Security guards", property: "Shop · Westlands", provider: "GreenGuard Security", amount: 12000, cadence: "Monthly", nextDate: "30 Jun 2025", dueDays: 3, lastPaid: "30 May 2025", lastAmount: 12000, destId: "d-bank-kcb", status: "Due soon", autopay: true, notify: true, contact: "0111 *** 908", channel: "SMS", notes: "Two guards · 18:00–06:00. Invoice attached monthly." },
  { id: "b-garden", category: "other", name: "Gardener", customLabel: "Gardener", property: "Karen bungalow", provider: "Samuel Kariuki", amount: 4000, cadence: "Monthly", nextDate: "07 Jul 2025", dueDays: 10, lastPaid: "07 Jun 2025", lastAmount: 4000, destId: "d-cash-care", status: "Scheduled", autopay: false, notify: false, contact: "0718 *** 332", channel: "WhatsApp", notes: "Cash via caretaker on the first Saturday." },
  { id: "b-pump", category: "other", name: "Borehole pump service", customLabel: "Borehole service", property: "Kiambu pump house", provider: "AquaTech Ltd", amount: 6500, cadence: "Quarterly", nextDate: "22 Jun 2025", dueDays: -5, lastPaid: "22 Mar 2025", lastAmount: 6200, destId: "d-bank-kcb", status: "Overdue", autopay: false, notify: true, contact: "020 *** 441", channel: "SMS", notes: "Filter change + oil. Overdue — service window slipped." },
];

const receiptsSeed: HouseholdReceipt[] = [
  { id: "r1", date: "18 Jun", time: "16:41", billId: "b-gas", name: "Kitchen 13kg refill", category: "gas", amount: 2850, dest: "M-Pesa 0722 *** 118", method: "Wallet", ref: "HH-3382", status: "Success", ack: "KGAS-ACK-3382" },
  { id: "r2", date: "07 Jun", time: "09:10", billId: "b-garden", name: "Gardener", category: "other", amount: 4000, dest: "Cash · caretaker", method: "Cash", ref: "HH-3011", status: "Success", ack: "SIGNED-SLIP" },
  { id: "r3", date: "05 Jun", time: "08:02", billId: "b-rent-home", name: "Home rent · Karen", category: "rent", amount: 45000, dest: "Equity ····4521", method: "Bank", ref: "HH-2880", status: "Success", ack: "EQ-RTGS-2880" },
  { id: "r4", date: "01 Jun", time: "07:15", billId: "b-rent-shop", name: "Shop rent · Westlands", category: "rent", amount: 85000, dest: "PayMo @jkholdings", method: "PayMo ID", ref: "HH-2701", status: "Success", ack: "PM-ID-2701" },
  { id: "r5", date: "30 May", time: "18:40", billId: "b-sec", name: "Night security", category: "other", amount: 12000, dest: "KCB ····8810", method: "Bank", ref: "HH-2599", status: "Pending", ack: "KCB-PEND-2599" },
  { id: "r6", date: "28 May", time: "11:22", billId: "b-litter", name: "Garbage collection", category: "litter", amount: 1500, dest: "Till 834291", method: "M-Pesa", ref: "HH-2410", status: "Success", ack: "TT-RCP-2410" },
  { id: "r7", date: "22 Mar", time: "14:05", billId: "b-pump", name: "Borehole pump service", category: "other", amount: 6200, dest: "KCB ····8810", method: "Bank", ref: "HH-1188", status: "Failed", ack: "TIMEOUT" },
];

const alertsSeed: HouseholdAlert[] = [
  { id: "a1", title: "Garbage due tomorrow", body: "TakaTaka KES 1,500 · Till 834291. Autopay will run at 08:00.", time: "2 hrs ago", tone: "warning", icon: "calendar", billId: "b-litter" },
  { id: "a2", title: "Shop rent in 4 days", body: "KES 85,000 to PayMo ID @jkholdings. Dual approval already queued.", time: "5 hrs ago", tone: "info", icon: "building", billId: "b-rent-shop" },
  { id: "a3", title: "Borehole service overdue", body: "AquaTech KES 6,500 is 5 days late. Message the technician?", time: "Yesterday", tone: "danger", icon: "alert", billId: "b-pump" },
  { id: "a4", title: "Landlord confirmed June rent", body: "Jane Wanjiku acknowledged Equity RTGS-2880 on WhatsApp.", time: "2 days ago", tone: "success", icon: "check-circle", billId: "b-rent-home" },
  { id: "a5", title: "Unread WhatsApp from K-Gas", body: "Ali: “13kg in stock today — reply YES to dispatch.”", time: "3 days ago", tone: "violet", icon: "phone", billId: "b-gas" },
];

const threadsSeed: Thread[] = [
  { id: "th1", provider: "Jane Wanjiku", billId: "b-rent-home", channel: "WhatsApp", last: "05 Jun · 09:12", unread: 0, preview: "Received, thank you. Receipt attached." },
  { id: "th2", provider: "J.K. Holdings Ltd", billId: "b-rent-shop", channel: "PayMo", last: "01 Jun · 07:40", unread: 1, preview: "July invoice uploaded to the PayMo thread." },
  { id: "th3", provider: "TakaTaka Solutions", billId: "b-litter", channel: "SMS", last: "27 Jun · 16:02", unread: 2, preview: "Pickup delayed to 10:30 tomorrow." },
  { id: "th4", provider: "K-Gas · Ali", billId: "b-gas", channel: "WhatsApp", last: "24 Jun · 11:18", unread: 1, preview: "13kg in stock today — reply YES to dispatch." },
  { id: "th5", provider: "AquaTech Ltd", billId: "b-pump", channel: "SMS", last: "20 Jun · 08:44", unread: 3, preview: "Crew can attend Friday if paid." },
];

const spendMix = [
  { label: "Rent", value: 130000, color: "#7a5af8" },
  { label: "Security", value: 12000, color: "#2e90fa" },
  { label: "Gas", value: 2850, color: "#f79009" },
  { label: "Litter", value: 1500, color: "#0e9384" },
  { label: "Other", value: 10500, color: "#12b76a" },
];
const spendTrend = [118000, 121500, 124000, 126800, 129400, 131200, 148000, 157850];

const CAT: Record<Category, { label: string; icon: IconName; tone: Tone; color: string; soft: string }> = {
  rent: { label: "Rent", icon: "building", tone: "violet", color: "#7a5af8", soft: "bg-pmviolet-soft text-pmviolet-ink" },
  litter: { label: "Litter", icon: "trash", tone: "teal", color: "#0e9384", soft: "bg-pmteal-soft text-pmteal-ink" },
  gas: { label: "Cooking gas", icon: "flame", tone: "warning", color: "#f79009", soft: "bg-warn-soft text-warn-ink" },
  other: { label: "Other", icon: "tag", tone: "info", color: "#2e90fa", soft: "bg-pmblue-soft text-pmblue-ink" },
};

const DEST_META: Record<DestKind, { label: string; icon: IconName }> = {
  bank: { label: "Bank account", icon: "bank" },
  mpesa: { label: "Mobile money", icon: "smartphone" },
  paymo: { label: "PayMo ID", icon: "wallet" },
  cash: { label: "Cash", icon: "users" },
};

function statusTone(s: BillStatus): Tone {
  if (s === "Paid" || s === "Scheduled") return "success";
  if (s === "Due soon") return "warning";
  if (s === "Overdue") return "danger";
  return "muted";
}
function payTone(s: HouseholdReceipt["status"]): Tone {
  if (s === "Success") return "success";
  if (s === "Pending") return "warning";
  return "danger";
}

export function RecurringPage() {
  const { toast, balance, open } = useApp();
  const [bills, setBills] = useState(billsSeed);
  const [destinations, setDestinations] = useState(destinationsSeed);
  const [receipts, setReceipts] = useState(receiptsSeed);
  const [alerts, setAlerts] = useState(alertsSeed);
  const [threads, setThreads] = useState(threadsSeed);
  const [filter, setFilter] = useState<"all" | Category | "due" | "overdue">("all");
  const [q, setQ] = useState("");
  const [payStatus, setPayStatus] = useState<"all" | HouseholdReceipt["status"]>("all");
  const [selected, setSelected] = useState(bills[0]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editBill, setEditBill] = useState<RecurringBill | null>(null);
  const [payBill, setPayBill] = useState<RecurringBill | null>(null);
  const [msgThread, setMsgThread] = useState<Thread | null>(null);
  const [receipt, setReceipt] = useState<HouseholdReceipt | null>(null);
  const [destOpen, setDestOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const [alertPrefs, setAlertPrefs] = useState({
    due3: true,
    due1: true,
    executed: true,
    failed: true,
    unread: true,
    increase: false,
    sms: true,
    email: true,
    push: true,
    whatsapp: true,
  });

  useReveal([filter, payStatus, q, bills.length]);

  const destOf = (id: string) => destinations.find((d) => d.id === id);
  const due = bills.filter((b) => b.dueDays <= 3 && b.status !== "Paused" && b.status !== "Paid");
  const overdue = bills.filter((b) => b.status === "Overdue");
  const autoCount = bills.filter((b) => b.autopay).length;
  const monthSpend = bills.reduce((s, b) => s + (b.cadence === "Monthly" || b.cadence === "Weekly" ? b.amount : b.cadence === "Quarterly" ? Math.round(b.amount / 3) : 0), 0);
  const unread = threads.reduce((s, t) => s + t.unread, 0);

  const shown = useMemo(() => {
    let rows = bills;
    if (filter === "due") rows = due;
    else if (filter === "overdue") rows = overdue;
    else if (filter !== "all") rows = rows.filter((b) => b.category === filter);
    return rows;
  }, [bills, filter, due, overdue]);

  const shownReceipts = useMemo(() => {
    let rows = receipts;
    if (payStatus !== "all") rows = rows.filter((r) => r.status === payStatus);
    if (q.trim()) {
      const s = q.toLowerCase();
      rows = rows.filter((r) => `${r.name} ${r.ref} ${r.ack} ${r.dest}`.toLowerCase().includes(s));
    }
    return rows;
  }, [receipts, payStatus, q]);

  const patchBill = (id: string, patch: Partial<RecurringBill>) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    setSelected((s) => (s.id === id ? { ...s, ...patch } : s));
  };

  const runPay = (bill: RecurringBill, method: string) => {
    const dest = destOf(bill.destId);
    const rec: HouseholdReceipt = {
      id: `r-${Date.now()}`,
      date: "27 Jun",
      time: "14:32",
      billId: bill.id,
      name: bill.name,
      category: bill.category,
      amount: bill.amount,
      dest: dest ? `${dest.label} · ${dest.detail}` : "—",
      method,
      ref: `HH-${Math.floor(1000 + Math.random() * 8000)}`,
      status: "Success",
      ack: dest?.kind === "paymo" ? "PM-ID-LIVE" : dest?.kind === "cash" ? "SIGNED-SLIP" : "ACK-LIVE",
    };
    setReceipts((p) => [rec, ...p]);
    patchBill(bill.id, { lastPaid: "27 Jun 2025", lastAmount: bill.amount, status: "Paid", dueDays: 30 });
    setPayBill(null);
    setReceipt(rec);
    toast({ title: "Payment sent", msg: `${kes(bill.amount)} to ${bill.provider} · ${rec.ref}.`, tone: "success" });
  };

  return (
    <div className="mx-auto max-w-1320px">
      <section className="pm-hero position-relative overflow-hidden rounded-3xl p-5 sm-p-7 lg-p-9">
        <div className="pm-hero-dots pe-none position-absolute inset-0" />
        <div className="position-relative d-grid gap-6 xl-grid-cols-1-15fr-0-85fr xl-gap-10">
          <div>
            <span className="d-inline-flex align-items-center gap-2 rounded-full border border-white-15 bg-white-10 px-3 py-15 fs-115 fw-semibold text-white-80 backdrop-blur">
              <span className="live-dot" /> Rent, litter, cooking gas and named household bills on one schedule
            </span>
            <h2 className="mt-4 font-display fs-27 fw-extrabold leading-1-08 tracking-tight text-white sm-fs-36 lg-fs-42">
              Household bills,
              <br className="d-none d-sm-block" /> paid on time, to the right pocket.
            </h2>
            <p className="mt-3 max-w-56ch fs-135 leading-relaxed text-white-70 sm-fs-145">
              Schedule rent, garbage collection, cooking gas and any other recurring household cost. Channel funds to a bank, M-Pesa, cash desk or a PayMo ID — then keep the receipt and the conversation in one audit trail.
            </p>
            <div className="mt-5 d-flex flex-column gap-25 flex-sm-row">
              <Button size="lg" icon="plus" onClick={() => { setEditBill(null); setWizardOpen(true); }}>New recurring bill</Button>
              <Button size="lg" variant="white" icon="building" onClick={() => { const rent = bills.find((b) => b.category === "rent" && b.status !== "Paused"); if (rent) setPayBill(rent); }}>Pay rent now</Button>
              <Button size="lg" variant="white" icon="download" onClick={() => {
                downloadCSV(`paymo-household-${new Date().toISOString().slice(0, 10)}.csv`, [
                  ["Date", "Bill", "Category", "Amount", "Destination", "Ref", "Status"],
                  ...receipts.map((r) => [r.date, r.name, r.category, r.amount, r.dest, r.ref, r.status]),
                ]);
                toast({ title: "Export ready", msg: `${receipts.length} household receipts downloaded.`, tone: "success" });
              }}>Export receipts</Button>
            </div>
            <div className="mt-5 d-grid gap-2 sm-grid-cols-4">
              {[
                { k: "This month", v: kes(monthSpend), s: `${bills.length} schedules`, i: "wallet" as IconName },
                { k: "Due ≤ 3 days", v: `${due.length}`, s: kes(due.reduce((s, b) => s + b.amount, 0)), i: "calendar" as IconName },
                { k: "Autopay", v: `${autoCount}/${bills.length}`, s: "rules running", i: "repeat" as IconName },
                { k: "Unread chats", v: `${unread}`, s: "SMS · WhatsApp · PayMo", i: "bell" as IconName },
              ].map((x) => (
                <div key={x.k} className="rounded-5 border border-white-10 bg-white-06 p-35 backdrop-blur">
                  <Icon name={x.i} size={16} className="text-pmgreen" />
                  <p className="num mt-2 font-display fs-18 fw-extrabold text-white">{x.v}</p>
                  <p className="mt-05 fs-11 fw-semibold text-uppercase tracking-wide text-white-40">{x.k}</p>
                  <p className="mt-1 fs-11 text-white-55">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-sheen position-relative overflow-hidden rounded-5 border border-white-12 bg-white-06 p-5 backdrop-blur">
            <div className="d-flex align-items-start gap-3">
              <span className="d-grid h-11 w-11 flex-none place-items-center rounded-13px bg-pmviolet-25 text-violet-200">
                <Icon name="building" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-white-45">Next payout</p>
                <p className="mt-1 font-display fs-18 fw-extrabold text-white">{selected.name}</p>
                <p className="mt-1 fs-115 leading-relaxed text-white-55">{kes(selected.amount)} · {selected.nextDate} · {destOf(selected.destId)?.label}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {bills.slice(0, 5).map((b) => (
                <button key={b.id} onClick={() => setSelected(b)} className={cn("d-flex w-100 align-items-center gap-3 rounded-4 border p-25 text-start transition", selected.id === b.id ? "border-pmgreen-60 bg-pmgreen-10" : "border-white-10 bg-white-04 hover-bg-white-08")}>
                  <span className="d-grid h-8 w-8 flex-none place-items-center rounded-3 bg-white-10 text-white"><Icon name={CAT[b.category].icon} size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="d-block text-truncate fs-12 fw-bold text-white">{b.name}</span>
                    <span className="num d-block text-truncate fs-105 text-white-45">{b.provider} · {kes(b.amount)}</span>
                  </span>
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-4 border border-white-10 bg-ink-20 p-3">
              <Row k={<span className="text-white-55">Destination</span>} v={<span className="text-white">{destOf(selected.destId)?.detail ?? "—"}</span>} />
              <Row k={<span className="text-white-55">Channel</span>} v={<span className="text-white">{selected.channel}</span>} />
              <Button className="mt-2" full icon="send" onClick={() => setPayBill(selected)}>Pay {kes(selected.amount)}</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 d-grid gap-3 sm-grid-cols-2 xl-grid-cols-4" data-reveal>
        <Kpi label="Household spend" value={kes(monthSpend)} sub="Scheduled this month" icon="wallet" tone="info" spark={<Spark points={spendTrend} stroke="#7a5af8" />} />
        <Kpi label="Rent book" value={kes(bills.filter((b) => b.category === "rent").reduce((s, b) => s + b.amount, 0))} sub={`${bills.filter((b) => b.category === "rent").length} properties`} icon="building" tone="violet" />
        <Kpi label="Needs attention" value={`${overdue.length + due.length}`} sub="Due soon or overdue" icon="alert" tone="danger" progress={overdue.length ? 72 : 38} />
        <Kpi label="Wallet ready" value={kes(balance)} sub="Zero-fee PayMo ID payouts" icon="repeat" tone="success" progress={autoCount / Math.max(bills.length, 1) * 100} />
      </section>

      <SectionHead no="4.1" id="sec-bills" title="Recurring household bills" sub="Rent, litter, cooking gas and any named service a household settles on a cadence.">
        <div className="d-flex flex-wrap gap-2">
          <Chip on={filter === "all"} onClick={() => setFilter("all")} count={bills.length}>All</Chip>
          <Chip on={filter === "rent"} onClick={() => setFilter("rent")} count={bills.filter((b) => b.category === "rent").length}>Rent</Chip>
          <Chip on={filter === "litter"} onClick={() => setFilter("litter")} count={bills.filter((b) => b.category === "litter").length}>Litter</Chip>
          <Chip on={filter === "gas"} onClick={() => setFilter("gas")} count={bills.filter((b) => b.category === "gas").length}>Cooking gas</Chip>
          <Chip on={filter === "other"} onClick={() => setFilter("other")} count={bills.filter((b) => b.category === "other").length}>Other</Chip>
          <Chip on={filter === "due"} onClick={() => setFilter("due")} count={due.length}>Due soon</Chip>
          <Chip on={filter === "overdue"} onClick={() => setFilter("overdue")} count={overdue.length}>Overdue</Chip>
        </div>
      </SectionHead>

      {shown.length === 0 ? (
        <Card>
          <Empty icon="calendar" title="No bills match that filter" sub="Create a rent, litter, cooking-gas or named household schedule." action={<Button icon="plus" onClick={() => { setEditBill(null); setWizardOpen(true); }}>New recurring bill</Button>} />
        </Card>
      ) : (
        <div className="d-grid gap-3 sm-grid-cols-2 xl-grid-cols-3">
          {shown.map((b, i) => (
            <BillCard
              key={b.id}
              bill={b}
              dest={destOf(b.destId)}
              delay={i * 40}
              onPay={() => setPayBill(b)}
              onEdit={() => { setEditBill(b); setWizardOpen(true); }}
              onMessage={() => setMsgThread(threads.find((t) => t.billId === b.id) ?? { id: `th-${b.id}`, provider: b.provider, billId: b.id, channel: b.channel, last: "Just now", unread: 0, preview: "Start a conversation." })}
              onToggle={(v) => {
                patchBill(b.id, { autopay: v, status: v ? "Scheduled" : "Paused" });
                toast({ title: v ? "Autopay on" : "Schedule paused", msg: b.name, tone: v ? "success" : "warn" });
              }}
              onDelete={() => {
                setBills((p) => p.filter((x) => x.id !== b.id));
                toast({ title: "Schedule removed", msg: `${b.name} will no longer auto-pay.`, tone: "warn" });
              }}
            />
          ))}
          <button data-reveal onClick={() => { setEditBill(null); setWizardOpen(true); }} className="d-flex min-h-268px flex-column align-items-center justify-content-center gap-25 rounded-5 border-2 border-dashed border-line bg-white-70 p-5 text-center transition hover-border-pmgreen-50 hover-bg-pmgreen-soft-20">
            <span className="d-grid h-12 w-12 place-items-center rounded-5 bg-canvas text-muted"><Icon name="plus" size={22} /></span>
            <p className="fs-135 fw-bold text-ink">Add a household bill</p>
            <p className="max-w-30ch fs-115 leading-relaxed text-muted">Name it, set the cadence, pick a destination — bank, mobile money, cash or a PayMo ID.</p>
          </button>
        </div>
      )}

      <SectionHead no="4.2" id="sec-destinations" title="Destination accounts" sub="Where the money lands: bank, mobile money, cash collection or a PayMo ID if the provider is on PayMo.">
        <Button size="sm" variant="outline" icon="plus" onClick={() => setDestOpen(true)}>Add destination</Button>
      </SectionHead>

      <div className="d-grid gap-3 sm-grid-cols-2 xl-grid-cols-4">
        {destinations.map((d, i) => (
          <div key={d.id} data-reveal style={{ animationDelay: `${i * 35}ms` }} className="card-hover d-flex flex-column rounded-5 border border-line bg-white p-4 shadow-pm">
            <div className="d-flex align-items-start gap-3">
              <span className={cn("d-grid h-11 w-11 flex-none place-items-center rounded-13px", d.kind === "paymo" ? "bg-pmgreen-soft text-pmgreen-ink" : d.kind === "bank" ? "bg-pmviolet-soft text-pmviolet-ink" : d.kind === "mpesa" ? "bg-pmgreen-soft text-pmgreen-ink" : "bg-canvas text-muted")}>
                <Icon name={DEST_META[d.kind].icon} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="d-flex flex-wrap align-items-center gap-15">
                  <p className="text-truncate fs-135 fw-bold text-ink">{d.label}</p>
                  {d.verified && <Badge tone="success" dot>Verified</Badge>}
                  {d.paymoUser && <Badge tone="info" icon="wallet">PayMo user</Badge>}
                </div>
                <p className="num mt-05 fs-115 text-muted">{d.detail}</p>
              </div>
            </div>
            <div className="mt-3 rounded-4 bg-paper-2 p-3">
              <Row k="Holder" v={d.holder} />
              <Row k="Rail" v={DEST_META[d.kind].label} />
              <Row k="Linked bills" v={`${bills.filter((b) => b.destId === d.id).length}`} />
            </div>
            <Button className="mt-3" full variant="outline" size="sm" icon="sliders" onClick={() => toast({ title: `${d.label} settings`, msg: "Limits, nicknames and verification documents.", tone: "info" })}>Manage rail</Button>
          </div>
        ))}
      </div>

      <SectionHead no="4.3" id="sec-alerts" title="Alerts" sub="Due dates, failed payouts, unread provider chats and rent-increase notices — routed to SMS, email, push and WhatsApp.">
        <Button size="sm" variant="outline" icon="sliders" onClick={() => setAlertOpen(true)}>Alert preferences</Button>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2 p-0">
          <div className="d-flex align-items-center justify-content-between border-bottom border-line px-4 py-3">
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Live household alerts</p>
            <Button size="sm" variant="ghost" onClick={() => { setAlerts([]); toast({ title: "Alerts cleared", msg: "Inbox is empty.", tone: "success" }); }}>Mark all read</Button>
          </div>
          {alerts.length === 0 ? (
            <Empty icon="bell" title="You're all caught up" sub="Due-date and payout alerts will land here." />
          ) : (
            <div className="divide-y divide-line">
              {alerts.map((a) => (
                <div key={a.id} className="d-flex gap-3 p-4">
                  <span className={cn("d-grid h-9 w-9 flex-none place-items-center rounded-10px", a.tone === "warning" ? "bg-warn-soft text-warn-ink" : a.tone === "danger" ? "bg-danger-soft text-danger-ink" : a.tone === "success" ? "bg-pmgreen-soft text-pmgreen-ink" : a.tone === "violet" ? "bg-pmviolet-soft text-pmviolet-ink" : "bg-pmblue-soft text-pmblue-ink")}>
                    <Icon name={a.icon} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="d-flex align-items-start gap-2">
                      <p className="flex-1 fs-13 fw-bold text-ink">{a.title}</p>
                      <span className="text-nowrap fs-105 fw-semibold text-faint">{a.time}</span>
                    </div>
                    <p className="mt-05 fs-12 leading-relaxed text-muted">{a.body}</p>
                    {a.billId && (
                      <button
                        onClick={() => {
                          const b = bills.find((x) => x.id === a.billId);
                          if (b) setPayBill(b);
                        }}
                        className="focus-ring mt-15 d-inline-flex align-items-center gap-1 fs-12 fw-bold text-pmgreen-ink transition hover-gap-15"
                      >
                        Open bill <Icon name="arrow-right" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card hover>
          <div className="d-flex align-items-center gap-2">
            <Icon name="bell" size={16} className="text-pmgreen" />
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Quiet hours still apply</p>
          </div>
          <p className="mt-2 fs-125 leading-relaxed text-muted">Failed payouts and approval requests always break through. Everything else waits until 06:00.</p>
          <div className="mt-3 space-y-2">
            {[
              { k: "3-day reminder", on: alertPrefs.due3 },
              { k: "Same-day reminder", on: alertPrefs.due1 },
              { k: "Payout executed", on: alertPrefs.executed },
              { k: "Payout failed", on: alertPrefs.failed },
              { k: "Unread provider chat", on: alertPrefs.unread },
            ].map((x) => (
              <div key={x.k} className="d-flex align-items-center justify-content-between rounded-4 border border-line bg-paper-2 px-3 py-2">
                <span className="fs-125 fw-semibold text-ink-2">{x.k}</span>
                <Badge tone={x.on ? "success" : "muted"}>{x.on ? "On" : "Off"}</Badge>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="sliders" onClick={() => setAlertOpen(true)}>Edit preferences</Button>
        </Card>
      </div>

      <SectionHead no="4.4" id="sec-comms" title="Talk to the person you pay" sub="SMS, WhatsApp or an in-app PayMo thread if they already have a PayMo ID. Receipts attach automatically.">
        <Badge tone="info">{unread} unread</Badge>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2 p-0">
          <div className="px-4 py-3 border-bottom border-line">
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Provider inbox</p>
          </div>
          <div className="divide-y divide-line">
            {threads.map((t) => {
              const bill = bills.find((b) => b.id === t.billId);
              return (
                <button key={t.id} onClick={() => setMsgThread(t)} className="d-flex w-100 align-items-center gap-3 p-4 text-start transition hover-bg-paper-3">
                  <Avatar name={t.provider} size={40} tone={t.channel === "PayMo" ? "green" : "dark"} />
                  <span className="min-w-0 flex-1">
                    <span className="d-flex align-items-center justify-content-between gap-2">
                      <span className="text-truncate fs-13 fw-bold text-ink">{t.provider}</span>
                      <span className="text-nowrap fs-105 fw-semibold text-faint">{t.last}</span>
                    </span>
                    <span className="mt-05 d-flex align-items-center justify-content-between gap-2">
                      <span className="text-truncate fs-115 text-muted">{t.preview}</span>
                      {t.unread > 0 && <Badge tone="danger">{t.unread}</Badge>}
                    </span>
                    <span className="mt-15 d-flex flex-wrap gap-15">
                      <Badge tone="muted">{t.channel}</Badge>
                      {bill && <Badge tone={CAT[bill.category].tone}>{CAT[bill.category].label}</Badge>}
                    </span>
                  </span>
                  <Icon name="chevron-right" size={15} className="flex-none text-faint" />
                </button>
              );
            })}
          </div>
        </Card>
        <Card hover>
          <div className="d-flex align-items-center gap-2">
            <Icon name="sparkle" size={16} className="text-pmviolet" />
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Why PayMo ID is better</p>
          </div>
          <div className="mt-3 space-y-25">
            {[
              { t: "Instant, receipted, reversible", d: "Shop rent already settles to @jkholdings with a PayMo acknowledgement." },
              { t: "No till or account typos", d: "The ID is verified. Funds never land on the wrong line." },
              { t: "Thread + receipt in one place", d: "Invoices, chats and payouts stay on the same bill." },
            ].map((x) => (
              <div key={x.t} className="d-flex align-items-start gap-25 rounded-4 border border-line bg-paper-2 p-3">
                <Icon name="check-circle" size={16} className="mt-05 flex-none text-pmgreen" />
                <div>
                  <p className="fs-125 fw-bold text-ink">{x.t}</p>
                  <p className="mt-05 fs-115 leading-relaxed text-muted">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="wallet" onClick={() => setDestOpen(true)}>Invite a provider to PayMo</Button>
        </Card>
      </div>

      <SectionHead no="4.5" id="sec-history" title="Receipts & records" sub="Every household payout carries a PayMo reference plus the destination acknowledgement — bank RTGS, M-Pesa, cash slip or PayMo ID.">
        <Button size="sm" variant="outline" icon="download" onClick={() => {
          downloadCSV(`paymo-household-${new Date().toISOString().slice(0, 10)}.csv`, [
            ["Date", "Bill", "Category", "Amount", "Destination", "Method", "Ref", "Ack", "Status"],
            ...shownReceipts.map((r) => [r.date, r.name, r.category, r.amount, r.dest, r.method, r.ref, r.ack, r.status]),
          ]);
          toast({ title: "Export ready", msg: `${shownReceipts.length} rows downloaded.`, tone: "success" });
        }}>Export</Button>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2 p-0">
          <div className="space-y-3 border-bottom border-line p-4">
            <div className="d-flex flex-wrap gap-2">
              <div className="min-w-220px flex-1">
                <Input icon="search" placeholder="Search bill, reference or acknowledgement…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value as typeof payStatus)} className="w-auto">
                <option value="all">All states</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </Select>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {(["all", "Success", "Pending", "Failed"] as const).map((s) => (
                <Chip key={s} on={payStatus === s} onClick={() => setPayStatus(s)} count={s === "all" ? receipts.length : receipts.filter((r) => r.status === s).length}>{s === "all" ? "All" : s}</Chip>
              ))}
              <span className="ms-auto fs-115 fw-semibold text-muted">{shownReceipts.length} of {receipts.length} shown</span>
            </div>
          </div>
          {shownReceipts.length === 0 ? (
            <Empty icon="search" title="No receipts match" sub="Try HH-2880, Jane, or PayMo ID." action={<Button variant="outline" icon="refresh" onClick={() => { setQ(""); setPayStatus("all"); }}>Reset</Button>} />
          ) : (
            <>
              <div className="d-none overflow-x-auto d-lg-block">
                <table className="w-100 min-w-900px">
                  <thead className="bg-paper-2">
                    <tr className="text-start fs-105 fw-bold text-uppercase tracking-0-1em text-faint">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Bill</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-end">Amount</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Ref</th>
                      <th className="px-4 py-3">Ack</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {shownReceipts.map((r) => (
                      <tr key={r.id} className="transition hover-bg-paper-3">
                        <td className="text-nowrap px-4 py-3 fs-12 fw-semibold text-ink-2">{r.date}<span className="ms-15 fs-11 fw-normal text-faint">{r.time}</span></td>
                        <td className="px-4 py-3 fs-125 fw-semibold text-ink">{r.name}</td>
                        <td className="px-4 py-3"><Badge tone={CAT[r.category].tone}>{CAT[r.category].label}</Badge></td>
                        <td className="num px-4 py-3 text-end fs-125 fw-bold text-ink">{kes(r.amount)}</td>
                        <td className="px-4 py-3 fs-12 text-muted">{r.dest}</td>
                        <td className="num px-4 py-3 fs-115 fw-semibold text-muted">{r.ref}</td>
                        <td className="num px-4 py-3 fs-115 fw-semibold text-muted">{r.ack}</td>
                        <td className="px-4 py-3"><Badge tone={payTone(r.status)} dot>{r.status}</Badge></td>
                        <td className="px-4 py-3 text-end"><Button size="sm" variant="outline" icon="receipt" onClick={() => setReceipt(r)}>Open</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-line d-lg-none">
                {shownReceipts.map((r) => (
                  <button key={r.id} onClick={() => setReceipt(r)} className="d-flex w-100 align-items-center gap-3 p-35 text-start transition active-bg-paper-3">
                    <span className={cn("d-grid h-10 w-10 flex-none place-items-center rounded-4", CAT[r.category].soft)}><Icon name={CAT[r.category].icon} size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="d-flex align-items-center justify-content-between gap-2"><span className="text-truncate fs-13 fw-bold text-ink">{r.name}</span><span className="num fs-13 fw-extrabold text-ink">{kes(r.amount)}</span></span>
                      <span className="mt-05 d-flex align-items-center justify-content-between gap-2"><span className="num text-truncate fs-115 text-muted">{r.date} · {r.ref}</span><Badge tone={payTone(r.status)}>{r.status}</Badge></span>
                    </span>
                    <Icon name="chevron-right" size={15} className="flex-none text-faint" />
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>
        <Card hover>
          <p className="font-display fs-15 fw-bold tracking-tight text-ink">June mix</p>
          <div className="mt-4 d-flex flex-column align-items-center gap-4">
            <Donut data={spendMix} center={<><p className="num font-display fs-16 fw-extrabold text-ink">{kes(spendMix.reduce((s, x) => s + x.value, 0))}</p><p className="fs-105 fw-semibold text-muted">household</p></>} />
            <div className="w-100 space-y-2">
              {spendMix.map((x) => (
                <div key={x.label} className="d-flex align-items-center gap-2">
                  <span className="h-25 w-25 flex-none rounded-full" style={{ background: x.color }} />
                  <span className="flex-1 text-truncate fs-12 fw-semibold text-ink-2">{x.label}</span>
                  <span className="num fs-12 fw-bold text-ink">{kes(x.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <section className="mt-6 d-grid gap-3 lg-grid-cols-3" data-reveal>
        <Card className="lg-col-span-2 bg-gradient-to-br from-ink via-0f2233 to-0d5c38 text-white" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
            <div className="max-w-52ch">
              <Badge tone="dark" className="border border-white-15 bg-white-10 text-white-80">Household ops</Badge>
              <h3 className="mt-3 font-display fs-19 fw-extrabold tracking-tight">Never miss rent. Never argue about a receipt.</h3>
              <p className="mt-2 fs-13 leading-relaxed text-white-65">Autopay the 5th, ping the landlord on WhatsApp, and keep the Equity acknowledgement next to the PayMo reference for seven years.</p>
              <div className="mt-4 d-flex flex-wrap gap-2">
                <Button variant="white" icon="plus" onClick={() => { setEditBill(null); setWizardOpen(true); }}>New schedule</Button>
                <Button variant="white" icon="bell" onClick={() => setAlertOpen(true)}>Tune alerts</Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>Get help</Button>
              </div>
            </div>
            <div className="d-grid grid-cols-2 gap-2 sm-grid-cols-1">
              {[
                { k: "On-time payouts", v: "99.2%", i: "check-circle" as IconName },
                { k: "PayMo ID rails", v: "1 live", i: "wallet" as IconName },
                { k: "Receipts filed", v: "100%", i: "file" as IconName },
              ].map((x) => (
                <div key={x.k} className="d-flex align-items-center gap-25 rounded-4 border border-white-10 bg-white-06 p-3">
                  <Icon name={x.i} size={16} className="text-pmgreen" />
                  <div>
                    <p className="num font-display fs-15 fw-extrabold lh-1">{x.v}</p>
                    <p className="mt-1 fs-105 text-white-50">{x.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="d-flex align-items-center gap-2">
            <Icon name="sparkle" size={16} className="text-pmviolet" />
            <p className="font-display fs-15 fw-bold tracking-tight text-ink">Recommended</p>
          </div>
          <div className="mt-3 space-y-25">
            {[
              { t: "Move gardener off cash", d: "M-Pesa leaves a receipt. Cash slips get lost." },
              { t: "Invite AquaTech to PayMo", d: "Overdue borehole service settles faster on a PayMo ID." },
              { t: "Autopay kitchen gas on empty", d: "Threshold rule when the last refill is 28+ days old." },
            ].map((x) => (
              <div key={x.t} className="d-flex align-items-start gap-25 rounded-4 border border-line bg-paper-2 p-3">
                <Icon name="check-circle" size={16} className="mt-05 flex-none text-pmgreen" />
                <div>
                  <p className="fs-125 fw-bold text-ink">{x.t}</p>
                  <p className="mt-05 fs-115 leading-relaxed text-muted">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="repeat" onClick={() => { setEditBill(null); setWizardOpen(true); }}>Create the next rule</Button>
        </Card>
      </section>

      <BillWizard
        open={wizardOpen}
        editing={editBill}
        destinations={destinations}
        onClose={() => { setWizardOpen(false); setEditBill(null); }}
        onSave={(bill) => {
          if (editBill) {
            setBills((p) => p.map((b) => (b.id === editBill.id ? { ...bill, id: editBill.id } : b)));
            toast({ title: "Schedule updated", msg: `${bill.name} · ${bill.cadence}`, tone: "success" });
          } else {
            const id = `b-${Date.now()}`;
            setBills((p) => [{ ...bill, id }, ...p]);
            toast({ title: "Recurring bill created", msg: `${bill.name} will pay ${kes(bill.amount)} via ${destOf(bill.destId)?.label ?? "the selected rail"}.`, tone: "success" });
          }
          setWizardOpen(false);
          setEditBill(null);
        }}
      />
      <PayDrawer bill={payBill} dest={payBill ? destOf(payBill.destId) : undefined} onClose={() => setPayBill(null)} onPay={runPay} />
      <MessageDrawer
        thread={msgThread}
        bill={msgThread ? bills.find((b) => b.id === msgThread.billId) : undefined}
        onClose={() => setMsgThread(null)}
        onSend={(text, channel) => {
          if (!msgThread) return;
          setThreads((p) => p.map((t) => (t.id === msgThread.id ? { ...t, preview: text, last: "Just now", unread: 0, channel } : t)));
          toast({ title: `Sent via ${channel}`, msg: text, tone: "success" });
          setMsgThread(null);
        }}
      />
      <ReceiptDrawer receipt={receipt} onClose={() => setReceipt(null)} />
      <DestinationModal
        open={destOpen}
        onClose={() => setDestOpen(false)}
        onSave={(d) => {
          setDestinations((p) => [{ ...d, id: `d-${Date.now()}` }, ...p]);
          setDestOpen(false);
          toast({ title: "Destination added", msg: `${d.label} · ${d.detail}`, tone: "success" });
        }}
      />
      <AlertPrefsModal open={alertOpen} prefs={alertPrefs} onClose={() => setAlertOpen(false)} onChange={(p) => setAlertPrefs((prev) => ({ ...prev, ...p }))} />
    </div>
  );
}

function BillCard({
  bill, dest, delay, onPay, onEdit, onMessage, onToggle, onDelete,
}: {
  bill: RecurringBill; dest?: Destination; delay: number;
  onPay: () => void; onEdit: () => void; onMessage: () => void;
  onToggle: (v: boolean) => void; onDelete: () => void;
}) {
  const cat = CAT[bill.category];
  const overdue = bill.status === "Overdue";
  const due = bill.status === "Due soon";
  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover position-relative d-flex flex-column rounded-5 border border-line bg-white p-4 shadow-pm">
      <div className="d-flex align-items-start gap-3">
        <span className={cn("d-grid h-11 w-11 flex-none place-items-center rounded-13px", cat.soft)}>
          <Icon name={cat.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="d-flex flex-wrap align-items-center gap-15">
            <p className="text-truncate fs-135 fw-bold text-ink">{bill.name}</p>
            <Badge tone={statusTone(bill.status)}>{bill.status}</Badge>
          </div>
          <p className="mt-05 fs-115 text-muted">{bill.provider} · {bill.property}</p>
        </div>
        <Menu
          trigger={() => <span className="d-grid h-8 w-8 place-items-center rounded-3 text-muted transition hover-bg-canvas hover-text-ink"><Icon name="more" size={16} /></span>}
          items={[
            { label: "Pay now", icon: "send", onClick: onPay },
            { label: "Edit schedule", icon: "edit", onClick: onEdit },
            { label: "Message provider", icon: "mail", onClick: onMessage },
            { label: "Delete", icon: "trash", onClick: onDelete, danger: true },
          ]}
        />
      </div>
      <div className="mt-3 d-flex flex-wrap align-items-center gap-15">
        <Badge tone={cat.tone} icon={cat.icon}>{bill.customLabel ?? cat.label}</Badge>
        {bill.autopay && <Badge tone="success" icon="repeat">Autopay</Badge>}
        {dest?.paymoUser && <Badge tone="info" icon="wallet">PayMo ID</Badge>}
        <Badge tone="muted">{bill.cadence}</Badge>
      </div>
      <div className={cn("mt-3 rounded-4 p-3", overdue ? "bg-danger-soft-50" : due ? "bg-warn-soft-50" : "bg-paper-2")}>
        <Row k="Amount" v={kes(bill.amount)} strong />
        <Row k="Next run" v={bill.nextDate} />
        <Row k="Destination" v={<span className="text-end fs-115">{dest ? `${dest.label}` : "—"}</span>} />
        <Progress value={overdue ? 100 : due ? 78 : 32} tone={overdue ? "red" : due ? "amber" : "green"} className="mt-2" />
      </div>
      <div className="mt-3 rounded-4 border border-line bg-white p-3">
        <Row k="Rail" v={dest ? DEST_META[dest.kind].label : "—"} icon={dest ? DEST_META[dest.kind].icon : "wallet"} />
        <Row k="Last paid" v={`${kes(bill.lastAmount)} · ${bill.lastPaid}`} />
        <Row k="Contact" v={bill.channel} />
      </div>
      <div className="mt-3 d-flex align-items-center gap-2">
        <Button className="flex-1" icon="send" onClick={onPay}>Pay {kes(bill.amount)}</Button>
        <IconBtn icon="mail" label="Message" tone="outline" onClick={onMessage} />
        <Toggle on={bill.autopay} label={`${bill.name} autopay`} onChange={onToggle} />
      </div>
    </div>
  );
}

function BillWizard({
  open, onClose, editing, destinations, onSave,
}: {
  open: boolean; onClose: () => void; editing: RecurringBill | null; destinations: Destination[];
  onSave: (b: RecurringBill) => void;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category>("rent");
  const [name, setName] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [property, setProperty] = useState("Karen bungalow");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState(1500);
  const [cadence, setCadence] = useState<Cadence>("Monthly");
  const [nextDate, setNextDate] = useState("05 Jul 2025");
  const [destId, setDestId] = useState(destinations[0]?.id ?? "");
  const [channel, setChannel] = useState<RecurringBill["channel"]>("WhatsApp");
  const [contact, setContact] = useState("");
  const [autopay, setAutopay] = useState(true);
  const [notify, setNotify] = useState(true);
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState<string | null>(null);

  if (open && editing && hydrated !== editing.id) {
    setHydrated(editing.id); setStep(0); setCategory(editing.category); setName(editing.name); setCustomLabel(editing.customLabel ?? "");
    setProperty(editing.property); setProvider(editing.provider); setAmount(editing.amount); setCadence(editing.cadence);
    setNextDate(editing.nextDate); setDestId(editing.destId); setChannel(editing.channel); setContact(editing.contact);
    setAutopay(editing.autopay); setNotify(editing.notify); setNotes(editing.notes);
  }
  if (open && !editing && hydrated !== "new") { setHydrated("new"); setStep(0); setName(""); setCustomLabel(""); setProvider(""); setAmount(1500); }
  if (!open && hydrated !== null) setHydrated(null);

  const save = () => {
    onSave({
      id: editing?.id ?? "",
      category, name: name || `${CAT[category].label} · ${property}`, customLabel: category === "other" ? customLabel || name : undefined,
      property, provider: provider || "Provider", amount, cadence, nextDate, dueDays: 7, lastPaid: editing?.lastPaid ?? "Never",
      lastAmount: editing?.lastAmount ?? 0, destId, status: "Scheduled", autopay, notify, contact, channel, notes,
    });
  };

  return (
    <Modal open={open} onClose={onClose} width="max-w-640px" icon="repeat" title={editing ? "Edit household bill" : "New household bill"} subtitle="Name it, pick a cadence, then choose where the money goes."
      footer={step === 0 ? (<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="arrow-right" onClick={() => setStep(1)}>Continue</Button></>) : step === 1 ? (<><Button variant="ghost" icon="chevron-left" onClick={() => setStep(0)}>Back</Button><Button icon="arrow-right" onClick={() => setStep(2)}>Continue</Button></>) : (<><Button variant="ghost" icon="chevron-left" onClick={() => setStep(1)}>Back</Button><Button icon="check" onClick={save}>{editing ? "Save changes" : "Create schedule"}</Button></>)}
    >
      <Stepper steps={["What & who", "Amount & cadence", "Destination & alerts"]} current={step} />
      {step === 0 && (
        <div className="mt-4 space-y-4">
          <p className="mb-2 fs-125 fw-semibold text-ink-2">Category</p>
          <div className="d-grid gap-2 sm-grid-cols-2">
            {(Object.keys(CAT) as Category[]).map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cn("d-flex align-items-start gap-3 rounded-4 border p-35 text-start transition", category === c ? "border-pmgreen bg-pmgreen-soft-40 shadow-sm" : "border-line bg-white hover-border-gray-400")}>
                <span className={cn("d-grid h-9 w-9 flex-none place-items-center rounded-10px", category === c ? "bg-white text-pmgreen-ink shadow-sm" : CAT[c].soft)}><Icon name={CAT[c].icon} size={17} /></span>
                <span className="min-w-0 flex-1"><span className="d-block fs-13 fw-bold text-ink">{CAT[c].label}</span><span className="mt-05 d-block fs-115 leading-relaxed text-muted">{c === "other" ? "Name any household service" : c === "rent" ? "Landlord or managing agent" : c === "litter" ? "Garbage / waste collection" : "Cylinder refill on a cadence"}</span></span>
              </button>
            ))}
          </div>
          {category === "other" && (
            <Field label="Name this utility" required hint="e.g. Security guards, gardener, borehole service, DSTV for the boys’ quarters.">
              <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Security guards" icon="tag" />
            </Field>
          )}
          <div className="d-grid gap-3 sm-grid-cols-2">
            <Field label="Schedule name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home rent · Karen" icon="edit" /></Field>
            <Field label="Property"><Select value={property} onChange={(e) => setProperty(e.target.value)}><option>Karen bungalow</option><option>Westlands hardware</option><option>Kiambu pump house</option><option>Shop · Westlands</option></Select></Field>
          </div>
          <Field label="Person / provider" required hint="Landlord, collector, rider or company you pay.">
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Jane Wanjiku" icon="user" />
          </Field>
        </div>
      )}
      {step === 1 && (
        <div className="mt-4 space-y-4">
          <div className="d-grid gap-3 sm-grid-cols-2">
            <Field label="Amount (KES)" required><Input type="number" className="no-spin" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} icon="wallet" /></Field>
            <Field label="Cadence" required>
              <Select value={cadence} onChange={(e) => setCadence(e.target.value as Cadence)}>
                <option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>On request</option>
              </Select>
            </Field>
          </div>
          <div className="d-flex flex-wrap gap-2">{[1500, 2850, 4000, 12000, 45000, 85000].map((v) => <Chip key={v} on={amount === v} onClick={() => setAmount(v)}>{kes(v)}</Chip>)}</div>
          <Field label="Next run" hint="Used for reminders. On-request bills wait for you to tap Pay.">
            <Input value={nextDate} onChange={(e) => setNextDate(e.target.value)} icon="calendar" />
          </Field>
          <div className="rounded-4 bg-paper-2 p-35">
            <Row k="Per run" v={kes(amount)} strong />
            <Row k="Cadence" v={cadence} />
            <Row k="Annual exposure" v={kes(cadence === "Monthly" ? amount * 12 : cadence === "Weekly" ? amount * 52 : cadence === "Quarterly" ? amount * 4 : amount)} />
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="mt-4 space-y-4">
          <Field label="Destination account" required hint="Bank, mobile money, cash desk or a PayMo ID if they are on PayMo.">
            <Select value={destId} onChange={(e) => setDestId(e.target.value)}>
              {destinations.map((d) => <option key={d.id} value={d.id}>{DEST_META[d.kind].label} · {d.label} · {d.detail}{d.paymoUser ? " · PayMo user" : ""}</option>)}
            </Select>
          </Field>
          <div className="d-grid gap-3 sm-grid-cols-2">
            <Field label="Talk to them via">
              <Select value={channel} onChange={(e) => setChannel(e.target.value as RecurringBill["channel"])}><option>WhatsApp</option><option>SMS</option><option>PayMo</option></Select>
            </Field>
            <Field label="Contact"><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="0712 *** 440 or @id" icon="phone" /></Field>
          </div>
          <label className="d-flex align-items-start gap-3 rounded-4 border border-line bg-paper-2 p-35">
            <Toggle on={autopay} onChange={setAutopay} label="Autopay" />
            <span className="min-w-0 flex-1"><span className="d-block fs-125 fw-bold text-ink">Run this automatically</span><span className="mt-05 d-block fs-115 leading-relaxed text-muted">PayMo executes on the cadence and files the receipt against the destination.</span></span>
          </label>
          <label className="d-flex align-items-start gap-3 rounded-4 border border-line bg-paper-2 p-35">
            <Toggle on={notify} onChange={setNotify} label="Notify" />
            <span className="min-w-0 flex-1"><span className="d-block fs-125 fw-bold text-ink">Ping me and the provider</span><span className="mt-05 d-block fs-115 leading-relaxed text-muted">3-day reminder, payout confirmation, and a copy of the receipt on {channel}.</span></span>
          </label>
          <Field label="Internal notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Standing order, missed-pickup policy…" /></Field>
        </div>
      )}
    </Modal>
  );
}

function PayDrawer({ bill, dest, onClose, onPay }: { bill: RecurringBill | null; dest?: Destination; onClose: () => void; onPay: (b: RecurringBill, method: string) => void }) {
  const [method, setMethod] = useState("Wallet");
  if (!bill) return null;
  const cat = CAT[bill.category];
  return (
    <Drawer open onClose={onClose} width="max-w-480px">
      <DrawerHead title={`Pay ${bill.name}`} subtitle={`${bill.provider} · ${bill.cadence}`} icon={cat.icon} onClose={onClose} />
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        <div className="rounded-5 border border-line bg-paper-2 p-4">
          <Badge tone={cat.tone}>{cat.label}</Badge>
          <p className="num mt-2 font-display fs-26 fw-extrabold text-ink">{kes(bill.amount)}</p>
          <p className="mt-1 fs-115 text-muted">{bill.nextDate} · {bill.property}</p>
        </div>
        <div className="mt-4 rounded-5 border border-line bg-white p-4">
          <p className="mb-2 fs-11 fw-bold text-uppercase tracking-0-14em text-faint">Destination</p>
          <Row k="Rail" v={dest ? DEST_META[dest.kind].label : "—"} />
          <Row k="Account" v={dest?.detail ?? "—"} />
          <Row k="Holder" v={dest?.holder ?? "—"} />
          {dest?.paymoUser && <div className="mt-2 d-flex align-items-start gap-25 rounded-4 bg-pmgreen-soft-40 p-3"><Icon name="wallet" size={16} className="mt-05 flex-none text-pmgreen-ink" /><p className="fs-12 leading-relaxed text-pmgreen-ink">This provider is a PayMo user. Funds settle instantly to {dest.detail} with a PayMo acknowledgement.</p></div>}
        </div>
        <p className="mt-4 mb-2 fs-12 fw-bold text-uppercase tracking-0-12em text-faint">Fund from</p>
        <div className="space-y-2">
          {["Wallet", "M-Pesa", "Bank"].map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={cn("d-flex w-100 align-items-center justify-content-between rounded-4 border p-35 text-start", method === m ? "border-pmgreen bg-pmgreen-soft-30" : "border-line")}>
              <span className="fs-135 fw-bold text-ink">{m}</span>
              {method === m && <Icon name="check-circle" size={17} className="text-pmgreen" />}
            </button>
          ))}
        </div>
      </div>
      <div className="d-flex gap-2 border-top border-line bg-paper-2 px-4 py-35">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" icon="lock" onClick={() => onPay(bill, method)}>Authorise {kes(bill.amount)}</Button>
      </div>
    </Drawer>
  );
}

function MessageDrawer({ thread, bill, onClose, onSend }: { thread: Thread | null; bill?: RecurringBill; onClose: () => void; onSend: (text: string, channel: Thread["channel"]) => void }) {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<Thread["channel"]>(thread?.channel ?? "WhatsApp");
  if (!thread) return null;
  return (
    <Drawer open onClose={onClose} width="max-w-460px">
      <DrawerHead title={thread.provider} subtitle={`${channel} · ${bill?.name ?? "Household bill"}`} icon="mail" onClose={onClose} />
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        <Segmented value={channel} onChange={setChannel} options={[{ value: "WhatsApp", label: "WhatsApp" }, { value: "SMS", label: "SMS" }, { value: "PayMo", label: "PayMo" }]} />
        <div className="mt-4 space-y-3">
          <div className="rounded-4 border border-line bg-paper-2 p-3">
            <p className="fs-105 fw-bold text-uppercase tracking-wide text-faint">{thread.last}</p>
            <p className="mt-1 fs-125 leading-relaxed text-ink">{thread.preview}</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {["Confirm pickup tomorrow", "Receipt attached — asante", "Please share July invoice", "YES — dispatch the 13kg"].map((q) => (
              <Chip key={q} on={text === q} onClick={() => setText(q)}>{q}</Chip>
            ))}
          </div>
          <Field label="Message">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Write to the person you pay…" className="w-100 rounded-4 border border-line bg-white px-35 py-25 fs-13 fw-medium text-ink outline-none transition focus-border-pmgreen focus-ring-4 focus-ring-pmgreen-12" />
          </Field>
        </div>
      </div>
      <div className="d-flex gap-2 border-top border-line bg-paper-2 px-4 py-35">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button className="flex-1" icon="send" disabled={!text.trim()} onClick={() => onSend(text.trim(), channel)}>Send via {channel}</Button>
      </div>
    </Drawer>
  );
}

function ReceiptDrawer({ receipt, onClose }: { receipt: HouseholdReceipt | null; onClose: () => void }) {
  const { toast } = useApp();
  if (!receipt) return null;
  const cat = CAT[receipt.category];
  return (
    <Drawer open onClose={onClose} width="max-w-480px">
      <DrawerHead title="Household receipt" subtitle={`${receipt.ref} · ${receipt.date} ${receipt.time}`} icon="receipt" onClose={onClose} />
      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        <div className={cn("rounded-5 p-4", receipt.status === "Success" ? "border border-pmgreen-25 bg-pmgreen-soft-40" : receipt.status === "Pending" ? "border border-warn-30 bg-warn-soft-50" : "border border-danger-25 bg-danger-soft-50")}>
          <Badge tone={payTone(receipt.status)} dot>{receipt.status}</Badge>
          <p className="num mt-2 font-display fs-26 fw-extrabold text-ink">{kes(receipt.amount)}</p>
          <p className="mt-1 fs-125 text-muted">{receipt.name}</p>
        </div>
        <div className="mt-4 rounded-5 border border-line bg-white p-4">
          <Row k="Category" v={cat.label} />
          <Row k="Destination" v={receipt.dest} />
          <Row k="Funded from" v={receipt.method} />
          <Row k="PayMo reference" v={receipt.ref} />
          <Row k="Acknowledgement" v={receipt.ack} />
        </div>
        <div className="mt-3 d-grid grid-cols-2 gap-2">
          <CopyBtn text={receipt.ref} label="Copy ref" />
          <Button variant="outline" icon="share" onClick={() => toast({ title: "Receipt shared", msg: `${receipt.ref} sent to the provider thread.`, tone: "info" })}>Share</Button>
        </div>
      </div>
    </Drawer>
  );
}

function DestinationModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (d: Omit<Destination, "id">) => void }) {
  const [kind, setKind] = useState<DestKind>("mpesa");
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [holder, setHolder] = useState("");
  const [paymoUser, setPaymoUser] = useState(false);
  return (
    <Modal open={open} onClose={onClose} icon="wallet" title="Add destination account" subtitle="Bank, mobile money, cash collection or a PayMo ID."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="check" disabled={!label || !detail} onClick={() => onSave({ kind, label, detail, holder: holder || label, verified: kind === "paymo", paymoUser: kind === "paymo" || paymoUser })}>Save destination</Button></>}
    >
      <div className="d-grid gap-2 sm-grid-cols-2">
        {(Object.keys(DEST_META) as DestKind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("d-flex align-items-center gap-25 rounded-4 border p-3 text-start", kind === k ? "border-pmgreen bg-pmgreen-soft-40" : "border-line")}>
            <Icon name={DEST_META[k].icon} size={16} className="text-pmgreen" />
            <span className="fs-125 fw-bold text-ink">{DEST_META[k].label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        <Field label="Label" required><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={kind === "paymo" ? "PayMo ID" : kind === "bank" ? "Equity Bank" : kind === "cash" ? "Caretaker desk" : "M-Pesa"} /></Field>
        <Field label={kind === "paymo" ? "PayMo ID" : kind === "bank" ? "Account number" : kind === "cash" ? "Collection point" : "Phone / till"} required>
          <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={kind === "paymo" ? "@provider" : kind === "bank" ? "···· 4521" : kind === "cash" ? "Envelope · gate" : "07xx *** xxx"} icon={kind === "paymo" ? "wallet" : kind === "bank" ? "bank" : "smartphone"} />
        </Field>
        <Field label="Account holder"><Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Jane Wanjiku" icon="user" /></Field>
        {kind !== "paymo" && (
          <label className="d-flex align-items-center gap-3 rounded-4 border border-line bg-paper-2 p-3">
            <Toggle on={paymoUser} onChange={setPaymoUser} label="PayMo user" />
            <span className="fs-125 fw-medium text-ink-2">This person already has a PayMo ID — prefer it next time.</span>
          </label>
        )}
      </div>
    </Modal>
  );
}

function AlertPrefsModal({ open, prefs, onClose, onChange }: { open: boolean; prefs: Record<string, boolean>; onClose: () => void; onChange: (p: Record<string, boolean>) => void }) {
  const { toast } = useApp();
  const rows: { key: string; t: string; d: string }[] = [
    { key: "due3", t: "3 days before due", d: "Rent, litter and named bills." },
    { key: "due1", t: "Same-day reminder", d: "08:00 on the payout morning." },
    { key: "executed", t: "Payout executed", d: "Receipt attached automatically." },
    { key: "failed", t: "Payout failed", d: "Always breaks quiet hours." },
    { key: "unread", t: "Unread provider chat", d: "SMS, WhatsApp or PayMo thread." },
    { key: "increase", t: "Amount changed", d: "Catch a rent increase before autopay." },
  ];
  return (
    <Modal open={open} onClose={onClose} icon="bell" title="Household alert preferences" subtitle="Choose events and channels."
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button icon="check" onClick={() => { toast({ title: "Alerts saved", msg: "Household reminder matrix updated.", tone: "success" }); onClose(); }}>Save</Button></>}
    >
      <div className="space-y-2">
        {rows.map((r) => (
          <label key={r.key} className="d-flex align-items-start gap-3 rounded-4 border border-line bg-paper-2 p-3">
            <Toggle on={!!prefs[r.key]} onChange={(v) => onChange({ ...prefs, [r.key]: v })} label={r.t} />
            <span className="min-w-0 flex-1"><span className="d-block fs-125 fw-bold text-ink">{r.t}</span><span className="mt-05 d-block fs-115 text-muted">{r.d}</span></span>
          </label>
        ))}
      </div>
      <p className="mt-4 mb-2 fs-11 fw-bold text-uppercase tracking-0-14em text-faint">Channels</p>
      <div className="d-grid grid-cols-2 gap-2">
        {(["sms", "email", "push", "whatsapp"] as const).map((ch) => (
          <label key={ch} className="d-flex align-items-center gap-25 rounded-4 border border-line bg-paper-2 p-25">
            <Toggle on={!!prefs[ch]} onChange={(v) => onChange({ ...prefs, [ch]: v })} label={ch} />
            <span className="fs-12 fw-semibold text-capitalize text-ink-2">{ch}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

function Kpi({ label, value, sub, icon, tone, spark, progress }: { label: string; value: string; sub: string; icon: IconName; tone: "success" | "warning" | "danger" | "info" | "violet"; spark?: ReactNode; progress?: number }) {
  const toneCls = {
    success: "bg-pmgreen-soft text-pmgreen-ink",
    warning: "bg-warn-soft text-warn-ink",
    danger: "bg-danger-soft text-danger-ink",
    info: "bg-pmblue-soft text-pmblue-ink",
    violet: "bg-pmviolet-soft text-pmviolet-ink",
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
      {progress !== undefined && <Progress value={progress} tone={tone === "danger" ? "red" : tone === "warning" ? "amber" : tone === "info" ? "blue" : tone === "violet" ? "violet" : "green"} className="mt-3" />}
    </div>
  );
}
