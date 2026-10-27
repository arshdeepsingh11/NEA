import { NextResponse } from "next/server";

/**
 * Receives every form on the site (skin scan, consultation, partner, contact…).
 * Set LEAD_WEBHOOK_URL to forward leads to Zapier/Make/your CRM, so the
 * "reply within 15 minutes" rule can be automated with SMS.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.company_website) return NextResponse.json({ ok: true }); // honeypot
  const email = String(body.email ?? "");
  const phone = String(body.phone ?? "");
  if (!email && !phone) return NextResponse.json({ error: "Add an email or phone number" }, { status: 422 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Check the email address" }, { status: 422 });

  const lead = { ...body, receivedAt: new Date().toISOString() };
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    } catch {
      return NextResponse.json({ error: "Could not deliver the request" }, { status: 502 });
    }
  } else {
    console.info("[lead]", lead);
  }
  return NextResponse.json({ ok: true });
}
