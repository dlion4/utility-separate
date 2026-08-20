import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils/cn";
import { Icon, type IconName } from "./icons";

/* ============================== Badge ============================== */

export type Tone = "success" | "warning" | "danger" | "info" | "muted" | "violet" | "teal" | "dark";
const tones: Record<Tone, string> = {
  success: "bg-pmgreen-soft text-pmgreen-ink",
  warning: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger-ink",
  info: "bg-pmblue-soft text-pmblue-ink",
  muted: "bg-canvas text-slate",
  violet: "bg-pmviolet-soft text-pmviolet-ink",
  teal: "bg-pmteal-soft text-pmteal-ink",
  dark: "bg-ink text-white",
};

export function Badge({ tone = "muted", children, className, dot, icon }: { tone?: Tone; children?: ReactNode; className?: string; dot?: boolean; icon?: IconName }) {
  return (
    <span className={cn("badge", `badge-${tone}`, tones[tone], className)}>
      {dot && <span className="h-15 w-15 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ============================== Button ============================== */

type BtnVariant = "primary" | "dark" | "ghost" | "outline" | "danger" | "soft" | "white";
const btnVariants: Record<BtnVariant, string> = {
  primary: "btn-primary",
  dark: "btn-dark",
  ghost: "btn-ghost",
  outline: "btn-outline-secondary",
  danger: "btn-danger",
  soft: "btn-soft",
  white: "btn-white",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  disabled,
  full,
  type = "button",
  loading,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconRight?: IconName;
  className?: string;
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit";
  loading?: boolean;
}) {
  const sizes = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "btn",
        sizes[size],
        btnVariants[variant],
        full && "w-100",
        (disabled || loading) && "disabled",
        className
      )}
    >
      {loading ? <Icon name="refresh" size={15} className="spin-slow" /> : icon ? <Icon name={icon} size={size === "sm" ? 14 : 16} /> : null}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16} />}
    </button>
  );
}

/* ============================== Icon button ============================== */

export function IconBtn({
  icon,
  onClick,
  label,
  className,
  tone = "ghost",
  size = 17,
}: {
  icon: IconName;
  onClick?: () => void;
  label: string;
  className?: string;
  tone?: "ghost" | "dark" | "outline" | "white";
  size?: number;
}) {
  const map = {
    ghost: "text-muted hover-bg-canvas hover-text-ink",
    dark: "text-white-70 hover-bg-white-10 hover-text-white",
    outline: "border border-line bg-white text-muted hover-text-ink hover-border-gray-400",
    white: "bg-white text-ink hover-bg-white-90 shadow-pm",
  };
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn("focus-ring d-grid h-9 w-9 place-items-center rounded-4 transition", map[tone], className)}>
      <Icon name={icon} size={size} />
    </button>
  );
}

/* ============================== Chip ============================== */

export function Chip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "focus-ring d-inline-flex align-items-center gap-15 rounded-full border px-35 py-15 fs-125 fw-semibold transition-all duration-150",
        on ? "border-ink bg-ink text-white shadow-sm" : "border-line bg-white text-slate hover-border-gray-400 hover-translate-y-npx"
      )}
    >
      {children}
      {count !== undefined && <span className={cn("rounded-full px-15 fs-105 fw-bold", on ? "bg-white-20" : "bg-canvas")}>{count}</span>}
    </button>
  );
}

/* ============================== Toggle ============================== */

export function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn("focus-ring position-relative h-24px w-44px flex-none rounded-full transition-colors duration-200", on ? "bg-pmgreen" : "bg-gray-300", disabled && "cursor-not-allowed opacity-40")}
    >
      <span className={cn("position-absolute top-3px h-18px w-18px rounded-full bg-white shadow transition-all duration-200", on ? "left-23px" : "left-3px")} />
    </button>
  );
}

/* ============================== Section head ============================== */

export function SectionHead({ no, title, sub, id, children }: { no: string; title: string; sub?: string; id?: string; children?: ReactNode }) {
  return (
    <div id={id} className="mb-4 d-flex scroll-mt-24 flex-wrap align-items-center gap-3">
      <span className="d-grid h-30px w-30px flex-none place-items-center rounded-9px bg-ink font-display fs-12 fw-bold text-white">{no}</span>
      <h2 className="font-display fs-17 fw-bold tracking-tight text-ink sm-fs-19">{title}</h2>
      {children && <div className="ms-auto d-flex flex-wrap align-items-center gap-2">{children}</div>}
      {sub && <p className="mt-n1 w-100 fs-125 leading-relaxed text-muted sm-ml-42px">{sub}</p>}
    </div>
  );
}

