import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteModerationItem } from "./actions";

export default async function AdminPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=%2Fadmin");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", authData.user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/account");

  const [{ data: listings, error: listingsError }, { data: needs, error: needsError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from("listings").select("id, title, description, price, is_available, created_at, profiles!listings_seller_id_fkey(display_name)").order("created_at", { ascending: false }),
    supabase.from("need_posts").select("id, body, created_at, profiles!need_posts_requester_id_fkey(display_name)").order("created_at", { ascending: false }),
    supabase.from("post_comments").select("id, body, created_at, profiles!post_comments_author_id_fkey(display_name), listing_id, need_post_id").order("created_at", { ascending: false }),
  ]);
  if (listingsError || needsError || commentsError) throw new Error("Unable to load moderation data.");

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e] sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Admin workspace</p>
            <h1 className="mt-1 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">Moderation</h1>
            <p className="mt-2 text-sm text-[#8b7775]">Review and remove public marketplace content.</p>
          </div>
          <a href="/account" className="text-sm font-semibold text-[#7b2432]">Back to marketplace</a>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <ModerationSection title="Listings" count={listings?.length ?? 0}>
            {listings?.map((listing) => (
              <ModerationRow key={listing.id} title={listing.title} detail={`${profileName(listing.profiles)} · ₱${Number(listing.price).toLocaleString("en-PH")}`}>
                <form action={deleteModerationItem}><input type="hidden" name="listingId" value={listing.id} /><button type="submit" className="text-xs font-bold text-[#7b2432]">Delete</button></form>
              </ModerationRow>
            ))}
          </ModerationSection>

          <ModerationSection title="Requests" count={needs?.length ?? 0}>
            {needs?.map((need) => (
              <ModerationRow key={need.id} title={need.body} detail={profileName(need.profiles)}>
                <form action={deleteModerationItem}><input type="hidden" name="needPostId" value={need.id} /><button type="submit" className="text-xs font-bold text-[#7b2432]">Delete</button></form>
              </ModerationRow>
            ))}
          </ModerationSection>

          <ModerationSection title="Comments" count={comments?.length ?? 0}>
            {comments?.map((comment) => (
              <ModerationRow key={comment.id} title={comment.body} detail={profileName(comment.profiles)}>
                <form action={deleteModerationItem}><input type="hidden" name="commentId" value={comment.id} /><button type="submit" className="text-xs font-bold text-[#7b2432]">Delete</button></form>
              </ModerationRow>
            ))}
          </ModerationSection>
        </section>
      </div>
    </main>
  );
}

function profileName(profile: { display_name: string } | { display_name: string }[] | null) {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.display_name ?? "Iskolar";
}

function ModerationSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8d9c5] bg-[#fffdf8]">
      <div className="flex items-center justify-between border-b border-[#e8d9c5] px-4 py-4">
        <h2 className="font-serif text-xl font-bold text-[#7b2432]">{title}</h2>
        <span className="rounded-full bg-[#f5ead8] px-2.5 py-1 text-xs font-bold text-[#7b2432]">{count}</span>
      </div>
      <div className="divide-y divide-[#e8d9c5]">
        {count > 0 ? children : <p className="px-4 py-8 text-center text-sm text-[#8b7775]">Nothing to review.</p>}
      </div>
    </section>
  );
}

function ModerationRow({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-[#45383a]">{title}</p>
        <p className="mt-1 text-xs text-[#a4938d]">{detail}</p>
      </div>
      {children}
    </div>
  );
}
