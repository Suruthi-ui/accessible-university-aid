import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { to: "/request", label: "Request" },
  { to: "/assistant", label: "Assistant" },
  { to: "/volunteer", label: "Volunteers" },
  { to: "/coordinator", label: "Coordinator" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-slate/80 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="AccessU home">
          <span aria-hidden className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-black text-primary-foreground">A</span>
          <span className="font-display text-xl font-extrabold tracking-tight">AccessU</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-2 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-primary", "aria-current": "page" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/request" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary">
            Request support
          </Link>
          <Link to="/volunteer" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110">
            Become a volunteer
          </Link>
        </div>
        <button
          className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-border md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-border px-6 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-lg font-medium" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
