import type { Metadata } from "next";
import PolicyPage, { PolicyList, PolicySection } from "@/components/PolicyPage";

const description =
  "Community rules for IskoMart: prohibited items, listing and photo standards, scam policy, meetup safety, and enforcement.";

export const metadata: Metadata = {
  title: "Community Rules · IskoMart",
  description,
  openGraph: { title: "Community Rules · IskoMart", description, type: "article" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "standards", title: "Community standards" },
  { id: "prohibited-items", title: "Prohibited items" },
  { id: "listings-and-images", title: "Listings and photos" },
  { id: "payments-and-scams", title: "Payments and scams" },
  { id: "meetup-safety", title: "Meetup safety" },
  { id: "reporting", title: "Reporting and blocking" },
  { id: "enforcement", title: "Enforcement" },
  { id: "appeals", title: "Appeals and contact" },
];

export default function RulesPage() {
  return (
    <PolicyPage
      eyebrow="Community"
      title="Community Rules"
      description="IskoMart works only if Iskolars can trust what they see and who they meet. These rules apply to listings, requests, comments, messages, profiles, reviews, and photos."
      updated="November 2, 2026"
      sections={sections}
    >
      <PolicySection id="standards" title="Community standards">
        <p>
          Treat every Iskolar the way you want to be treated in a campus org room: honestly, directly, and
          without harassment. Use one account, keep your profile accurate, and post only things you actually
          own or have permission to sell.
        </p>
        <PolicyList
          items={[
            "No hate speech, slurs, threats, sexual harassment, or targeted harassment.",
            "No impersonation of another student, a moderator, or IskoMart staff.",
            "No spam, duplicate listings, fake engagement, or misleading prices.",
            "No exposing another person's private information, conversations, or photos without consent.",
            "No attempts to move every conversation off-platform to avoid moderation.",
          ]}
        />
      </PolicySection>

      <PolicySection id="prohibited-items" title="Prohibited items">
        <p>Do not list, request, or advertise the following on IskoMart:</p>
        <PolicyList
          items={[
            "Weapons, ammunition, explosives, fireworks, or anything designed to cause harm.",
            "Illegal drugs, drug paraphernalia, or prescription medicine.",
            "Alcohol, tobacco, vapes, e-cigarettes, or nicotine products.",
            "Stolen, smuggled, or illegally obtained goods.",
            "Counterfeit or replica items presented as authentic.",
            "Live animals, protected wildlife, or animal parts.",
            "Adult content, sexual services, or anything sexualizing minors.",
            "Gambling, lottery, raffle, or betting services without authorization.",
            "Bank accounts, e-wallet accounts, SIM cards, credit cards, passwords, or OTPs.",
            "Government IDs, student records, transcripts, or other people's personal data.",
            "Stolen exam papers, answer keys, or services that complete academic work for someone else. Original reviewers and notes you made yourself are allowed.",
            "Hazardous chemicals, toxic materials, or recalled products.",
            "Any item or service that is illegal under Philippine law or prohibited by PUP policy.",
          ]}
        />
      </PolicySection>

      <PolicySection id="listings-and-images" title="Listings and photos">
        <p>
          Public listings, requests, comments, and reviews are screened before they are posted. The filters
          reject links, email addresses, Philippine mobile numbers, and payment-app or deposit terms. Contact
          details and payment arrangements belong in private chat. Direct messages and profiles may contain
          them, but those messages are flagged for review.
        </p>
        <PolicyList
          items={[
            "Describe the actual item: size, condition, inclusions, flaws, and meetup preference.",
            "Do not use HTML, scripts, embedded media, or filter-evading spacing and symbols.",
            "Do not post the same item repeatedly or bump listings with misleading edits.",
            "Upload real photos of the item you are selling. Supported formats are JPG, PNG, and WebP.",
            "Every photo is checked by file signature, not just by its filename. The current size limit is shown on the upload screen.",
            "Photos must be yours or used with the owner's permission. Do not use stock photos, external store watermarks, or images that hide the item's real condition.",
            "Do not upload screenshots containing names, student numbers, IDs, addresses, order numbers, OTPs, or private chats.",
            "Listing images live in a controlled storage bucket. Only the owner can upload, replace, or delete their own images.",
          ]}
        />
      </PolicySection>

      <PolicySection id="payments-and-scams" title="Payments and scams">
        <p>
          IskoMart is a meetup-and-pay-in-person marketplace. We do not hold funds, offer escrow, process
          online payments, or arrange shipping. A seller asking for money before a meetup is a red flag.
        </p>
        <PolicyList
          items={[
            "Do not ask for deposits, reservation fees, shipping fees, or advance payment in a listing or chat.",
            "Do not post GCash, Maya, bank-transfer, or other payment details in a public listing.",
            "Never ask for or share OTPs, passwords, bank logins, e-wallet PINs, or verification codes.",
            "Ignore overpayment stories, fake receipts, courier-fee requests, and urgent 'pay to reserve' messages.",
            "Inspect the item first. Pay only when you are face to face and satisfied.",
          ]}
        />
        <div className="rounded-2xl border border-[#e8d9c5] bg-[#f5ead8] p-4 text-sm leading-6 text-[#69595a]">
          <strong className="text-[#7b2432]">If someone asks for advance payment,</strong> stop the
          conversation, do not send money, and report the account or listing. Save the chat details for the
          moderator.
        </div>
      </PolicySection>

      <PolicySection id="meetup-safety" title="Meetup safety">
        <PolicyList
          items={[
            "Meet in a public, well-lit place on or near campus, preferably during the day.",
            "Tell a friend where you are going and who you are meeting.",
            "Bring someone with you for high-value items or first-time meetups.",
            "Do not share your home address, dorm room number, or daily schedule.",
            "Inspect and test the item before paying. For gadgets, check that it powers on and matches the listing.",
            "Leave immediately if the other person changes the location, pressures you, or makes you uncomfortable.",
          ]}
        />
      </PolicySection>

      <PolicySection id="reporting" title="Reporting and blocking">
        <p>
          Use the Report option on a listing, request, comment, message, review, or profile. Include what
          happened and any details that help a moderator review it. You can also block an account so its
          content disappears from your feed and conversations.
        </p>
        <p>
          Moderators see reported content snapshots and relevant account history, not your full private
          conversations. Reports are reviewed as quickly as possible. False or retaliatory reports may be
          treated as abuse.
        </p>
      </PolicySection>

      <PolicySection id="enforcement" title="Enforcement">
        <p>
          We may flag content for review, hide it, remove it, or limit an account. Serious or repeated
          violations can lead to a 24-hour mute, suspension, or a permanent ban. Comments may hide
          automatically after three distinct open reports.
        </p>
        <PolicyList
          items={[
            "Content that breaks a hard rule is rejected before it is stored.",
            "Ambiguous content can be marked for review while staying visible.",
            "Accounts that evade a sanction with a new profile may be banned again.",
            "Illegal activity may be reported to PUP authorities or law enforcement.",
          ]}
        />
      </PolicySection>

      <PolicySection id="appeals" title="Appeals and contact">
        <p>
          If you believe a moderation decision was wrong, email{" "}
          <a
            href="mailto:iskomart.pup@gmail.com"
            className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
          >
            iskomart.pup@gmail.com
          </a>{" "}
          with your account email, the post link, and what you want reviewed. Do not create another account
          to get around a suspension.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
