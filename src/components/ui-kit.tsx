import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="a-rise">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        <span aria-hidden className="size-1.5 rounded-full bg-primary" />
        {eyebrow}
      </span>
      <h1 className="mt-4 text-4xl font-black md:text-5xl">{title}</h1>
      {children && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}

export function Panel({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass rounded-[1.8rem] p-6", className)} {...rest}>
      {children}
    </div>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: "default" | "accent" | "cyan" | "warn" }) {
  const toneCls = { default: "text-foreground", accent: "text-primary", cyan: "text-cyan", warn: "text-warn" }[tone];
  return (
    <div className="rounded-xl border border-border bg-ink/40 p-4">
      <p className={cn("font-display text-3xl font-black", toneCls)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{children}</span>;
}

export function MatchBar({ value, strong }: { value: number; strong?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-muted-foreground">Match</span>
        <span className={cn("font-bold", strong ? "text-primary" : "text-foreground")}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`Match ${value} percent`}>
        <div className={cn("a-bar h-2 rounded-full", strong ? "bg-primary" : "bg-cyan")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  const cls =
    urgency === "High"
      ? "border-destructive/50 text-destructive"
      : urgency === "Medium"
        ? "border-warn/50 text-warn"
        : "border-border text-muted-foreground";
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}>{urgency} urgency</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    open: "bg-cyan/15 text-cyan",
    matched: "bg-warn/15 text-warn",
    accepted: "bg-primary/15 text-primary",
    completed: "bg-secondary text-muted-foreground",
  };
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", cls[status] ?? cls["open"])}>{status}</span>;
}
