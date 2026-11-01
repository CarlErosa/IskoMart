"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ContactSellerState = { error?: string };

export async function contactSeller(
  _previousState: ContactSellerState,
  formData: FormData,
): Promise<ContactSellerState> {
  const listingId = z.string().uuid().safeParse(String(formData.get("listingId") ?? ""));
  if (!listingId.success) return { error: "This listing is not available." };
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in to contact a seller." };
  const { data: listing, error: listingError } = await supabase.from("listings").select("seller_id").eq("id", listingId.data).single();
  if (listingError || !listing) return { error: "Unable to find this listing." };
  if (listing.seller_id === authData.user.id) return { error: "You cannot contact yourself. You can edit this listing from your profile." };
  const { data: existing } = await supabase.from("conversations").select("id").eq("buyer_id", authData.user.id).eq("seller_id", listing.seller_id).eq("listing_id", listingId.data).maybeSingle();
  if (existing) redirect(`/messages/${existing.id}`);
  const { data: conversation, error } = await supabase.from("conversations").insert({ buyer_id: authData.user.id, seller_id: listing.seller_id, listing_id: listingId.data }).select("id").single();
  if (error || !conversation) return { error: "Unable to start a conversation. Please try again." };
  revalidatePath("/messages");
  redirect(`/messages/${conversation.id}`);
}

export async function sendMessage(formData: FormData) {
  const conversationId = z.string().uuid().safeParse(String(formData.get("conversationId") ?? ""));
  const body = z.string().trim().min(1).max(2000).safeParse(String(formData.get("body") ?? ""));
  if (!conversationId.success || !body.success) throw new Error("Write a message before sending.");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("You must be signed in to send messages.");
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId.data, sender_id: data.user.id, body: body.data });
  if (error) throw new Error(`Unable to send message: ${error.message}`);
  revalidatePath(`/messages/${conversationId.data}`);
}
