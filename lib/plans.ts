import type { Plan } from "./types";

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    priceLabel: "$5.99/mo",
    priceCents: 599,
    interval: "month",
    description: "Full progress history & goals, billed monthly.",
  },
  {
    id: "sixmo",
    name: "6 Months",
    priceLabel: "$25.99/6mo",
    priceCents: 2599,
    interval: "6 months",
    description: "Save vs monthly — six months of Cardio Burner Pro.",
    highlight: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    priceLabel: "$45.99/yr",
    priceCents: 4599,
    interval: "year",
    description: "Best annual value for dedicated burners.",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    priceLabel: "$65.99",
    priceCents: 6599,
    interval: "once",
    description: "Pay once. Unlock forever on this device.",
  },
];
