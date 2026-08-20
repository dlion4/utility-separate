import { useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Button, Card, Chip, Donut, Empty, IconBtn, Input, Menu, Progress, Row, Segmented, Select, Spark, SectionHead, type Tone } from "./ui";
import { MONTHLY, NOTICES, PAY_METHODS, SCHEDULES, SPEND_BY_UTILITY, SPEND_TREND, TARIFF, UNITS_TREND, UTILITIES, kes, num, utilityOf } from "./data";
import { useApp } from "./store";
import { useReveal } from "./utils/useReveal";

const SERIES = [
  { key: "electricity", label: "Electricity", color: "#f79009" },
  { key: "water", label: "Water", color: "#2e90fa" },
  { key: "tv", label: "TV", color: "#7a5af8" },
  { key: "internet", label: "Internet", color: "#0e9384" },
  { key: "other", label: "Other", color: "#98a2b3" },
] as const;

export function UtilitiesPage() {
  const { open, accounts, txns, balance, toast } = useApp();
  const [range, setRange] = useState<"6" | "8">("8");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "Success" | "Pending" | "Failed">("all");
  const [utility, setUtility] = useState("all");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [accFilter, setAccFilter] = useState<"all" | "autopay" | "due">("all");

  useReveal([txns.length, accounts.length]);

  const monthData = useMemo(() => (range === "8" ? MONTHLY : MONTHLY.slice(-6)), [range]);
  const maxTotal = Math.max(...monthData.map((m) => m.electricity + m.water + m.tv + m.internet + m.other));
  const june = MONTHLY[MONTHLY.length - 1];
  const may = MONTHLY[MONTHLY.length - 2];
  const juneTotal = june.electricity + june.water + june.tv + june.internet + june.other;
  const mayTotal = may.electricity + may.water + may.tv + may.internet + may.other;
  const growth = ((juneTotal - mayTotal) / mayTotal) * 100;
  const dueSoon = SCHEDULES.filter((s) => s.dueInDays <= 7);
  const dueTotal = dueSoon.reduce((s, x) => s + x.amount, 0);
  const shownAccounts = useMemo(
    () =>
      accFilter === "autopay"
        ? accounts.filter((a) => a.autopay)
        : accFilter === "due"
        ? accounts.filter((a) => a.dueInDays !== undefined)
        : accounts,
    [accounts, accFilter]
  );

  const rows = useMemo(() => {
    let r = [...txns];
    if (status !== "all") r = r.filter((t) => t.status === status);
    if (utility !== "all") r = r.filter((t) => t.utility === utility);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((t) => `${t.ref} ${t.provider} ${t.account} ${t.nickname} ${t.method}`.toLowerCase().includes(s));
    }
    r.sort((a, b) => (sort === "amount" ? b.amount - a.amount : b.iso.localeCompare(a.iso)));
    return r.slice(0, 8);
  }, [txns, status, utility, q, sort]);

  return (
    <div className="mx-auto max-w-1320px">
      {/* ============================ HERO ============================ */}
      <section className="pm-hero position-relative overflow-hidden rounded-3xl p-5 sm-p-7 lg-p-9">
        <div className="pm-hero-dots pe-none position-absolute inset-0" />
        <div className="position-relative d-grid gap-6 lg-grid-cols-1-35fr-1fr lg-gap-10">
          <div>
            <span className="d-inline-flex align-items-center gap-2 rounded-full border border-white-15 bg-white-10 px-3 py-15 fs-115 fw-semibold text-white-80 backdrop-blur">
              <span className="live-dot" /> KPLC · NCWSC · MultiChoice gateways operational
            </span>
            <h2 className="mt-4 font-display fs-26 fw-extrabold leading-1-1 tracking-tight text-white sm-fs-34 lg-fs-40">
              Every utility, one
              <br className="d-none d-sm-block" /> command centre.
            </h2>
            <p className="mt-3 max-w-52ch fs-135 leading-relaxed text-white-70 sm-fs-145">
              Buy KPLC tokens in ~6 seconds, settle water, TV, fibre, gas and airtime, then let autopay handle the rest. One balance, one audit trail, zero surprise bills.
            </p>

            <div className="mt-5 d-flex flex-column gap-25 flex-sm-row">
              <div className="position-relative flex-1">
                <Icon name="search" size={17} className="pe-none position-absolute left-35 top-1-2 translate-y-n1-2 text-white-40" />
                <input
                  placeholder="Meter, account or phone number…"
                  className="w-100 rounded-4 border border-white-15 bg-white-07 py-3 ps-11 pe-3 fs-135 fw-medium text-white outline-none transition placeholder-text-white-40 focus-border-pmgreen-60 focus-bg-white-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      const hit = accounts.find((a) => a.ref.includes(val)) ?? accounts.find((a) => a.nickname.toLowerCase().includes(val.toLowerCase()));
                      if (hit && val) open({ kind: "buy", utility: hit.utility, accountId: hit.id });
                      else if (val) open({ kind: "buy", utility: "electricity" });
                      else toast({ title: "Type a meter number", msg: "Try 14825739 or “Home · Karen”.", tone: "info" });
                    }
                  }}
                />
              </div>
              <Button size="lg" icon="bolt" onClick={() => open({ kind: "buy", utility: "electricity" })}>
                Buy tokens
              </Button>
            </div>

            <div className="mt-5 d-flex flex-wrap align-items-center gap-x-5 gap-y-2 fs-115 fw-semibold text-white-55">
              <span className="d-flex align-items-center gap-15">
                <Icon name="shield" size={14} className="text-pmgreen" /> PCI-DSS Level 1
              </span>
              <span className="d-flex align-items-center gap-15">
                <Icon name="gauge" size={14} className="text-pmgreen" /> KES {TARIFF.toFixed(2)}/kWh today
              </span>
              <span className="d-flex align-items-center gap-15">
                <Icon name="check-circle" size={14} className="text-pmgreen" /> 42,318 tokens issued
              </span>
            </div>
          </div>

          {/* wallet / quick actions card */}
          <div className="card-sheen position-relative overflow-hidden rounded-5 border border-white-12 bg-white-06 p-5 backdrop-blur">
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div>
                <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-white-45">PayMo wallet</p>
                <p className="num mt-15 font-display fs-28 fw-extrabold lh-1 text-white">{kes(balance)}</p>
                <p className="mt-15 fs-115 text-white-50">Zero-fee utility payments · trust account</p>
              </div>
              <IconBtn icon="plus" label="Top up wallet" tone="white" onClick={() => open({ kind: "topup" })} />
            </div>

            <div className="mt-4 d-grid grid-cols-2 gap-2">
              {UTILITIES.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => open({ kind: "buy", utility: u.id })}
                  className="group d-flex align-items-center gap-25 rounded-4 border border-white-10 bg-white-04 p-25 text-start transition hover-border-white-25 hover-bg-white-09"
                >
                  <span className="d-grid h-8 w-8 flex-none place-items-center rounded-3" style={{ background: `${u.color}22`, color: u.color }}>
                    <Icon name={u.icon} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="d-block text-truncate fs-12 fw-bold text-white">{u.name}</span>
                    <span className="d-block text-truncate fs-105 text-white-45">{u.providers[0].name}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-4 border border-warn-25 bg-warn-10 p-3">
              <div className="d-flex align-items-center gap-2">
                <span className="live-dot amber" />
                <p className="fs-12 fw-bold text-white">{dueSoon.length} bills due within 7 days</p>
              </div>
              <p className="num mt-1 fs-115 text-white-60">
                {kes(dueTotal)} total · next {SCHEDULES[0].date} {SCHEDULES[0].label}
              </p>
              <button onClick={() => open({ kind: "autopay" })} className="focus-ring mt-2 d-inline-flex align-items-center gap-1 fs-12 fw-bold text-pmgreen transition hover-gap-15">
                Review schedule <Icon name="arrow-right" size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ KPI STRIP ============================ */}
      <section className="mt-5 d-grid gap-3 sm-grid-cols-2 xl-grid-cols-4" data-reveal>
        <Kpi
          label="Spend this month"
          value={kes(juneTotal)}
          delta={growth}
          deltaNote={`vs ${kes(mayTotal)} in May`}
          icon="wallet"
          tone="info"
          spark={<Spark points={SPEND_TREND} stroke="#2e90fa" />}
        />
        <Kpi
          label="Units purchased"
          value={`${num(UNITS_TREND[UNITS_TREND.length - 1], 0)} kWh`}
          delta={13.2}
          deltaNote="168 kWh across 2 meters"
          icon="gauge"
          tone="warning"
          spark={<Spark points={UNITS_TREND} stroke="#f79009" />}
        />
        <Kpi
          label="Active autopay rules"
          value={`${accounts.filter((a) => a.autopay).length} rules`}
          delta={0}
          deltaNote="KES 12,799 auto-paid in June"
          icon="repeat"
          tone="success"
          custom={<Progress value={(accounts.filter((a) => a.autopay).length / Math.max(accounts.length, 1)) * 100} className="mt-3" />}
        />
        <Kpi
          label="Due next 7 days"
          value={kes(dueTotal)}
          delta={-8.4}
          deltaNote={`${dueSoon.length} scheduled payments`}
          icon="calendar"
          tone="violet"
          custom={
            <div className="mt-3 space-y-15">
              {dueSoon.slice(0, 3).map((s) => (
                <div key={s.id} className="d-flex align-items-center justify-content-between fs-11">
                  <span className="text-truncate text-muted">{s.account.nickname}</span>
                  <span className="num fw-bold text-ink">{kes(s.amount)}</span>
                </div>
              ))}
            </div>
          }
        />
      </section>

      {/* ============================ 3.1 UTILITY CATEGORIES ============================ */}
      <SectionHead no="3.1" id="sec-categories" title="Pay a utility" sub="Eight categories, 20+ providers. Every payment is receipted, reconciled and auditable.">
        <Button variant="outline" size="sm" icon="plus" onClick={() => open({ kind: "addAccount" })}>
          Add meter / account
        </Button>
      </SectionHead>

      <div className="d-grid gap-3 sm-grid-cols-2 lg-grid-cols-4">
        {UTILITIES.map((u, i) => {
          const saved = accounts.filter((a) => a.utility === u.id);
          return (
            <button
              key={u.id}
              data-reveal
              onClick={() => open({ kind: "buy", utility: u.id })}
              style={{ animationDelay: `${i * 45}ms` }}
              className="card-hover group position-relative overflow-hidden rounded-5 border border-line bg-white p-4 text-start shadow-pm"
            >
              <span className="pe-none position-absolute right-n8 top-n8 h-24 w-24 rounded-full opacity-007 transition-transform duration-500 group-hover-scale-150" style={{ background: u.color }} />
              <div className="d-flex align-items-start justify-content-between">
                <span className="d-grid h-11 w-11 place-items-center rounded-13px" style={{ background: `${u.color}1a`, color: u.color }}>
                  <Icon name={u.icon} size={21} />
                </span>
                <span className="d-grid h-7 w-7 place-items-center rounded-3 bg-canvas text-muted transition group-hover-bg-ink group-hover-text-white">
                  <Icon name="arrow-up-right" size={14} />
                </span>
              </div>
              <p className="mt-3 font-display fs-145 fw-bold tracking-tight text-ink">{u.name}</p>
              <p className="mt-05 fs-115 leading-relaxed text-muted">{u.short}</p>
              <div className="mt-3 d-flex flex-wrap align-items-center gap-15">
                <Badge tone="muted">{u.providers.length} providers</Badge>
                {saved.length > 0 ? <Badge tone="success">{saved.length} saved</Badge> : <Badge tone="info">New</Badge>}
              </div>
              <p className="mt-3 border-top border-line pt-25 fs-11 leading-relaxed text-muted">{u.blurb}</p>
              {u.bundles && (
                <p className="mt-2 fs-11 fw-semibold text-ink-2">
                  From <span className="num">{kes(Math.min(...u.bundles.map((b) => b.price)))}</span>
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================ 3.2 SAVED ACCOUNTS ============================ */}
      <SectionHead no="3.2" id="sec-accounts" title="Saved meters & accounts" sub="Two-tap payments for the accounts you settle every month.">
        <div className="d-flex flex-wrap gap-2">
          <Chip on={accFilter === "all"} onClick={() => setAccFilter("all")} count={accounts.length}>
            All
          </Chip>
          <Chip on={accFilter === "autopay"} onClick={() => setAccFilter("autopay")} count={accounts.filter((a) => a.autopay).length}>
            On autopay
          </Chip>
          <Chip on={accFilter === "due"} onClick={() => setAccFilter("due")} count={accounts.filter((a) => a.dueInDays !== undefined).length}>
            Bill due
          </Chip>
        </div>
      </SectionHead>

      {accounts.length === 0 ? (
        <Card>
          <Empty
            icon="bolt"
            title="No saved accounts yet"
            sub="Add a KPLC meter, water account or smartcard and it becomes a one-tap payment."
            action={<Button icon="plus" onClick={() => open({ kind: "addAccount" })}>Add your first account</Button>}
          />
        </Card>
      ) : accFilter !== "all" && shownAccounts.length === 0 ? (
          <Card>
            <Empty
              icon={accFilter === "autopay" ? "repeat" : "calendar"}
              title={accFilter === "autopay" ? "No accounts on autopay" : "No bills due right now"}
              sub={accFilter === "autopay" ? "Turn on autopay from any saved account card to automate it." : "Every scheduled bill for this workspace is settled."}
              action={<Button variant="outline" icon="refresh" onClick={() => setAccFilter("all")}>Show all accounts</Button>}
            />
          </Card>
        ) : (
        <div className="d-grid gap-3 sm-grid-cols-2 xl-grid-cols-3">
          {shownAccounts.map((a, i) => {
            const u = utilityOf(a.utility);
            const overdue = a.dueInDays !== undefined && a.dueInDays <= 2;
            return (
              <div key={a.id} data-reveal style={{ animationDelay: `${i * 40}ms` }} className="card-hover position-relative d-flex flex-column rounded-5 border border-line bg-white p-4 shadow-pm">
                <div className="d-flex align-items-start gap-3">
                  <span className="d-grid h-11 w-11 flex-none place-items-center rounded-13px" style={{ background: `${u.color}1a`, color: u.color }}>
                    <Icon name={u.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="d-flex flex-wrap align-items-center gap-15">
                      <p className="text-truncate fs-135 fw-bold text-ink">{a.nickname}</p>
                      {a.favourite && <Icon name="star" size={13} className="text-warn" />}
                    </div>
                    <p className="mt-05 fs-115 text-muted">
                      {a.provider} · <span className="num fw-semibold text-ink-2">{a.ref}</span>
                    </p>
                  </div>
                  <Menu
                    trigger={() => (
                      <span className="d-grid h-8 w-8 place-items-center rounded-3 text-muted transition hover-bg-canvas hover-text-ink">
                        <Icon name="more" size={16} />
                      </span>
                    )}
                    items={[
                      { label: "Buy / pay now", icon: "bolt", onClick: () => open({ kind: "buy", utility: a.utility, accountId: a.id }) },
                      { label: "Repeat last payment", icon: "repeat", onClick: () => open({ kind: "buy", utility: a.utility, accountId: a.id, amount: a.lastAmount }) },
                      { label: "Rename account", icon: "edit", onClick: () => open({ kind: "rename", account: a }) },
                      { label: a.autopay ? "Pause autopay" : "Set up autopay", icon: "sliders", onClick: () => open({ kind: "autopay", accountId: a.id }) },
                      { label: "Remove account", icon: "trash", onClick: () => open({ kind: "remove", account: a }), danger: true },
                    ]}
                  />
                </div>

                <div className="mt-3 d-flex flex-wrap align-items-center gap-15">
                  {a.autopay && (
                    <Badge tone="success" icon="repeat">
                      Autopay
                    </Badge>
                  )}
                  {a.dueInDays !== undefined && (
                    <Badge tone={overdue ? "danger" : a.dueInDays <= 4 ? "warning" : "muted"} icon="calendar">
                      Due in {a.dueInDays}d
                    </Badge>
                  )}
                  {a.lastUnits && <Badge tone="muted" icon="gauge">{a.lastUnits}</Badge>}
                </div>

                <div className="mt-3 flex-1 rounded-4 bg-paper-2 p-3">
                  <Row k="Last payment" v={a.lastDate === "—" ? "—" : `${kes(a.lastAmount)}`} />
                  <Row k="Last date" v={a.lastDate} />
                  {a.dueAmount ? <Row k="Estimated due" v={kes(a.dueAmount)} strong /> : <Row k="Estimated due" v="—" />}
                </div>

                <div className="mt-3 d-flex gap-2">
                  <Button className="flex-1" icon="bolt" onClick={() => open({ kind: "buy", utility: a.utility, accountId: a.id, amount: a.dueAmount ?? a.lastAmount })}>
                    {a.dueAmount ? `Pay ${kes(a.dueAmount)}` : `Buy ${kes(a.lastAmount || u.quick[2])}`}
                  </Button>
                  <IconBtn icon="repeat" label="Repeat last payment" tone="outline" onClick={() => open({ kind: "buy", utility: a.utility, accountId: a.id, amount: a.lastAmount })} />
                </div>
              </div>
            );
          })}

          <button
            data-reveal
            onClick={() => open({ kind: "addAccount" })}
            className="d-flex min-h-220px flex-column align-items-center justify-content-center gap-25 rounded-5 border-2 border-dashed border-line bg-white-60 p-4 text-center transition hover-border-pmgreen-50 hover-bg-pmgreen-soft-20"
          >
            <span className="d-grid h-12 w-12 place-items-center rounded-5 bg-canvas text-muted">
              <Icon name="plus" size={22} />
            </span>
            <p className="fs-135 fw-bold text-ink">Add another meter or account</p>
            <p className="max-w-30ch fs-115 leading-relaxed text-muted">KPLC, NCWSC, DSTV, fibre, gas, solar, SHA — verified in seconds.</p>
          </button>
        </div>
      )}

      {/* ============================ 3.3 INSIGHTS ============================ */}
      <SectionHead no="3.3" id="sec-insights" title="Spend insights" sub="Where the money goes, month by month — and what changed.">
        <Segmented value={range} onChange={setRange} size="sm" options={[{ value: "6", label: "6 months" }, { value: "8", label: "8 months" }]} />
        <Button variant="outline" size="sm" icon="download" onClick={() => open({ kind: "export" })}>
          Export
        </Button>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        {/* stacked bars */}
        <Card className="lg-col-span-2" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <p className="font-display fs-145 fw-bold tracking-tight text-ink">Monthly utility spend</p>
              <p className="mt-05 fs-115 text-muted">
                {kes(juneTotal)} in June · <span className={cn("fw-bold", growth > 0 ? "text-danger-ink" : "text-pmgreen-ink")}>{growth > 0 ? "+" : ""}{growth.toFixed(1)}%</span> vs May
              </p>
            </div>
            <div className="d-flex flex-wrap gap-x-3 gap-y-15">
              {SERIES.map((s) => (
                <span key={s.key} className="d-flex align-items-center gap-15 fs-11 fw-semibold text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 d-flex align-items-end gap-2 sm-gap-3" style={{ height: 208 }}>
            {monthData.map((m, mi) => {
              const total = m.electricity + m.water + m.tv + m.internet + m.other;
              return (
                <div key={m.month} className="group position-relative d-flex h-100 flex-1 flex-column justify-content-end">
                  <div className="pe-none position-absolute top-n1 left-1-2 z-10 d-none translate-x-n1-2 translate-y-nfull text-nowrap rounded-3 bg-ink px-25 py-15 fs-11 fw-semibold text-white shadow-pm-lg group-hover-d-block">
                    {kes(total)}
                    <span className="mt-1 d-block space-y-05">
                      {SERIES.map((s) => (
                        <span key={s.key} className="d-flex align-items-center justify-content-between gap-2">
                          <span className="d-flex align-items-center gap-1">
                            <span className="h-15 w-15 rounded-full" style={{ background: s.color }} />
                            {s.label}
                          </span>
                          <span className="num">{kes(m[s.key])}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="d-flex w-100 flex-column justify-content-end overflow-hidden rounded-t-lg transition-opacity group-hover-opacity-90" style={{ height: `${(total / maxTotal) * 100}%` }}>
                    {SERIES.map((s, si) => (
                      <div
                        key={s.key}
                        className="bar-grow w-100"
                        style={{ background: s.color, height: `${(m[s.key] / total) * 100}%`, animationDelay: `${mi * 55 + si * 30}ms`, opacity: si === 4 ? 0.7 : 1 }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-center fs-105 fw-semibold text-muted">{m.month}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 d-grid gap-2 border-top border-line pt-4 sm-grid-cols-3">
            {[
              { k: "Avg / month", v: kes(Math.round(monthData.reduce((s, m) => s + m.electricity + m.water + m.tv + m.internet + m.other, 0) / monthData.length)) },
              { k: "Peak month", v: `Jun · ${kes(juneTotal)}` },
              { k: "Fees paid YTD", v: kes(150) },
            ].map((x) => (
              <div key={x.k} className="rounded-4 bg-paper-2 p-3">
                <p className="fs-105 fw-bold text-uppercase tracking-wide text-faint">{x.k}</p>
                <p className="num mt-05 font-display fs-15 fw-extrabold text-ink">{x.v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* donut + insights */}
        <div className="space-y-3">
          <Card hover>
            <p className="font-display fs-145 fw-bold tracking-tight text-ink">June by utility</p>
            <div className="mt-4 d-flex flex-column align-items-center gap-4 flex-sm-row">
              <Donut
                data={SPEND_BY_UTILITY}
                center={
                  <>
                    <p className="num font-display fs-16 fw-extrabold text-ink">{kes(juneTotal)}</p>
                    <p className="fs-105 fw-semibold text-muted">total June</p>
                  </>
                }
              />
              <div className="w-100 flex-1 space-y-2">
                {SPEND_BY_UTILITY.map((s) => (
                  <div key={s.label} className="d-flex align-items-center gap-2">
                    <span className="h-25 w-25 flex-none rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 text-truncate fs-12 fw-semibold text-ink-2">{s.label}</span>
                    <span className="num fs-12 fw-bold text-ink">{kes(s.value)}</span>
                    <span className="num w-9 text-end fs-11 text-muted">{Math.round((s.value / juneTotal) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card hover>
            <div className="d-flex align-items-center gap-2">
              <Icon name="sparkle" size={16} className="text-pmviolet" />
              <p className="font-display fs-145 fw-bold tracking-tight text-ink">What we noticed</p>
            </div>
            <div className="mt-3 space-y-25">
              {[
                { icon: "trend-up" as const, tone: "warning" as Tone, t: "Electricity up 78%", d: "Shop meter used 595 kWh — consider a postpaid plan." },
                { icon: "repeat" as const, tone: "success" as Tone, t: "Autopay saved KES 4,200", d: "12 rule runs replaced manual top-ups this quarter." },
                { icon: "alert" as const, tone: "danger" as Tone, t: "1 payment failed", d: "NCWSC KES 1,800 on 03 Jun — retry from wallet?" },
                { icon: "tag" as const, tone: "info" as Tone, t: "DSTV is 32% of spend", d: "Downgrading to Compact saves KES 5,000 / month." },
              ].map((n) => (
                <div key={n.t} className="d-flex gap-25 rounded-4 border border-line bg-paper-2 p-3">
                  <Badge tone={n.tone} icon={n.icon} className="h-6" />
                  <div className="min-w-0 flex-1">
                    <p className="fs-125 fw-bold text-ink">{n.t}</p>
                    <p className="mt-05 fs-115 leading-relaxed text-muted">{n.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ============================ 3.4 SCHEDULES & AUTOPAY ============================ */}
      <SectionHead no="3.4" id="sec-autopay" title="Bills, schedules & autopay" sub="Never miss a due date — PayMo pays on the day you choose and shows you the receipt.">
        <Button variant="outline" size="sm" icon="sliders" onClick={() => open({ kind: "autopay" })}>
          Manage autopay
        </Button>
      </SectionHead>

      <div className="d-grid gap-3 lg-grid-cols-3">
        <Card className="lg-col-span-2">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <p className="font-display fs-145 fw-bold tracking-tight text-ink">Upcoming payments</p>
            <Badge tone="warning" dot>
              {SCHEDULES.length} scheduled
            </Badge>
          </div>
          <div className="mt-3 divide-y divide-line">
            {SCHEDULES.map((s) => {
              const u = utilityOf(s.account.utility);
              const urgent = s.dueInDays <= 2;
              return (
                <div key={s.id} className="d-flex flex-wrap align-items-center gap-3 py-3">
                  <div className={cn("d-grid h-12 w-12 flex-none place-items-center rounded-4 border", urgent ? "border-danger-25 bg-danger-soft" : "border-line bg-paper-2")}>
                    <span className="font-display fs-13 fw-extrabold lh-1 text-ink">{s.date.split(" ")[0]}</span>
                    <span className="fs-95 fw-bold text-uppercase tracking-wide text-muted">{s.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="d-flex flex-wrap align-items-center gap-15">
                      <p className="text-truncate fs-13 fw-bold text-ink">{s.label}</p>
                      {urgent && <Badge tone="danger" dot>Due in {s.dueInDays}d</Badge>}
                      {!urgent && s.dueInDays <= 4 && <Badge tone="warning" dot>Due in {s.dueInDays}d</Badge>}
                    </div>
                    <p className="mt-05 text-truncate fs-115 text-muted">
                      {s.account.provider} · <span className="num">{s.account.ref}</span> · {s.method}
                    </p>
                  </div>
                  <div className="num text-end">
                    <p className="fs-135 fw-extrabold text-ink">{kes(s.amount)}</p>
                    <p className="fs-11 text-muted">{u.name}</p>
                  </div>
                  <Button size="sm" variant={urgent ? "primary" : "outline"} icon="bolt" onClick={() => open({ kind: "buy", utility: s.account.utility, accountId: s.account.id, amount: s.amount })}>
                    Pay now
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-3">
          <Card hover className="bg-gradient-to-br from-ink to-123a2c text-white">
            <div className="d-flex align-items-center gap-2">
              <Icon name="repeat" size={17} className="text-pmgreen" />
              <p className="font-display fs-145 fw-bold tracking-tight">Autopay at a glance</p>
            </div>
            <div className="mt-3 d-grid grid-cols-2 gap-2">
              <div className="rounded-4 bg-white-07 p-3">
                <p className="num font-display fs-20 fw-extrabold">{accounts.filter((a) => a.autopay).length}</p>
                <p className="fs-11 text-white-55">active rules</p>
              </div>
              <div className="rounded-4 bg-white-07 p-3">
                <p className="num font-display fs-20 fw-extrabold">0</p>
                <p className="fs-11 text-white-55">missed bills</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {accounts
                .filter((a) => a.autopay)
                .slice(0, 3)
                .map((a) => (
                  <div key={a.id} className="d-flex align-items-center gap-25 rounded-4 bg-white-05 p-25">
                    <span className="d-grid h-7 w-7 flex-none place-items-center rounded-3 bg-white-10 text-pmgreen">
                      <Icon name={utilityOf(a.utility).icon} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="d-block text-truncate fs-12 fw-bold">{a.nickname}</span>
                      <span className="d-block text-truncate fs-105 text-white-50">{a.provider}</span>
                    </span>
                    <span className="live-dot" />
                  </div>
                ))}
            </div>
            <Button variant="white" full className="mt-3" icon="sliders" onClick={() => open({ kind: "autopay" })}>
              Tune rules
            </Button>
          </Card>

          <Card hover id="sec-alerts">
            <div className="d-flex align-items-center gap-2">
              <Icon name="bell" size={16} className="text-pmgreen" />
              <p className="font-display fs-145 fw-bold tracking-tight text-ink">Reminders</p>
              <Badge tone="muted" className="ms-auto">
                {NOTICES.length} new
              </Badge>
            </div>
            <div className="mt-3 space-y-2">
              {NOTICES.slice(0, 3).map((n) => (
                <div key={n.id} className="rounded-4 border border-line bg-paper-2 p-3">
                  <div className="d-flex align-items-start gap-2">
                    <Badge tone={n.tone} icon={n.icon} className="h-6" />
                    <p className="flex-1 fs-125 fw-bold text-ink">{n.title}</p>
                  </div>
                  <p className="mt-15 fs-115 leading-relaxed text-muted">{n.body}</p>
                  {n.cta && (
                    <button
                      onClick={() => {
                        if (n.id === "n1") open({ kind: "buy", utility: "electricity", accountId: "acc-1" });
                        else if (n.id === "n2") open({ kind: "txn", txn: txns.find((t) => t.ref === "TXN-4490") ?? txns[0] });
                        else if (n.id === "n5") open({ kind: "buy", utility: "water", accountId: "acc-3" });
                        else open({ kind: "history" });
                      }}
                      className="focus-ring mt-2 d-inline-flex align-items-center gap-1 fs-12 fw-bold text-pmgreen-ink transition hover-gap-15"
                    >
                      {n.cta} <Icon name="arrow-right" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ============================ 3.5 PAYMENT METHODS ============================ */}
      <SectionHead no="3.5" id="sec-methods" title="Funding sources" sub="Mix channels per payment — M-Pesa for speed, wallet for zero fees, bank for big bills.">
        <Button variant="outline" size="sm" icon="plus" onClick={() => open({ kind: "topup" })}>
          Top up wallet
        </Button>
      </SectionHead>

      <div className="d-grid gap-3 sm-grid-cols-2 xl-grid-cols-4">
        {PAY_METHODS.map((m, i) => (
          <div key={m.id} data-reveal style={{ animationDelay: `${i * 40}ms` }} className="card-hover rounded-5 border border-line bg-white p-4 shadow-pm">
            <div className="d-flex align-items-start justify-content-between">
              <span className="d-grid h-11 w-11 place-items-center rounded-13px bg-canvas text-muted">
                <Icon name={m.icon} size={20} />
              </span>
              {m.primary && <Badge tone="success">Default</Badge>}
            </div>
            <p className="mt-3 font-display fs-14 fw-bold text-ink">{m.name}</p>
            <p className="mt-05 fs-115 text-muted">{m.sub}</p>
            <div className="mt-3 rounded-4 bg-paper-2 p-3">
              <Row k="Fee" v={m.fee === 0 ? "Free" : `+${kes(m.fee)}`} />
              <Row k="Limit / txn" v={kes(150000)} />
              {m.balance !== undefined ? <Row k="Available" v={kes(m.balance)} strong /> : <Row k="Available" v="Linked" strong />}
            </div>
            <div className="mt-3 d-flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" icon="bolt" onClick={() => open({ kind: "buy", utility: "electricity" })}>
                Use to pay
              </Button>
              <IconBtn icon="sliders" label="Settings" tone="outline" onClick={() => toast({ title: `${m.name} settings`, msg: "Limits, defaults and notifications.", tone: "info" })} />
            </div>
          </div>
        ))}
      </div>

      {/* ============================ 3.6 HISTORY ============================ */}
      <SectionHead no="3.6" id="sec-history" title="Transaction history" sub="Every payment, receipted and reconciled — searchable, filterable, exportable.">
        <Button variant="outline" size="sm" icon="download" onClick={() => open({ kind: "export" })}>
          Export
        </Button>
        <Button size="sm" icon="receipt" onClick={() => open({ kind: "history" })}>
          Open full history
        </Button>
      </SectionHead>

      <Card className="p-0">
        {/* toolbar */}
        <div className="space-y-3 border-bottom border-line p-4">
          <div className="d-flex flex-wrap gap-2">
            <div className="min-w-200px flex-1">
              <Input icon="search" placeholder="Search reference, provider, account, nickname…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={utility} onChange={(e) => setUtility(e.target.value)} className="w-auto">
              <option value="all">All utilities</option>
              {UTILITIES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
            <Segmented
              value={sort}
              onChange={setSort}
              size="sm"
              options={[
                { value: "date", label: "Newest", icon: "calendar" },
                { value: "amount", label: "Largest", icon: "sort" },
              ]}
            />
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {(["all", "Success", "Pending", "Failed"] as const).map((s) => (
              <Chip key={s} on={status === s} onClick={() => setStatus(s)} count={s === "all" ? txns.length : txns.filter((t) => t.status === s).length}>
                {s === "all" ? "All" : s}
              </Chip>
            ))}
            <span className="ms-auto fs-115 fw-semibold text-muted">
              {rows.length} of {txns.length} shown
            </span>
          </div>
        </div>

        {rows.length === 0 ? (
          <Empty
            icon="search"
            title="Nothing matches those filters"
            sub="Clear the search or pick a different utility to see your payments."
            action={
              <Button
                variant="outline"
                icon="refresh"
                onClick={() => {
                  setQ("");
                  setStatus("all");
                  setUtility("all");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            {/* desktop table */}
            <div className="d-none overflow-x-auto d-lg-block">
              <table className="w-100 min-w-840px">
                <thead className="bg-paper-2">
                  <tr className="text-start fs-105 fw-bold text-uppercase tracking-0-1em text-faint">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Utility</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3 text-end">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((t) => {
                    const u = utilityOf(t.utility);
                    return (
                      <tr key={t.id} onClick={() => open({ kind: "txn", txn: t })} className="cursor-pointer transition hover-bg-paper-3">
                        <td className="text-nowrap px-4 py-3 fs-12 fw-semibold text-ink-2">
                          {t.date}
                          <span className="ms-15 fs-11 fw-normal text-faint">{t.time}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="d-flex align-items-center gap-2">
                            <span className="d-grid h-8 w-8 flex-none place-items-center rounded-3" style={{ background: `${u.color}1a`, color: u.color }}>
                              <Icon name={u.icon} size={15} />
                            </span>
                            <span className="fs-125 fw-semibold text-ink">{u.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 fs-125 fw-semibold text-ink-2">{t.provider}</td>
                        <td className="px-4 py-3">
                          <span className="num fs-12 text-muted">{t.account}</span>
                          <span className="d-block fs-11 text-faint">{t.nickname}</span>
                        </td>
                        <td className="num px-4 py-3 text-end fs-13 fw-bold text-ink">{kes(t.amount)}</td>
                        <td className="px-4 py-3">
                          <span className="d-inline-flex align-items-center gap-15 fs-12 text-muted">
                            <Icon name={PAY_METHODS.find((m) => m.name === t.method)?.icon ?? "wallet"} size={14} className="text-faint" />
                            {t.method}
                          </span>
                        </td>
                        <td className="num px-4 py-3 fs-115 fw-semibold text-muted">{t.ref}</td>
                        <td className="px-4 py-3">
                          <Badge tone={t.status === "Success" ? "success" : t.status === "Pending" ? "warning" : "danger"} dot>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Icon name="chevron-right" size={15} className="text-faint" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* mobile / tablet cards */}
            <div className="divide-y divide-line d-lg-none">
              {rows.map((t) => {
                const u = utilityOf(t.utility);
                return (
                  <button key={t.id} onClick={() => open({ kind: "txn", txn: t })} className="d-flex w-100 align-items-center gap-3 p-35 text-start transition active-bg-paper-3">
                    <span className="d-grid h-10 w-10 flex-none place-items-center rounded-4" style={{ background: `${u.color}1a`, color: u.color }}>
                      <Icon name={u.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="d-flex align-items-center justify-content-between gap-2">
                        <span className="text-truncate fs-13 fw-bold text-ink">{t.provider}</span>
                        <span className="num fs-13 fw-extrabold text-ink">{kes(t.amount)}</span>
                      </span>
                      <span className="mt-05 d-flex align-items-center justify-content-between gap-2">
                        <span className="num text-truncate fs-115 text-muted">
                          {t.date} · {t.account}
                        </span>
                        <Badge tone={t.status === "Success" ? "success" : t.status === "Pending" ? "warning" : "danger"}>{t.status}</Badge>
                      </span>
                      {t.units && <span className="mt-05 d-block fs-11 fw-semibold text-pmgreen-ink">{t.units} purchased</span>}
                    </span>
                    <Icon name="chevron-right" size={15} className="flex-none text-faint" />
                  </button>
                );
              })}
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-top border-line bg-paper-2 px-4 py-35">
              <p className="fs-115 text-muted">
                Showing {rows.length} of {txns.length} · gross {kes(txns.reduce((s, t) => s + t.amount, 0))}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>
                  Export
                </Button>
                <Button size="sm" variant="dark" icon="list" onClick={() => open({ kind: "history" })}>
                  Full history
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ============================ SUPPORT ============================ */}
      <section className="mt-6 d-grid gap-3 lg-grid-cols-3" data-reveal>
        <Card className="lg-col-span-2 bg-gradient-to-br from-ink via-0f2233 to-0d5c38 text-white" hover>
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
            <div className="max-w-46ch">
              <Badge tone="dark" className="border border-white-15 bg-white-10 text-white-80">
                Support
              </Badge>
              <h3 className="mt-3 font-display fs-19 fw-extrabold tracking-tight">Humans on WhatsApp, 24/7</h3>
              <p className="mt-2 fs-13 leading-relaxed text-white-65">
                Median first reply is 47 seconds. Share a reference and we trace it across M-Pesa, the bank and the provider while you wait.
              </p>
              <div className="mt-4 d-flex flex-wrap gap-2">
                <Button variant="white" icon="phone" onClick={() => open({ kind: "help" })}>
                  Start a chat
                </Button>
                <Button variant="white" icon="gauge" onClick={() => open({ kind: "tariff" })}>
                  Tariff & fees
                </Button>
                <Button variant="white" icon="help" onClick={() => open({ kind: "help" })}>
                  FAQ
                </Button>
              </div>
            </div>
            <div className="d-grid grid-cols-2 gap-2 sm-grid-cols-1">
              {[
                { k: "First reply", v: "47s", i: "clock" as const },
                { k: "Resolution", v: "3.2 hrs", i: "check-circle" as const },
                { k: "Auto-reversals", v: "100%", i: "refresh" as const },
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
            <Icon name="target" size={16} className="text-pmgreen" />
            <p className="font-display fs-145 fw-bold tracking-tight text-ink">Cut next month's bill</p>
          </div>
          <div className="mt-3 space-y-25">
            {[
              { t: "Shift the shop meter to postpaid", v: "Save ~KES 2,400/mo" },
              { t: "DSTV Premium → Compact", v: "Save KES 5,000/mo" },
              { t: "Fund with wallet, not card", v: "Save KES 390/mo in fees" },
            ].map((x) => (
              <div key={x.t} className="d-flex align-items-start gap-25 rounded-4 border border-line bg-paper-2 p-3">
                <Icon name="check-circle" size={16} className="mt-05 flex-none text-pmgreen" />
                <div className="min-w-0 flex-1">
                  <p className="fs-125 fw-bold text-ink">{x.t}</p>
                  <p className="num mt-05 fs-115 fw-semibold text-pmgreen-ink">{x.v}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3" full variant="soft" icon="sparkle" onClick={() => open({ kind: "autopay" })}>
            Apply with autopay
          </Button>
        </Card>
      </section>
    </div>
  );
}

/* ============================== KPI card ============================== */

function Kpi({
  label,
  value,
  delta,
  deltaNote,
  icon,
  tone,
  spark,
  custom,
}: {
  label: string;
  value: string;
  delta: number;
  deltaNote: string;
  icon: Parameters<typeof Icon>[0]["name"];
  tone: Tone;
  spark?: React.ReactNode;
  custom?: React.ReactNode;
}) {
  const bg: Record<string, string> = {
    success: "bg-pmgreen-soft text-pmgreen-ink",
    warning: "bg-warn-soft text-warn-ink",
    info: "bg-pmblue-soft text-pmblue-ink",
    violet: "bg-pmviolet-soft text-pmviolet-ink",
    danger: "bg-danger-soft text-danger-ink",
    muted: "bg-canvas text-muted",
    teal: "bg-pmteal-soft text-pmteal-ink",
    dark: "bg-ink text-white",
  };
  return (
    <div className="card-hover rounded-5 border border-line bg-white p-4 shadow-pm">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="min-w-0">
          <p className="fs-11 fw-bold text-uppercase tracking-0-12em text-faint">{label}</p>
          <p className="num mt-15 font-display fs-21 fw-extrabold lh-1 tracking-tight text-ink">{value}</p>
        </div>
        <span className={cn("d-grid h-9 w-9 flex-none place-items-center rounded-11px", bg[tone])}>
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="mt-3 d-flex align-items-end justify-content-between gap-3">
        <div className="min-w-0">
          {delta !== 0 && (
            <span className={cn("d-inline-flex align-items-center gap-1 rounded-2 px-15 py-05 fs-11 fw-bold", delta > 0 ? "bg-danger-soft text-danger-ink" : "bg-pmgreen-soft text-pmgreen-ink")}>
              <Icon name={delta > 0 ? "trend-up" : "trend-down"} size={12} />
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          <p className="mt-1 text-truncate fs-11 leading-relaxed text-muted">{deltaNote}</p>
        </div>
        {spark}
      </div>
      {custom}
    </div>
  );
}
