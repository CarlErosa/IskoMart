"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapDbError, toActionError } from "@/lib/content/errors";
import { screenContent } from "@/lib/content/guard";
import { allowedImageTypes, hasValidImageSignature } from "@/lib/content/images";
import { listingSchema } from "@/lib/content/schemas";

const maxImageSize = 5 * 1024 * 1024;

export type SellActionState = { error?: string };

export async function createListing(
  _previousState: SellActionState,
  formData: FormData,
): Promise<SellActionState> {
  try {
    const image = formData.get("image");
    if (!(image instanceof File) || image.size === 0) {
      return { error: "Add a photo of what you are selling." };
    }

    if (!allowedImageTypes.has(image.type) || image.size > maxImageSize) {
      return { error: "Use a JPG, PNG, or WebP image up to 5 MB." };
    }

    if (!(await hasValidImageSignature(image))) {
      return { error: "That file does not look like a valid JPG, PNG, or WebP image." };
    }

    const parsed = listingSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      categoryId: formData.get("categoryId"),
      condition: formData.get("condition"),
      meetupLocation: String(formData.get("meetupLocation") ?? "").trim() || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check your listing details." };
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { error: "Your session has expired. Please sign in again." };
    }

    await screenContent(supabase, {
      text: [
        parsed.data.title,
        parsed.data.description,
        parsed.data.meetupLocation ?? "",
      ].filter(Boolean).join("\n"),
      surface: "listing",
    });

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        seller_id: userData.user.id,
        category_id: parsed.data.categoryId,
        title: parsed.data.title,
        description: parsed.data.description,
        price: parsed.data.price,
        condition: parsed.data.condition,
        meetup_location: parsed.data.meetupLocation ?? null,
      })
      .select("id, moderation_status")
      .single();

    if (listingError || !listing) {
      return toActionError(mapDbError(listingError));
    }

    const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `${userData.user.id}/${listing.id}/cover.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(storagePath, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      await supabase.from("listings").delete().eq("id", listing.id);
      return { error: "Your listing was not published because the image upload failed." };
    }

    const { error: imageRecordError } = await supabase.from("listing_images").insert({
      listing_id: listing.id,
      storage_path: storagePath,
      sort_order: 0,
    });

    if (imageRecordError) {
      await supabase.storage.from("listing-images").remove([storagePath]);
      await supabase.from("listings").delete().eq("id", listing.id);
      return { error: "Your listing was not published. Please try again." };
    }

    revalidatePath("/account");
    revalidatePath("/profile");
  } catch (error) {
    return toActionError(error);
  }

  redirect("/account");
}
