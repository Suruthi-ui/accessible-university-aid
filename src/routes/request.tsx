import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { volunteersQuery } from "@/lib/queries";
import { CATEGORIES, LOCATIONS, URGENCIES, dayOf, fallbackExplanation, initials, rankVolunteers, type Match, type SupportRequest } from "@/lib/match";
import { explainMatches } from "@/lib/explain.functions";
import { Chip, MatchBar, PageHeader, UrgencyBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "Request Support — AccessU" },
      { name: "description", content: "Submit an accessibility support request and get AI-explained volunteer matches." },
      { property: "og:title", content: "Request Support — AccessU" },
      { property: "og:description", content: "Scribe, reader, note-taking, mobility, communication, exam and campus activity support." },
    ],
  }),
  component: RequestPage,
});

function tomorrow() {
  const d = new Date(Date.now() + 86400000);
  return d.toISOString().slice(0, 10);
}

function RequestPage() {
  const qc = useQueryClient();
  const { data: volunteers = [] } = useQuery(volunteersQuery);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<SupportRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explaining, setExplaining] = useState(false);
  const [requested, setRequested] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      student_name: String(f.get("student_name")).trim(),
      student_code: String(f.get("student_code")).trim(),
      category: String(f.get("category")),
      support_required: String(f.get("support_required")).trim(),
      request_date: String(f.get("request_date")),
      request_time: String(f.get("request_time")),
      location: String(f.get("location")),
      urgency: String(f.get("urgency")),
      details: String(f.get("details") ?? "").trim(),
    };
    setSubmitting(true);
    const { data, error } = await supabase.from("support_requests").insert(payload).select().single();
    setSubmitting(false);
    if (error || !data) {
      toast.error("Could not submit request. Please try again.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["requests"] });
    setSaved(data);
    setRequested(null);
    const ranked = rankVolunteers(volunteers, data);
    setMatches(ranked);
    setExplanations({});
    toast.success("Request submitted — here are your matches.");
    setTimeout(() => resultsRef.current?.focus(), 50);

    if (ranked.length) {
      setExplaining(true);
      try {
        const res = await explainMatches({
          data: {
            request: data,
            candidates: ranked.map((m) => ({
              id: m.volunteer.id,
              name: m.volunteer.name,
              skills: m.volunteer.skills,
              categories: m.volunteer.categories,
              experience_years: m.volunteer.experience_years,
              availability_label: m.volunteer.availability_label,
              availability_match: m.breakdown.availability >= 20,
              location: m.volunteer.location,
              rating: Number(m.volunteer.rating),
              sessions: m.volunteer.sessions,
              score: m.score,
            })),
          },
        });
        setExplanations(res.explanations);
        if (res.error) toast.message(res.error);
      } catch {
        toast.message("AI explanation unavailable — showing summary instead.");
      } finally {
        setExplaining(false);
      }
    }
  }

  async function requestVolunteer(m: Match) {
    if (!saved) return;
    const { error } = await supabase.from("support_requests").update({ status: "matched", volunteer_id: m.volunteer.id }).eq("id", saved.id);
    if (error) { toast.error("Could not send request."); return; }
    setRequested(m.volunteer.id);
    qc.invalidateQueries({ queryKey: ["requests"] });
    toast.success(`Request sent to ${m.volunteer.name}. They'll confirm from their dashboard.`);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <PageHeader eyebrow="Student support" title="Request support">
            Tell us what you need. AccessU finds volunteers who fit the category, time and location — and explains why.
          </PageHeader>
          <ul className="mt-8 space-y-4">
            {[
              ["Describe once.", "Category, date, time, location and urgency in one pass."],
              ["Get explained matches.", "Not just a score — the reasoning behind each volunteer."],
              ["Not sure which category?", "Ask the AI assistant from the top menu."],
            ].map(([b, t], i) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${i % 2 ? "bg-cyan" : "bg-primary"}`} />
                <span className="text-muted-foreground"><b className="text-foreground">{b}</b> {t}</span>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="glass rounded-[2rem] p-6 md:p-8" aria-label="Support request form">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="student_name" label="Student name"><input id="student_name" name="student_name" required autoComplete="name" defaultValue="Aisha Rahman" className="field" /></Field>
            <Field id="student_code" label="Student ID"><input id="student_code" name="student_code" required defaultValue="U2024118" className="field" /></Field>
            <Field id="category" label="Support category" wide>
              <select id="category" name="category" className="field" defaultValue="Scribe assistance">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field id="support_required" label="Support required" wide>
              <input id="support_required" name="support_required" required defaultValue="Scribe for timed essay during midterms" className="field" />
            </Field>
            <Field id="request_date" label="Date"><input id="request_date" name="request_date" type="date" required defaultValue={tomorrow()} className="field" /></Field>
            <Field id="request_time" label="Time"><input id="request_time" name="request_time" type="time" required defaultValue="14:00" className="field" /></Field>
            <Field id="location" label="Location">
              <select id="location" name="location" className="field" defaultValue="Main Library">
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field id="urgency" label="Urgency">
              <select id="urgency" name="urgency" className="field" defaultValue="High">
                {URGENCIES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
            <Field id="details" label="Additional details" wide>
              <textarea id="details" name="details" rows={3} className="field" defaultValue="Needs quiet room access; prefers a scribe experienced with timed writing." />
            </Field>
          </div>
          <button type="submit" disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-display text-lg font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-60">
            {submitting && <Loader2 className="size-5 animate-spin" aria-hidden />}
            Find my matches →
          </button>
        </form>
      </div>

      {saved && (
        <section ref={resultsRef} tabIndex={-1} aria-labelledby="matches-title" className="mt-16 rounded-[2rem] border border-border bg-slate/40 p-6 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="matches-title" className="text-3xl font-black md:text-4xl">Smart volunteer matching</h2>
              <p className="mt-2 text-muted-foreground">
                Ranked for {saved.student_name} · {saved.category} · {saved.location} · {dayOf(saved.request_date)} {saved.request_time}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={saved.urgency} />
              <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                AI ranked · {matches.length} candidates
              </span>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{explaining ? "Generating AI explanations" : matches.length ? "Explanations ready" : ""}</p>
          {matches.length === 0 ? (
            <p className="mt-8 text-lg text-muted-foreground">No volunteers currently cover this category. A coordinator has been notified and will follow up.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {matches.map((m, i) => (
                <article key={m.volunteer.id} className={`glass flex flex-col rounded-[1.6rem] p-6 ${i === 0 ? "border-primary/50" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div aria-hidden className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-primary font-display font-black text-primary-foreground">{initials(m.volunteer.name)}</div>
                    <div>
                      <h3 className="text-lg font-bold">{m.volunteer.name}</h3>
                      <p className="text-sm text-muted-foreground">{m.volunteer.experience_years} yrs experience · {Number(m.volunteer.rating).toFixed(1)}★ ({m.volunteer.sessions})</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">{m.volunteer.skills.map((s) => <Chip key={s}>{s}</Chip>)}</div>
                  <p className="mt-3 text-sm text-muted-foreground">Available: <span className="text-foreground">{m.volunteer.availability_label}</span> · {m.volunteer.location}</p>
                  <div className="mt-4 rounded-xl border border-border bg-ink/40 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkle className="size-3.5" aria-hidden /> Why this match</p>
                    {explaining && !explanations[m.volunteer.id] ? (
                      <p className="mt-1 text-muted-foreground"><span className="a-blink">Thinking…</span></p>
                    ) : (
                      <p className="mt-1">{explanations[m.volunteer.id] ?? fallbackExplanation(m, saved)}</p>
                    )}
                  </div>
                  <div className="mt-4"><MatchBar value={m.score} strong={i === 0} /></div>
                  <button
                    onClick={() => requestVolunteer(m)}
                    disabled={!!requested}
                    className={`mt-5 rounded-xl px-4 py-3 font-display font-bold transition disabled:opacity-60 ${i === 0 ? "bg-primary text-primary-foreground hover:brightness-110" : "border border-border hover:border-primary hover:text-primary"}`}
                  >
                    {requested === m.volunteer.id ? "Requested ✓" : "Request Volunteer"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Field({ id, label, wide, children }: { id: string; label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
    </div>
  );
}
