import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { requestsQuery, studentsCountQuery, volunteersQuery } from "@/lib/queries";
import { CATEGORIES } from "@/lib/match";
import { PageHeader, Panel, Stat, StatusBadge, UrgencyBadge } from "@/components/ui-kit";

export const Route = createFileRoute("/coordinator")({
  head: () => ({
    meta: [
      { title: "Coordinator Dashboard — AccessU" },
      { name: "description", content: "University overview of accessibility support requests, volunteers, matches and completions." },
      { property: "og:title", content: "Coordinator Dashboard — AccessU" },
      { property: "og:description", content: "Track active requests, available volunteers and completed support at a glance." },
    ],
  }),
  component: CoordinatorPage,
});

function CoordinatorPage() {
  const { data: students } = useQuery(studentsCountQuery);
  const { data: volunteers = [] } = useQuery(volunteersQuery);
  const { data: requests = [] } = useQuery(requestsQuery);

  const count = (s: string) => requests.filter((r) => r.status === s).length;
  const active = requests.filter((r) => r.status !== "completed").length;
  const matched = count("matched") + count("accepted");
  const completed = count("completed");
  const busyIds = new Set(requests.filter((r) => r.status === "accepted").map((r) => r.volunteer_id));
  const availableVols = volunteers.filter((v) => !busyIds.has(v.id)).length;
  const byCat = CATEGORIES.map((c) => ({ c, n: requests.filter((r) => r.category === c).length }));
  const max = Math.max(1, ...byCat.map((b) => b.n));
  const volName = (id: string | null) => volunteers.find((v) => v.id === id)?.name ?? "—";
  const completionRate = requests.length ? Math.round((completed / requests.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <PageHeader eyebrow="Coordinator" title="Coordinator dashboard">
        A live view of accessibility support across campus.
      </PageHeader>

      <section aria-label="Key figures" className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total students" value={students ?? "—"} tone="cyan" />
        <Stat label="Active support requests" value={active} tone="accent" />
        <Stat label="Available volunteers" value={availableVols} />
        <Stat label="Matched requests" value={matched} tone="warn" />
        <Stat label="Completed requests" value={completed} tone="accent" />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <Panel>
            <h2 className="text-xl font-bold">Requests by category</h2>
            <ul className="mt-5 space-y-3">
              {byCat.map(({ c, n }) => (
                <li key={c}>
                  <div className="flex justify-between text-sm"><span>{c}</span><span className="font-bold">{n}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-secondary" aria-hidden>
                    <div className="a-bar h-2 rounded-full bg-cyan" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <div className="flex justify-between"><span className="text-muted-foreground">Completion rate</span><span className="font-bold text-primary">{completionRate}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-secondary" aria-hidden><div className="a-bar h-2 rounded-full bg-primary" style={{ width: `${completionRate}%` }} /></div>
            <p className="mt-4 text-sm text-muted-foreground">Open: {count("open")} · Matched: {count("matched")} · Accepted: {count("accepted")} · Completed: {completed}</p>
          </Panel>
        </div>

        <Panel className="overflow-x-auto">
          <h2 className="text-xl font-bold">All support requests</h2>
          <table className="mt-4 w-full min-w-[640px] text-left">
            <caption className="sr-only">All support requests with status and assigned volunteer</caption>
            <thead className="text-sm text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="col" className="py-3 pr-3 font-semibold">Student</th>
                <th scope="col" className="py-3 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-3 pr-3 font-semibold">When</th>
                <th scope="col" className="py-3 pr-3 font-semibold">Urgency</th>
                <th scope="col" className="py-3 pr-3 font-semibold">Status</th>
                <th scope="col" className="py-3 font-semibold">Volunteer</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-3 pr-3"><span className="font-semibold">{r.student_name}</span><br /><span className="text-sm text-muted-foreground">{r.student_code}</span></td>
                  <td className="py-3 pr-3">{r.category}</td>
                  <td className="py-3 pr-3 text-sm">{r.request_date}<br />{r.request_time} · {r.location}</td>
                  <td className="py-3 pr-3"><UrgencyBadge urgency={r.urgency} /></td>
                  <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
                  <td className="py-3">{volName(r.volunteer_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
