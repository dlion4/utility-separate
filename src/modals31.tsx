import { useEffect, useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Button, Chip, CopyBtn, Field, IconBtn, Input, KeyPad, Modal, PinDots, Progress, Row, Select, Segmented, Stepper, Toggle } from "./ui";
import { PAY_METHODS, TARIFF, UTILITIES, kes, num, utilityOf, type UtilityId } from "./data";
import { useApp } from "./store";

const rand = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
const genToken = () => [rand(4), rand(4), rand(4), rand(4), rand(4)].join("-");
const genRef = () => `TXN-PM-20250627-${rand(4)}`;

/* ====================================================================== */
/*                            BUY / PAY WIZARD                            */
/* ====================================================================== */

export function BuyWizard() {
  const { dialog, close, open, toast, accounts, pushTxn, updateAccount, balance, setBalance } = useApp();
  const active = dialog.kind === "buy" ? dialog : null;
  const [utilityId, setUtilityId] = useState<UtilityId>("electricity");
  const [step, setStep] = useState(0);
  const [providerId, setProviderId] = useState("");
  const [ref, setRef] = useState("");
  const [nickname, setNickname] = useState("");
  const [verified, setVerified] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [refErr, setRefErr] = useState("");
  const [postpaid, setPostpaid] = useState(false);
  const [amount, setAmount] = useState(2000);
  const [bundleId, setBundleId] = useState("");
  const [methodId, setMethodId] = useState("mpesa");
  const [remember, setRemember] = useState(true);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<{ token?: string; units?: number; refId: string; date: string } | null>(null);

  const utility = utilityOf(utilityId);
  const provider = utility.providers.find((p) => p.id === providerId) ?? utility.providers[0];
  const method = PAY_METHODS.find((m) => m.id === methodId)!;
  const bundle = utility.bundles?.find((b) => b.id === bundleId);
  const net = bundle ? bundle.price : amount;
  const fee = provider?.fee ?? 0;
  const total = net + fee;
  const units = utilityId === "electricity" && !postpaid ? net / TARIFF : undefined;
  const tokenMode = utility.successMode === "token" && !postpaid;

  /* --- initialise from dialog payload --- */
  useEffect(() => {
    if (!active) return;
    setUtilityId(active.utility);
    setStep(0);
    setPhase("idle");
    setResult(null);
    setPin("");
    setPinErr(false);
    setVerified(null);
    setBundleId("");
    setRefErr("");
    const acc = active.accountId ? accounts.find((a) => a.id === active.accountId) : undefined;
    if (acc) {
      setProviderId(acc.providerId);
      setRef(acc.ref);
      setNickname(acc.nickname);
      setVerified(acc.holder ?? acc.nickname);
      if (active.amount) setAmount(active.amount);
      else setAmount(Math.max(utilityOf(acc.utility).min, acc.lastAmount));
      if (utilityOf(acc.utility).bundles?.length) setBundleId(utilityOf(acc.utility).bundles![Math.min(1, utilityOf(acc.utility).bundles!.length - 1)].id);
    } else {
      setProviderId(utilityOf(active.utility).providers[0].id);
      setRef("");
      setNickname("");
      setAmount(active.amount ?? utilityOf(active.utility).quick[Math.min(2, utilityOf(active.utility).quick.length - 1)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dialog]);

  /* --- explicit utility switch (keeps prefills intact when opening for an account) --- */
  const switchUtility = (id: UtilityId) => {
    const u = utilityOf(id);
    setUtilityId(id);
    setProviderId(u.providers[0].id);
    setRef("");
    setNickname("");
    setVerified(null);
    setRefErr("");
    setPostpaid(false);
    setAmount(u.quick[Math.min(2, u.quick.length - 1)]);
    setBundleId(u.bundles?.[Math.min(1, u.bundles.length - 1)].id ?? "");
  };

  const stages = useMemo(
    () =>
      methodId === "mpesa"
        ? ["Sending STK push to 0712 *** 890", "Awaiting your M-Pesa PIN", `Settling with ${provider?.name}`, tokenMode ? "Generating token" : "Posting to account", "Done"]
        : [`Debiting ${method.name}`, `Settling with ${provider?.name}`, tokenMode ? "Generating token" : "Posting to account", "Done"],
    [methodId, method.name, provider?.name, tokenMode]
  );

  const validateRef = (v: string) => {
    const u = utility;
    if (u.mode === "phone") return /^(\+?254|0)7\d{8}$/.test(v.replace(/\s/g, "")) ? "" : "Enter a valid Kenyan mobile number e.g. 0712345678";
    if (u.mode === "meter") return /^\d{6,11}$/.test(v) ? "" : "Meter numbers are 6–11 digits";
    return v.trim().length >= 4 ? "" : `Enter a valid ${u.accountLabel.toLowerCase()} (min 4 characters)`;
  };

  const stepLabels = ["Account", "Amount", "Payment", "Authorise"];
  const canNext =
    step === 0 ? !validateRef(ref) && !!provider : step === 1 ? utility.bundles?.length ? !!bundle : amount >= utility.min && amount <= utility.max : step === 2 ? !!method : true;

  const run = () => {
    if (pin.length < 4) {
      setPinErr(true);
      window.setTimeout(() => setPinErr(false), 500);
      return;
    }
    setPhase("processing");
    setStage(0);
    stages.forEach((_, i) => {
      window.setTimeout(() => setStage(i + 1), 620 * (i + 1));
    });
    const doneAt = 620 * stages.length + 500;
    window.setTimeout(() => {
      const refId = genRef();
      const unitVal = units;
      const tokenVal = tokenMode ? genToken() : undefined;
      const date = new Date("2025-06-27T14:32:00");
      setResult({
        refId,
        date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", 14:32",
        token: tokenVal,
        units: unitVal ? Math.round(unitVal * 10) / 10 : undefined,
      });
      setPhase("done");
      if (methodId === "wallet") setBalance(Math.max(0, balance - total));
      const acc = accounts.find((a) => a.ref === ref);
      if (acc) updateAccount(acc.id, { lastAmount: net, lastDate: "27 Jun 2025", lastUnits: unitVal ? `${num(unitVal)} ${utility.unitLabel}` : undefined });
      pushTxn({
        id: `new-${refId}`,
        date: "27 Jun",
        iso: "2025-06-27",
        time: "14:32",
        utility: utilityId,
        provider: provider?.name ?? "",
        account: ref,
        nickname: nickname || acc?.nickname || utility.name,
        amount: net,
        fee,
        method: method.name,
        ref: refId.replace("TXN-PM-20250627-", "TXN-"),
        status: "Success",
        units: unitVal ? `${num(unitVal)} ${utility.unitLabel}` : undefined,
        token: tokenVal,
        note: bundle ? `${bundle.name} · ${bundle.note}` : tokenMode ? "Prepaid token generated" : "Payment posted to account",
      });
      if (tokenMode) toast({ title: "Token generated", msg: `${num(unitVal ?? 0)} kWh for meter ${ref} — SMS sent.`, tone: "success" });
      else toast({ title: "Payment successful", msg: `${kes(net)} paid to ${provider?.name}.`, tone: "success" });
    }, doneAt);
  };

  if (!active) return null;

  const acc = accounts.find((a) => a.ref === ref);
  const matched = accounts.filter((a) => a.utility === utilityId);

  return (
    <Modal
      open
      onClose={close}
      width="max-w-680px"
      title={
        <span className="d-flex align-items-center gap-2">
          {utility.name} <span className="text-faint">·</span> <span className="text-muted">{phase === "done" ? "Receipt" : "New payment"}</span>
        </span>
      }
      subtitle={phase === "done" ? "Completed 27 Jun 2025 at 14:32 · EAT" : `${utility.short} · median settlement 6 seconds`}
      icon={utility.icon}
      footer={
        phase === "done" ? (
          <>
            <Button
              variant="outline"
              icon="repeat"
              onClick={() => {
                setStep(0);
                setPhase("idle");
                setPin("");
                setResult(null);
              }}
            >
              Buy again
            </Button>
            <Button variant="outline" icon="share" onClick={() => toast({ title: "Receipt shared", msg: "Sent to j@paymo.co.ke and saved to history.", tone: "info" })}>
              Share receipt
            </Button>
            <Button icon="check" onClick={close}>
              Done
            </Button>
          </>
        ) : phase === "processing" ? (
          <Button variant="outline" onClick={close}>
            Run in background
          </Button>
        ) : step === 0 ? (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="outline" icon="plus" onClick={() => open({ kind: "addAccount", utility: utilityId })}>
              Save new account
            </Button>
            <Button icon="arrow-right" disabled={!canNext} onClick={() => setStep(1)}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" icon="chevron-left" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            {step < 3 ? (
              <Button icon="arrow-right" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                {step === 2 ? "Review & authorise" : "Continue"}
              </Button>
            ) : (
              <Button icon="lock" onClick={run} loading={false}>
                Authorise {kes(total)}
              </Button>
            )}
          </>
        )
      }
    >
      {/* ---------- success ---------- */}
      {phase === "done" && result ? (
        <div>
          <div className="position-relative mx-auto mb-5 d-grid h-20 w-20 place-items-center">
            <span className="position-absolute inset-0 rounded-full bg-pmgreen-15 ring-pop" />
            <span className="position-absolute inset-0 rounded-full bg-pmgreen-15 ring-pop" style={{ animationDelay: "0.6s" }} />
            <span className="position-relative d-grid h-16 w-16 place-items-center rounded-full bg-pmgreen text-white shadow-green-check">
              <svg className="check-draw" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          </div>
          <h4 className="text-center font-display fs-20 fw-extrabold tracking-tight text-ink">Payment successful</h4>
          <p className="mt-1 text-center fs-13 text-muted">
            {tokenMode ? "Your prepaid token has been generated and SMS'd to 0712 *** 890." : `${provider?.name} account ${ref} has been credited with ${kes(net)}.`}
          </p>

          {result.token && (
            <div className="mt-5 overflow-hidden rounded-5 border border-pmgreen-30 bg-gradient-to-br from-pmgreen-soft to-white p-4">
              <div className="d-flex align-items-center gap-2">
                <Icon name="key" size={15} className="text-pmgreen-ink" />
                <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-pmgreen-ink">Token number</p>
                <Badge tone="success" className="ms-auto" dot>
                  Valid immediately
                </Badge>
              </div>
              <p className="num mt-2 font-display fs-19 fw-extrabold tracking-0-06em text-ink sm-fs-23">{result.token}</p>
              <div className="mt-3 d-flex flex-wrap gap-2">
                <CopyBtn text={result.token} label="Copy token" />
                <Button variant="outline" size="sm" icon="share" onClick={() => toast({ title: "Token shared", msg: "Sent via SMS to 0712 *** 890.", tone: "success" })}>
                  SMS again
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 d-grid gap-3 sm-grid-cols-2">
            <div className="rounded-4 border border-line bg-paper-2 p-35">
              <Row k="Amount paid" v={kes(net, 2)} strong />
              <div className="my-1 h-px bg-line" />
              <Row k="Charges & fee" v={kes(fee, 2)} />
              <Row k="Payment method" v={method.name} />
              <div className="my-1 h-px bg-line" />
              <Row k="Total debited" v={kes(total, 2)} strong />
            </div>
            <div className="rounded-4 border border-line bg-paper-2 p-35">
              {result.units && <Row k="Units purchased" v={`${num(result.units)} kWh`} strong />}
              {bundle && <Row k="Package" v={bundle.name} strong />}
              <Row k={utility.accountLabel} v={ref} />
              <Row k="Provider" v={provider?.name ?? ""} />
              <div className="my-1 h-px bg-line" />
              <Row k="Reference" v={result.refId} />
              <Row k="Date" v={result.date} />
            </div>
          </div>

          <div className="mt-4 d-flex flex-wrap align-items-center gap-2 rounded-4 border border-line bg-white p-3">
            <Icon name="repeat" size={16} className="text-pmgreen" />
            <p className="flex-1 fs-125 fw-medium text-ink-2">Automate this payment so it never lapses again.</p>
            <Button size="sm" variant="soft" icon="sliders" onClick={() => open({ kind: "autopay", accountId: acc?.id })}>
              Set up autopay
            </Button>
          </div>
        </div>
      ) : phase === "processing" ? (
        /* ---------- processing ---------- */
        <div className="py-3">
          <div className="mx-auto mb-6 d-grid h-16 w-16 place-items-center rounded-5 bg-pmgreen-soft">
            <Icon name="refresh" size={28} className="spin-slow text-pmgreen-ink" />
          </div>
          <Progress value={(stage / stages.length) * 100} />
          <div className="mt-5 space-y-25">
            {stages.map((s, i) => (
              <div key={s} className={cn("d-flex align-items-center gap-3 rounded-4 border p-3 transition-all", i < stage ? "border-line bg-white" : i === stage ? "border-pmgreen-40 bg-pmgreen-soft-40" : "border-dashed border-line bg-paper-2 opacity-60")}>
                <span
                  className={cn(
                    "d-grid h-7 w-7 flex-none place-items-center rounded-full fs-11 fw-bold",
                    i < stage ? "bg-pmgreen text-white" : i === stage ? "bg-white text-pmgreen-ink shadow-sm" : "bg-canvas text-faint"
                  )}
                >
                  {i < stage ? <Icon name="check" size={13} strokeWidth={2.8} /> : i + 1}
                </span>
                <p className={cn("fs-13 fw-semibold", i <= stage ? "text-ink" : "text-faint")}>{s}</p>
                {i === stage && <span className="live-dot ms-auto" />}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-4 bg-warn-soft-60 p-3 fs-12 leading-relaxed text-warn-ink">
            <strong>Do not close this window.</strong> If the STK push times out we will reverse automatically and notify you — no funds are lost.
          </p>
        </div>
      ) : (
        /* ---------- wizard ---------- */
        <div>
          <div className="mb-4">
            <Stepper steps={stepLabels} current={step} />
          </div>

          {/* utility switcher */}
          <div className="mb-4 d-flex gap-15 overflow-x-auto pb-1 thin-scroll">
            {UTILITIES.map((u) => (
              <button
                key={u.id}
                onClick={() => switchUtility(u.id)}
                className={cn(
                  "d-flex flex-none align-items-center gap-15 rounded-full border px-3 py-15 fs-12 fw-semibold transition",
                  u.id === utilityId ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover-border-gray-400"
                )}
              >
                <Icon name={u.icon} size={13} />
                {u.name}
              </button>
            ))}
          </div>

          {/* STEP 0 — account */}
          {step === 0 && (
            <div className="space-y-4">
              {matched.length > 0 && (
                <div>
                  <p className="mb-2 fs-12 fw-bold text-uppercase tracking-0-12em text-faint">Saved accounts</p>
                  <div className="d-grid gap-2 sm-grid-cols-2">
                    {matched.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setProviderId(a.providerId);
                          setRef(a.ref);
                          setNickname(a.nickname);
                          setVerified(a.holder ?? a.nickname);
                          setRefErr("");
                        }}
                        className={cn(
                          "d-flex align-items-center gap-3 rounded-4 border p-3 text-start transition",
                          ref === a.ref ? "border-pmgreen bg-pmgreen-soft-40" : "border-line bg-white hover-border-gray-400"
                        )}
                      >
                        <span className="d-grid h-9 w-9 flex-none place-items-center rounded-10px bg-canvas text-muted">
                          <Icon name={utility.icon} size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="d-block text-truncate fs-125 fw-bold text-ink">{a.nickname}</span>
                          <span className="d-block text-truncate fs-115 text-muted">
                            {a.provider} · {a.ref}
                          </span>
                        </span>
                        {ref === a.ref && <Icon name="check-circle" size={17} className="text-pmgreen" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-grid gap-3 sm-grid-cols-2">
                <Field label="Provider" required>
                  <Select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                    {utility.providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.note}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nickname (optional)" hint="Shown in history & reminders">
                  <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Home · Karen" icon="tag" />
                </Field>
              </div>

              <Field label={utility.accountLabel} required error={refErr} hint={utility.mode === "phone" ? "We mask the number on receipts" : verified ? `Verified · ${verified}` : "Enter the number printed on your bill or meter"}>
                <div className="d-flex gap-2">
                  <Input
                    value={ref}
                    onChange={(e) => {
                      setRef(e.target.value);
                      setRefErr("");
                      setVerified(null);
                    }}
                    onBlur={() => setRefErr(validateRef(ref))}
                    placeholder={utility.mode === "meter" ? "14825739" : utility.mode === "phone" ? "0712345678" : "Account number"}
                    inputMode={utility.mode === "phone" || utility.mode === "meter" ? "numeric" : "text"}
                    icon="search"
                  />
                  <Button
                    variant="outline"
                    disabled={!!validateRef(ref) || verifying}
                    loading={verifying}
                    onClick={() => {
                      setVerifying(true);
                      window.setTimeout(() => {
                        setVerifying(false);
                        setVerified(nickname || "J. Mwangi · Account active");
                        toast({ title: "Account verified", msg: `${provider?.name} confirmed the ${utility.accountLabel.toLowerCase()}.`, tone: "success" });
                      }, 900);
                    }}
                  >
                    Verify
                  </Button>
                </div>
              </Field>

              {utilityId === "electricity" && (
                <div className="rounded-4 border border-line bg-paper-2 p-35">
                  <p className="mb-25 fs-125 fw-bold text-ink-2">Meter type</p>
                  <Segmented
                    value={postpaid ? "post" : "pre"}
                    onChange={(v) => setPostpaid(v === "post")}
                    options={[
                      { value: "pre", label: "Prepaid — buy tokens", icon: "bolt" },
                      { value: "post", label: "Postpaid — settle bill", icon: "receipt" },
                    ]}
                  />
                  <p className="mt-2 fs-115 leading-relaxed text-muted">
                    {postpaid ? "We pull the outstanding KPLC balance before you pay — settlement same day." : `Tokens at KES ${TARIFF.toFixed(2)}/kWh, delivered in ~6 seconds.`}
                  </p>
                </div>
              )}

              <div className="d-flex align-items-start gap-25 rounded-4 bg-pmblue-soft-70 p-3">
                <Icon name="info" size={16} className="mt-05 flex-none text-pmblue-ink" />
                <p className="fs-12 leading-relaxed text-pmblue-ink">{utility.blurb}</p>
              </div>
            </div>
          )}

          {/* STEP 1 — amount */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="d-flex flex-wrap align-items-center gap-2 rounded-4 border border-line bg-paper-2 p-3">
                <Icon name={utility.icon} size={16} className="text-muted" />
                <p className="fs-125 fw-semibold text-ink-2">
                  {provider?.name} · <span className="num">{ref}</span>
                </p>
                {verified && <Badge tone="success">Verified · {verified}</Badge>}
                <button onClick={() => setStep(0)} className="focus-ring ms-auto fs-12 fw-bold text-pmgreen-ink">
                  Change
                </button>
              </div>

              {utility.bundles?.length ? (
                <div>
                  <p className="mb-2 fs-12 fw-bold text-uppercase tracking-0-12em text-faint">Choose a package</p>
                  <div className="d-grid gap-2 sm-grid-cols-2">
                    {utility.bundles.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBundleId(b.id)}
                        className={cn(
                          "position-relative d-flex align-items-start gap-3 rounded-4 border p-3 text-start transition",
                          bundleId === b.id ? "border-pmgreen bg-pmgreen-soft-40 shadow-sm" : "border-line bg-white hover-border-gray-400"
                        )}
                      >
                        <span className="mt-05 h-4 w-4 flex-none rounded-full border-2 border-gray-300 bg-white" style={{ borderColor: bundleId === b.id ? "#12b76a" : undefined }} />
                        <span className="min-w-0 flex-1">
                          <span className="d-flex flex-wrap align-items-center gap-15">
                            <span className="fs-13 fw-bold text-ink">{b.name}</span>
                            {b.badge && <Badge tone="violet">{b.badge}</Badge>}
                          </span>
                          <span className="mt-05 d-block fs-115 text-muted">{b.note}</span>
                          <span className="num mt-1 d-block fs-135 fw-extrabold text-ink">{kes(b.price)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Field label="Or enter a custom amount" hint={`Between ${kes(utility.min)} and ${kes(utility.max)}`}>
                      <Input type="number" className="no-spin" value={amount || ""} onChange={(e) => { setAmount(Number(e.target.value)); setBundleId(""); }} placeholder="0" />
                    </Field>
                  </div>
                </div>
              ) : (
                <div>
                  <Field label="Amount (KES)" required hint={`Min ${kes(utility.min)} · Max ${kes(utility.max)} per transaction`}>
                    <div className="position-relative">
                      <span className="position-absolute left-35 top-1-2 translate-y-n1-2 fs-13 fw-bold text-faint">KES</span>
                      <input
                        type="number"
                        className={cn("no-spin w-100 rounded-4 border border-line bg-white py-3 ps-14 pe-4 font-display fs-24 fw-extrabold text-ink outline-none transition focus-border-pmgreen focus-ring-4 focus-ring-pmgreen-12")}
                        value={amount || ""}
                        onChange={(e) => setAmount(Number(e.target.value))}
                      />
                    </div>
                  </Field>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    {utility.quick.map((q) => (
                      <Chip key={q} on={amount === q && !bundleId} onClick={() => { setAmount(q); setBundleId(""); }}>
                        {kes(q)}
                      </Chip>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 d-flex align-items-center justify-content-between fs-115 fw-semibold text-muted">
                      <span>{kes(utility.min)}</span>
                      <span>Slide to choose</span>
                      <span>{kes(utility.max)}</span>
                    </div>
                    <input type="range" className="w-100" min={utility.min} max={utility.max} step={50} value={Math.min(amount, utility.max)} onChange={(e) => { setAmount(Number(e.target.value)); setBundleId(""); }} />
                  </div>
                </div>
              )}

              {units !== undefined && (
                <div className="rounded-5 border border-warn-30 bg-warn-soft-50 p-4">
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="gauge" size={16} className="text-warn-ink" />
                    <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-warn-ink">Estimated units</p>
                  </div>
                  <p className="num mt-1 font-display fs-26 fw-extrabold lh-1 text-ink">
                    ~{num(units)} <span className="fs-15 fw-bold text-muted">kWh</span>
                  </p>
                  <p className="mt-15 fs-115 leading-relaxed text-warn-ink">
                    At the ERC pass-through tariff of KES {TARIFF.toFixed(2)}/kWh. Fixed charges may adjust final units on the token.
                  </p>
                  <div className="mt-3 d-grid grid-cols-3 gap-2">
                    {[
                      { k: "Energy", v: kes(Math.round(net * 0.86)) },
                      { k: "Fixed charge", v: kes(Math.round(net * 0.09)) },
                      { k: "Levies & VAT", v: kes(Math.round(net * 0.05)) },
                    ].map((x) => (
                      <div key={x.k} className="rounded-3 bg-white-70 p-2 text-center">
                        <p className="fs-105 fw-semibold text-uppercase tracking-wide text-warn-ink-80">{x.k}</p>
                        <p className="num mt-05 fs-12 fw-bold text-ink">{x.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SummaryBar net={net} fee={fee} total={total} utility={utilityId} />
            </div>
          )}

          {/* STEP 2 — method */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="fs-12 fw-bold text-uppercase tracking-0-12em text-faint">How would you like to pay?</p>
              <div className="space-y-2">
                {PAY_METHODS.map((m) => {
                  const on = methodId === m.id;
                  const insufficient = m.id === "wallet" && total > balance;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethodId(m.id)}
                      className={cn("d-flex w-100 align-items-center gap-3 rounded-4 border p-35 text-start transition", on ? "border-pmgreen bg-pmgreen-soft-30 shadow-sm" : "border-line bg-white hover-border-gray-400")}
                    >
                      <span className={cn("d-grid h-10 w-10 flex-none place-items-center rounded-11px", on ? "bg-white text-pmgreen-ink shadow-sm" : "bg-canvas text-muted")}>
                        <Icon name={m.icon} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="d-flex flex-wrap align-items-center gap-15">
                          <span className="fs-135 fw-bold text-ink">{m.name}</span>
                          {m.primary && <Badge tone="success">Default</Badge>}
                          {m.balance !== undefined && <Badge tone="info">Balance {kes(m.balance)}</Badge>}
                        </span>
                        <span className="mt-05 d-block fs-115 text-muted">{m.sub}</span>
                        {insufficient && (
                          <span className="mt-15 d-flex align-items-center gap-2 fs-115 fw-semibold text-danger-ink">
                            <Icon name="alert" size={13} /> Insufficient wallet balance ({kes(balance)})
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBalance(balance + 10000);
                                toast({ title: "Wallet topped up", msg: `${kes(10000)} added from M-Pesa ····890.`, tone: "success" });
                              }}
                              className="fw-bold text-pmgreen-ink text-decoration-underline decoration-dotted"
                            >
                              Top up {kes(10000)}
                            </span>
                          </span>
                        )}
                      </span>
                      <span className="d-flex flex-none flex-column align-items-end gap-05">
                        <span className="num fs-12 fw-bold text-ink">{m.fee === 0 ? "Free" : `+${kes(m.fee)}`}</span>
                        <span className={cn("h-4 w-4 rounded-full border-2", on ? "border-pmgreen bg-pmgreen" : "border-gray-300")} />
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="d-flex align-items-center gap-3 rounded-4 border border-line bg-paper-2 p-3">
                <Toggle on={remember} onChange={setRemember} label="Remember method" />
                <span className="fs-125 fw-medium text-ink-2">Remember {method.name} as my default for {utility.name.toLowerCase()}</span>
              </label>

              <div className="rounded-4 border border-line bg-white p-35">
                <Row k="Amount" v={kes(net)} />
                <Row k={`${provider?.name} fee`} v={fee === 0 ? "Free" : kes(fee)} />
                <Row k="Total" v={kes(total)} strong />
              </div>
            </div>
          )}

          {/* STEP 3 — confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-5 border border-line bg-paper-2 p-4">
                <div className="mb-2 d-flex align-items-center gap-2">
                  <Icon name="receipt" size={16} className="text-muted" />
                  <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-faint">Payment summary</p>
                </div>
                <div className="d-grid gap-x-6 gap-y-1 sm-grid-cols-2">
                  <Row k="Provider" v={provider?.name ?? ""} />
                  <Row k={utility.accountLabel} v={ref} />
                  <Row k="Nickname" v={nickname || "—"} />
                  <Row k="Type" v={utilityId === "electricity" ? (postpaid ? "Postpaid bill" : "Prepaid token") : bundle ? bundle.name : utility.name} />
                  <Row k="Units estimate" v={units ? `~${num(units)} kWh` : "—"} />
                  <Row k="Package" v={bundle?.name ?? "Custom amount"} />
                  <Row k="Method" v={method.name} />
                  <Row k="Fee" v={fee === 0 ? "Free" : kes(fee)} />
                </div>
                <div className="mt-2 border-top border-line pt-2">
                  <Row k="Total to authorise" v={kes(total)} strong />
                </div>
              </div>

              <div className="rounded-5 border border-line bg-white p-4">
                <p className="mb-3 d-flex align-items-center gap-2 fs-125 fw-bold text-ink-2">
                  <Icon name="lock" size={15} className="text-pmgreen" /> Enter your {methodId === "mpesa" ? "M-Pesa" : "PayMo"} PIN to authorise
                </p>
                <div className="mb-4 d-flex flex-column align-items-center gap-3">
                  <PinDots len={4} filled={pin.length} error={pinErr} />
                  <p className="fs-115 text-muted">
                    {methodId === "mpesa" ? "An STK push will be sent to 0712 *** 890 for confirmation." : "Enter your 4-digit PayMo wallet PIN to confirm."}
                  </p>
                </div>
                <KeyPad
                  onKey={(k) => setPin((p) => (p.length < 4 ? p + k : p))}
                  onClear={() => setPin("")}
                />
                <button onClick={() => toast({ title: "PIN reset link sent", msg: "Check 0712 *** 890 for the reset prompt.", tone: "info" })} className="focus-ring mt-3 w-100 text-center fs-12 fw-semibold text-muted transition hover-text-ink">
                  Forgot PIN?
                </button>
              </div>

              <div className="d-flex align-items-start gap-25 rounded-4 bg-pmgreen-soft-60 p-3">
                <Icon name="shield" size={16} className="mt-05 flex-none text-pmgreen-ink" />
                <p className="fs-12 leading-relaxed text-pmgreen-ink">
                  PCI-DSS secured · funds are held in a regulated trust account until {provider?.name} confirms settlement. Failed payments auto-reverse.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function SummaryBar({ net, fee, total, utility }: { net: number; fee: number; total: number; utility: UtilityId }) {
  return (
    <div className="rounded-5 border border-ink-10 bg-ink p-4 text-white">
      <div className="d-flex align-items-center gap-2">
        <Icon name={utilityOf(utility).icon} size={15} className="text-pmgreen" />
        <p className="fs-11 fw-bold text-uppercase tracking-0-14em text-white-50">Order total</p>
      </div>
      <div className="mt-2 d-flex align-items-end justify-content-between gap-3">
        <p className="num font-display fs-26 fw-extrabold lh-1">{kes(total, 2)}</p>
        <div className="text-end fs-115 text-white-60">
          <p className="num">{kes(net)} + {fee === 0 ? "no fee" : kes(fee)}</p>
          <p>Settles instantly</p>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*                            ADD ACCOUNT WIZARD                          */
/* ====================================================================== */

export function AddAccountWizard() {
  const { dialog, close, toast, addAccount } = useApp();
  const active = dialog.kind === "addAccount" ? dialog : null;
  const [utilityId, setUtilityId] = useState<UtilityId>("electricity");
  const [providerId, setProviderId] = useState("kplc");
  const [ref, setRef] = useState("");
  const [nickname, setNickname] = useState("");
  const [autopay, setAutopay] = useState(false);
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(false);
  const [found, setFound] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    setStep(0);
    setRef("");
    setNickname("");
    setFound(null);
    setAutopay(false);
    const u = active.utility ?? "electricity";
    setUtilityId(u);
    setProviderId(utilityOf(u).providers[0].id);
  }, [active]);

  const utility = utilityOf(utilityId);
  const provider = utility.providers.find((p) => p.id === providerId)!;
  const valid = utility.mode === "meter" ? /^\d{6,11}$/.test(ref) : utility.mode === "phone" ? /^0\d{9}$/.test(ref) : ref.trim().length >= 4;

  const save = () => {
    addAccount({
      id: `acc-${Date.now()}`,
      utility: utilityId,
      providerId,
      provider: provider.name,
      nickname: nickname || `${utility.name} · ${ref.slice(-4)}`,
      ref,
      lastAmount: 0,
      lastDate: "—",
      autopay,
    });
    toast({ title: "Account saved", msg: `${provider.name} · ${ref} is ready to pay.`, tone: "success" });
    close();
  };

  return (
    <Modal
      open={!!active}
      onClose={close}
      width="max-w-600px"
      icon="plus"
      title="Add a meter or account"
      subtitle="Verified accounts can be paid in two taps from now on"
      footer={
        step === 1 ? (
          <>
            <Button variant="ghost" icon="chevron-left" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button icon="check" onClick={save}>
              Save account
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              icon="search"
              disabled={!valid}
              loading={checking}
              onClick={() => {
                setChecking(true);
                window.setTimeout(() => {
                  setChecking(false);
                  setFound(nickname || "J. Mwangi · Account active");
                  setStep(1);
                }, 1000);
              }}
            >
              Verify account
            </Button>
          </>
        )
      }
    >
      <Stepper steps={["Utility", "Confirm & save"]} current={step} />

      <div className="mt-4 d-grid grid-cols-2 gap-2 sm-grid-cols-4">
        {UTILITIES.map((u) => (
          <button
            key={u.id}
            onClick={() => {
              setUtilityId(u.id);
              setProviderId(u.providers[0].id);
            }}
            className={cn("d-flex flex-column align-items-center gap-15 rounded-4 border p-3 transition", u.id === utilityId ? "border-pmgreen bg-pmgreen-soft-40" : "border-line bg-white hover-border-gray-400")}
          >
            <Icon name={u.icon} size={19} className={u.id === utilityId ? "text-pmgreen-ink" : "text-muted"} />
            <span className={cn("text-center fs-115 fw-semibold leading-tight", u.id === utilityId ? "text-ink" : "text-muted")}>{u.name}</span>
          </button>
        ))}
      </div>

      {step === 0 ? (
        <div className="mt-4 space-y-3">
          <Field label="Provider" required>
            <Select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
              {utility.providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.note}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={utility.accountLabel} required hint="Copy it exactly as printed on your bill or meter card">
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={utility.mode === "meter" ? "14825739" : utility.mode === "phone" ? "0712345678" : "Account number"} icon="tag" />
          </Field>
          <Field label="Nickname" hint="E.g. Home · Karen, Shop meter, Ushago water">
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Give it a friendly name" icon="edit" />
          </Field>
          <div className="d-flex align-items-start gap-25 rounded-4 bg-warn-soft-60 p-3">
            <Icon name="info" size={16} className="mt-05 flex-none text-warn-ink" />
            <p className="fs-12 leading-relaxed text-warn-ink">Only add accounts you are authorised to pay. PayMo verifies ownership with {provider.name} before the first transaction.</p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="d-flex align-items-center gap-3 rounded-4 border border-pmgreen-30 bg-pmgreen-soft-40 p-4">
            <span className="d-grid h-11 w-11 flex-none place-items-center rounded-4 bg-white text-pmgreen-ink shadow-sm">
              <Icon name="check-circle" size={22} />
            </span>
            <div>
              <p className="fs-135 fw-bold text-ink">Verified · {found}</p>
              <p className="fs-12 text-muted">
                {provider.name} · {utility.accountLabel} <span className="num fw-semibold">{ref}</span>
              </p>
            </div>
          </div>
          <Field label="Nickname">
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Home · Karen" icon="edit" />
          </Field>
          <label className="d-flex align-items-center gap-3 rounded-4 border border-line bg-paper-2 p-35">
            <Toggle on={autopay} onChange={setAutopay} label="Enable autopay" />
            <span className="fs-125 fw-medium text-ink-2">
              Enable autopay for this account
              <span className="mt-05 d-block fs-115 text-muted">You can pick triggers, caps and the funding method next.</span>
            </span>
          </label>
          {autopay && (
            <div className="rounded-4 border border-line bg-white p-35">
              <p className="mb-2 fs-12 fw-bold text-ink-2">Suggested rule</p>
              <Row k="Trigger" v={utility.mode === "meter" ? "When units < 10 kWh" : "Monthly on the 5th"} />
              <Row k="Amount" v={kes(utility.quick[2])} />
              <Row k="Method" v="M-Pesa · 0712 *** 890" />
              <p className="mt-2 fs-115 text-muted">You can fine-tune this in Autopay rules after saving.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ====================================================================== */
/*                               WALLET TOP-UP                            */
/* ====================================================================== */

export function TopUpModal() {
  const { dialog, close, toast, balance, setBalance } = useApp();
  const openM = dialog.kind === "topup";
  const [amt, setAmt] = useState(5000);
  const [src, setSrc] = useState("mpesa");
  const sources = [
    { id: "mpesa", name: "M-Pesa", sub: "0712 *** 890 · free", icon: "smartphone" as const },
    { id: "bank", name: "Equity Bank", sub: "···· 4521 · free", icon: "bank" as const },
    { id: "card", name: "Visa card", sub: "···· 4417 · 1.5%", icon: "card" as const },
  ];
  return (
    <Modal
      open={openM}
      onClose={close}
      icon="wallet"
      title="Top up PayMo wallet"
      subtitle={`Current balance ${kes(balance)} · funds settle instantly`}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            icon="plus"
            onClick={() => {
              setBalance(balance + amt);
              toast({ title: "Wallet topped up", msg: `${kes(amt)} added — new balance ${kes(balance + amt)}.`, tone: "success" });
              close();
            }}
          >
            Top up {kes(amt)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Amount (KES)">
          <div className="position-relative">
            <span className="position-absolute left-35 top-1-2 translate-y-n1-2 fs-13 fw-bold text-faint">KES</span>
            <input type="number" className="no-spin w-100 rounded-4 border border-line bg-white py-3 ps-14 pe-4 font-display fs-22 fw-extrabold text-ink outline-none focus-border-pmgreen focus-ring-4 focus-ring-pmgreen-12" value={amt || ""} onChange={(e) => setAmt(Number(e.target.value))} />
          </div>
        </Field>
        <div className="d-flex flex-wrap gap-2">
          {[1000, 5000, 10000, 25000].map((q) => (
            <Chip key={q} on={amt === q} onClick={() => setAmt(q)}>
              {kes(q)}
            </Chip>
          ))}
        </div>
        <div className="space-y-2">
          {sources.map((s) => (
            <button key={s.id} onClick={() => setSrc(s.id)} className={cn("d-flex w-100 align-items-center gap-3 rounded-4 border p-35 text-start transition", src === s.id ? "border-pmgreen bg-pmgreen-soft-30" : "border-line hover-border-gray-400")}>
              <span className="d-grid h-9 w-9 flex-none place-items-center rounded-10px bg-canvas text-muted">
                <Icon name={s.icon} size={17} />
              </span>
              <span className="flex-1">
                <span className="d-block fs-13 fw-bold text-ink">{s.name}</span>
                <span className="d-block fs-115 text-muted">{s.sub}</span>
              </span>
              {src === s.id && <Icon name="check-circle" size={17} className="text-pmgreen" />}
            </button>
          ))}
        </div>
        <div className="d-flex align-items-start gap-25 rounded-4 bg-pmgreen-soft-60 p-3">
          <Icon name="shield" size={16} className="mt-05 flex-none text-pmgreen-ink" />
          <p className="fs-12 leading-relaxed text-pmgreen-ink">Wallet balances are held in a tier-3 trust account at Equity Bank and are never lent out.</p>
        </div>
      </div>
    </Modal>
  );
}

export { IconBtn };
