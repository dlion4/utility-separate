import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils/cn";
import { Icon, type IconName } from "./icons";

/* ============================== Badge ============================== */

export type Tone = "success" | "warning" | "danger" | "info" | "muted" | "violet" | "teal" | "dark";
const tones: Record<Tone, string> = {
  success: "bg-pmgreen-soft text-[#067647]",
  warning: "bg-warn-soft text-[#93370d]",
  danger: "bg-danger-soft text-[#b42318]",
  info: "bg-pmblue-soft text-[#175cd3]",
  muted: "bg-canvas text-[#475467]",
  violet: "bg-pmviolet-soft text-[#5925dc]",
  teal: "bg-pmteal-soft text-[#07615a]",
  dark: "bg-ink text-white",
};

export function Badge({ tone = "muted", children, className, dot, icon }: { tone?: Tone; children?: ReactNode; className?: string; dot?: boolean; icon?: IconName }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* ============================== Button ============================== */

type BtnVariant = "primary" | "dark" | "ghost" | "outline" | "danger" | "soft" | "white";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-pmgreen text-white hover:bg-pmgreen-dark shadow-[0_6px_16px_-6px_rgba(18,183,106,0.6)]",
  dark: "bg-ink text-white hover:bg-ink-2",
  ghost: "text-[#475467] hover:bg-canvas hover:text-ink",
  outline: "border border-line bg-white text-ink hover:border-[#c4c9d4] hover:bg-[#fafbfd]",
  danger: "bg-danger text-white hover:bg-[#d92d20]",
  soft: "bg-pmgreen-soft text-[#067647] hover:bg-[#d3f1e2]",
  white: "bg-white/10 text-white hover:bg-white/20 border border-white/15 backdrop-blur",
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
    sm: "h-8 px-3 text-[12.5px] gap-1.5 rounded-lg",
    md: "h-10 px-4 text-[13.5px] gap-2 rounded-xl",
    lg: "h-12 px-5 text-[14.5px] gap-2 rounded-xl",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "focus-ring inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.985]",
        sizes[size],
        btnVariants[variant],
        full && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-50 active:scale-100",
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
    ghost: "text-muted hover:bg-canvas hover:text-ink",
    dark: "text-white/70 hover:bg-white/10 hover:text-white",
    outline: "border border-line bg-white text-muted hover:text-ink hover:border-[#c4c9d4]",
    white: "bg-white text-ink hover:bg-white/90 shadow-pm",
  };
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn("focus-ring grid h-9 w-9 place-items-center rounded-xl transition", map[tone], className)}>
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
        "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-150",
        on ? "border-ink bg-ink text-white shadow-sm" : "border-line bg-white text-[#475467] hover:border-[#c4c9d4] hover:-translate-y-px"
      )}
    >
      {children}
      {count !== undefined && <span className={cn("rounded-full px-1.5 text-[10.5px] font-bold", on ? "bg-white/20" : "bg-canvas")}>{count}</span>}
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
      className={cn("focus-ring relative h-[24px] w-[44px] flex-none rounded-full transition-colors duration-200", on ? "bg-pmgreen" : "bg-[#d0d5dd]", disabled && "cursor-not-allowed opacity-40")}
    >
      <span className={cn("absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-200", on ? "left-[23px]" : "left-[3px]")} />
    </button>
  );
}

/* ============================== Section head ============================== */

export function SectionHead({ no, title, sub, id, children }: { no: string; title: string; sub?: string; id?: string; children?: ReactNode }) {
  return (
    <div id={id} className="mb-4 flex scroll-mt-24 flex-wrap items-center gap-3">
      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-ink font-display text-[12px] font-bold text-white">{no}</span>
      <h2 className="font-display text-[17px] font-bold tracking-tight text-ink sm:text-[19px]">{title}</h2>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
      {sub && <p className="-mt-1 w-full text-[12.5px] leading-relaxed text-muted sm:ml-[42px]">{sub}</p>}
    </div>
  );
}

/* ============================== Card ============================== */

