import type { Tables } from "@/integrations/supabase/types";

export type Volunteer = Tables<"volunteers">;
export type SupportRequest = Tables<"support_requests">;

export const CATEGORIES = [
  "Scribe assistance",
  "Reader assistance",
  "Note-taking assistance",
  "Mobility assistance",
  "Communication assistance",
  "Exam assistance",
  "Campus activity assistance",
] as const;

export const LOCATIONS = [
  "Main Library",
  "Science Wing",
  "Arts Building",
  "North Campus",
  "Exam Hall B",
  "Student Union",
];

export const URGENCIES = ["High", "Medium", "Low"] as const;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type MatchBreakdown = {
  category: number;
  availability: number;
  experience: number;
  rating: number;
  location: number;
  skills: number;
};

export type Match = { volunteer: Volunteer; score: number; breakdown: MatchBreakdown };

export function dayOf(date: string) {
  const d = new Date(date + "T12:00:00");
  return DAYS[d.getDay()];
}

export function scoreVolunteer(
  v: Volunteer,
  r: Pick<SupportRequest, "category" | "request_date" | "location" | "support_required" | "details">,
): Match {
  const category = v.categories.includes(r.category) ? 40 : 0;
  const availability = v.availability_days.includes(dayOf(r.request_date)) ? 20 : 4;
  const experience = Math.round((Math.min(v.experience_years, 4) / 4) * 10);
  const rating = Math.round(Math.max(0, Math.min(1, (Number(v.rating) - 4) / 1)) * 10);
  const location = v.location === r.location ? 10 : 3;
  const text = `${r.support_required} ${r.details}`.toLowerCase();
  const hits = v.skills.filter((s) =>
    s.toLowerCase().split(/[^a-z]+/).some((w) => w.length > 3 && text.includes(w)),
  ).length;
  const skills = Math.min(10, 4 + hits * 3);
  const breakdown = { category, availability, experience, rating, location, skills };
  const score = Math.min(99, Object.values(breakdown).reduce((a, b) => a + b, 0));
  return { volunteer: v, score, breakdown };
}

export function rankVolunteers(volunteers: Volunteer[], r: Parameters<typeof scoreVolunteer>[1], limit = 3) {
  return volunteers
    .map((v) => scoreVolunteer(v, r))
    .filter((m) => m.breakdown.category > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function fallbackExplanation(m: Match, r: Parameters<typeof scoreVolunteer>[1]) {
  const v = m.volunteer;
  const parts = [`${v.name.split(" ")[0]} supports ${r.category.toLowerCase()}`];
  if (m.breakdown.availability >= 20) parts.push(`is available on ${dayOf(r.request_date)}s`);
  if (m.breakdown.location >= 10) parts.push(`is based at ${v.location}`);
  parts.push(`has ${v.experience_years} yr${v.experience_years === 1 ? "" : "s"} experience and a ${v.rating}★ rating over ${v.sessions} sessions`);
  return parts.join(", ") + ".";
}
