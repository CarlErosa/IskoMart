import type { Metadata } from "next";
import PolicyPage, { PolicyList, PolicySection } from "@/components/PolicyPage";

const description =
  "The terms that govern your use of IskoMart, a meetup-and-pay-in-person marketplace for the PUP community.";

export const metadata: Metadata = {
  title: "Terms of Service · IskoMart",
  description,
  openGraph: { title: "Terms of Service · IskoMart", description, type: "article" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "acceptance", title: "Accepting these terms" },
  { id: "eligibility", title: "Who can use IskoMart" },
  { id: "accounts", title: "Your account" },
  { id: "listings", title: "Listings and transactions" },
  { id: "conduct", title: "Prohibited conduct" },
  { id: "moderation", title: "Moderation and enforcement" },
  { id: "content", title: "Content you post" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "termination", title: "Termination and changes" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Terms of Service"
      description="These terms explain what you can expect from IskoMart and what IskoMart expects from you. They apply every time you browse, post, message, or meet another user."
      updated="November 2, 2026"
      sections={sections}
    >
      <PolicySection id="acceptance" title="Accepting these terms">
        <p>
          By creating an account or using IskoMart, you agree to these terms, our{" "}
          <a href="/privacy" className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2">
            Privacy Policy
          </a>
          , and our{" "}
          <a href="/rules" className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2">
            Community Rules
          </a>
          . If you do not agree, do not use the service.
        </p>
      </PolicySection>

      <PolicySection id="eligibility" title="Who can use IskoMart">
        <p>
          IskoMart is intended for currently enrolled PUP students and recent graduates. You must sign up
          with a personal Gmail address that you control. You must be at least 18 years old, or use the
          service with the consent and supervision of a parent or guardian.
        </p>
        <p>
          IskoMart is a student-built project. It is not an official service of the Polytechnic University
          of the Philippines unless we say so in writing.
        </p>
      </PolicySection>

      <PolicySection id="accounts" title="Your account">
        <PolicyList
          items={[
            "Keep one account per person. Do not create accounts to evade a mute, suspension, or ban.",
            "Provide accurate profile information and keep your login credentials private.",
            "You are responsible for activity that happens through your account.",
            "Tell us promptly if you believe your account has been compromised.",
          ]}
        />
      </PolicySection>

      <PolicySection id="listings" title="Listings and transactions">
        <p>
          Sellers are responsible for the accuracy, legality, and condition of what they list. Buyers are
          responsible for inspecting an item before paying. IskoMart does not own the items, hold funds,
          process online payments, arrange shipping, or guarantee that a transaction will happen.
        </p>
        <PolicyList
          items={[
            "Prices are shown in Philippine pesos and must be the actual price you intend to accept.",
            "Meetups and payment happen in person. Do not send money in advance.",
            "Remove or mark a listing when it is no longer available.",
            "A listing does not create a binding sale until you and the other person agree at the meetup.",
          ]}
        />
      </PolicySection>

      <PolicySection id="conduct" title="Prohibited conduct">
        <p>
          You may not use IskoMart to break the law, harm another person, or undermine the marketplace.
          Prohibited items and behavior are listed in our{" "}
          <a href="/rules" className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2">
            Community Rules
          </a>
          . This includes harassment, hate speech, fraud, impersonation, spam, and attempts to bypass
          moderation filters.
        </p>
      </PolicySection>

      <PolicySection id="moderation" title="Moderation and enforcement">
        <p>
          We review reports and may flag, hide, or remove content, or limit an account. Depending on the
          issue, we may issue a warning, a 24-hour mute, a suspension, or a permanent ban. We may also
          preserve and share information when required by law.
        </p>
        <p>
          Moderation is applied in good faith, but we cannot review every post before it appears. If you see
          something that breaks the rules, report it or email us.
        </p>
      </PolicySection>

      <PolicySection id="content" title="Content you post">
        <p>
          You keep ownership of the text and photos you post. You give IskoMart permission to host, display,
          crop, and resize that content so the marketplace can work. You confirm that you own the content or
          have permission to use it.
        </p>
        <PolicyList
          items={[
            "Do not post another person's photos, private information, or conversations without consent.",
            "Do not post content that infringes copyright, trademarks, or other rights.",
            "We may remove content that violates these terms or applicable law.",
          ]}
        />
      </PolicySection>

      <PolicySection id="disclaimers" title="Disclaimers">
        <p>
          IskoMart is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not
          guarantee uninterrupted access, complete moderation, or the quality, safety, or legality of any
          listing. You use the marketplace at your own risk.
        </p>
      </PolicySection>

      <PolicySection id="liability" title="Limitation of liability">
        <p>
          To the fullest extent allowed by Philippine law, IskoMart and the people who run it are not liable
          for indirect, incidental, or consequential losses arising from a transaction, a meetup, user
          content, or service interruption. Nothing in these terms removes rights that cannot be waived
          under applicable law.
        </p>
      </PolicySection>

      <PolicySection id="termination" title="Termination and changes">
        <p>
          You may stop using IskoMart at any time. We may suspend or end access if you break these terms or
          if continuing would put other users at risk. We may update these terms as the service changes; the
          updated date at the top of this page shows the latest version. Continued use after an update means
          you accept the new terms.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <a
            href="mailto:iskomart.pup@gmail.com"
            className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
          >
            iskomart.pup@gmail.com
          </a>
          . Include your account email and a short description of the issue.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
