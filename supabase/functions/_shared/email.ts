import type { EmailMessage, EmailSender } from "./types.ts";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Resend (https://resend.com) — free tier: 3,000 emails/month, 100/day. */
export class ResendSender implements EmailSender {
  constructor(private apiKey: string, private from: string, private fetchImpl: FetchLike = fetch) {}

  async send(msg: EmailMessage): Promise<{ id?: string }> {
    const res = await this.fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, headers: msg.headers }),
    });
    if (!res.ok) throw new Error(`Resend error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const j = (await res.json().catch(() => ({}))) as { id?: string };
    return { id: j.id };
  }
}

/** Collects messages instead of sending (tests and --dry-run). */
export class MemorySender implements EmailSender {
  sent: EmailMessage[] = [];
  async send(msg: EmailMessage): Promise<{ id?: string }> {
    this.sent.push(msg);
    return { id: `memory-${this.sent.length}` };
  }
}
