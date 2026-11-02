import type { Metadata } from "next";
import PolicyPage, { PolicyList, PolicySection } from "@/components/PolicyPage";

const description =
  "IskoMart is a student-built marketplace for PUP Iskolars to buy, sell, and meet safely on campus.";

export const metadata: Metadata = {
  title: "About · IskoMart",
  description,
  openGraph: { title: "About · IskoMart", description, type: "article" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "mission", title: "Why IskoMart exists" },
  { id: "how-it-works", title: "How it works" },
  { id: "safety", title: "Safety by default" },
  { id: "community", title: "Built for the PUP community" },
  { id: "contact", title: "Contact and feedback" },
];

export default function AboutPage() {
  return (
    <PolicyPage
      eyebrow="About"
      title="A campus marketplace made by Iskolars."
      description="IskoMart helps PUP students pass down good finds, clear out dorm clutter, and ask the community for what they need, without leaving campus."
      updated="November 2, 2026"
      sections={sections}
    >
      <PolicySection id="mission" title="Why IskoMart exists">
        <p>
          Campus buying and selling usually happens in group chats, where posts get buried, photos are
          unclear, and scams are hard to spot. IskoMart gives the PUP community one place to browse real
          listings, contact sellers, and arrange a meetup.
        </p>
        <p>
          We are starting small: one campus, verified Gmail accounts, and in-person transactions. That focus
          helps us keep the experience simple and the community accountable.
        </p>
      </PolicySection>

      <PolicySection id="how-it-works" title="How it works">
        <PolicyList
          items={[
            "Create an account with a personal Gmail address and verify your email.",
            "Browse listings or post what you need from the feed.",
            "Message the seller or buyer in the app to ask questions and agree on a meetup.",
            "Meet in a public campus spot, inspect the item, and pay in person.",
            "Report anything suspicious so moderators can review it.",
          ]}
        />
        <p>
          IskoMart does not process online payments, hold funds, or arrange shipping. The marketplace is
          built around a face-to-face exchange.
        </p>
      </PolicySection>

      <PolicySection id="safety" title="Safety by default">
        <p>
          Public posts are screened for links, contact details, payment-app terms, and other risky content.
          Photos are checked as real image files before they are stored. Reports and blocks are available on
          listings, posts, messages, reviews, and profiles.
        </p>
        <PolicyList
          items={[
            "Moderators review reported content and can hide, remove, or restrict accounts.",
            "Hard violations are rejected before content is stored.",
            "Ambiguous content is flagged and reviewed while the community stays visible.",
            "Private conversations stay between participants; moderators see only reported snapshots and relevant account history.",
          ]}
        />
      </PolicySection>

      <PolicySection id="community" title="Built for the PUP community">
        <p>
          IskoMart is built and maintained by PUP students. It is not an official service of the Polytechnic
          University of the Philippines unless we say so in writing. We follow campus rules, Philippine law,
          and the standards in our{" "}
          <a href="/rules" className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2">
            Community Rules
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact and feedback">
        <p>
          Found a bug, have an idea, or want to report a safety issue? Email{" "}
          <a
            href="mailto:iskomart.pup@gmail.com"
            className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
          >
            iskomart.pup@gmail.com
          </a>
          . Include the page or post link and a short description so we can act faster.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
