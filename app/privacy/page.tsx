import type { Metadata } from "next";
import PolicyPage, { PolicyList, PolicySection } from "@/components/PolicyPage";
import { PRIVACY_NOTICE_VERSION } from "@/lib/legal/consent";

const description =
  "How IskoMart collects, uses, stores, and protects personal data under the Philippine Data Privacy Act of 2012 (RA 10173).";

export const metadata: Metadata = {
  title: "Privacy Policy · IskoMart",
  description,
  openGraph: { title: "Privacy Policy · IskoMart", description, type: "article" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "scope", title: "Scope" },
  { id: "data-we-collect", title: "Data we collect" },
  { id: "purposes", title: "Why we use it" },
  { id: "legal-basis", title: "Legal basis" },
  { id: "consent", title: "Consent at sign-up" },
  { id: "sharing", title: "Sharing" },
  { id: "retention", title: "Retention" },
  { id: "security", title: "Security" },
  { id: "rights", title: "Your rights" },
  { id: "cookies", title: "Cookies" },
  { id: "minors", title: "Minors" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="This notice explains how IskoMart handles personal data under the Data Privacy Act of 2012 (RA 10173), its implementing rules, and National Privacy Commission guidance."
      updated="November 2, 2026"
      sections={sections}
    >
      <PolicySection id="scope" title="Scope">
        <p>
          This notice applies when you create an IskoMart account, browse or post listings, send messages,
          upload photos, report content, or contact us. It covers the IskoMart web app and the Supabase and
          Vercel services that run it.
        </p>
      </PolicySection>

      <PolicySection id="data-we-collect" title="Data we collect">
        <PolicyList
          items={[
            "Account data: your name, Gmail address, hashed password handled by Supabase Auth, and email verification status.",
            "Profile data: display name, campus or branch, bio, avatar, and header image.",
            "Marketplace data: listings, photos, titles, descriptions, prices, condition, meetup preferences, requests, comments, likes, and reposts.",
            "Communications and safety data: messages, reports, blocks, moderation notes, and account sanctions.",
            "Technical data: IP address, browser and device information, timestamps, error logs, and security events.",
          ]}
        />
        <p>
          Do not post government IDs, student numbers, OTPs, passwords, bank details, or other sensitive
          personal information. If an image or message contains that data, we may remove it.
        </p>
      </PolicySection>

      <PolicySection id="purposes" title="Why we use it">
        <PolicyList
          items={[
            "To create and secure your account, verify your email, and sign you in.",
            "To show listings, profiles, messages, comments, and ratings to the right people.",
            "To run moderation, investigate reports, prevent fraud, and enforce our rules.",
            "To respond to support requests, appeals, and privacy requests.",
            "To monitor reliability, fix errors, and protect the service from abuse.",
            "To comply with legal obligations and lawful requests from authorities.",
          ]}
        />
        <p>We do not sell personal data or use it for third-party advertising.</p>
      </PolicySection>

      <PolicySection id="legal-basis" title="Legal basis">
        <p>We process personal data only when we have a lawful basis under RA 10173, including:</p>
        <PolicyList
          items={[
            "Performance of our agreement with you, such as providing the marketplace and your account.",
            "Your consent, where we ask for it separately.",
            "Our legitimate interests in safety, fraud prevention, moderation, and service reliability.",
            "Compliance with legal obligations or a lawful order.",
          ]}
        />
        <p>
          Where we rely on consent, we will ask for it separately and record the version and time you
          accepted. You may withdraw consent for future processing, but that does not affect processing that
          already happened.
        </p>
      </PolicySection>

      <PolicySection id="consent" title="Consent at sign-up">
        <p>
          When you create an account, we ask you to confirm that you have read this notice. We record the
          notice version (<strong>{PRIVACY_NOTICE_VERSION}</strong>) and the time you accepted it in our
          database. That record is kept as evidence of the consent you gave.
        </p>
        <p>
          You may withdraw consent for future processing by emailing us. Withdrawal does not affect
          processing that already happened, and we may still process some data where another legal basis
          applies, such as safety, fraud prevention, or a legal obligation.
        </p>
        <p>
          If this notice changes materially, we will publish a new version and show the first-visit notice
          again.
        </p>
      </PolicySection>

      <PolicySection id="sharing" title="Sharing">
        <p>We share data only as needed to run IskoMart:</p>
        <PolicyList
          items={[
            "Supabase provides authentication, database, and image storage.",
            "Vercel provides hosting and delivery.",
            "Authorized moderators review reported content snapshots and relevant account history. They do not read full private conversations unless a report requires it.",
            "We may disclose data when required by law, a court order, or a lawful request from PUP authorities or law enforcement.",
          ]}
        />
        <p>
          Service providers process data for us under their terms and only for the services they provide.
        </p>
      </PolicySection>

      <PolicySection id="retention" title="Retention">
        <p>
          We keep account and marketplace data while your account is active. Reports, moderation records,
          and sanctions may be kept longer where needed to protect users, resolve disputes, or meet legal
          requirements. Deleted content may remain in backups for a limited period before it is overwritten.
          Technical logs are kept only as long as needed for security and troubleshooting.
        </p>
      </PolicySection>

      <PolicySection id="security" title="Security">
        <p>
          We use access controls, Row Level Security, encrypted connections, and server-only secrets to
          protect data. Only authorized systems and moderators can access moderation records. No system is
          completely secure, so use a strong password and report anything suspicious.
        </p>
      </PolicySection>

      <PolicySection id="rights" title="Your rights">
        <p>Under RA 10173, you have the right to:</p>
        <PolicyList
          items={[
            "Be informed about how your data is collected and used.",
            "Access the personal data we hold about you.",
            "Correct inaccurate or incomplete data.",
            "Request erasure or blocking of data that is no longer needed or is being processed unlawfully.",
            "Object to processing based on legitimate interests.",
            "Request data portability where applicable.",
            "Withdraw consent for future processing.",
            "File a complaint with the National Privacy Commission.",
          ]}
        />
        <p>
          To exercise a right, email us from the Gmail address linked to your account. We may ask for
          information to verify your identity before acting on the request.
        </p>
      </PolicySection>

      <PolicySection id="cookies" title="Cookies">
        <p>
          IskoMart uses cookies and similar storage for sign-in sessions and basic preferences. We do not
          currently use advertising cookies. If we add analytics or preference storage later, we will update
          this notice and ask for consent where required.
        </p>
      </PolicySection>

      <PolicySection id="minors" title="Minors">
        <p>
          IskoMart is intended for PUP students and recent graduates. If you are under 18, use the service
          only with the consent and supervision of a parent or guardian. Contact us if you believe a minor
          has provided personal data without the required consent.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes">
        <p>
          We may update this notice when the service or the law changes. The date at the top of this page
          shows the latest version. If a change materially affects how we use your data, we will provide a
          clear notice before it takes effect.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>
          For privacy questions, data requests, or concerns, email{" "}
          <a
            href="mailto:iskomart.pup@gmail.com"
            className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
          >
            iskomart.pup@gmail.com
          </a>
          . You may also contact the National Privacy Commission through{" "}
          <a
            href="https://www.privacy.gov.ph"
            className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
            rel="noopener noreferrer"
            target="_blank"
          >
            privacy.gov.ph
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
