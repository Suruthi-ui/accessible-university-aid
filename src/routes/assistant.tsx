import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Send, Square, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Accessibility Assistant — AccessU" },
      { name: "description", content: "Ask which accessibility support you can request, which category fits, and how to submit." },
      { property: "og:title", content: "AI Accessibility Assistant — AccessU" },
      { property: "og:description", content: "Plain-language answers about university accessibility support." },
    ],
  }),
  component: AssistantPage,
});

const STORAGE_KEY = "accessu-chat-v1";
const SUGGESTIONS = [
  "What support can I request?",
  "I get tired writing in lectures — which category fits me?",
  "How do I submit a request?",
  "Can I get help getting around campus?",
];

function AssistantPage() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => {
      const msg = e.message || "";
      if (msg.includes("429")) toast.error("Too many requests — please wait a moment.");
      else if (msg.includes("402")) toast.error("AI credits are used up for this workspace.");
      else toast.error("The assistant couldn't respond. Please try again.");
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as UIMessage[]);
    } catch {
      /* ignore */
    }
    setLoaded(true);
    inputRef.current?.focus();
  }, [setMessages]);

  useEffect(() => {
    if (!loaded || busy) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    inputRef.current?.focus();
  }, [messages, busy, loaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <PageHeader eyebrow="AI assistant" title="AI accessibility assistant">
            Ask in plain language. The assistant explains which support category fits, how to submit, and answers general accessibility questions.
          </PageHeader>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Suggested questions">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={busy} className="rounded-full border border-border bg-glass px-4 py-2.5 text-left hover:border-primary hover:text-primary disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
          <Link to="/request" className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3.5 font-display font-bold text-primary-foreground hover:brightness-110">
            Go to Request Support →
          </Link>
        </div>

        <section aria-label="Chat with AccessU Assistant" className="glass flex h-[70dvh] min-h-[480px] flex-col rounded-[2rem] p-5 md:p-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary font-display font-black text-primary-foreground">A</span>
            <div className="flex-1">
              <p className="font-display font-bold">AccessU Assistant</p>
              <p className="text-sm text-muted-foreground">Accessibility &amp; support guidance</p>
            </div>
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); localStorage.removeItem(STORAGE_KEY); }} className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:border-primary" aria-label="Start a new conversation">
                <RotateCcw className="size-4" aria-hidden /> New
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto py-5" role="log" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && (
              <p className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-glass px-4 py-3">
                Hi! I can help you figure out what support to request — scribes, readers, note-takers, mobility help, captioning, exam support and more. What do you need help with?
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground" : "max-w-[90%] px-1 py-1"}>
                  <span className="sr-only">{m.role === "user" ? "You said:" : "Assistant said:"}</span>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      <div key={i} className="space-y-2 [&_a]:text-primary [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_strong]:text-primary [&_ul]:list-disc">
                        {m.role === "user" ? p.text : <ReactMarkdown>{p.text}</ReactMarkdown>}
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {status === "submitted" && (
              <p className="flex gap-1 px-1 text-muted-foreground" aria-label="Assistant is typing">
                <span className="a-blink">●</span><span className="a-blink [animation-delay:.2s]">●</span><span className="a-blink [animation-delay:.4s]">●</span>
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">Ask about accessibility support</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about accessibility support…"
              className="field max-h-40 resize-none"
            />
            {busy ? (
              <button type="button" onClick={() => stop()} className="grid size-12 shrink-0 place-items-center rounded-xl border border-border hover:border-primary" aria-label="Stop response">
                <Square className="size-5" aria-hidden />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send message">
                <Send className="size-5" aria-hidden />
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
