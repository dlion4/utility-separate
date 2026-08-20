import { useMemo, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { cn } from "./utils/cn";
import { useReveal } from "./utils/useReveal";
import {
  Badge,
  Button,
  Card,
  Chip,
  Empty,
  Input,
  Menu,
  Modal,
  Progress,
  Row,
  SectionHead,
  Segmented,
  Select,
  Field,
  Stepper,
  Toggle,
  Avatar,
  type Tone,
} from "./ui";
import { PAY_METHODS, kes, utilityOf, type UtilityId } from "./data";
import { useApp } from "./store";

/* ===================================================================== */
/*                              TYPES                                    */
/* ===================================================================== */

type RuleType = "Schedule" | "Threshold";
type AmountRule = "Fixed amount" | "Full bill" | "Cap at maximum" | "Average + 10%";

interface AutoRule {
  id: string;
  utility: UtilityId;
  accountRef: string;
  nickname: string;
  provider: string;
  type: RuleType;
  amountRule: AmountRule;
  amount: number;
  cap: number;
  timing: string;
  primary: string;
  fallback: string;
  approvalOnSpike: boolean;
  notifyOnRun: boolean;
  active: boolean;
  lastRun: string;
  nextRun: string;
  runsThisMonth: number;
  spentThisMonth: number;
}

interface NotifChannel {
  id: string;
  label: string;
  desc: string;
  icon: IconName;
  sms: boolean;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
}

interface Approver {
  id: string;
  name: string;
  role: string;
  email: string;
  limit: number;
  scope: string;
  active: boolean;
}

interface AuditEntry {
  id: string;
  date: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  tone: Tone;
  icon: IconName;
}

interface Integration {
  id: string;
  name: string;
  desc: string;
  icon: IconName;
  category: "Accounting" | "Messaging" | "Storage" | "Data";
  connected: boolean;
  lastSync?: string;
}

/* ===================================================================== */
/*                              DATA                                     */
/* ===================================================================== */

const initialRules: AutoRule[] = [
  {
    id: "ar-1",
    utility: "electricity",
    accountRef: "14825739",
    nickname: "Home · Karen",
    provider: "KPLC",
    type: "Threshold",
    amountRule: "Fixed amount",
    amount: 2500,
    cap: 8000,
    timing: "When units fall below 10 kWh",
    primary: "wallet",
    fallback: "mpesa",
    approvalOnSpike: true,
    notifyOnRun: true,
    active: true,
    lastRun: "27 Jun · 14:32",
    nextRun: "On trigger",
    runsThisMonth: 2,
    spentThisMonth: 5000,
  },
  {
    id: "ar-2",
    utility: "water",
    accountRef: "290081",
    nickname: "Home water",
    provider: "NCWSC",
    type: "Schedule",
    amountRule: "Full bill",
    amount: 3200,
    cap: 6000,
    timing: "Monthly on the 6th · 08:00",
    primary: "wallet",
    fallback: "bank",
    approvalOnSpike: true,
    notifyOnRun: true,
    active: true,
    lastRun: "06 Jun · 08:00",
    nextRun: "06 Jul · 08:00",
    runsThisMonth: 1,
    spentThisMonth: 3200,
  },
  {
    id: "ar-3",
    utility: "internet",
    accountRef: "SF-40812",
    nickname: "Office fibre",
    provider: "Safaricom Fibre",
    type: "Schedule",
    amountRule: "Fixed amount",
    amount: 5999,
    cap: 6500,
    timing: "Monthly on the 30th · 08:00",
    primary: "wallet",
    fallback: "mpesa",
    approvalOnSpike: false,
    notifyOnRun: true,
    active: true,
    lastRun: "30 May · 08:00",
    nextRun: "30 Jun · 08:00",
    runsThisMonth: 1,
    spentThisMonth: 5999,
  },
  {
    id: "ar-4",
    utility: "airtime",
    accountRef: "0712 *** 890",
    nickname: "Personal line",
    provider: "Safaricom",
    type: "Threshold",
    amountRule: "Fixed amount",
    amount: 1000,
    cap: 3000,
    timing: "When data falls below 1 GB",
    primary: "mpesa",
    fallback: "wallet",
    approvalOnSpike: false,
    notifyOnRun: false,
    active: false,
    lastRun: "10 Jun · 09:31",
    nextRun: "Paused",
    runsThisMonth: 1,
    spentThisMonth: 1000,
  },
  {
    id: "ar-5",
    utility: "tv",
    accountRef: "20491867421",
    nickname: "Family TV",
    provider: "DSTV",
    type: "Schedule",
    amountRule: "Cap at maximum",
    amount: 11500,
    cap: 12000,
    timing: "Monthly on the 3rd · 09:00",
    primary: "bank",
    fallback: "mpesa",
    approvalOnSpike: true,
    notifyOnRun: true,
    active: true,
    lastRun: "03 Jun · 09:00",
    nextRun: "03 Jul · 09:00",
    runsThisMonth: 1,
    spentThisMonth: 11500,
  },
];

const initialChannels: NotifChannel[] = [
  { id: "nc-1", label: "Payment executed", desc: "Every autopay run and manual payment receipt", icon: "check-circle", sms: true, email: true, push: true, whatsapp: false },
  { id: "nc-2", label: "Low balance / units", desc: "Prepaid meter or data bundle running out", icon: "gauge", sms: true, email: false, push: true, whatsapp: true },
  { id: "nc-3", label: "Bill due reminder", desc: "3 days, 1 day and same-day reminders", icon: "calendar", sms: false, email: true, push: true, whatsapp: true },
  { id: "nc-4", label: "Payment failed", desc: "Failed, reversed or rejected transactions", icon: "alert", sms: true, email: true, push: true, whatsapp: true },
  { id: "nc-5", label: "Approval requested", desc: "A payment needs your sign-off", icon: "shield", sms: false, email: true, push: true, whatsapp: false },
  { id: "nc-6", label: "Tariff & provider updates", desc: "Rate changes and service notices", icon: "info", sms: false, email: true, push: false, whatsapp: false },
];

const initialApprovers: Approver[] = [
  { id: "ap-1", name: "Joseph Mwangi", role: "Admin · Owner", email: "j@paymo.co.ke", limit: 500000, scope: "All utilities", active: true },
  { id: "ap-2", name: "Grace Wanjiru", role: "Finance Manager", email: "grace@paymo.co.ke", limit: 100000, scope: "All utilities", active: true },
  { id: "ap-3", name: "Peter Otieno", role: "Site Manager", email: "peter@paymo.co.ke", limit: 25000, scope: "Electricity · Water", active: true },
  { id: "ap-4", name: "Mary Achieng", role: "Accounts Clerk", email: "mary@paymo.co.ke", limit: 10000, scope: "Airtime · TV", active: false },
];

const auditLog: AuditEntry[] = [
  { id: "au-1", date: "27 Jun", time: "14:32", actor: "System · Autopay", action: "Rule executed", target: "Home · Karen", detail: "KES 2,500 KPLC token · funded from wallet", tone: "success", icon: "repeat" },
  { id: "au-2", date: "27 Jun", time: "09:15", actor: "Joseph Mwangi", action: "Cap increased", target: "Family TV", detail: "Monthly cap KES 10,000 → KES 12,000", tone: "info", icon: "sliders" },
  { id: "au-3", date: "26 Jun", time: "16:40", actor: "Grace Wanjiru", action: "Payment approved", target: "Shop · Westlands", detail: "KES 8,400 KPLC postpaid · spike approval", tone: "success", icon: "shield" },
  { id: "au-4", date: "25 Jun", time: "11:02", actor: "Joseph Mwangi", action: "Rule paused", target: "Personal line", detail: "Airtime auto-renew disabled manually", tone: "warning", icon: "pause-circle" },
  { id: "au-5", date: "24 Jun", time: "08:20", actor: "System · Guardrail", action: "Approval required", target: "Cold Room", detail: "Bill 34% above 3-month average", tone: "warning", icon: "alert" },
  { id: "au-6", date: "22 Jun", time: "15:55", actor: "Peter Otieno", action: "Account added", target: "Borehole permit", detail: "WRA account BH-001488 verified", tone: "info", icon: "plus" },
  { id: "au-7", date: "20 Jun", time: "10:11", actor: "System · Autopay", action: "Rule failed", target: "Office fibre", detail: "Bank timeout · auto-retried from wallet", tone: "danger", icon: "alert" },
  { id: "au-8", date: "18 Jun", time: "13:44", actor: "Grace Wanjiru", action: "Approver added", target: "Mary Achieng", detail: "Accounts Clerk · KES 10,000 limit", tone: "info", icon: "users" },
];

const initialIntegrations: Integration[] = [
  { id: "in-1", name: "QuickBooks", desc: "Auto-post utility expenses to your ledger", icon: "file", category: "Accounting", connected: true, lastSync: "27 Jun · 15:00" },
  { id: "in-2", name: "Xero", desc: "Sync bills, receipts and reconciliations", icon: "file", category: "Accounting", connected: false },
  { id: "in-3", name: "WhatsApp Business", desc: "Send receipts and alerts to tenants", icon: "phone", category: "Messaging", connected: true, lastSync: "27 Jun · 14:32" },
  { id: "in-4", name: "Google Drive", desc: "Archive every receipt PDF automatically", icon: "upload", category: "Storage", connected: true, lastSync: "27 Jun · 12:00" },
  { id: "in-5", name: "Slack", desc: "Post autopay events into a finance channel", icon: "send", category: "Messaging", connected: false },
  { id: "in-6", name: "Analytics API", desc: "Pull consumption data into your BI tool", icon: "chart", category: "Data", connected: false },
];

/* ===================================================================== */
/*                            HELPERS                                    */
/* ===================================================================== */

function methodName(id: string) {
  return PAY_METHODS.find((m) => m.id === id)?.name ?? "M-Pesa";
}

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

/* ===================================================================== */
/*                              PAGE                                     */
/* ===================================================================== */

export function SettingsPage() {
  const { open, toast, accounts, balance } = useApp();

  const [rules, setRules] = useState(initialRules);
  const [channels, setChannels] = useState(initialChannels);
  const [approvers, setApprovers] = useState(initialApprovers);
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const [ruleFilter, setRuleFilter] = useState<"all" | "active" | "paused" | "threshold" | "schedule">("all");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditFilter, setAuditFilter] = useState<"all" | "system" | "user">("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editRule, setEditRule] = useState<AutoRule | null>(null);

  /* global guardrails */
  const [globalCap, setGlobalCap] = useState(80000);
  const [spikeThreshold, setSpikeThreshold] = useState(20);
  const [dualApproval, setDualApproval] = useState(true);
  const [dualThreshold, setDualThreshold] = useState(20000);
  const [pauseOnFail, setPauseOnFail] = useState(true);
  const [retryOnFail, setRetryOnFail] = useState(true);
  const [weekendHold, setWeekendHold] = useState(false);
  const [autoReverse, setAutoReverse] = useState(true);
  const [receiptArchive, setReceiptArchive] = useState(true);
  const [quietHours, setQuietHours] = useState(true);

  useReveal([ruleFilter, auditFilter, auditQuery, rules.length]);

  const activeRules = rules.filter((r) => r.active);
  const monthSpend = rules.reduce((s, r) => s + r.spentThisMonth, 0);
  const capUsed = Math.round((monthSpend / globalCap) * 100);
  const guardrailCount = [dualApproval, pauseOnFail, retryOnFail, autoReverse, receiptArchive, weekendHold, quietHours].filter(Boolean).length;

  const shownRules = useMemo(() => {
    if (ruleFilter === "active") return rules.filter((r) => r.active);
    if (ruleFilter === "paused") return rules.filter((r) => !r.active);
    if (ruleFilter === "threshold") return rules.filter((r) => r.type === "Threshold");
    if (ruleFilter === "schedule") return rules.filter((r) => r.type === "Schedule");
    return rules;
  }, [rules, ruleFilter]);

  const shownAudit = useMemo(() => {
    let rows = auditLog;
    if (auditFilter === "system") rows = rows.filter((a) => a.actor.startsWith("System"));
    if (auditFilter === "user") rows = rows.filter((a) => !a.actor.startsWith("System"));
    if (auditQuery.trim()) {
      const q = auditQuery.toLowerCase();
      rows = rows.filter((a) => `${a.actor} ${a.action} ${a.target} ${a.detail}`.toLowerCase().includes(q));
    }
    return rows;
  }, [auditFilter, auditQuery]);

  const patchRule = (id: string, patch: Partial<AutoRule>) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="mx-auto max-w-[1320px]">
      {/* ========================= HERO ========================= */}
      <section className="pm-hero relative overflow-hidden rounded-3xl p-5 sm:p-7 lg:p-9">
        <div className="pm-hero-dots pointer-events-none absolute inset-0" />
        <div className="relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 backdrop-blur">
              <span className="live-dot" /> {activeRules.length} automation rules running · {guardrailCount} guardrails enforced
            </span>
            <h2 className="mt-4 font-display text-[27px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[36px] lg:text-[42px]">
              Utility settings
              <br className="hidden sm:block" /> &amp; automation control.
            </h2>
            <p className="mt-3 max-w-[56ch] text-[13.5px] leading-relaxed text-white/70 sm:text-[14.5px]">
              Build schedule or threshold rules, set caps and funding waterfalls, require approvals on spikes, and route every alert to the right channel — with a full audit trail behind it.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" icon="plus" onClick={() => { setEditRule(null); setBuilderOpen(true); }}>
                New automation rule
              </Button>
              <Button size="lg" variant="white" icon="shield" onClick={() => document.getElementById("sec-guardrails")?.scrollIntoView({ behavior: "smooth" })}>
                Guardrails
              </Button>
              <Button size="lg" variant="white" icon="download" onClick={() => open({ kind: "export" })}>
                Export config
              </Button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {[
                { k: "Active rules", v: `${activeRules.length}/${rules.length}`, s: "across 5 utilities", icon: "repeat" as IconName },
                { k: "Automated (Jun)", v: kes(monthSpend), s: `${capUsed}% of monthly cap`, icon: "wallet" as IconName },
                { k: "Approvers", v: `${approvers.filter((a) => a.active).length} people`, s: "maker–checker enabled", icon: "users" as IconName },
                { k: "Integrations", v: `${integrations.filter((i) => i.connected).length} live`, s: "auto-sync receipts", icon: "grid" as IconName },
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

          {/* right — monthly cap gauge + waterfall */}
          <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold text-white">Monthly automation cap</p>
              <Badge tone={capUsed > 80 ? "danger" : capUsed > 60 ? "warning" : "success"}>{capUsed}% used</Badge>
            </div>
            <p className="num mt-2 font-display text-[26px] font-extrabold leading-none text-white">{kes(monthSpend)}</p>
            <p className="mt-1 text-[11px] text-white/50">of {kes(globalCap)} authorised for June</p>
            <div className="mt-3 h-[8px] w-full overflow-hidden rounded-full bg-white/10">
              <div className={cn("h-full rounded-full transition-[width] duration-700", capUsed > 80 ? "bg-danger" : capUsed > 60 ? "bg-warn" : "bg-pmgreen")} style={{ width: `${Math.min(capUsed, 100)}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-white/45">Rules auto-pause at 100%. You'll be alerted at 80%.</p>

            <div className="mt-4 rounded-xl border border-white/10 bg-ink/25 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">Default funding waterfall</p>
              <div className="mt-2.5 space-y-2">
                {[
                  { n: "1", t: "PayMo wallet", d: `${kes(balance)} available · zero fee` },
                  { n: "2", t: "M-Pesa STK", d: "0712 *** 890 · free" },
                  { n: "3", t: "Equity Bank", d: "····4521 · KES 25 fee" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-2.5 rounded-lg bg-white/[0.05] p-2.5">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-white/10 font-display text-[11px] font-bold text-white">{s.n}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-bold text-white">{s.t}</span>
                      <span className="num block text-[10.5px] text-white/50">{s.d}</span>
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="white" size="sm" full className="mt-3" icon="wallet" onClick={() => open({ kind: "topup" })}>Top up wallet</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= 3.6 — AUTOMATION RULES ========================= */}
      <SectionHead no="3.6" id="sec-rules" title="Automation rules" sub="Schedule-based or threshold-based rules with per-rule caps, funding waterfalls and spike protection.">
        <div className="flex flex-wrap gap-2">
          <Chip on={ruleFilter === "all"} onClick={() => setRuleFilter("all")} count={rules.length}>All</Chip>
          <Chip on={ruleFilter === "active"} onClick={() => setRuleFilter("active")} count={activeRules.length}>Active</Chip>
          <Chip on={ruleFilter === "paused"} onClick={() => setRuleFilter("paused")} count={rules.length - activeRules.length}>Paused</Chip>
          <Chip on={ruleFilter === "schedule"} onClick={() => setRuleFilter("schedule")} count={rules.filter((r) => r.type === "Schedule").length}>Schedule</Chip>
          <Chip on={ruleFilter === "threshold"} onClick={() => setRuleFilter("threshold")} count={rules.filter((r) => r.type === "Threshold").length}>Threshold</Chip>
        </div>
      </SectionHead>

      {shownRules.length === 0 ? (
        <Card>
          <Empty
            icon="repeat"
            title="No rules match that filter"
            sub="Switch the filter or create a new automation rule for any saved utility account."
            action={<Button icon="plus" onClick={() => { setEditRule(null); setBuilderOpen(true); }}>New rule</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shownRules.map((r, i) => (
            <RuleCard
              key={r.id}
              rule={r}
              delay={i * 45}
              onPatch={(p) => patchRule(r.id, p)}
              onEdit={() => { setEditRule(r); setBuilderOpen(true); }}
              onDelete={() => {
                setRules((prev) => prev.filter((x) => x.id !== r.id));
                toast({ title: "Rule deleted", msg: `${r.nickname} will no longer auto-pay.`, tone: "warn" });
              }}
            />
          ))}
          <button
            data-reveal
            onClick={() => { setEditRule(null); setBuilderOpen(true); }}
            className="flex min-h-[300px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-white/70 p-5 text-center transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/20"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-muted"><Icon name="plus" size={22} /></span>
            <p className="text-[13.5px] font-bold text-ink">Create automation rule</p>
            <p className="max-w-[30ch] text-[11.5px] leading-relaxed text-muted">Pick a utility account, choose schedule or threshold, then set the cap and funding source.</p>
          </button>
        </div>
      )}

      {/* ========================= 3.6A — GUARDRAILS ========================= */}
      <SectionHead no="3.6A" id="sec-guardrails" title="Global guardrails" sub="Workspace-wide protections that apply to every automation rule and manual payment.">
        <Badge tone="success" dot>{guardrailCount} enforced</Badge>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* caps */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={16} className="text-pmgreen" />
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Spend limits &amp; approvals</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Monthly automation cap (KES)" hint="All rules pause when this is reached.">
              <Input type="number" className="no-spin" value={globalCap} onChange={(e) => setGlobalCap(Number(e.target.value) || 0)} icon="wallet" />
            </Field>
            <Field label="Spike approval threshold (%)" hint="Require manual approval when a bill exceeds the 3-month average by this much.">
              <div className="flex items-center gap-3">
                <input type="range" min={5} max={100} step={5} value={spikeThreshold} onChange={(e) => setSpikeThreshold(Number(e.target.value))} className="flex-1" />
                <span className="num w-14 rounded-lg bg-canvas px-2 py-1.5 text-center text-[12.5px] font-bold text-ink">{spikeThreshold}%</span>
              </div>
            </Field>
          </div>

          <div className="mt-4 rounded-xl bg-[#fafbfd] p-3.5">
            <Row k="Cap consumed" v={`${kes(monthSpend)} of ${kes(globalCap)}`} strong />
            <Progress value={capUsed} tone={capUsed > 80 ? "red" : capUsed > 60 ? "amber" : "green"} className="mt-2" />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
              <span>{capUsed}% used</span>
              <span className="num">{kes(Math.max(globalCap - monthSpend, 0))} remaining</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <GuardToggle
              on={dualApproval}
              onChange={(v) => { setDualApproval(v); toast({ title: v ? "Dual approval on" : "Dual approval off", msg: v ? `Payments above ${kes(dualThreshold)} need two approvers.` : "Single approver is now sufficient.", tone: v ? "success" : "warn" }); }}
              icon="users"
              title="Require dual approval on large payments"
              desc={`Any payment above ${kes(dualThreshold)} needs a second approver before it executes.`}
            >
              {dualApproval && (
                <div className="mt-2.5">
                  <Select value={dualThreshold} onChange={(e) => setDualThreshold(Number(e.target.value))}>
                    {[10000, 20000, 50000, 100000].map((v) => (
                      <option key={v} value={v}>Above {kes(v)}</option>
                    ))}
                  </Select>
                </div>
              )}
            </GuardToggle>

            <GuardToggle on={pauseOnFail} onChange={setPauseOnFail} icon="pause-circle" title="Pause rule after 2 consecutive failures" desc="Stops repeated debits when a provider or funding source is down." />
            <GuardToggle on={retryOnFail} onChange={setRetryOnFail} icon="refresh" title="Auto-retry from fallback source" desc="If the primary source fails, retry once from the fallback before pausing." />
            <GuardToggle on={autoReverse} onChange={setAutoReverse} icon="repeat" title="Auto-reverse unconfirmed payments" desc="Reverse to source if the provider does not acknowledge within 24 hours." />
            <GuardToggle on={weekendHold} onChange={setWeekendHold} icon="calendar" title="Hold executions on weekends" desc="Shift Saturday and Sunday runs to the next business day at 08:00." />
            <GuardToggle on={receiptArchive} onChange={setReceiptArchive} icon="upload" title="Archive every receipt to Drive" desc="Store a signed PDF of each payment in your connected Google Drive folder." />
          </div>
        </Card>

        {/* health summary */}
        <div className="space-y-3">
          <Card hover className="bg-gradient-to-br from-ink to-[#123a2c] text-white">
            <div className="flex items-center gap-2">
              <Icon name="gauge" size={17} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight">Automation health</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { v: `${activeRules.length}`, k: "rules running" },
                { v: "0", k: "missed bills" },
                { v: "1", k: "failed run" },
                { v: "100%", k: "auto-reversed" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/[0.07] p-3">
                  <p className="num font-display text-[20px] font-extrabold">{s.v}</p>
                  <p className="text-[11px] text-white/55">{s.k}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {rules.filter((r) => r.active).slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] p-2.5">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-white/10 text-pmgreen">
                    <Icon name={utilityOf(r.utility).icon} size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold">{r.nickname}</span>
                    <span className="block truncate text-[10.5px] text-white/50">{r.nextRun}</span>
                  </span>
                  <span className="live-dot" />
                </div>
              ))}
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center gap-2">
              <Icon name="bell" size={16} className="text-pmgreen" />
              <p className="font-display text-[15px] font-bold tracking-tight text-ink">Quiet hours</p>
            </div>
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-line bg-[#fafbfd] p-3">
              <Toggle on={quietHours} onChange={setQuietHours} label="Quiet hours" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-ink">Mute non-urgent alerts 22:00 – 06:00</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">Failed payments and approval requests always break through.</span>
              </span>
            </label>
            {quietHours && (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <Field label="From">
                  <Select defaultValue="22:00">{["20:00", "21:00", "22:00", "23:00"].map((t) => <option key={t}>{t}</option>)}</Select>
                </Field>
                <Field label="To">
                  <Select defaultValue="06:00">{["05:00", "06:00", "07:00", "08:00"].map((t) => <option key={t}>{t}</option>)}</Select>
                </Field>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ========================= 3.6B — NOTIFICATIONS ========================= */}
      <SectionHead no="3.6B" id="sec-notifications" title="Notification matrix" sub="Choose exactly which channel receives which event — per category, across SMS, email, push and WhatsApp.">
        <Button size="sm" variant="outline" icon="check" onClick={() => { setChannels((p) => p.map((c) => ({ ...c, sms: true, email: true, push: true, whatsapp: true }))); toast({ title: "All channels enabled", msg: "Every event now notifies all four channels.", tone: "success" }); }}>
          Enable all
        </Button>
      </SectionHead>

      <Card className="p-0">
        {/* desktop matrix */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[760px]">
            <thead className="bg-[#fafbfd]">
              <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-center">SMS</th>
                <th className="px-4 py-3 text-center">Email</th>
                <th className="px-4 py-3 text-center">Push</th>
                <th className="px-4 py-3 text-center">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {channels.map((c) => (
                <tr key={c.id} className="transition hover:bg-[#f7f9fc]">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name={c.icon} size={15} /></span>
                      <div>
                        <p className="text-[12.5px] font-bold text-ink">{c.label}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{c.desc}</p>
                      </div>
                    </div>
                  </td>
                  {(["sms", "email", "push", "whatsapp"] as const).map((ch) => (
                    <td key={ch} className="px-4 py-3">
                      <div className="flex justify-center">
                        <Toggle on={c[ch]} label={`${c.label} via ${ch}`} onChange={(v) => setChannels((p) => p.map((x) => (x.id === c.id ? { ...x, [ch]: v } : x)))} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile stacked */}
        <div className="divide-y divide-line lg:hidden">
          {channels.map((c) => (
            <div key={c.id} className="p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name={c.icon} size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">{c.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{c.desc}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["sms", "email", "push", "whatsapp"] as const).map((ch) => (
                  <label key={ch} className="flex items-center gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-2.5">
                    <Toggle on={c[ch]} label={`${c.label} via ${ch}`} onChange={(v) => setChannels((p) => p.map((x) => (x.id === c.id ? { ...x, [ch]: v } : x)))} />
                    <span className="text-[12px] font-semibold capitalize text-ink-2">{ch}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#fafbfd] px-4 py-3.5">
          <p className="text-[11.5px] text-muted">Alerts are sent to <span className="font-bold text-ink-2">j@paymo.co.ke</span> and <span className="num font-bold text-ink-2">0712 *** 890</span>.</p>
          <Button size="sm" variant="outline" icon="send" onClick={() => toast({ title: "Test alert sent", msg: "Check your SMS, email and push notifications.", tone: "info" })}>Send test alert</Button>
        </div>
      </Card>

      {/* ========================= 3.6C — APPROVERS ========================= */}
      <SectionHead no="3.6C" id="sec-approvers" title="Approvers & spend limits" sub="Maker–checker controls: who can authorise what, and up to which amount.">
        <Button size="sm" variant="outline" icon="plus" onClick={() => toast({ title: "Invite approver", msg: "Send an invite from Team & roles to add a new approver.", tone: "info" })}>Invite approver</Button>
      </SectionHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {approvers.map((a, i) => (
          <div key={a.id} data-reveal style={{ animationDelay: `${i * 40}ms` }} className="card-hover flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="flex items-start gap-3">
              <Avatar name={a.name} size={40} tone={a.active ? "dark" : "light"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-ink">{a.name}</p>
                <p className="truncate text-[11.5px] text-muted">{a.role}</p>
              </div>
              <Toggle on={a.active} label={`${a.name} approver`} onChange={(v) => { setApprovers((p) => p.map((x) => (x.id === a.id ? { ...x, active: v } : x))); toast({ title: v ? "Approver enabled" : "Approver disabled", msg: `${a.name} · ${a.role}`, tone: v ? "success" : "warn" }); }} />
            </div>
            <div className="mt-3 rounded-xl bg-[#fafbfd] p-3">
              <Row k="Approval limit" v={kes(a.limit)} strong />
              <Row k="Scope" v={a.scope} />
              <Row k="Email" v={<span className="truncate text-[11.5px]">{a.email}</span>} />
            </div>
            <div className="mt-3">
              <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">Adjust limit</p>
              <Select value={a.limit} onChange={(e) => setApprovers((p) => p.map((x) => (x.id === a.id ? { ...x, limit: Number(e.target.value) } : x)))}>
                {[10000, 25000, 50000, 100000, 250000, 500000].map((v) => (
                  <option key={v} value={v}>{kes(v)}</option>
                ))}
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* ========================= 3.6D — INTEGRATIONS ========================= */}
      <SectionHead no="3.6D" id="sec-integrations" title="Integrations" sub="Push receipts and consumption data into the tools your finance team already uses.">
        <Badge tone="info">{integrations.filter((i) => i.connected).length} connected</Badge>
      </SectionHead>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((it, i) => (
          <div key={it.id} data-reveal style={{ animationDelay: `${i * 40}ms` }} className="card-hover flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="flex items-start gap-3">
              <span className={cn("grid h-11 w-11 flex-none place-items-center rounded-[13px]", it.connected ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}>
                <Icon name={it.icon} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[13.5px] font-bold text-ink">{it.name}</p>
                  {it.connected && <Badge tone="success" dot>Live</Badge>}
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{it.desc}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="muted">{it.category}</Badge>
              {it.lastSync && <Badge tone="info" icon="clock">Synced {it.lastSync}</Badge>}
            </div>
            <div className="mt-auto pt-3">
              <Button
                full
                variant={it.connected ? "outline" : "primary"}
                icon={it.connected ? "sliders" : "plus"}
                onClick={() => {
                  setIntegrations((p) => p.map((x) => (x.id === it.id ? { ...x, connected: !x.connected, lastSync: !x.connected ? "Just now" : undefined } : x)));
                  toast({ title: it.connected ? `${it.name} disconnected` : `${it.name} connected`, msg: it.connected ? "Data sync has been stopped." : "Initial sync started — receipts will appear shortly.", tone: it.connected ? "warn" : "success" });
                }}
              >
                {it.connected ? "Manage connection" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================= 3.6E — AUDIT LOG ========================= */}
      <SectionHead no="3.6E" id="sec-audit" title="Configuration audit log" sub="Every rule change, approval and automated execution, attributed and timestamped.">
        <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>Export log</Button>
      </SectionHead>

      <Card className="p-0">
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[220px] flex-1">
              <Input icon="search" placeholder="Search actor, action or account…" value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} />
            </div>
            <Segmented
              value={auditFilter}
              onChange={setAuditFilter}
              size="sm"
              options={[
                { value: "all", label: "All events" },
                { value: "system", label: "System", icon: "repeat" },
                { value: "user", label: "People", icon: "users" },
              ]}
            />
          </div>
        </div>

        {shownAudit.length === 0 ? (
          <Empty
            icon="search"
            title="No audit entries match"
            sub="Try a person's name, an account nickname or an action like 'approved'."
            action={<Button variant="outline" icon="refresh" onClick={() => { setAuditQuery(""); setAuditFilter("all"); }}>Reset filters</Button>}
          />
        ) : (
          <div className="p-4">
            <ol className="relative space-y-4 border-l border-dashed border-line pl-6">
              {shownAudit.map((a) => (
                <li key={a.id} className="relative">
                  <span className={cn("absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full ring-4 ring-white", toneBg(a.tone))}>
                    <Icon name={a.icon} size={12} />
                  </span>
                  <div className="rounded-xl border border-line bg-[#fafbfd] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12.5px] font-bold text-ink">{a.action}</p>
                      <Badge tone={a.tone}>{a.target}</Badge>
                      <span className="num ml-auto whitespace-nowrap text-[11px] font-semibold text-faint">{a.date} · {a.time}</span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{a.detail}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-ink-2">
                      <Icon name={a.actor.startsWith("System") ? "repeat" : "user"} size={12} className="text-faint" />
                      {a.actor}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#fafbfd] px-4 py-3.5">
          <p className="text-[11.5px] text-muted">Showing {shownAudit.length} of {auditLog.length} entries · retained 7 years</p>
          <Button size="sm" variant="dark" icon="shield" onClick={() => toast({ title: "Compliance pack queued", msg: "Full audit export will be emailed within 5 minutes.", tone: "success" })}>Compliance pack</Button>
        </div>
      </Card>

      {/* ========================= DANGER ZONE ========================= */}
      <section className="mt-6 grid gap-3 lg:grid-cols-3" data-reveal>
        <Card className="lg:col-span-2 bg-gradient-to-br from-ink via-[#0f2233] to-[#0d5c38] text-white" hover>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-[52ch]">
              <Badge tone="dark" className="border border-white/15 bg-white/10 text-white/80">Safety</Badge>
              <h3 className="mt-3 font-display text-[19px] font-extrabold tracking-tight">Emergency controls</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">
                Pause every automation instantly if a provider outage or funding issue occurs. Nothing is deleted — rules resume exactly where they left off.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="white"
                  icon="pause-circle"
                  onClick={() => {
                    setRules((p) => p.map((r) => ({ ...r, active: false, nextRun: "Paused" })));
                    toast({ title: "All automation paused", msg: `${rules.length} rules stopped. Resume any time.`, tone: "warn" });
                  }}
                >
                  Pause all rules
                </Button>
                <Button
                  variant="white"
                  icon="play"
                  onClick={() => {
                    setRules((p) => p.map((r) => ({ ...r, active: true, nextRun: r.type === "Threshold" ? "On trigger" : r.nextRun === "Paused" ? "Next cycle" : r.nextRun })));
                    toast({ title: "All automation resumed", msg: `${rules.length} rules are running again.`, tone: "success" });
                  }}
                >
                  Resume all
                </Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>Get help</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
              {[
                { k: "Rules running", v: `${activeRules.length}`, i: "repeat" as IconName },
                { k: "Guardrails", v: `${guardrailCount}`, i: "shield" as IconName },
                { k: "Cap headroom", v: `${100 - Math.min(capUsed, 100)}%`, i: "gauge" as IconName },
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
            <p className="font-display text-[15px] font-bold tracking-tight text-ink">Configuration tips</p>
          </div>
          <div className="mt-3 space-y-2.5">
            {[
              { t: "Fund from the wallet first", d: "Zero fees vs KES 25 per bank debit — saves KES 300/yr per rule." },
              { t: "Set caps 20% above average", d: "Catches billing errors without blocking legitimate seasonal spikes." },
              { t: "Use threshold rules for prepaid", d: "Meters and SIMs run dry unpredictably — schedules miss them." },
              { t: "Keep two active approvers", d: "Avoids a single point of failure when someone is on leave." },
            ].map((x) => (
              <div key={x.t} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3">
                <Icon name="check-circle" size={16} className="mt-0.5 flex-none text-pmgreen" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{x.t}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="plus" onClick={() => { setEditRule(null); setBuilderOpen(true); }}>Create optimised rule</Button>
        </Card>
      </section>

      {/* ========================= RULE BUILDER MODAL ========================= */}
      <RuleBuilder
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditRule(null); }}
        editing={editRule}
        accounts={accounts}
        onSave={(rule) => {
          if (editRule) {
            setRules((p) => p.map((r) => (r.id === editRule.id ? { ...rule, id: editRule.id } : r)));
            toast({ title: "Rule updated", msg: `${rule.nickname} · ${rule.timing}`, tone: "success" });
          } else {
            setRules((p) => [...p, { ...rule, id: `ar-${Date.now()}` }]);
            toast({ title: "Automation rule created", msg: `${rule.nickname} will auto-pay ${kes(rule.amount)}.`, tone: "success" });
          }
          setBuilderOpen(false);
          setEditRule(null);
        }}
      />
    </div>
  );
}

/* ===================================================================== */
/*                          GUARD TOGGLE ROW                             */
/* ===================================================================== */

function GuardToggle({ on, onChange, icon, title, desc, children }: { on: boolean; onChange: (v: boolean) => void; icon: IconName; title: string; desc: string; children?: ReactNode }) {
  return (
    <div className={cn("rounded-xl border p-3.5 transition", on ? "border-pmgreen/30 bg-pmgreen-soft/25" : "border-line bg-[#fafbfd]")}>
      <div className="flex items-start gap-3">
        <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-white text-[#067647] shadow-sm" : "bg-canvas text-muted")}>
          <Icon name={icon} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold text-ink">{title}</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{desc}</p>
        </div>
        <Toggle on={on} onChange={onChange} label={title} />
      </div>
      {children}
    </div>
  );
}

/* ===================================================================== */
/*                             RULE CARD                                 */
/* ===================================================================== */

function RuleCard({
  rule,
  delay,
  onPatch,
  onEdit,
  onDelete,
}: {
  rule: AutoRule;
  delay: number;
  onPatch: (p: Partial<AutoRule>) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { open, toast } = useApp();
  const u = utilityOf(rule.utility);
  const capPct = Math.round((rule.spentThisMonth / rule.cap) * 100);

  return (
    <div data-reveal style={{ animationDelay: `${delay}ms` }} className="card-hover relative flex flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-[13px]" style={{ background: `${u.color}1a`, color: u.color }}>
          <Icon name={u.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13.5px] font-bold text-ink">{rule.nickname}</p>
            <Badge tone={rule.active ? "success" : "muted"} dot>{rule.active ? "Active" : "Paused"}</Badge>
          </div>
          <p className="num mt-0.5 text-[11.5px] text-muted">{rule.provider} · {rule.accountRef}</p>
        </div>
        <Menu
          trigger={() => <span className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="more" size={16} /></span>}
          items={[
            { label: "Edit rule", icon: "edit", onClick: onEdit },
            { label: "Run now", icon: "bolt", onClick: () => open({ kind: "buy", utility: rule.utility, amount: rule.amount }) },
            { label: "View history", icon: "receipt", onClick: () => open({ kind: "history" }) },
            { label: rule.active ? "Pause rule" : "Resume rule", icon: rule.active ? "pause-circle" : "play", onClick: () => { onPatch({ active: !rule.active }); toast({ title: rule.active ? "Rule paused" : "Rule resumed", msg: rule.nickname, tone: rule.active ? "warn" : "success" }); } },
            { label: "Delete rule", icon: "trash", onClick: onDelete, danger: true },
          ]}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={rule.type === "Threshold" ? "violet" : "info"} icon={rule.type === "Threshold" ? "gauge" : "calendar"}>{rule.type}</Badge>
        {rule.approvalOnSpike && <Badge tone="warning" icon="shield">Spike guard</Badge>}
        {rule.notifyOnRun && <Badge tone="muted" icon="bell">Notify</Badge>}
      </div>

      <div className="mt-3 rounded-xl bg-[#fafbfd] p-3">
        <Row k="Trigger" v={<span className="text-right text-[11.5px]">{rule.timing}</span>} />
        <Row k="Amount rule" v={rule.amountRule} />
        <Row k="Amount" v={kes(rule.amount)} strong />
        <Row k="Monthly cap" v={kes(rule.cap)} />
        <Progress value={capPct} tone={capPct > 85 ? "red" : capPct > 60 ? "amber" : "green"} className="mt-2" />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
          <span className="num">{kes(rule.spentThisMonth)} used</span>
          <span>{rule.runsThisMonth} run{rule.runsThisMonth === 1 ? "" : "s"} this month</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-white p-3">
        <Row k="Primary source" v={methodName(rule.primary)} icon="wallet" />
        <Row k="Fallback" v={methodName(rule.fallback)} icon="refresh" />
        <Row k="Last run" v={rule.lastRun} />
        <Row k="Next run" v={rule.nextRun} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button className="flex-1" variant="outline" icon="edit" onClick={onEdit}>Edit rule</Button>
        <Toggle on={rule.active} label={`${rule.nickname} rule`} onChange={(v) => onPatch({ active: v, nextRun: v ? (rule.type === "Threshold" ? "On trigger" : "Next cycle") : "Paused" })} />
      </div>
    </div>
  );
}

/* ===================================================================== */
/*                          RULE BUILDER MODAL                           */
/* ===================================================================== */

function RuleBuilder({
  open,
  onClose,
  editing,
  accounts,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: AutoRule | null;
  accounts: { id: string; utility: UtilityId; nickname: string; ref: string; provider: string }[];
  onSave: (r: AutoRule) => void;
}) {
  const [step, setStep] = useState(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [type, setType] = useState<RuleType>("Schedule");
  const [amountRule, setAmountRule] = useState<AmountRule>("Fixed amount");
  const [amount, setAmount] = useState(2500);
  const [cap, setCap] = useState(8000);
  const [timing, setTiming] = useState("Monthly on the 1st · 08:00");
  const [primary, setPrimary] = useState("wallet");
  const [fallback, setFallback] = useState("mpesa");
  const [approvalOnSpike, setApprovalOnSpike] = useState(true);
  const [notifyOnRun, setNotifyOnRun] = useState(true);

  const acc = accounts.find((a) => a.id === accountId);

  // hydrate when editing
  const [hydrated, setHydrated] = useState<string | null>(null);
  if (open && editing && hydrated !== editing.id) {
    setHydrated(editing.id);
    setStep(0);
    const match = accounts.find((a) => a.ref === editing.accountRef);
    setAccountId(match?.id ?? accounts[0]?.id ?? "");
    setType(editing.type);
    setAmountRule(editing.amountRule);
    setAmount(editing.amount);
    setCap(editing.cap);
    setTiming(editing.timing);
    setPrimary(editing.primary);
    setFallback(editing.fallback);
    setApprovalOnSpike(editing.approvalOnSpike);
    setNotifyOnRun(editing.notifyOnRun);
  }
  if (open && !editing && hydrated !== "new") {
    setHydrated("new");
    setStep(0);
  }
  if (!open && hydrated !== null) setHydrated(null);

  const scheduleOptions = ["Monthly on the 1st · 08:00", "Monthly on the 5th · 08:00", "Monthly on the 30th · 08:00", "Weekly · Monday 08:00", "3 days before due date"];
  const thresholdOptions = ["When units fall below 10 kWh", "When units fall below 25 kWh", "When data falls below 1 GB", "When data falls below 500 MB", "When balance falls below KES 500"];

  const save = () => {
    if (!acc) return;
    onSave({
      id: editing?.id ?? "",
      utility: acc.utility,
      accountRef: acc.ref,
      nickname: acc.nickname,
      provider: acc.provider,
      type,
      amountRule,
      amount,
      cap,
      timing,
      primary,
      fallback,
      approvalOnSpike,
      notifyOnRun,
      active: true,
      lastRun: editing?.lastRun ?? "Never",
      nextRun: type === "Threshold" ? "On trigger" : "Next cycle",
      runsThisMonth: editing?.runsThisMonth ?? 0,
      spentThisMonth: editing?.spentThisMonth ?? 0,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-[640px]"
      icon="repeat"
      title={editing ? "Edit automation rule" : "New automation rule"}
      subtitle="Three steps: pick the account, define amount and timing, then set guardrails."
      footer={
        step === 0 ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button icon="arrow-right" disabled={!acc} onClick={() => setStep(1)}>Continue</Button>
          </>
        ) : step === 1 ? (
          <>
            <Button variant="ghost" icon="chevron-left" onClick={() => setStep(0)}>Back</Button>
            <Button icon="arrow-right" onClick={() => setStep(2)}>Continue</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" icon="chevron-left" onClick={() => setStep(1)}>Back</Button>
            <Button icon="check" onClick={save}>{editing ? "Save changes" : "Create rule"}</Button>
          </>
        )
      }
    >
      <Stepper steps={["Utility & type", "Amount & timing", "Guardrails & funding"]} current={step} />

      {/* STEP 1 */}
      {step === 0 && (
        <div className="mt-4 space-y-4">
          <Field label="Utility account" required hint="Only verified saved accounts can be automated.">
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.nickname} · {a.provider} · {a.ref}</option>
              ))}
            </Select>
          </Field>

          <div>
            <p className="mb-2 text-[12.5px] font-semibold text-ink-2">Rule type</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { v: "Schedule" as RuleType, icon: "calendar" as IconName, t: "Schedule based", d: "Pay on fixed dates or due dates" },
                { v: "Threshold" as RuleType, icon: "gauge" as IconName, t: "Threshold based", d: "Top up when balance drops" },
              ]).map((o) => (
                <button
                  key={o.v}
                  onClick={() => { setType(o.v); setTiming(o.v === "Schedule" ? scheduleOptions[0] : thresholdOptions[0]); }}
                  className={cn("flex items-start gap-3 rounded-xl border p-3.5 text-left transition", type === o.v ? "border-pmgreen bg-pmgreen-soft/40 shadow-sm" : "border-line bg-white hover:border-[#c4c9d4]")}
                >
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", type === o.v ? "bg-white text-[#067647] shadow-sm" : "bg-canvas text-muted")}>
                    <Icon name={o.icon} size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-ink">{o.t}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">{o.d}</span>
                  </span>
                  <span className={cn("mt-1 h-4 w-4 flex-none rounded-full border-2", type === o.v ? "border-pmgreen bg-pmgreen" : "border-[#d0d5dd]")} />
                </button>
              ))}
            </div>
          </div>

          {acc && (
            <div className="flex items-start gap-2.5 rounded-xl bg-pmblue-soft/70 p-3">
              <Icon name="info" size={16} className="mt-0.5 flex-none text-[#175cd3]" />
              <p className="text-[12px] leading-relaxed text-[#175cd3]">
                {utilityOf(acc.utility).name} · {acc.provider}. {type === "Threshold" ? "Threshold rules check the balance every 30 minutes." : "Schedule rules execute at the chosen time in EAT."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div className="mt-4 space-y-4">
          <Field label="Amount rule" hint="How PayMo decides what to pay each run.">
            <Select value={amountRule} onChange={(e) => setAmountRule(e.target.value as AmountRule)}>
              {(["Fixed amount", "Full bill", "Cap at maximum", "Average + 10%"] as AmountRule[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Amount per run (KES)" required>
              <Input type="number" className="no-spin" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} icon="wallet" />
            </Field>
            <Field label="Monthly cap (KES)" hint="Rule pauses when reached.">
              <Input type="number" className="no-spin" value={cap} onChange={(e) => setCap(Number(e.target.value) || 0)} icon="shield" />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            {[500, 1000, 2500, 5000, 10000].map((v) => (
              <Chip key={v} on={amount === v} onClick={() => setAmount(v)}>{kes(v)}</Chip>
            ))}
          </div>

          <Field label="Execution timing" required>
            <Select value={timing} onChange={(e) => setTiming(e.target.value)}>
              {(type === "Schedule" ? scheduleOptions : thresholdOptions).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>

          <div className="rounded-xl bg-[#fafbfd] p-3.5">
            <Row k="Per run" v={kes(amount)} strong />
            <Row k="Max runs / month" v={`${Math.max(Math.floor(cap / Math.max(amount, 1)), 0)} runs`} />
            <Row k="Monthly exposure" v={kes(cap)} />
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary funding source" required>
              <Select value={primary} onChange={(e) => setPrimary(e.target.value)}>
                {PAY_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} · {m.fee === 0 ? "free" : `+${kes(m.fee)}`}</option>
                ))}
              </Select>
            </Field>
            <Field label="Fallback funding source" hint="Used only if the primary fails.">
              <Select value={fallback} onChange={(e) => setFallback(e.target.value)}>
                {PAY_METHODS.filter((m) => m.id !== primary).map((m) => (
                  <option key={m.id} value={m.id}>{m.name} · {m.fee === 0 ? "free" : `+${kes(m.fee)}`}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-xl border border-line bg-[#fafbfd] p-3.5">
              <Toggle on={approvalOnSpike} onChange={setApprovalOnSpike} label="Spike approval" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-ink">Require manual approval on spikes</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">Hold the payment if the bill is 20% higher than the 3-month average.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-line bg-[#fafbfd] p-3.5">
              <Toggle on={notifyOnRun} onChange={setNotifyOnRun} label="Notify on execution" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-ink">Notify me instantly upon execution</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted">SMS and push the moment the rule runs, with the receipt attached.</span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Rule summary</p>
            <Row k="Account" v={acc ? `${acc.nickname} · ${acc.ref}` : "—"} />
            <Row k="Type" v={type} />
            <Row k="Trigger" v={<span className="text-right text-[11.5px]">{timing}</span>} />
            <Row k="Amount" v={`${kes(amount)} · ${amountRule}`} />
            <Row k="Monthly cap" v={kes(cap)} />
            <Row k="Funding" v={`${methodName(primary)} → ${methodName(fallback)}`} />
            <div className="my-1 h-px bg-line" />
            <Row k="Protections" v={`${[approvalOnSpike && "Spike guard", notifyOnRun && "Notify"].filter(Boolean).join(" · ") || "None"}`} />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-pmgreen-soft/60 p-3">
            <Icon name="shield" size={16} className="mt-0.5 flex-none text-[#067647]" />
            <p className="text-[12px] leading-relaxed text-[#067647]">
              Every automated run still requires your PIN once per day. Rules pause automatically at the monthly cap and never silently overspend.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
