import { useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Button, Chip, CopyBtn, Drawer, DrawerHead, Empty, Field, Input, Modal, Row, Segmented, Select, Toggle, downloadCSV } from "./ui";
import { AUTOPAY_RULES, FAQ, MODULES, PAY_METHODS, TARIFF, UTILITIES, kes, num, utilityOf, type Txn } from "./data";
import { useApp } from "./store";

/* ====================================================================== */
/*                          TRANSACTION RECEIPT                           */
/* ====================================================================== */

export function TxnDrawer() {
  const { dialog, close, open, toast, accounts } = useApp();
  const txn = dialog.kind === "txn" ? dialog.txn : null;
  if (!txn) return null;
  const u = utilityOf(txn.utility);
  const statusTone = txn.status === "Success" ? "success" : txn.status === "Pending" ? "warning" : "danger";

  const timeline = [
    { t: "Payment initiated", d: `${txn.date} · ${txn.time}`, done: true },
    { t: `${txn.method} debited`, d: `${kes(txn.amount + txn.fee, 2)} · authorised by J. Mwangi`, done: true },
    { t: `${txn.provider} notified`, d: txn.status === "Pending" ? "Awaiting provider confirmation" : `Confirmed in 6s · ref ${txn.ref}`, done: txn.status === "Success" },
    {
      t: txn.token ? "Token generated" : txn.status === "Failed" ? "Payment failed" : "Account credited",
      d: txn.status === "Failed" ? txn.note ?? "Rejected by provider" : txn.token ? `SMS sent to 0712 *** 890` : txn.note ?? "Receipt emailed",
      done: txn.status === "Success",
    },
  ];

  return (
    <Drawer open onClose={close} width="max-w-[480px]">
      <DrawerHead title={`${u.name} receipt`} subtitle={`${txn.ref} · ${txn.date} ${txn.time}`} icon={u.icon} onClose={close} />

      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        {/* status banner */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-4",
            txn.status === "Success" && "bg-gradient-to-br from-pmgreen-soft to-white border border-pmgreen/25",
            txn.status === "Pending" && "bg-gradient-to-br from-warn-soft to-white border border-warn/30",
            txn.status === "Failed" && "bg-gradient-to-br from-danger-soft to-white border border-danger/25"
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "grid h-11 w-11 flex-none place-items-center rounded-xl bg-white shadow-sm",
                txn.status === "Success" && "text-[#067647]",
                txn.status === "Pending" && "text-[#93370d]",
                txn.status === "Failed" && "text-[#b42318]"
              )}
            >
              <Icon name={txn.status === "Success" ? "check-circle" : txn.status === "Pending" ? "clock" : "alert"} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-[17px] font-extrabold text-ink">{kes(txn.amount, 2)}</p>
                <Badge tone={statusTone} dot>
                  {txn.status}
                </Badge>
              </div>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {txn.provider} · {txn.nickname}
              </p>
            </div>
          </div>
          {txn.status === "Pending" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="dark"
                icon="refresh"
                onClick={() => toast({ title: "Status refreshed", msg: "Equity confirmed settlement — receipt updated.", tone: "success" })}
              >
                Refresh status
              </Button>
              <Button size="sm" variant="outline" icon="help" onClick={() => open({ kind: "report", txn })}>
                Query payment
              </Button>
            </div>
          )}
          {txn.status === "Failed" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" icon="repeat" onClick={() => open({ kind: "buy", utility: txn.utility, accountId: txn.account })}>
                Retry payment
              </Button>
            </div>
          )}
        </div>

        {/* token */}
        {txn.token && (
          <div className="mt-4 rounded-2xl border border-pmgreen/30 bg-pmgreen-soft/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#067647]">KPLC token</p>
            <p className="num mt-1.5 font-display text-[18px] font-extrabold tracking-[0.05em] text-ink sm:text-[20px]">{txn.token}</p>
            <div className="mt-2.5">
              <CopyBtn text={txn.token} label="Copy token" />
            </div>
          </div>
        )}

        {/* details */}
        <div className="mt-4 rounded-2xl border border-line bg-white p-4">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Transaction detail</p>
          <Row k="Reference" v={<span className="inline-flex items-center gap-2">{txn.ref}</span>} />
          <Row k={u.accountLabel} v={txn.account} />
          <Row k="Nickname" v={txn.nickname} />
          {txn.units && <Row k="Units delivered" v={txn.units} strong />}
          <Row k="Amount" v={kes(txn.amount, 2)} />
          <Row k="Convenience fee" v={txn.fee === 0 ? "Free" : kes(txn.fee, 2)} />
          <div className="my-1 h-px bg-line" />
          <Row k="Total debited" v={kes(txn.amount + txn.fee, 2)} strong />
          <Row k="Paid with" v={txn.method} />
          <Row k="Channel" v="PayMo Business web · 3.1" />
          {txn.note && <Row k="Note" v={txn.note} />}
        </div>

        {/* timeline */}
        <div className="mt-4 rounded-2xl border border-line bg-white p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Settlement timeline</p>
          <ol className="relative space-y-4 border-l border-dashed border-line pl-5">
            {timeline.map((t) => (
              <li key={t.t} className="relative">
                <span
                  className={cn(
                    "absolute -left-[26px] grid h-4 w-4 place-items-center rounded-full border-2 bg-white",
                    t.done ? "border-pmgreen" : "border-[#d0d5dd]"
                  )}
                >
                  {t.done && <span className="h-1.5 w-1.5 rounded-full bg-pmgreen" />}
                </span>
                <p className={cn("text-[12.5px] font-bold", t.done ? "text-ink" : "text-muted")}>{t.t}</p>
                <p className="text-[11.5px] text-muted">{t.d}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" icon="download" onClick={() => toast({ title: "Receipt downloaded", msg: `${txn.ref}.pdf saved to your device.`, tone: "success" })}>
            Download
          </Button>
          <Button variant="outline" icon="share" onClick={() => toast({ title: "Receipt shared", msg: "Link copied — valid for 7 days.", tone: "info" })}>
            Share
          </Button>
          <Button variant="outline" icon="printer" onClick={() => toast({ title: "Sent to printer", msg: "A5 receipt format selected.", tone: "info" })}>
            Print
          </Button>
          <Button variant="outline" icon="mail" onClick={() => toast({ title: "Receipt emailed", msg: "Sent to j@paymo.co.ke and the finance alias.", tone: "success" })}>
            Email
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line bg-[#fafbfd] px-4 py-3.5">
        <Button
          className="flex-1"
          icon="repeat"
          onClick={() => {
            close();
            open({ kind: "buy", utility: txn.utility, accountId: accounts.find((a) => a.ref === txn.account)?.id, amount: txn.amount });
          }}
        >
          Repeat this payment
        </Button>
        <Button variant="outline" icon="help" onClick={() => open({ kind: "report", txn })}>
          Report
        </Button>
      </div>
    </Drawer>
  );
}

/* ====================================================================== */
/*                            FULL HISTORY DRAWER                         */
/* ====================================================================== */

export function HistoryDrawer() {
  const { dialog, close, open, txns, toast } = useApp();
  const isOpen = dialog.kind === "history";
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "Success" | "Pending" | "Failed">("all");
  const [utility, setUtility] = useState("all");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [limit, setLimit] = useState(8);
  const [selected, setSelected] = useState<Txn | null>(null);

  const rows = useMemo(() => {
    let r = [...txns];
    if (status !== "all") r = r.filter((t) => t.status === status);
    if (utility !== "all") r = r.filter((t) => t.utility === utility);
    if (q.trim()) {
      const s = q.toLowerCase();
      r = r.filter((t) => `${t.ref} ${t.provider} ${t.account} ${t.nickname} ${t.method} ${kes(t.amount)}`.toLowerCase().includes(s));
    }
    r.sort((a, b) => (sort === "amount" ? b.amount - a.amount : b.iso.localeCompare(a.iso) || b.time.localeCompare(a.time)));
    return r;
  }, [txns, status, utility, q, sort]);

  if (!isOpen) return null;

  const total = rows.reduce((s, t) => s + t.amount, 0);

  return (
    <Drawer open onClose={close} width="max-w-[760px]">
      <DrawerHead
        title="Transaction history"
        subtitle={`${rows.length} payments · ${kes(total)} total value`}
        icon="receipt"
        onClose={close}
        actions={
          <Button size="sm" variant="outline" icon="download" className="mr-1" onClick={() => open({ kind: "export" })}>
            Export
          </Button>
        }
      />

      {selected ? (
        <div className="thin-scroll flex-1 overflow-y-auto p-4">
          <button onClick={() => setSelected(null)} className="focus-ring mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#067647]">
            <Icon name="chevron-left" size={14} /> Back to history
          </button>
          <ReceiptInline txn={selected} onOpenFull={() => open({ kind: "txn", txn: selected })} />
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="space-y-3 border-b border-line p-4">
            <div className="flex flex-wrap gap-2">
              <div className="min-w-[200px] flex-1">
                <Input icon="search" placeholder="Search reference, provider, account…" value={q} onChange={(e) => setQ(e.target.value)} />
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
            <div className="flex flex-wrap gap-2">
              {(["all", "Success", "Pending", "Failed"] as const).map((s) => (
                <Chip key={s} on={status === s} onClick={() => setStatus(s)} count={s === "all" ? txns.length : txns.filter((t) => t.status === s).length}>
                  {s === "all" ? "All" : s}
                </Chip>
              ))}
            </div>
          </div>

          <div className="thin-scroll flex-1 overflow-y-auto p-3">
            {rows.length === 0 ? (
              <Empty
                icon="search"
                title="No transactions match those filters"
                sub="Try clearing the search box or switching the utility filter."
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
                <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
                  <table className="w-full">
                    <thead className="bg-[#fafbfd]">
                      <tr className="text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Utility</th>
                        <th className="px-3 py-2.5">Account</th>
                        <th className="px-3 py-2.5 text-right">Amount</th>
                        <th className="px-3 py-2.5">Method</th>
                        <th className="px-3 py-2.5">Ref</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.slice(0, limit).map((t) => (
                        <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer transition hover:bg-[#f7f9fc]">
                          <td className="whitespace-nowrap px-3 py-2.5 text-[12px] font-semibold text-ink-2">
                            {t.date}
                            <span className="ml-1 text-[11px] font-normal text-faint">{t.time}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-2">
                              <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-canvas text-muted">
                                <Icon name={utilityOf(t.utility).icon} size={14} />
                              </span>
                              <span className="text-[12px] font-semibold text-ink">{t.provider}</span>
                            </span>
                          </td>
                          <td className="num px-3 py-2.5 text-[12px] text-muted">{t.account}</td>
                          <td className="num px-3 py-2.5 text-right text-[12.5px] font-bold text-ink">{kes(t.amount)}</td>
                          <td className="px-3 py-2.5 text-[12px] text-muted">{t.method}</td>
                          <td className="num px-3 py-2.5 text-[11.5px] font-semibold text-muted">{t.ref}</td>
                          <td className="px-3 py-2.5">
                            <Badge tone={t.status === "Success" ? "success" : t.status === "Pending" ? "warning" : "danger"} dot>
                              {t.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* mobile list */}
                <div className="space-y-2 md:hidden">
                  {rows.slice(0, limit).map((t) => (
                    <button key={t.id} onClick={() => setSelected(t)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left transition active:scale-[0.99]">
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted">
                        <Icon name={utilityOf(t.utility).icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12.5px] font-bold text-ink">{t.provider}</span>
                          <span className="num text-[12.5px] font-bold text-ink">{kes(t.amount)}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="num truncate text-[11.5px] text-muted">
                            {t.date} · {t.account}
                          </span>
                          <Badge tone={t.status === "Success" ? "success" : t.status === "Pending" ? "warning" : "danger"}>{t.status}</Badge>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {limit < rows.length && (
                  <div className="mt-3 flex justify-center">
                    <Button variant="outline" icon="chevron-down" onClick={() => setLimit((l) => l + 10)}>
                      Load 10 more ({rows.length - limit} left)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#fafbfd] px-4 py-3">
            <p className="text-[11.5px] text-muted">
              Showing {Math.min(limit, rows.length)} of {rows.length} · retention 7 years
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" icon="download" onClick={() => open({ kind: "export" })}>
                Export
              </Button>
              <Button size="sm" variant="dark" icon="receipt" onClick={() => toast({ title: "Statement queued", msg: "Monthly PDF statement will be emailed.", tone: "info" })}>
                Monthly statement
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function ReceiptInline({ txn, onOpenFull }: { txn: Txn; onOpenFull: () => void }) {
  const u = utilityOf(txn.utility);
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-canvas text-muted">
          <Icon name={u.icon} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-extrabold text-ink">
            {txn.provider} · {kes(txn.amount, 2)}
          </p>
          <p className="text-[11.5px] text-muted">
            {txn.date} {txn.time} · {txn.method}
          </p>
        </div>
        <Badge tone={txn.status === "Success" ? "success" : txn.status === "Pending" ? "warning" : "danger"} dot>
          {txn.status}
        </Badge>
      </div>
      <div className="mt-3 rounded-xl bg-[#fafbfd] p-3">
        <Row k="Reference" v={txn.ref} />
        <Row k={u.accountLabel} v={txn.account} />
        {txn.units && <Row k="Units" v={txn.units} />}
        <Row k="Fee" v={txn.fee === 0 ? "Free" : kes(txn.fee)} />
        <Row k="Total" v={kes(txn.amount + txn.fee, 2)} strong />
      </div>
      <Button className="mt-3" full icon="external" onClick={onOpenFull}>
        Open full receipt & timeline
      </Button>
    </div>
  );
}

/* ====================================================================== */
/*                                EXPORT                                  */
/* ====================================================================== */

export function ExportModal() {
  const { dialog, close, toast, txns } = useApp();
  const openM = dialog.kind === "export";
  const [fmt, setFmt] = useState<"csv" | "pdf" | "xls">("csv");
  const [range, setRange] = useState("30");
  const [cols, setCols] = useState<Record<string, boolean>>({ date: true, utility: true, account: true, amount: true, method: true, ref: true, status: true, units: false, fee: true });
  const [failed, setFailed] = useState(true);

  const headerMap: Record<string, string> = { date: "Date", utility: "Utility", account: "Account", amount: "Amount (KES)", method: "Method", ref: "Reference", status: "Status", units: "Units", fee: "Fee (KES)" };

  const run = () => {
    if (fmt === "csv") {
      const keys = Object.keys(cols).filter((k) => cols[k]);
      const rows: (string | number)[][] = [keys.map((k) => headerMap[k])];
      txns
        .filter((t) => failed || t.status !== "Failed")
        .forEach((t) =>
          rows.push(
            keys.map((k) =>
              k === "date" ? `${t.date} ${t.time}` : k === "utility" ? `${utilityOf(t.utility).name} · ${t.provider}` : k === "account" ? t.account : k === "amount" ? t.amount : k === "method" ? t.method : k === "ref" ? t.ref : k === "status" ? t.status : k === "units" ? (t.units ?? "") : t.fee
            )
          )
        );
      downloadCSV(`paymo-utilities-${range}d-${new Date().toISOString().slice(0, 10)}.csv`, rows);
      toast({ title: "Export ready", msg: `${rows.length - 1} transactions downloaded as CSV.`, tone: "success" });
    } else {
      toast({ title: `${fmt.toUpperCase()} queued`, msg: "Your export will land in your inbox in ~2 minutes.", tone: "info" });
    }
    close();
  };

  return (
    <Modal
      open={openM}
      onClose={close}
      icon="download"
      title="Export transactions"
      subtitle="Statement-ready files for your accountant"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button icon="download" onClick={run}>
            {fmt === "csv" ? "Download now" : `Email ${fmt.toUpperCase()}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="File format">
          <Segmented value={fmt} onChange={setFmt} options={[{ value: "csv", label: "CSV", icon: "file" }, { value: "pdf", label: "PDF", icon: "file" }, { value: "xls", label: "Excel", icon: "file" }]} />
        </Field>
        <Field label="Period">
          <Select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last quarter</option>
            <option value="365">This financial year</option>
            <option value="all">All time (14 records)</option>
          </Select>
        </Field>
        <Field label="Columns">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Object.keys(cols).map((k) => (
              <button
                key={k}
                onClick={() => setCols((c) => ({ ...c, [k]: !c[k] }))}
                className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[12px] font-semibold transition", cols[k] ? "border-pmgreen bg-pmgreen-soft/40 text-ink" : "border-line bg-white text-muted")}
              >
                <span className={cn("grid h-4 w-4 place-items-center rounded border", cols[k] ? "border-pmgreen bg-pmgreen text-white" : "border-[#d0d5dd]")}>
                  {cols[k] && <Icon name="check" size={11} strokeWidth={3} />}
                </span>
                {headerMap[k]}
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-3 rounded-xl border border-line bg-[#fafbfd] p-3">
          <Toggle on={failed} onChange={setFailed} label="Include failed" />
          <span className="text-[12.5px] font-medium text-ink-2">Include failed &amp; reversed payments</span>
        </label>
        <div className="rounded-xl bg-canvas p-3">
          <Row k="Records" v={failed ? txns.length : txns.filter((t) => t.status !== "Failed").length} />
          <Row k="Gross value" v={kes(txns.reduce((s, t) => s + t.amount, 0))} />
          <Row k="Fees paid" v={kes(txns.reduce((s, t) => s + t.fee, 0))} />
        </div>
      </div>
    </Modal>
  );
}

/* ====================================================================== */
/*                                AUTOPAY                                 */
/* ====================================================================== */

export function AutopayDrawer() {
  const { dialog, close, accounts, updateAccount, toast, open } = useApp();
  const isOpen = dialog.kind === "autopay";
  const [rules, setRules] = useState(AUTOPAY_RULES);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ accountId: accounts[0]?.id ?? "", trigger: "low", amount: 2500, method: "mpesa", cap: 8000 });

  if (!isOpen) return null;

  const activeCount = rules.filter((r) => r.on).length;

  return (
    <Drawer open onClose={close} width="max-w-[500px]">
      <DrawerHead title="Autopay rules" subtitle={`${activeCount} of ${rules.length} rules active · KES 12,800 saved in fees this year`} icon="repeat" onClose={close} />

      <div className="thin-scroll flex-1 overflow-y-auto p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { k: "Active rules", v: activeCount, i: "repeat" as const },
            { k: "Auto-paid (Jun)", v: kes(12799), i: "wallet" as const },
            { k: "Missed bills", v: "0", i: "check-circle" as const },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-line bg-[#fafbfd] p-3">
              <Icon name={s.i} size={15} className="text-pmgreen" />
              <p className="num mt-1.5 font-display text-[15px] font-extrabold text-ink">{s.v}</p>
              <p className="text-[11px] leading-tight text-muted">{s.k}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-white p-3.5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-canvas text-muted">
                  <Icon name={utilityOf(r.account.utility).icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[13px] font-bold text-ink">{r.account.nickname}</p>
                    {r.on ? <Badge tone="success" dot>Active</Badge> : <Badge tone="muted" dot>Paused</Badge>}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    {r.account.provider} · <span className="num">{r.account.ref}</span>
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-2">
                    <Icon name="clock" size={12} className="text-faint" /> {r.trigger}
                  </p>
                </div>
                <Toggle
                  on={r.on}
                  label={`Autopay ${r.account.nickname}`}
                  onChange={(v) => {
                    setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, on: v } : x)));
                    updateAccount(r.account.id, { autopay: v });
                    toast({ title: v ? "Autopay enabled" : "Autopay paused", msg: `${r.account.nickname} · ${r.trigger}`, tone: v ? "success" : "info" });
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
                <div>
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">Amount</p>
                  <Select
                    value={r.amount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, amount: val } : x)));
                    }}
                  >
                    {[1000, 2500, 3000, 5000, r.amount].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b).map((v) => (
                      <option key={v} value={v}>
                        {kes(v)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <p className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-faint">Pay with</p>
                  <Select
                    value={PAY_METHODS.find((m) => m.name === r.method)?.id ?? "mpesa"}
                    onChange={(e) => {
                      const val = PAY_METHODS.find((m) => m.id === e.target.value)?.name ?? "M-Pesa";
                      setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, method: val } : x)));
                    }}
                  >
                    {PAY_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon="bolt" onClick={() => open({ kind: "buy", utility: r.account.utility, accountId: r.account.id, amount: r.amount })}>
                  Run now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon="trash"
                  onClick={() => {
                    setRules((prev) => prev.filter((x) => x.id !== r.id));
                    toast({ title: "Rule deleted", msg: `${r.account.nickname} will no longer auto-pay.`, tone: "warn" });
                  }}
                >
                  Remove rule
                </Button>
              </div>
            </div>
          ))}
        </div>

        {adding ? (
          <div className="mt-4 rounded-2xl border border-pmgreen/30 bg-pmgreen-soft/25 p-4">
            <p className="mb-3 font-display text-[14px] font-bold text-ink">New autopay rule</p>
            <div className="space-y-3">
              <Field label="Account">
                <Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nickname} · {a.provider}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Trigger">
                <Select value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
                  <option value="low">When units fall below 10 kWh</option>
                  <option value="weekly">Weekly · Monday 08:00</option>
                  <option value="monthly">Monthly · on the 5th</option>
                  <option value="due">3 days before due date</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount (KES)">
                  <Input type="number" className="no-spin" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </Field>
                <Field label="Monthly cap (KES)">
                  <Input type="number" className="no-spin" value={form.cap} onChange={(e) => setForm({ ...form, cap: Number(e.target.value) })} />
                </Field>
              </div>
              <Field label="Funding method">
                <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {PAY_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.fee === 0 ? "free" : `+${kes(m.fee)}`}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
                <Button
                  icon="check"
                  onClick={() => {
                    const acc = accounts.find((a) => a.id === form.accountId);
                    if (acc) {
                      setRules((prev) => [
                        ...prev,
                        {
                          id: `r-${Date.now()}`,
                          account: acc,
                          trigger: form.trigger === "low" ? "When units < 10 kWh" : form.trigger === "weekly" ? "Weekly · Monday 8am" : form.trigger === "monthly" ? "Monthly on the 5th" : "3 days before due date",
                          amount: form.amount,
                          method: PAY_METHODS.find((m) => m.id === form.method)!.name,
                          on: true,
                        },
                      ]);
                      updateAccount(acc.id, { autopay: true });
                      toast({ title: "Autopay rule created", msg: `${acc.nickname} will auto-pay ${kes(form.amount)}.`, tone: "success" });
                    }
                    setAdding(false);
                  }}
                >
                  Create rule
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button className="mt-4" full icon="plus" onClick={() => setAdding(true)}>
            New autopay rule
          </Button>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-pmblue-soft/70 p-3">
          <Icon name="shield" size={16} className="mt-0.5 flex-none text-[#175cd3]" />
          <p className="text-[12px] leading-relaxed text-[#175cd3]">
            Every autopay run needs your PIN once per day. We pause a rule and alert you when 80% of its monthly cap is reached — no silent charges, ever.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

/* ====================================================================== */
/*                          SMALL MODALS & HELP                           */
/* ====================================================================== */

export function RenameModal() {
  const { dialog, close, updateAccount, toast } = useApp();
  const acc = dialog.kind === "rename" ? dialog.account : null;
  const [name, setName] = useState(acc?.nickname ?? "");
  return (
    <Modal
      open={!!acc}
      onClose={close}
      icon="edit"
      title="Rename account"
      subtitle={acc ? `${acc.provider} · ${acc.ref}` : ""}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            icon="check"
            onClick={() => {
              if (acc) {
                updateAccount(acc.id, { nickname: name || acc.nickname });
                toast({ title: "Account renamed", msg: `Now called “${name}”.`, tone: "success" });
              }
              close();
            }}
          >
            Save name
          </Button>
        </>
      }
    >
      <Field label="Nickname" hint="Shown on the dashboard, receipts and reminders">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home · Karen" icon="tag" />
      </Field>
    </Modal>
  );
}

export function RemoveModal() {
  const { dialog, close, removeAccount, toast } = useApp();
  const acc = dialog.kind === "remove" ? dialog.account : null;
  return (
    <Modal
      open={!!acc}
      onClose={close}
      tone="danger"
      icon="trash"
      title="Remove saved account?"
      subtitle={acc ? `${acc.nickname} · ${acc.provider} · ${acc.ref}` : ""}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Keep account
          </Button>
          <Button
            variant="danger"
            icon="trash"
            onClick={() => {
              if (acc) {
                removeAccount(acc.id);
                toast({ title: "Account removed", msg: `${acc.nickname} deleted. History is retained.`, tone: "warn" });
              }
              close();
            }}
          >
            Remove permanently
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-ink-2">
        This only removes the saved reference — <strong>past receipts stay in your history</strong> for 7 years. Any active autopay rule on this account will be paused.
      </p>
      <div className="mt-3 rounded-xl bg-danger-soft/50 p-3">
        <Row k="Autopay" v={acc?.autopay ? "Will be paused" : "None"} />
        <Row k="Receipts retained" v="Yes · 7 years" />
      </div>
    </Modal>
  );
}

export function ModuleModal() {
  const { dialog, close, toast, open } = useApp();
  const m = dialog.kind === "module" ? MODULES[dialog.moduleKey] : null;
  if (!m) return null;
  return (
    <Modal
      open
      onClose={close}
      icon={m.icon}
      title={m.title}
      subtitle="PayMo Business module"
      footer={
        <>
          <Button variant="outline" icon="bolt" onClick={() => open({ kind: "buy", utility: "electricity" })}>
            Back to utilities
          </Button>
          <Button icon="send" onClick={() => { toast({ title: "Request sent", msg: `${m.title} access will be enabled for your workspace.`, tone: "success" }); close(); }}>
            Request access
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-ink-2">{m.blurb}</p>
      <div className="mt-3 space-y-2">
        {m.points.map((p) => (
          <div key={p} className="flex items-start gap-2.5 rounded-xl border border-line bg-[#fafbfd] p-3">
            <Icon name="check-circle" size={16} className="mt-0.5 flex-none text-pmgreen" />
            <p className="text-[12.5px] font-medium text-ink-2">{p}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink p-4 text-white">
        <Icon name="sparkle" size={20} className="flex-none text-pmgreen" />
        <p className="text-[12.5px] leading-relaxed">
          You are currently on the <strong>Utilities 3.1</strong> page. All modules share one balance, one audit trail and one approval flow.
        </p>
      </div>
    </Modal>
  );
}

export function HelpModal() {
  const { dialog, close, toast } = useApp();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  if (dialog.kind !== "help") return null;
  const channels = [
    { icon: "phone" as const, name: "WhatsApp support", sub: "Median reply 47 seconds", cta: "Start chat" },
    { icon: "mail" as const, name: "Email finance desk", sub: "utilities@paymo.co.ke", cta: "Send email" },
    { icon: "lifebuoy" as const, name: "Book a call", sub: "Mon–Sat · 8am–8pm EAT", cta: "Pick a slot" },
  ];
  return (
    <Modal open onClose={close} width="max-w-[620px]" icon="lifebuoy" title="Help centre" subtitle="Answers, tariff explainers and 24/7 human support">
      <div className="grid gap-2 sm:grid-cols-3">
        {channels.map((c) => (
          <div key={c.name} className="flex flex-col rounded-xl border border-line bg-[#fafbfd] p-3.5">
            <Icon name={c.icon} size={18} className="text-pmgreen" />
            <p className="mt-2 text-[12.5px] font-bold text-ink">{c.name}</p>
            <p className="mt-0.5 flex-1 text-[11.5px] leading-relaxed text-muted">{c.sub}</p>
            <Button size="sm" variant="outline" className="mt-2.5" onClick={() => toast({ title: c.cta, msg: `${c.name} opening…`, tone: "info" })}>
              {c.cta}
            </Button>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Frequent questions</p>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {FAQ.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-[#fafbfd]">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-canvas text-[11px] font-bold text-muted">{i + 1}</span>
              <span className="flex-1 text-[12.5px] font-semibold text-ink">{f.q}</span>
              <Icon name={openIdx === i ? "chevron-up" : "chevron-down"} size={15} className="text-faint" />
            </button>
            {openIdx === i && <p className="px-3.5 pb-3.5 text-[12.5px] leading-relaxed text-muted">{f.a}</p>}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function TariffModal() {
  const { dialog, close, open } = useApp();
  if (dialog.kind !== "tariff") return null;
  return (
    <Modal open onClose={close} width="max-w-[560px]" icon="gauge" title="Tariff & fees" subtitle="ERC pass-through tariff · effective 01 Jul 2025">
      <div className="rounded-2xl border border-warn/30 bg-warn-soft/40 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#93370d]">Domestic prepaid rate</p>
        <p className="num mt-1 font-display text-[26px] font-extrabold text-ink">
          KES {TARIFF.toFixed(2)} <span className="text-[14px] font-bold text-muted">/ kWh</span>
        </p>
        <p className="mt-1 text-[11.5px] text-[#93370d]">Units are indicative — KPLC applies fixed charges, ERC levy & VAT on the final token.</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full">
          <thead className="bg-[#fafbfd] text-left text-[10.5px] font-bold uppercase tracking-wide text-faint">
            <tr>
              <th className="px-3 py-2.5">Component</th>
              <th className="px-3 py-2.5 text-right">Rate</th>
              <th className="px-3 py-2.5 text-right">On KES 2,000</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-[12.5px]">
            {[
              ["Energy charge", "KES 12.60 / kWh", "1,720"],
              ["Fixed charge", "KES 150 / month", "150"],
              ["ERC levy & WARMA", "KES 0.42 / kWh", "58"],
              ["VAT (16%)", "on chargeable", "72"],
              ["PayMo fee", "KES 0", "0"],
            ].map((r) => (
              <tr key={r[0]}>
                <td className="px-3 py-2.5 font-semibold text-ink-2">{r[0]}</td>
                <td className="num px-3 py-2.5 text-right text-muted">{r[1]}</td>
                <td className="num px-3 py-2.5 text-right font-bold text-ink">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Payment channel fees</p>
      <div className="space-y-2">
        {PAY_METHODS.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted">
              <Icon name={m.icon} size={15} />
            </span>
            <p className="flex-1 text-[12.5px] font-semibold text-ink">{m.name}</p>
            <Badge tone={m.fee === 0 ? "success" : "muted"}>{m.fee === 0 ? "Free" : `+${kes(m.fee)}`}</Badge>
          </div>
        ))}
      </div>
      <Button className="mt-4" full variant="outline" icon="bolt" onClick={() => { close(); open({ kind: "buy", utility: "electricity" }); }}>
        Buy tokens at this rate
      </Button>
    </Modal>
  );
}

export function ReportModal() {
  const { dialog, close, toast } = useApp();
  const txn = dialog.kind === "report" ? dialog.txn : null;
  const [kind, setKind] = useState("no-token");
  const [note, setNote] = useState("");
  if (dialog.kind !== "report") return null;
  return (
    <Modal
      open
      onClose={close}
      icon="alert"
      tone="danger"
      title="Report an issue"
      subtitle={txn ? `${txn.ref} · ${kes(txn.amount)} · ${txn.provider}` : ""}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon="send"
            onClick={() => {
              toast({ title: "Ticket opened", msg: "A specialist replies within 30 minutes on WhatsApp.", tone: "warn" });
              close();
            }}
          >
            Submit ticket
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="What went wrong?" required>
          <Select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="no-token">Token not received</option>
            <option value="wrong-units">Units look incorrect</option>
            <option value="double">Charged twice</option>
            <option value="not-credited">Account not credited</option>
            <option value="other">Something else</option>
          </Select>
        </Field>
        <Field label="Describe it" hint="Include any SMS or reference you received — it speeds up the trace.">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="e.g. STK push timed out at 14:31 but M-Pesa sent a confirmation SMS…"
            className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-medium text-ink outline-none transition focus:border-pmgreen focus:ring-4 focus:ring-pmgreen/12"
          />
        </Field>
        <div className="rounded-xl bg-[#fafbfd] p-3">
          <Row k="Auto-reverse policy" v="Within 24 hrs" />
          <Row k="Dispute SLA" v="First reply in 30 min" />
          <Row k="Evidence attached" v="Receipt + gateway logs" />
        </div>
      </div>
    </Modal>
  );
}

export { num };
