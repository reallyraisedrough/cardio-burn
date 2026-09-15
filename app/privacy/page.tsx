import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-28">
      <Link href="/" className="text-sm text-zinc-400">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-black text-white">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Cardio Burner stores workout history locally on your device using
          IndexedDB / local storage. We do not upload your session data to our
          servers for the free/demo experience.
        </p>
        <p>
          If you use Stripe checkout, payment processing is handled by Stripe
          under their privacy policy. We only receive subscription status via
          webhooks when configured.
        </p>
        <p>
          Optional browser notifications (set-complete alerts) require your
          explicit permission and are never used for marketing.
        </p>
        <p>This app is not a medical device and does not collect health PHI.</p>
      </div>
    </div>
  );
}
