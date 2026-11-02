import Image from "next/image";
import Link from "next/link";

const exploreLinks = [
  { href: "/account", label: "Browse marketplace" },
  { href: "/sell", label: "Sell an item" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Your profile" },
];

const policyLinks = [
  { href: "/about", label: "About IskoMart" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/rules", label: "Community Rules" },
];

export default function SiteFooter() {
  return (
    <footer
      id="community"
      className="relative mt-auto overflow-hidden border-t border-[#4a3537] bg-[#211719] text-[#f5ead8]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(211,164,69,0.16),transparent_38%),radial-gradient(circle_at_85%_100%,rgba(123,36,50,0.3),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="IskoMart home" className="inline-flex">
              <Image
                src="/logos/text_logo.png"
                alt="IskoMart"
                width={208}
                height={56}
                className="h-7 w-auto object-contain opacity-90 [filter:brightness(0)_invert(1)]"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#cebdb7]">
              A student-first marketplace for PUP Iskolars. Buy, sell, and meet safely on campus.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#4a3537] bg-[#2d2022] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-[#d3a445] uppercase">
              <span className="size-1.5 rounded-full bg-[#d3a445]" aria-hidden="true" />
              PUP Sta. Mesa
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#d3a445] uppercase">Explore</p>
            <nav aria-label="Marketplace links" className="mt-4">
              <ul className="space-y-2.5 text-sm">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#cebdb7] transition hover:text-[#f5ead8]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#d3a445] uppercase">Policies</p>
            <nav aria-label="Site policies" className="mt-4">
              <ul className="space-y-2.5 text-sm">
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#cebdb7] transition hover:text-[#f5ead8]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#3d2c2e] pt-6 text-xs text-[#a5918b] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IskoMart. For PUP students, by PUP students.</p>
          <p className="max-w-md leading-5 sm:text-right">
            Not an official service of the Polytechnic University of the Philippines.
          </p>
        </div>
      </div>
    </footer>
  );
}
