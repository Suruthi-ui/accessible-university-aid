import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { requestsQuery, studentsCountQuery, volunteersQuery } from "@/lib/queries";
import { Chip, MatchBar } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AccessU — Smart Accessibility Support for Every Student" },
      { name: "description", content: "AccessU connects university students with disabilities to skilled student volunteers, with AI-explained matches." },
      { property: "og:title", content: "AccessU — Smart Accessibility Support for Every Student" },
      { property: "og:description", content: "Request scribe, reader, note-taking, mobility and exam support — matched to the right volunteer by AI." },
    ],
  }),
  component: Index,
});

const STEPS = [
  { n: "01", t: "Describe once", d: "Category, date, time, location and urgency in one simple form." },
  { n: "02", t: "Get explained matches", d: "Volunteers ranked by skill, availability, experience, rating and location — with the reasoning in plain language." },
  { n: "03", t: "Track to completion", d: "Requests move from open → matched → accepted → completed, visible to coordinators." },
];

function Index() {
  const { data: students } = useQuery(studentsCountQuery);
  const { data: volunteers } = useQuery(volunteersQuery);
  const { data: requests } = useQuery(requestsQuery);
  const completed = requests?.filter((r) => r.status === "completed").length;

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-cyan/20 blur-[120px]" />
          <div className="absolute -bottom-32 right-0 h-[460px] w-[460px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="a-float glass absolute -right-24 top-10 h-80 w-72 rounded-[2rem]" />
          <div className="a-drift absolute -left-16 bottom-8 h-56 w-48 rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
          <div className="a-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span aria-hidden className="size-1.5 rounded-full bg-primary" />
              AI-powered · university accessibility
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] md:text-7xl">
              AccessU
              <span className="mt-3 block text-3xl leading-tight md:text-5xl">
                Smart Accessibility Support for <span className="text-primary">Every Student</span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Students who need academic or campus support describe what they need. AccessU recommends the right volunteers — matched by skill,
              availability, location, experience and rating — and explains why each one is a good fit.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/request" className="rounded-xl bg-primary px-7 py-4 font-display text-lg font-bold text-primary-foreground transition hover:brightness-110">
                Request Support →
              </Link>
              <Link to="/volunteer" className="rounded-xl border border-border bg-glass px-7 py-4 font-display text-lg font-bold hover:border-primary hover:text-primary">
                Become a Volunteer
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-8 text-muted-foreground">
              <div><dt className="text-sm">Students registered</dt><dd className="font-display text-2xl font-black text-foreground">{students ?? "—"}</dd></div>
              <div><dt className="text-sm">Active volunteers</dt><dd className="font-display text-2xl font-black text-foreground">{volunteers?.length ?? "—"}</dd></div>
              <div><dt className="text-sm">Sessions completed</dt><dd className="font-display text-2xl font-black text-foreground">{completed ?? "—"}</dd></div>
            </dl>
          </div>

          <div className="relative" aria-label="Example match">
            <div aria-hidden className="absolute -left-6 top-8 h-full w-full -rotate-3 rounded-[2rem] border border-cyan/25 bg-cyan/5 backdrop-blur-xl" />
            <div className="glass relative rotate-1 rounded-[2rem] p-6 shadow-[var(--shadow-panel)]">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Example match</span>
                <span className="text-primary">Scribe assistance</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div aria-hidden className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-primary font-display font-black text-primary-foreground">MA</div>
                <div>
                  <p className="font-display text-lg font-bold">Maya Anand</p>
                  <p className="text-sm text-muted-foreground">Reader &amp; scribe · 4 yrs · 4.9★</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5"><Chip>Certified scribe</Chip><Chip>Quiet-room protocol</Chip></div>
              <div className="mt-5"><MatchBar value={94} strong /></div>
              <p className="mt-4 text-muted-foreground">
                <span className="font-semibold text-primary">Why this fits: </span>
                Maya is a certified scribe, free weekday afternoons in the Main Library, and has completed 38 similar sessions with a 4.9 rating.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-slate/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-4xl font-black">How AccessU works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="glass rounded-[1.6rem] p-6">
                <span className="font-display text-sm font-black text-primary">{s.n}</span>
                <h3 className="mt-2 text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/assistant" className="rounded-xl border border-border px-5 py-3 font-semibold hover:border-primary hover:text-primary">Ask the AI assistant</Link>
            <Link to="/coordinator" className="rounded-xl border border-border px-5 py-3 font-semibold hover:border-primary hover:text-primary">Coordinator dashboard</Link>
          </div>
        </div>
      </section>
    </>
  );
}
