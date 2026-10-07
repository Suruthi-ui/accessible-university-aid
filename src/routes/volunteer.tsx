import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { requestsQuery, volunteersQuery } from "@/lib/queries";
import { CATEGORIES, LOCATIONS, dayOf, initials, scoreVolunteer, type SupportRequest } from "@/lib/match";
import { Chip, PageHeader, Panel, Stat, StatusBadge, UrgencyBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/volunteer")({
  head: () => ({
    meta: [
      { title: "Volunteer Dashboard — AccessU" },
      { name: "description", content: "Find accessibility support requests that match your skills and availability." },
      { property: "og:title", content: "Volunteer Dashboard — AccessU" },
      { property: "og:description", content: "Become a volunteer and support students with disabilities on campus." },
    ],
  }),
  component: VolunteerPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function VolunteerPage() {
  const qc = useQueryClient();
  const { data: volunteers = [] } = useQuery(volunteersQuery);
  const { data: requests = [] } = useQuery(requestsQuery);
  const [selectedId, setSelectedId] = useState<string>("11111111-0000-0000-0000-000000000002");
  const [joinOpen, setJoinOpen] = useState(false);
  const me = volunteers.find((v) => v.id === selectedId) ?? volunteers[0];

  const refresh = () => qc.invalidateQueries({ queryKey: ["requests"] });

  async function updateRequest(r: SupportRequest, patch: Partial<SupportRequest>, msg: string) {
    const { error } = await supabase.from("support_requests").update(patch).eq("id", r.id);
    if (error) { toast.error("Update failed."); return; }
    toast.success(msg);
    refresh();
  }

  async function join(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const categories = f.getAll("categories").map(String);
    const days = f.getAll("days").map(String);
    if (!categories.length || !days.length) { toast.error("Pick at least one category and one day."); return; }
    const { data, error } = await supabase
      .from("volunteers")
      .insert({
        name: String(f.get("name")).trim(),
        categories,
        skills: String(f.get("skills")).split(",").map((s) => s.trim()).filter(Boolean),
        experience_years: Number(f.get("experience")) || 0,
        availability_days: days,
        availability_label: days.join(", "),
        location: String(f.get("location")),
        rating: 4.5,
      })
      .select()
      .single();
    if (error || !data) { toast.error("Could not register."); return; }
    await qc.invalidateQueries({ queryKey: ["volunteers"] });
    setSelectedId(data.id);
    setJoinOpen(false);
    toast.success(`Welcome to AccessU, ${data.name}!`);
  }

  if (!me) return <div className="mx-auto max-w-7xl px-6 py-14 text-muted-foreground">Loading…</div>;

  const available = requests
    .filter((r) => r.status === "open" && me.categories.includes(r.category))
    .map((r) => ({ r, score: scoreVolunteer(me, r).score }))
    .sort((a, b) => b.score - a.score);
  const incoming = requests.filter((r) => r.status === "matched" && r.volunteer_id === me.id);
  const accepted = requests.filter((r) => r.status === "accepted" && r.volunteer_id === me.id);
  const completed = requests.filter((r) => r.status === "completed" && r.volunteer_id === me.id);

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeader eyebrow="Volunteer" title="Volunteer dashboard">
          See support requests that fit your skills and availability. Accept, complete and build your rating.
        </PageHeader>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="vol-select" className="field-label">Viewing as</label>
            <select id="vol-select" className="field min-w-56" value={me.id} onChange={(e) => setSelectedId(e.target.value)}>
              {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <button onClick={() => setJoinOpen((o) => !o)} aria-expanded={joinOpen} className="rounded-xl bg-primary px-5 py-3.5 font-display font-bold text-primary-foreground hover:brightness-110">
            {joinOpen ? "Close" : "Become a Volunteer"}
          </button>
        </div>
      </div>

      {joinOpen && (
        <form onSubmit={join} className="glass a-rise mt-8 grid gap-5 rounded-[2rem] p-6 md:grid-cols-2 md:p-8" aria-label="Volunteer registration">
          <div><label htmlFor="v-name" className="field-label">Full name</label><input id="v-name" name="name" required className="field" /></div>
          <div><label htmlFor="v-skills" className="field-label">Skills (comma separated)</label><input id="v-skills" name="skills" placeholder="Fast typing, BSL, First aid" className="field" /></div>
          <div><label htmlFor="v-exp" className="field-label">Years of experience</label><input id="v-exp" name="experience" type="number" min={0} max={20} defaultValue={0} className="field" /></div>
          <div><label htmlFor="v-loc" className="field-label">Usual location</label><select id="v-loc" name="location" className="field">{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
          <fieldset className="md:col-span-2">
            <legend className="field-label">Support you can offer</legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 has-[:checked]:border-primary has-[:checked]:text-primary">
                  <input type="checkbox" name="categories" value={c} className="size-4 accent-[var(--primary)]" /> {c}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="md:col-span-2">
            <legend className="field-label">Available days</legend>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label key={d} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 has-[:checked]:border-primary has-[:checked]:text-primary">
                  <input type="checkbox" name="days" value={d} className="size-4 accent-[var(--primary)]" /> {d}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="rounded-xl bg-primary px-6 py-4 font-display font-bold text-primary-foreground md:col-span-2">Register as volunteer</button>
        </form>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <Panel>
            <div className="flex items-center gap-4">
              <div aria-hidden className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-primary font-display text-lg font-black text-primary-foreground">{initials(me.name)}</div>
              <div>
                <h2 className="text-xl font-bold">{me.name}</h2>
                <p className="text-muted-foreground">{me.location} · {me.experience_years} yrs</p>
              </div>
            </div>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">{me.skills.map((s) => <Chip key={s}>{s}</Chip>)}</div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Supports</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">{me.categories.map((s) => <Chip key={s}>{s}</Chip>)}</div>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Availability</h3>
            <p className="mt-1">{me.availability_label}</p>
          </Panel>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Rating" value={Number(me.rating).toFixed(1)} tone="accent" />
            <Stat label="Accepted" value={accepted.length + incoming.length} />
            <Stat label="Completed" value={completed.length + me.sessions} />
          </div>
        </div>

        <div className="space-y-6">
          {incoming.length > 0 && (
            <Panel className="border-primary/40">
              <h2 className="text-xl font-bold">Requests sent to you</h2>
              <ul className="mt-4 space-y-3">
                {incoming.map((r) => (
                  <RequestRow key={r.id} r={r}>
                    <button onClick={() => updateRequest(r, { status: "accepted" }, "Request accepted.")} className="rounded-lg bg-primary px-4 py-2.5 font-bold text-primary-foreground">Accept</button>
                  </RequestRow>
                ))}
              </ul>
            </Panel>
          )}
          <Panel>
            <h2 className="text-xl font-bold">Available support requests <span className="text-muted-foreground">({available.length})</span></h2>
            {available.length === 0 ? (
              <p className="mt-4 text-muted-foreground">No open requests in your categories right now.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {available.map(({ r, score }) => (
                  <RequestRow key={r.id} r={r} score={score}>
                    <button onClick={() => updateRequest(r, { status: "accepted", volunteer_id: me.id }, "Request accepted — the student has been notified.")} className="rounded-lg bg-primary px-4 py-2.5 font-bold text-primary-foreground">Accept request</button>
                  </RequestRow>
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <h2 className="text-xl font-bold">Accepted requests</h2>
            {accepted.length === 0 ? <p className="mt-4 text-muted-foreground">Nothing scheduled yet.</p> : (
              <ul className="mt-4 space-y-3">
                {accepted.map((r) => (
                  <RequestRow key={r.id} r={r}>
                    <button onClick={() => updateRequest(r, { status: "completed" }, "Marked as completed. Thank you!")} className="rounded-lg border border-border px-4 py-2.5 font-semibold hover:border-primary hover:text-primary">Mark completed</button>
                  </RequestRow>
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <h2 className="text-xl font-bold">Completed requests</h2>
            {completed.length === 0 ? <p className="mt-4 text-muted-foreground">No completed sessions in AccessU yet.</p> : (
              <ul className="mt-4 space-y-3">{completed.map((r) => <RequestRow key={r.id} r={r} />)}</ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function RequestRow({ r, score, children }: { r: SupportRequest; score?: number; children?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-ink/40 p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-primary">{r.category}</span>
          <UrgencyBadge urgency={r.urgency} />
          <StatusBadge status={r.status} />
          {score !== undefined && <span className="text-sm text-muted-foreground">{score}% fit</span>}
        </div>
        <p className="mt-1 font-display font-bold">{r.support_required}</p>
        <p className="text-sm text-muted-foreground">{r.student_name} · {r.location} · {dayOf(r.request_date)} {r.request_date} · {r.request_time}</p>
      </div>
      {children}
    </li>
  );
}
