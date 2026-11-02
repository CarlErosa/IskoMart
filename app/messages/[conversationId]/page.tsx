import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "../actions";

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=%2Fmessages%2F${conversationId}`);
  const { data: conversation } = await supabase.from("conversations").select("id, buyer_id, seller_id, listing_id").eq("id", conversationId).maybeSingle();
  if (!conversation) notFound();
  const otherId = conversation.buyer_id === authData.user.id ? conversation.seller_id : conversation.buyer_id;
  const [{ data: other }, { data: listing }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", otherId).single(),
    conversation.listing_id ? supabase.from("listings").select("title").eq("id", conversation.listing_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("messages").select("id, sender_id, body, created_at").eq("conversation_id", conversationId).order("created_at"),
  ]);
  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e]">
      <div className="mx-auto max-w-2xl">
        <Link href="/account" className="text-sm font-semibold text-[#7b2432]">← Back to marketplace</Link>
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#e8d9c5] bg-[#fffdf8]">
          <div className="border-b border-[#e8d9c5] p-5"><p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Conversation</p><h1 className="mt-1 font-serif text-2xl font-bold text-[#7b2432]">{other?.display_name ?? "PUP student"}</h1>{listing && <p className="mt-1 text-xs text-[#8b7775]">About: {listing.title}</p>}</div>
          <div className="min-h-72 space-y-3 p-4 sm:p-5">{messages?.length ? messages.map((message) => <div key={message.id} className={`max-w-[88%] break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] ${message.sender_id === authData.user.id ? "ml-auto bg-[#7b2432] text-white" : "bg-[#f5ead8] text-[#45383a]"}`}>{message.body}</div>) : <p className="py-16 text-center text-sm text-[#8b7775]">Start the conversation about this listing.</p>}</div>
          <form action={sendMessage} className="flex items-end gap-2 border-t border-[#e8d9c5] p-3 sm:p-4"><input type="hidden" name="conversationId" value={conversationId} /><input name="body" required maxLength={2000} placeholder="Ask about size, availability, or meetup..." className="min-w-0 flex-1 rounded-2xl bg-[#fbf8f2] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#d3a445]/30" /><button type="submit" className="shrink-0 rounded-full bg-[#7b2432] px-4 py-2 text-sm font-bold text-white">Send</button></form>
        </div>
      </div>
    </main>
  );
}
