import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook stub (test mode).
 * Verifies signature when STRIPE_WEBHOOK_SECRET is set; otherwise accepts
 * parsed JSON for local demos and logs the event type.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const rawBody = await req.text();

  let event: { type: string; data?: { object?: { metadata?: Record<string, string> } } };

  if (secret && stripeKey) {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }
    try {
      const stripe = new Stripe(stripeKey);
      event = stripe.webhooks.constructEvent(rawBody, sig, secret) as typeof event;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid signature";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } else {
    try {
      event = JSON.parse(rawBody) as typeof event;
    } catch {
      return NextResponse.json(
        {
          ok: true,
          stub: true,
          message:
            "Webhook stub: no STRIPE_WEBHOOK_SECRET. Configure keys for production.",
        },
        { status: 200 }
      );
    }
  }

  // Stub handlers — client unlocks via Demo unlock or success redirect.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated"
  ) {
    console.log(
      "[stripe webhook stub]",
      event.type,
      event.data?.object?.metadata?.planId
    );
  }

  return NextResponse.json({ received: true, type: event.type, stub: !secret });
}
