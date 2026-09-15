import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let planId: PlanId | undefined;
  try {
    const body = (await req.json()) as { planId?: PlanId };
    planId = body.planId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({
      demo: true,
      url: null,
      message:
        "Stripe not configured. Use Demo unlock on the subscribe page.",
      plan: { id: plan.id, priceLabel: plan.priceLabel },
    });
  }

  try {
    const stripe = new Stripe(secret);
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const mode = plan.id === "lifetime" ? "payment" : "subscription";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      success_url: `${origin}/subscribe?success=1&plan=${plan.id}`,
      cancel_url: `${origin}/subscribe?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            product_data: {
              name: `Cardio Burner — ${plan.name}`,
              description: plan.description,
            },
            ...(mode === "subscription"
              ? {
                  recurring: {
                    interval: plan.id === "yearly" ? "year" : "month",
                    interval_count: plan.id === "sixmo" ? 6 : 1,
                  },
                }
              : {}),
          },
        },
      ],
      metadata: { planId: plan.id },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
