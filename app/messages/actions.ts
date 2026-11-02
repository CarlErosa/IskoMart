"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { screenContent } from "@/lib/content/guard";
import { messageBodySchema } from "@/lib/content/schemas";

export type ContactSellerState = { error?: string };
export type MessageActionState = { error?: string; success?: boolean; flagged?: boolean };

export async function contactSeller(
  _previousState: ContactSellerState,
  formData: FormData,
): Promise<ContactSellerState> {
  const listingId = z.string().uuid().safeParse(String(formData.get("listingId") ?? ""));
  if (!listingId.success) return { error: "This listing is not available." };

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in to contact a seller." };

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId.data)
    .single();

  if (listingError || !listing) return { error: "Unable to find this listing." };
  if (listing.seller_id === authData.user.id) {
    return { error: "You cannot contact yourself. You can edit this listing from your profile." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", authData.user.id)
    .eq("seller_id", listing.seller_id)
    .eq("listing_id", listingId.data)
    .maybeSingle();

  if (existing) redirect(`/messages/${existing.id}`);

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: authData.user.id,
      seller_id: listing.seller_id,
      listing_id: listingId.data,
    })
    .select("id")
    .single();

  if (error || !conversation) {
    return toActionError(mapDbError(error));
  }

  revalidatePath("/messages");
  redirect(`/messages/${conversation.id}`);
}

export async function sendMessage(
  _previousState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  try {
    const conversationId = z.string().uuid().safeParse(String(formData.get("conversationId") ?? ""));
    const body = messageBodySchema.safeParse(String(formData.get("body") ?? ""));

    if (!conversationId.success || !body.success) {
      return { error: body.success ? "Choose a conversation first." : body.error.issues[0]?.message ?? "Write a message before sending." };
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { error: "You must be signed in to send messages." };
    }

    const screened = await screenContent(supabase, {
      text: body.data,
      surface: "message",
    });

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId.data,
        sender_id: data.user.id,
        body: screened.text,
      })
      .select("id, moderation_status")
      .single();

    if (error || !message) {
      return toActionError(mapDbError(error));
    }

    revalidatePath(`/messages/${conversationId.data}`);
    return { success: true, flagged: message.moderation_status === "flagged" };
  } catch (error) {
    return toActionError(error);
  }
}
