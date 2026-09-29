import { PolicyPager } from "@/components/PolicyPager";

const steps = [
  {
    eyebrow: "Privacy · draft",
    title: "Cardio Burner privacy",
    body: "Cardio Burner is aimed at iOS and Android. It is a progressive web app (PWA) now, with store apps planned later. This is a plain-language draft, not legal advice.",
  },
  {
    eyebrow: "What stays local",
    title: "Your workout stays on your device",
    body: "After you give consent, Cardio Burner stores app data on the device in IndexedDB and/or localStorage.",
    bullets: [
      "Workout times, sets, reps, and mode",
      "Local progress and related app settings",
      "An optional account email if you choose to log in",
    ],
  },
  {
    eyebrow: "No workout server",
    title: "We do not sell or read workout logs",
    body: "Your data is not sold or traded. The creator and anyone associated with building Cardio Burner do not view your workout logs. There is no backend that lets the builder read those logs.",
  },
  {
    eyebrow: "Choices",
    title: "Notifications are opt-in",
    body: "Notifications, such as workout or inspiration reminders, are off unless you choose to allow them. You can change notification permission in your device or browser settings.",
  },
  {
    eyebrow: "Payments",
    title: "Stripe handles payment details",
    body: "If you subscribe, Stripe is the payment processor and sees the payment data needed to process your purchase. Stripe does not receive your workout logs from Cardio Burner.",
  },
  {
    eyebrow: "Your control",
    title: "How to delete local data",
    body: "To remove local Cardio Burner data, clear this site’s data in your browser or device settings. If the app already shows an in-app data-clearing control, you may use that. This draft does not promise a remote delete because workout logs are not stored in a builder-readable backend.",
  },
  {
    eyebrow: "Questions",
    title: "Contact and review",
    body: "Contact placeholder: the GitHub repository reallyraisedrough/cardio-burn. This privacy draft should be reviewed by a lawyer before any App Store or Google Play submission.",
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPager
      title="Cardio Burner privacy"
      description="Cardio Burner is aimed at iOS and Android. It is a progressive web app (PWA) now, with store apps planned later. This is a plain-language draft, not legal advice."
      steps={steps}
    />
  );
}