export function Card({ children, className, hover, id }: { children: ReactNode; className?: string; hover?: boolean; id?: string }) {
  return (
    <div id={id} className={cn("rounded-2xl border border-line bg-white p-5 shadow-pm", hover && "card-hover", className)}>
      {children}
    </div>
  );
}

/* ============================== Progress ============================== */

export function Progress({ value, tone = "green", className }: { value: number; tone?: "green" | "amber" | "red" | "blue" | "violet"; className?: string }) {
  const colors = { green: "bg-pmgreen", amber: "bg-warn", red: "bg-danger", blue: "bg-pmblue", violet: "bg-pmviolet" };
  return (
    <div className={cn("h-[5px] w-full overflow-hidden rounded-full bg-[#eef0f4]", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out", colors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
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
    <div className="relative grid flex-none place-items-center" style={{ width: size, height: size }}>
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
      {center && <div className="absolute grid place-items-center text-center">{center}</div>}
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="overlay-fade absolute inset-0 bg-[#0b1322]/55 backdrop-blur-[3px]" onClick={onClose} />
      <div className={cn("modal-pop relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-pm-lg sm:rounded-2xl", width)}>
        <div className={cn("flex items-start gap-3 border-b border-line px-5 py-4", tone === "danger" && "bg-danger-soft/40")}>
          {icon && (
            <span className={cn("mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-[10px]", tone === "danger" ? "bg-danger-soft text-[#b42318]" : "bg-pmgreen-soft text-[#067647]")}>
              <Icon name={icon} size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15.5px] font-bold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{subtitle}</p>}
          </div>
          {!hideClose && (
            <button onClick={onClose} aria-label="Close dialog" className="focus-ring -mr-1 grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
              <Icon name="x" size={17} />
            </button>
          )}
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-[#fafbfd] px-5 py-3.5">{footer}</div>}
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
  width = "max-w-[460px]",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "right" | "left";
  width?: string;
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
    <div className="fixed inset-0 z-[85] flex" role="dialog" aria-modal="true">
      <div className="overlay-fade absolute inset-0 bg-[#0b1322]/55 backdrop-blur-[3px]" onClick={onClose} />
      <div className={cn("relative ml-auto flex h-full w-full flex-col bg-white shadow-pm-lg", width, side === "right" ? "drawer-in" : "drawer-in-left ml-0 mr-auto")}>
        {children}
      </div>
    </div>
  );
}

export function DrawerHead({ title, subtitle, icon, onClose, actions }: { title: ReactNode; subtitle?: ReactNode; icon?: IconName; onClose: () => void; actions?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-line px-5 py-4">
      {icon && (
        <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]">
          <Icon name={icon} size={18} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[15.5px] font-bold tracking-tight text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {actions}
      <button onClick={onClose} aria-label="Close panel" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
        <Icon name="x" size={17} />
      </button>
    </div>
  );
}

/* ============================== Fields ============================== */

export function Field({ label, hint, error, children, className, required }: { label?: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-ink-2">
          {label}
          {required && <span className="text-danger">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium text-[#b42318]">
          <Icon name="alert" size={13} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11.5px] leading-relaxed text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-ink placeholder:text-faint transition focus:border-pmgreen focus:outline-none focus:ring-4 focus:ring-pmgreen/12";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { icon?: IconName }) {
  const { icon, className, ...rest } = props;
  if (!icon) return <input {...rest} className={cn(inputCls, className)} />;
  return (
    <div className="relative">
      <Icon name={icon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
      <input {...rest} className={cn(inputCls, "pl-10", className)} />
    </div>
  );
}

export function Select({ children, className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={cn(inputCls, "appearance-none pr-9", className)}>
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-faint" />
    </div>
  );
}

/* ============================== Segmented control ============================== */

export function Segmented<T extends string>({ value, onChange, options, size = "md" }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; icon?: IconName }[]; size?: "sm" | "md" }) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-line bg-[#f7f9fc] p-1", size === "sm" && "rounded-lg")}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "focus-ring inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-150",
            size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[12.5px]",
            value === o.value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 thin-scroll">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex flex-none items-center gap-1.5">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition-all duration-200",
                active ? "border-ink bg-ink text-white" : done ? "border-pmgreen/30 bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-faint"
              )}
            >
              <span className={cn("grid h-[18px] w-[18px] place-items-center rounded-full text-[10.5px] font-bold", active ? "bg-white/20" : done ? "bg-pmgreen text-white" : "bg-canvas")}>
                {done ? <Icon name="check" size={11} strokeWidth={2.6} /> : i + 1}
              </span>
              <span className="whitespace-nowrap text-[11.5px] font-semibold">{s}</span>
            </div>
            {i < steps.length - 1 && <span className={cn("h-[2px] w-4 rounded-full sm:w-6", done ? "bg-pmgreen/40" : "bg-line")} />}
          </div>
        );
      })}
    </div>
  );
}

