import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  request: z.object({
    category: z.string(),
    support_required: z.string(),
    details: z.string(),
    request_date: z.string(),
    request_time: z.string(),
    location: z.string(),
    urgency: z.string(),
  }),
  candidates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        skills: z.array(z.string()),
        categories: z.array(z.string()),
        experience_years: z.number(),
        availability_label: z.string(),
        availability_match: z.boolean(),
        location: z.string(),
        rating: z.number(),
        sessions: z.number(),
        score: z.number(),
      }),
    )
    .max(5),
});

export const explainMatches = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { generateFinalText } = await import("./ai/gateway.server");
    const instructions =
      "You explain volunteer matches for a university accessibility support platform. For each candidate write ONE or TWO plain-language sentences (max 45 words) to the student explaining why this volunteer suits their specific request, referencing concrete facts (skills, availability on that day, location, experience, rating). If there is a weakness (e.g. not available that day, different location), mention it honestly. Respond ONLY with a JSON object mapping candidate id to explanation string, no markdown.";
    const prompt = JSON.stringify(data);
    try {
      const text = await generateFinalText(instructions, prompt);
      const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const parsed = JSON.parse(json) as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const c of data.candidates) {
        const v = parsed[c.id];
        if (typeof v === "string") out[c.id] = v.slice(0, 400);
      }
      return { explanations: out, error: null as string | null };
    } catch (e) {
      console.error("explainMatches failed", e);
      return { explanations: {} as Record<string, string>, error: "AI explanation unavailable right now." };
    }
  });
