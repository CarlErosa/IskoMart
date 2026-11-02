"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const listingSchema = z.object({
  title: z.string().trim().min(3, "Give your item a name.").max(120, "Keep the name under 120 characters."),
  description: z.string().trim().min(10, "Add a little more detail about your item.").max(5000, "Keep the description under 5,000 characters."),
  price: z.coerce.number().finite().min(0, "Price cannot be negative.").max(9999999999, "Enter a smaller price."),
  categoryId: z.string().uuid("Choose a category."),
  condition: z.enum(["new", "like_new", "good", "fair"]),
  meetupLocation: z.string().trim().max(120, "Keep the meetup location under 120 characters.").optional(),
});

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export type SellActionState = { error?: string };

export async function createListing(
  _previousState: SellActionState,
  formData: FormData,
): Promise<SellActionState> {
  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return { error: "Add a photo of what you are selling." };
  }
  if (!allowedImageTypes.has(image.type) || image.size > maxImageSize) {
    return { error: "Use a JPG, PNG, or WebP image up to 5 MB." };
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
    .select("id")
    .single();

  if (listingError || !listing) {
    return { error: "Unable to create your listing. Please try again." };
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
  redirect("/account");
}