/* ============================== Summary row ============================== */

export function Row({ k, v, tone, strong, icon }: { k: ReactNode; v: ReactNode; tone?: string; strong?: boolean; icon?: IconName }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
        {icon && <Icon name={icon} size={14} className="text-faint" />}
        {k}
      </span>
      <span className={cn("num text-right text-[13px] font-semibold text-ink", strong && "text-[14.5px] font-bold", tone)}>{v}</span>
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
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-canvas text-faint">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="font-display text-[14.5px] font-bold text-ink">{title}</p>
        {sub && <p className="mx-auto mt-1 max-w-[38ch] text-[12.5px] leading-relaxed text-muted">{sub}</p>}
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
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div className={cn("modal-pop absolute z-40 mt-1.5 w-[212px] overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pm-lg", align === "right" ? "right-0" : "left-0")}>
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-semibold transition",
                it.danger ? "text-[#b42318] hover:bg-danger-soft" : "text-ink-2 hover:bg-canvas"
              )}
            >
              <Icon name={it.icon} size={15} className={it.danger ? "text-[#b42318]" : "text-muted"} />
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
    success: { icon: "check-circle" as IconName, cls: "bg-white border-pmgreen/30", ic: "bg-pmgreen-soft text-[#067647]" },
    info: { icon: "info" as IconName, cls: "bg-white border-pmblue/30", ic: "bg-pmblue-soft text-[#175cd3]" },
    warn: { icon: "alert" as IconName, cls: "bg-white border-warn/40", ic: "bg-warn-soft text-[#93370d]" },
    danger: { icon: "alert" as IconName, cls: "bg-white border-danger/40", ic: "bg-danger-soft text-[#b42318]" },
  };
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[120] flex w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      {toasts.map((t) => (
        <div key={t.id} className={cn("toast-in pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-pm-lg", map[t.tone].cls)}>
          <span className={cn("mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg", map[t.tone].ic)}>
            <Icon name={map[t.tone].icon} size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-ink">{t.title}</p>
            {t.msg && <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{t.msg}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="grid h-6 w-6 place-items-center rounded-md text-faint transition hover:bg-canvas hover:text-ink">
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
    <span className={cn("grid flex-none place-items-center rounded-full font-display font-bold", cls)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

export function KeyPad({ onKey, onClear }: { onKey: (k: string) => void; onClear: () => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "ok"];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => (k === "clear" ? onClear() : onKey(k))}
          className={cn(
            "focus-ring grid h-12 place-items-center rounded-xl border border-line bg-white font-display text-[16px] font-bold text-ink transition active:scale-95",
            k === "clear" && "text-[#b42318]",
            k === "ok" && "bg-pmgreen-soft text-[#067647]"
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
    <div className={cn("flex items-center justify-center gap-3", error && "shake")}>
      {Array.from({ length: len }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-3.5 rounded-full border-2 transition-all duration-200",
            error ? "border-danger bg-danger/30" : i < filled ? "border-pmgreen bg-pmgreen scale-110" : "border-[#d0d5dd] bg-white"
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
