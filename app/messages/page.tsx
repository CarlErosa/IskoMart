import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?next=%2Fmessages");

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_id, created_at")
    .or(`buyer_id.eq.${authData.user.id},seller_id.eq.${authData.user.id}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load your messages.");

  const otherIds = [...new Set((conversations ?? []).map((conversation) => (
    conversation.buyer_id === authData.user.id ? conversation.seller_id : conversation.buyer_id
  )))];
  const listingIds = [...new Set((conversations ?? []).map((conversation) => conversation.listing_id).filter(Boolean))];
  const [{ data: profiles }, { data: listings }] = await Promise.all([
    otherIds.length ? supabase.from("profiles").select("id, display_name").in("id", otherIds) : Promise.resolve({ data: [] }),
    listingIds.length ? supabase.from("listings").select("id, title").in("id", listingIds) : Promise.resolve({ data: [] }),
  ]);
  const profileNames = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
  const listingTitles = new Map((listings ?? []).map((listing) => [listing.id, listing.title]));

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e] sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/account" className="text-sm font-semibold text-[#7b2432]">← Back to marketplace</Link>
        <div className="mt-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Your conversations</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <h1 className="font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">Messages</h1>
            <Link href="/account" className="text-sm font-semibold text-[#7b2432]">Browse listings</Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[#e8d9c5] bg-[#fffdf8]">
          {conversations?.length ? conversations.map((conversation) => {
            const otherId = conversation.buyer_id === authData.user.id ? conversation.seller_id : conversation.buyer_id;
            return (
              <Link key={conversation.id} href={`/messages/${conversation.id}`} className="block border-b border-[#e8d9c5] p-5 transition last:border-b-0 hover:bg-[#f5ead8]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-xl font-bold text-[#7b2432]">{profileNames.get(otherId) ?? "Iskolar"}</h2>
                    <p className="mt-1 truncate text-sm text-[#8b7775]">{conversation.listing_id ? `About: ${listingTitles.get(conversation.listing_id) ?? "a listing"}` : "Marketplace conversation"}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[#a4938d]">{new Date(conversation.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                </div>
              </Link>
            );
          }) : (
            <div className="px-6 py-16 text-center">
              <h2 className="font-serif text-2xl font-bold text-[#7b2432]">No messages yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b7775]">When someone contacts you about a listing, the conversation will appear here.</p>
              <Link href="/account" className="mt-5 inline-flex rounded-full bg-[#7b2432] px-5 py-3 text-sm font-bold text-white">Browse marketplace</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
