import { PolicyPager } from "@/components/PolicyPager";

const steps = [
  {
    eyebrow: "Data collection · draft",
    title: "What Cardio Burner collects",
    body: "This data-collection policy is a plain-language draft for Cardio Burner, an app aimed at iOS and Android. It is a PWA now; store apps may come later. It is not legal advice.",
  },
  {
    eyebrow: "Only after consent",
    title: "What is saved locally",
    body: "Cardio Burner saves the following on your device only after you consent to local storage, using IndexedDB and/or localStorage:",
    bullets: [
      "Workout times, sets, reps, and workout mode",
      "Local progress",
      "An optional account email if you log in",
    ],
  },
  {
    eyebrow: "What we do not do",
    title: "No sale, trade, or builder access",
    body: "Cardio Burner does not sell or trade this data. The creator and anyone associated with building the app do not view your workout logs. There is no backend that lets the builder read workout logs.",
  },
  {
    eyebrow: "Notifications",
    title: "Reminders require your choice",
    body: "Notifications are opt-in. Cardio Burner does not turn them on without your permission. You can manage permission through your browser or device settings.",
  },
  {
    eyebrow: "Subscriptions",
    title: "Payment data goes to Stripe",
    body: "When you subscribe, Stripe sees the payment data needed to process the transaction. Stripe does not see your workout logs from Cardio Burner.",
  },
  {
    eyebrow: "Delete on your device",
    title: "Clear local Cardio Burner data",
    body: "Clear the site data in your browser or device settings. You can also use an in-app clear-data control if one already exists. Do not assume there is a remote-delete feature: this policy does not invent one.",
  },
  {
    eyebrow: "Questions",
    title: "Contact and legal review",
    body: "Contact placeholder: the GitHub repository reallyraisedrough/cardio-burn. This data-collection policy is a draft, not legal advice, and a lawyer should review it before any App Store or Google Play submission.",
  },
];

export default function DataPolicyPage() {
  return (
    <PolicyPager
      title="What data is collected"
      description="This data-collection policy is a plain-language draft for Cardio Burner, an app aimed at iOS and Android. It is a PWA now; store apps may come later. It is not legal advice."
      steps={steps}
    />
  );
}
