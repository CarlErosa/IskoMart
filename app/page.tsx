import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Home() {
  await connection();
  const supabase = await createClient();
  const [{ data }, { data: recentListings, error: listingsError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("listings")
      .select("id, title, price, meetup_location, created_at, profiles!listings_seller_id_fkey(display_name, campus), categories!listings_category_id_fkey(name), listing_images(storage_path, sort_order)")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  const isAuthenticated = Boolean(data.user);
  const featuredListings = (recentListings ?? []).map((listing) => {
    const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
    const category = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
    const images = Array.isArray(listing.listing_images) ? listing.listing_images : [];
    const coverPath = images.sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path;

    return {
      id: listing.id,
      title: listing.title,
      seller: [seller?.display_name, seller?.campus].filter(Boolean).join(" · ") || "PUP student",
      price: `₱${Number(listing.price).toLocaleString("en-PH")}`,
      tag: category?.name ?? "Listing",
      imageUrl: coverPath ? supabase.storage.from("listing-images").getPublicUrl(coverPath).data.publicUrl : null,
    };
  });

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#281d1e]">
      <div className="border-b border-[#e8d9c5] bg-[#f5ead8] px-5 py-2 text-center text-[11px] font-semibold tracking-[0.18em] text-[#7b2432] uppercase">
        Built for Iskolars. Verified with your Gmail address.
      </div>

      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
        <Link href="/" aria-label="IskoMart home">
          <Image
            src="/logos/logo-removebg-preview.png"
            alt="IskoMart"
            width={112}
            height={64}
            priority
            className="h-16 w-28 object-contain sm:h-20 sm:w-36"
          />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-3 text-sm font-medium text-[#69595a] sm:gap-6">
          <a href="#listings" className="hidden transition-colors hover:text-[#7b2432] hover:underline sm:inline">
            Browse listings
          </a>
          <a href="#how-it-works" className="hidden transition-colors hover:text-[#7b2432] hover:underline sm:inline">
            How it works
          </a>
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hidden transition-colors hover:text-[#7b2432] hover:underline sm:inline">
                Profile
              </Link>
              <Link
                href="/account"
                className="rounded-lg border border-[#7b2432] px-3 py-2 text-xs font-bold whitespace-nowrap text-[#7b2432] transition hover:-translate-y-0.5 hover:bg-[#f5ead8] active:translate-y-0 sm:text-sm"
              >
                Marketplace
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg bg-[#7b2432] px-3 py-2 text-xs font-bold whitespace-nowrap text-white transition hover:-translate-y-0.5 hover:bg-[#5e1a25] active:translate-y-0 sm:px-4 sm:text-sm"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="transition-colors hover:text-[#7b2432] hover:underline">
                Log in
              </Link>
              <Link
                href="/auth"
                className="rounded-lg bg-[#7b2432] px-3 py-2 text-xs font-bold whitespace-nowrap text-white transition hover:-translate-y-0.5 hover:bg-[#5e1a25] active:translate-y-0 sm:px-4 sm:text-sm"
              >
                <span className="sm:hidden">Join</span>
                <span className="hidden sm:inline">Join IskoMart</span>
              </Link>
            </>
          )}
        </nav>
      </header>

      <section
        id="listings"
        className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16 lg:px-8 lg:pb-24 lg:pt-14"
      >
        <div>
          <h1 className="rise max-w-xl font-serif text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-[#7b2432] sm:text-6xl">
            Buy and sell with fellow <span className="marker">Iskolars</span>.
          </h1>
          <p className="rise mt-6 max-w-md text-lg leading-8 text-[#69595a]" style={{ animationDelay: "90ms" }}>
            A marketplace just for PUP. Browse what students are selling, message the seller, and meet up on campus.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-5" style={{ animationDelay: "160ms" }}>
            <a
              href="#listings"
              className="rounded-lg bg-[#7b2432] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#5e1a25] active:translate-y-0"
            >
              Browse listings
            </a>
            <Link
              href="/sell"
              className="text-sm font-bold text-[#7b2432] underline decoration-[#7b2432] decoration-2 underline-offset-8 transition hover:decoration-[#d3a445]"
            >
              List an item
            </Link>
          </div>
          <p className="rise mt-8 max-w-sm text-sm leading-6 text-[#69595a]" style={{ animationDelay: "220ms" }}>
            Verified PUP accounts. Meetups and payment happen in person.
          </p>
        </div>

        <div className="rise" style={{ animationDelay: "140ms" }}>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold tracking-[-0.02em] text-[#7b2432]">Fresh on the marketplace</h2>
            <Link href="/account" className="shrink-0 text-sm font-bold text-[#7b2432] hover:underline">
              Open the marketplace
            </Link>
          </div>

          {listingsError ? (
            <div className="mt-4 rounded-xl border border-[#d8c6b5] bg-[#f5ead8] px-6 py-8 text-center">
              <p className="font-serif text-lg font-bold text-[#7b2432]">Listings are unavailable right now.</p>
              <p className="mt-2 text-sm text-[#69595a]">Refresh the page to try again.</p>
            </div>
          ) : featuredListings.length > 0 ? (
            <ul className="mt-4 divide-y divide-[#e8d9c5] border-y border-[#e8d9c5]">
              {featuredListings.map((listing, index) => (
                <li key={listing.id} className={`flex items-center gap-4 ${index === 0 ? "py-5" : "py-4"}`}>
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-xl bg-[#f1e7d8] ${index === 0 ? "size-28 sm:size-32" : "size-20"}`}
                  >
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        sizes={index === 0 ? "(min-width: 640px) 128px, 112px" : "80px"}
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`truncate font-serif font-bold text-[#281d1e] ${index === 0 ? "text-xl sm:text-2xl" : "text-lg"}`}
                    >
                      {listing.title}
                    </h3>
                    <p className="mt-1 truncate text-sm text-[#69595a]">
                      {listing.tag} · {listing.seller}
                    </p>
                  </div>
                  <span className={`shrink-0 font-bold text-[#7b2432] ${index === 0 ? "text-lg" : ""}`}>{listing.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#d8c6b5] bg-[#f5ead8] px-6 py-10 text-center">
              <p className="font-serif text-xl font-bold text-[#7b2432]">Nothing listed yet.</p>
              <p className="mt-2 text-sm text-[#69595a]">Be the first to post something for your fellow Iskolars.</p>
              <Link
                href="/sell"
                className="mt-5 inline-flex rounded-lg bg-[#7b2432] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#5e1a25] active:translate-y-0"
              >
                List an item
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e8d9c5] bg-[#f5ead8] px-5 py-16 lg:px-8 lg:py-20">
        <div className="reveal mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <h2 className="font-serif text-4xl font-bold tracking-[-0.03em] text-[#7b2432] sm:text-5xl">How it works</h2>
            <p className="mt-4 max-w-md leading-7 text-[#69595a]">
              No shipping, no online payment. You talk to the seller and meet on campus.
            </p>
          </div>
          <ol className="divide-y divide-[#e3d0b4] border-y border-[#e3d0b4]">
            {[
              ["Browse", "Find what you need in the live listings."],
              ["Message", "Ask the seller your questions in the app."],
              ["Meet up", "Agree on a place on campus and pay in person."],
            ].map(([title, description], index) => (
              <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span className="font-serif text-lg font-bold text-[#7b2432]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#7b2432]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#69595a]">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