/* ============================== Card ============================== */

export function Card({ children, className, hover, id }: { children: ReactNode; className?: string; hover?: boolean; id?: string }) {
  return (
    <div id={id} className={cn("card", hover && "card-hover", className)}>
      {children}
    </div>
  );
}

/* ============================== Progress ============================== */

export function Progress({ value, tone = "green", className }: { value: number; tone?: "green" | "amber" | "red" | "blue" | "violet"; className?: string }) {
  const colors = { green: "bg-pmgreen", amber: "bg-warn", red: "bg-danger", blue: "bg-pmblue", violet: "bg-pmviolet" };
  return (
    <div className={cn("h-5px w-100 overflow-hidden rounded-full bg-gray-100", className)}>
      <div className={cn("h-100 rounded-full transition-width duration-500 ease-out", colors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ============================== Sparkline ============================== */

export function Spark({ points, stroke = "#12b76a", w = 84, h = 28, fill = true }: { points: number[]; stroke?: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (w - 2) + 1;
    const y = h - 3 - ((p - min) / (max - min || 1)) * (h - 6);
    return `${x},${y}`;
  });
  const path = `M${norm.join(" L")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden="true">
      {fill && <path d={`${path} L${w - 1},${h} L1,${h} Z`} fill={stroke} opacity="0.12" stroke="none" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].split(",")[0]} cy={norm[norm.length - 1].split(",")[1]} r="2.6" fill={stroke} />
    </svg>
  );
}

/* ============================== Donut ============================== */

export function Donut({ data, size = 148, thickness = 16, center }: { data: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="position-relative d-grid flex-none place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f4" strokeWidth={thickness} />
        {data.map((d) => {
          const len = (d.value / total) * c;
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(len - 2.5, 0)} ${c}`}
              strokeDashoffset={-acc}
              strokeLinecap="round"
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      {center && <div className="position-absolute d-grid place-items-center text-center">{center}</div>}
    </div>
  );
}

/* ============================== Modal ============================== */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = "max-w-lg",
  tone,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  tone?: "danger" | "default";
  hideClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="position-fixed inset-0 z-80 d-flex align-items-end justify-content-center p-0 align-items-sm-center sm-p-6" role="dialog" aria-modal="true">
      <div className="overlay-fade position-absolute inset-0 bg-side-55 backdrop-blur-3px" onClick={onClose} />
      <div className={cn("modal-pop position-relative d-flex max-h-94vh w-100 flex-column overflow-hidden rounded-t-2xl bg-white shadow-pm-lg sm-rounded-5", width)}>
        <div className={cn("d-flex align-items-start gap-3 border-bottom border-line px-5 py-4", tone === "danger" && "bg-danger-soft-40")}>
          {icon && (
            <span className={cn("mt-05 d-grid h-9 w-9 flex-none place-items-center rounded-10px", tone === "danger" ? "bg-danger-soft text-danger-ink" : "bg-pmgreen-soft text-pmgreen-ink")}>
              <Icon name={icon} size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display fs-155 fw-bold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-05 fs-125 leading-relaxed text-muted">{subtitle}</p>}
          </div>
          {!hideClose && (
            <button onClick={onClose} aria-label="Close dialog" className="focus-ring me-n1 d-grid h-8 w-8 place-items-center rounded-3 text-muted transition hover-bg-canvas hover-text-ink">
              <Icon name="x" size={17} />
            </button>
          )}
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 border-top border-line bg-paper-2 px-5 py-35">{footer}</div>}
      </div>
    </div>
  );
}

/* ============================== Drawer ============================== */

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  width = "max-w-460px",
  bg = "bg-white",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "right" | "left";
  width?: string;
  bg?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="position-fixed inset-0 z-85 d-flex" role="dialog" aria-modal="true">
      <div className="overlay-fade position-absolute inset-0 bg-side-55 backdrop-blur-3px" onClick={onClose} />
      <div className={cn("position-relative d-flex h-100 w-100 flex-column shadow-pm-lg", bg, width, side === "right" ? "ms-auto drawer-in" : "me-auto drawer-in-left")}>
        {children}
      </div>
    </div>
  );
}

