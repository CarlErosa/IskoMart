import Image from "next/image";

const categories = [
  { name: "School essentials", icon: "✦", count: "124 listings" },
  { name: "Fashion & finds", icon: "◌", count: "86 listings" },
  { name: "Food & snacks", icon: "⌁", count: "52 listings" },
  { name: "Gadgets & tech", icon: "▣", count: "41 listings" },
];

const featuredListings = [
  {
    title: "PUP College Shirt",
    seller: "Mika · Sta. Mesa",
    price: "₱250",
    tag: "Campus favorite",
    color: "bg-[#f5dfb4]",
    art: "shirt",
  },
  {
    title: "Handmade beaded keychains",
    seller: "Jules · COC",
    price: "₱85",
    tag: "Fresh find",
    color: "bg-[#d9e2d4]",
    art: "beads",
  },
  {
    title: "Calculus notes & reviewer",
    seller: "Anton · PUP Main",
    price: "₱120",
    tag: "Study buddy",
    color: "bg-[#e4d9e8]",
    art: "notes",
  },
];

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
      <circle cx="8.75" cy="8.75" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function ListingArt({ type }: { type: string }) {
  if (type === "shirt") {
    return (
      <svg aria-hidden="true" viewBox="0 0 240 180" className="h-full w-full">
        <path d="m86 42 21-14h26l21 14 29 21-15 28-17-12v69H69V79L52 91 37 63l29-21 20-14Z" fill="#7B2432" />
        <path d="M107 28c0 11 5 17 13 17s13-6 13-17" fill="none" stroke="#f4d28e" strokeWidth="4" />
        <path d="M82 112h78M82 123h78M82 134h48" stroke="#f4d28e" strokeLinecap="round" strokeWidth="3" />
        <circle cx="92" cy="60" r="4" fill="#f4d28e" />
      </svg>
    );
  }
  if (type === "beads") {
    return (
      <svg aria-hidden="true" viewBox="0 0 240 180" className="h-full w-full">
        <path d="M72 40c-14 40 4 88 47 100 36 10 69-14 52-45-11-20-31-16-43-3-15 16-37 5-33-16 3-17 20-25 34-28" fill="none" stroke="#7B2432" strokeLinecap="round" strokeWidth="12" />
        <circle cx="69" cy="40" r="12" fill="#d3a445" />
        <circle cx="168" cy="95" r="12" fill="#d3a445" />
        <circle cx="105" cy="44" r="8" fill="#7B2432" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="h-full w-full">
      <rect x="57" y="24" width="126" height="135" rx="4" fill="#fffdf8" stroke="#7B2432" strokeWidth="4" />
      <path d="M78 53h81M78 70h81M78 87h58M78 117h81M78 134h54" stroke="#d3a445" strokeLinecap="round" strokeWidth="4" />
      <path d="m78 104 13-8 9 6 16-18 17 13 11-7 15 14" fill="none" stroke="#7B2432" strokeWidth="3" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf8f2] text-[#281d1e]">
      <div className="border-b border-[#e8d9c5] bg-[#f5ead8] px-5 py-2 text-center text-[11px] font-semibold tracking-[0.18em] text-[#7b2432] uppercase">
        Built for Iskolars. Verified with your PUP email.
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-3" aria-label="IskoMart home">
          <Image
            src="/logos/logo-removebg-preview.png"
            alt="IskoMart"
            width={112}
            height={64}
            priority
            className="h-20 w-36 object-contain"
          />
        </a>
        <div className="hidden items-center gap-8 text-sm font-medium text-[#69595a] md:flex">
          <a className="transition-colors hover:text-[#7b2432]" href="#browse">Browse listings</a>
          <a className="transition-colors hover:text-[#7b2432]" href="#how-it-works">How it works</a>
          <a className="transition-colors hover:text-[#7b2432]" href="#community">Our community</a>
        </div>
        <a href="#join" className="rounded-full bg-[#7b2432] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          Join IskoMart
        </a>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">
            <span className="h-px w-8 bg-[#d3a445]" /> The PUP marketplace
          </p>
          <h1 className="max-w-3xl font-serif text-6xl font-bold leading-[0.94] tracking-[-0.06em] text-[#7b2432] sm:text-7xl lg:text-[92px]">
            Find your next <span className="relative whitespace-nowrap text-[#d3a445]">campus gem.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[#69595a]">
            Buy, sell, and discover good finds from fellow Iskolars. From reviewer notes to your next org fit, it&apos;s all here on campus.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#browse" className="flex items-center gap-3 rounded-full bg-[#7b2432] px-6 py-3.5 text-sm font-bold text-white shadow-[4px_4px_0_#d3a445] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#d3a445]">
              Explore listings <ArrowUpRight />
            </a>
            <a href="#sell" className="text-sm font-bold text-[#7b2432] underline decoration-[#d3a445] decoration-2 underline-offset-8">I want to sell</a>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-[#69595a]">
            <div className="flex -space-x-2">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbf8f2] bg-[#e6b5a6] text-xs font-bold text-[#7b2432]">A</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbf8f2] bg-[#d3a445] text-xs font-bold text-white">J</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbf8f2] bg-[#aabda8] text-xs font-bold text-[#7b2432]">M</span>
            </div>
            <span><strong className="text-[#281d1e]">1,200+</strong> Iskolars already here</span>
          </div>
        </div>

        <div className="relative mx-auto h-[430px] w-full max-w-[500px] sm:h-[500px]">
          <div className="absolute inset-8 rotate-3 rounded-[48%_52%_50%_46%] bg-[#f1dfbd]" />
          <div className="absolute left-1/2 top-1/2 flex h-[330px] w-[280px] -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] flex-col justify-between rounded-[24px] border-2 border-[#7b2432] bg-[#fffdf8] p-5 shadow-[10px_12px_0_#7b2432] sm:h-[370px] sm:w-[320px]">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-[#f5ead8] px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">Just listed</span>
              <span className="text-xl text-[#d3a445]">✦</span>
            </div>
            <div className="rounded-2xl bg-[#ead7bb] p-3">
              <svg aria-hidden="true" viewBox="0 0 240 180" className="h-40 w-full">
                <path d="m86 42 21-14h26l21 14 29 21-15 28-17-12v69H69V79L52 91 37 63l29-21 20-14Z" fill="#7B2432" />
                <path d="M107 28c0 11 5 17 13 17s13-6 13-17" fill="none" stroke="#f4d28e" strokeWidth="4" />
                <path d="M82 112h78M82 123h78M82 134h48" stroke="#f4d28e" strokeLinecap="round" strokeWidth="3" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#8b7775]">PUP Merch · Sta. Mesa</p>
              <div className="mt-1 flex items-end justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#7b2432]">College Shirt</h2>
                <span className="font-bold text-[#281d1e]">₱250</span>
              </div>
            </div>
          </div>
          <span className="absolute right-0 top-12 flex size-14 rotate-12 items-center justify-center rounded-full bg-[#d3a445] text-2xl text-white shadow-lg">✦</span>
          <span className="absolute bottom-8 left-2 flex size-16 -rotate-12 items-center justify-center rounded-full border-2 border-[#7b2432] bg-[#fbf8f2] font-serif text-2xl text-[#7b2432]">★</span>
        </div>
      </section>

      <section id="browse" className="bg-[#7b2432] px-5 py-16 text-white lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#f4d28e] uppercase">Start exploring</p>
              <h2 className="font-serif text-4xl font-bold tracking-[-0.04em] sm:text-5xl">What are you looking for?</h2>
            </div>
            <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-white px-5 py-3.5 text-sm text-[#8b7775]">
              <SearchIcon />
              <span>Search listings, categories, or sellers...</span>
            </div>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <a href="#listings" key={category.name} className="group rounded-2xl border border-white/20 bg-white/10 p-5 transition-colors hover:bg-white hover:text-[#7b2432]">
                <div className="flex items-start justify-between">
                  <span className="text-3xl text-[#f4d28e]">{category.icon}</span>
                  <ArrowUpRight />
                </div>
                <h3 className="mt-9 font-serif text-xl font-bold">{category.name}</h3>
                <p className="mt-1 text-xs text-white/60 group-hover:text-[#8b7775]">{category.count}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="listings" className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">From your fellow Iskolars</p>
            <h2 className="font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432] sm:text-5xl">Fresh on the marketplace</h2>
          </div>
          <a href="#browse" className="hidden items-center gap-2 text-sm font-bold text-[#7b2432] md:flex">See all listings <ArrowUpRight /></a>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featuredListings.map((listing) => (
            <article key={listing.title} className="group">
              <div className={`relative flex h-64 items-center justify-center overflow-hidden rounded-2xl ${listing.color}`}>
                <span className="absolute left-4 top-4 rounded-full bg-[#fffdf8]/80 px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">{listing.tag}</span>
                <div className="w-56 transition-transform duration-300 group-hover:scale-105"><ListingArt type={listing.art} /></div>
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#281d1e]">{listing.title}</h3>
                  <p className="mt-1 text-sm text-[#8b7775]">{listing.seller}</p>
                </div>
                <span className="font-bold text-[#7b2432]">{listing.price}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e8d9c5] bg-[#f5ead8] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Made for campus life</p>
            <h2 className="max-w-md font-serif text-4xl font-bold leading-tight tracking-[-0.04em] text-[#7b2432] sm:text-5xl">Good finds. Good people. No hassle.</h2>
            <p className="mt-5 max-w-md leading-7 text-[#69595a]">Every account is verified with a PUP email, so you can transact with confidence and keep things within the community.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Discover", "Browse things you actually need from fellow students."],
              ["02", "Connect", "Chat directly and arrange a convenient campus meetup."],
              ["03", "Isko win", "Get a great deal while supporting another Iskolar."],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-2xl bg-[#fffdf8] p-5">
                <span className="font-mono text-xs font-bold text-[#d3a445]">{number}</span>
                <h3 className="mt-12 font-serif text-2xl font-bold text-[#7b2432]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8b7775]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="community" className="bg-[#281d1e] px-5 py-8 text-[#f5ead8] lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm sm:flex-row sm:items-center">
          <Image
            src="/logos/text_logo.png"
            alt="IskoMart"
            width={112}
            height={32}
            className="h-8 w-28 object-contain"
          />
          <p className="text-[#cbb8aa]">For PUP students, by PUP students.</p>
          <span className="text-[#8f7976]">© 2026 IskoMart</span>
        </div>
      </footer>
    </main>
  );
}
