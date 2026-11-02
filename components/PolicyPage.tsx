import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type PolicySectionLink = {
  id: string;
  title: string;
};

const policyLinks = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/rules", label: "Rules" },
];

export default function PolicyPage({
  eyebrow,
  title,
  description,
  updated,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: PolicySectionLink[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#281d1e]">
      <header className="border-b border-[#e8d9c5] bg-[#fffdf8]">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" aria-label="IskoMart home">
            <Image
              src="/logos/text_logo.png"
              alt="IskoMart"
              width={208}
              height={56}
              className="h-9 w-32 object-contain sm:h-12 sm:w-44"
            />
          </Link>
          <nav aria-label="Policy pages" className="hidden items-center gap-6 text-sm font-semibold text-[#69595a] sm:flex">
            {policyLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-[#7b2432]">
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/account"
            className="rounded-full border border-[#7b2432] px-4 py-2 text-xs font-bold text-[#7b2432] transition hover:bg-[#f5ead8]"
          >
            Marketplace
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">On this page</p>
            <nav aria-label="Sections" className="mt-3 space-y-1 border-l border-[#e8d9c5]">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block border-l-2 border-transparent px-3 py-1.5 text-sm text-[#69595a] transition hover:border-[#d3a445] hover:text-[#7b2432]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-2xl bg-[#f5ead8] p-4 text-xs leading-5 text-[#69595a]">
              Questions? Email{" "}
              <a
                href="mailto:iskomart.pup@gmail.com"
                className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
              >
                iskomart.pup@gmail.com
              </a>
              .
            </div>
          </aside>

          <article className="max-w-3xl">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">{eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432] sm:text-5xl">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-[#69595a]">{description}</p>
            <p className="mt-4 text-xs font-semibold text-[#a4938d]">Last updated {updated}</p>
            <div className="mt-10 space-y-9">{children}</div>
          </article>
        </div>
      </div>
    </main>
  );
}

export function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-serif text-2xl font-bold text-[#7b2432]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-[#45383a]">{children}</div>
    </section>
  );
}

export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[#b07b1d]">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