export function DrawerHead({ title, subtitle, icon, onClose, actions }: { title: ReactNode; subtitle?: ReactNode; icon?: IconName; onClose: () => void; actions?: ReactNode }) {
  return (
    <div className="d-flex align-items-start gap-3 border-bottom border-line px-5 py-4">
      {icon && (
        <span className="mt-05 d-grid h-9 w-9 flex-none place-items-center rounded-10px bg-pmgreen-soft text-pmgreen-ink">
          <Icon name={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-display fs-155 fw-bold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-05 fs-125 leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {actions}
      <button onClick={onClose} aria-label="Close panel" className="focus-ring d-grid h-8 w-8 place-items-center rounded-3 text-muted transition hover-bg-canvas hover-text-ink">
        <Icon name="x" size={17} />
      </button>
    </div>
  );
}

/* ============================== Fields ============================== */

export function Field({ label, hint, error, children, className, required }: { label?: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={cn("d-block", className)}>
      {label && (
        <span className="mb-15 d-flex align-items-center gap-1 fs-125 fw-semibold text-ink-2">
          {label}
          {required && <span className="text-danger">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-15 d-flex align-items-center gap-15 fs-115 fw-medium text-danger-ink">
          <Icon name="alert" size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-15 d-block fs-115 leading-relaxed text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "w-100 rounded-4 border border-line bg-white px-35 py-25 fs-135 fw-medium text-ink placeholder-text-faint transition focus-border-pmgreen outline-none focus-ring-4 focus-ring-pmgreen-12";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: IconName }) {
  const { icon, className, ...rest } = props;
  if (!icon) return <input {...rest} className={cn(inputCls, className)} />;
  return (
    <div className="position-relative">
      <Icon name={icon} size={16} className="pe-none position-absolute left-35 top-1-2 translate-y-n1-2 text-faint" />
      <input {...rest} className={cn(inputCls, "ps-10", className)} />
    </div>
  );
}

export function Select({ children, className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="position-relative">
      <select {...rest} className={cn("form-select appearance-none pe-9", className)}>
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pe-none position-absolute right-3 top-1-2 translate-y-n1-2 text-faint" />
    </div>
  );
}

/* ============================== Segmented control ============================== */

export function Segmented<T extends string>({ value, onChange, options, size = "md" }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: IconName }[]; size?: "sm" | "md" }) {
  return (
    <div className={cn("d-inline-flex align-items-center gap-1 rounded-4 border border-line bg-paper-3 p-1", size === "sm" && "rounded-3")}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-ring d-inline-flex align-items-center gap-15 rounded-3 fw-semibold transition-all duration-150",
            size === "sm" ? "px-25 py-1 fs-115" : "px-3 py-15 fs-125",
            value === o.value ? "bg-white text-ink shadow-sm" : "text-muted hover-text-ink"
          )}
        >
          {o.icon && <Icon name={o.icon} size={13} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================== Stepper ============================== */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="d-flex align-items-center gap-15 overflow-x-auto pb-1 thin-scroll">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="d-flex flex-none align-items-center gap-15">
            <div
              className={cn(
                "d-flex align-items-center gap-2 rounded-full border px-25 py-15 transition-all duration-200",
                active ? "border-ink bg-ink text-white" : done ? "border-pmgreen-30 bg-pmgreen-soft text-pmgreen-ink" : "border-line bg-white text-faint"
              )}
            >
              <span className={cn("d-grid h-18px w-18px place-items-center rounded-full fs-105 fw-bold", active ? "bg-white-20" : done ? "bg-pmgreen text-white" : "bg-canvas")}>
                {done ? <Icon name="check" size={11} strokeWidth={2.6} /> : i + 1}
              </span>
              <span className="text-nowrap fs-115 fw-semibold">{s}</span>
            </div>
            {i < steps.length - 1 && <span className={cn("h-2px w-4 rounded-full sm-w-6", done ? "bg-pmgreen-40" : "bg-line")} />}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== Summary row ============================== */

export function Row({ k, v, tone, strong, icon }: { k: ReactNode; v: ReactNode; tone?: string; strong?: boolean; icon?: IconName }) {
  return (
    <div className="d-flex align-items-center justify-content-between gap-3 py-2">
      <span className="d-flex align-items-center gap-15 fs-125 text-muted">
        {icon && <Icon name={icon} size={14} className="text-faint" />}
        {k}
      </span>
      <span className={cn("num text-end fs-13 fw-semibold text-ink", strong && "fs-145 fw-bold", tone)}>{v}</span>
    </div>
  );
}

/* ============================== Copy button ============================== */

export function CopyBtn({ text, label = "Copy", onCopied, variant = "outline" }: { text: string; label?: string; onCopied?: () => void; variant?: BtnVariant }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={done ? "soft" : variant}
      size="sm"
      icon={done ? "check" : "copy"}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        onCopied?.();
        window.setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? "Copied" : label}
    </Button>
  );
}

/* ============================== Empty state ============================== */

export function Empty({ icon = "search", title, sub, action }: { icon?: IconName; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-3 px-6 py-14 text-center">
      <span className="d-grid h-14 w-14 place-items-center rounded-5 bg-canvas text-faint">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="font-display fs-145 fw-bold text-ink">{title}</p>
        {sub && <p className="mx-auto mt-1 max-w-38ch fs-125 leading-relaxed text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================== Dropdown menu ============================== */

export function Menu({ trigger, items, align = "right" }: { trigger: (open: boolean) => ReactNode; items: { label: string; icon: IconName; onClick: () => void; danger?: boolean }[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="position-relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div className={cn("modal-pop position-absolute z-40 mt-15 w-212px overflow-hidden rounded-4 border border-line bg-white p-15 shadow-pm-lg", align === "right" ? "end-0" : "start-0")}>
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "d-flex w-100 align-items-center gap-25 rounded-3 px-25 py-2 text-start fs-125 fw-semibold transition",
                it.danger ? "text-danger-ink hover-bg-danger-soft" : "text-ink-2 hover-bg-canvas"
              )}
            >
              <Icon name={it.icon} size={15} className={it.danger ? "text-danger-ink" : "text-muted"} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== Toast host ============================== */

export type ToastItem = { id: number; title: string; msg?: string; tone: "success" | "info" | "warn" | "danger" };

export function ToastHost({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: number) => void }) {
  const map = {
    success: { icon: "check-circle" as IconName, cls: "bg-white border-pmgreen-30", ic: "bg-pmgreen-soft text-pmgreen-ink" },
    info: { icon: "info" as IconName, cls: "bg-white border-pmblue-30", ic: "bg-pmblue-soft text-pmblue-ink" },
    warn: { icon: "alert" as IconName, cls: "bg-white border-warn-40", ic: "bg-warn-soft text-warn-ink" },
    danger: { icon: "alert" as IconName, cls: "bg-white border-danger-40", ic: "bg-danger-soft text-danger-ink" },
  };
  return (
    <div className="pe-none position-fixed bottom-4 left-1-2 z-120 d-flex w-calc100p-2rem max-w-380px translate-x-n1-2 flex-column gap-2 sm-bottom-6 sm-left-auto sm-right-6 sm-translate-x-0">
      {toasts.map((t) => (
        <div key={t.id} className={cn("toast-in pe-auto d-flex align-items-start gap-3 rounded-4 border p-3 shadow-pm-lg", map[t.tone].cls)}>
          <span className={cn("mt-05 d-grid h-8 w-8 flex-none place-items-center rounded-3", map[t.tone].ic)}>
            <Icon name={map[t.tone].icon} size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="fs-13 fw-bold text-ink">{t.title}</p>
            {t.msg && <p className="mt-05 fs-12 leading-relaxed text-muted">{t.msg}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="d-grid h-6 w-6 place-items-center rounded-2 text-faint transition hover-bg-canvas hover-text-ink">
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================== Misc ============================== */

export function Avatar({ name, size = 34, tone = "dark" }: { name: string; size?: number; tone?: "dark" | "green" | "light" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls = tone === "dark" ? "bg-ink text-white" : tone === "green" ? "bg-pmgreen text-white" : "bg-canvas text-ink";
  return (
    <span className={cn("d-grid flex-none place-items-center rounded-full font-display fw-bold", cls)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

export function KeyPad({ onKey, onClear }: { onKey: (k: string) => void; onClear: () => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "ok"];
  return (
    <div className="d-grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => (k === "clear" ? onClear() : onKey(k))}
          className={cn(
            "focus-ring d-grid h-12 place-items-center rounded-4 border border-line bg-white font-display fs-16 fw-bold text-ink transition active-scale-95",
            k === "clear" && "text-danger-ink",
            k === "ok" && "bg-pmgreen-soft text-pmgreen-ink"
          )}
          aria-label={k === "clear" ? "Clear" : k === "ok" ? "Confirm" : `Digit ${k}`}
        >
          {k === "clear" ? <Icon name="trash" size={17} /> : k === "ok" ? <Icon name="check" size={17} /> : k}
        </button>
      ))}
    </div>
  );
}

export function PinDots({ len, filled, error }: { len: number; filled: number; error?: boolean }) {
  return (
    <div className={cn("d-flex align-items-center justify-content-center gap-3", error && "shake")}>
      {Array.from({ length: len }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-35 w-35 rounded-full border-2 transition-all duration-200",
            error ? "border-danger bg-danger-30" : i < filled ? "border-pmgreen bg-pmgreen scale-110" : "border-gray-300 bg-white"
          )}
        />
      ))}
    </div>
  );
}

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
