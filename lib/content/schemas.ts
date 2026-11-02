import { z } from "zod";
import { normalizeText } from "./normalize";

function normalized(min: number, max: number, minMessage: string, maxMessage: string) {
  return z
    .string()
    .transform(normalizeText)
    .pipe(z.string().min(min, minMessage).max(max, maxMessage));
}

function normalizedOptional(max: number, maxMessage: string) {
  return z
    .string()
    .transform(normalizeText)
    .pipe(z.string().max(max, maxMessage))
    .optional();
}

export const listingTitleSchema = normalized(
  3,
  120,
  "Give your item a name.",
  "Keep the name under 120 characters.",
);

export const listingDescriptionSchema = normalized(
  10,
  5000,
  "Add a little more detail about your item.",
  "Keep the description under 5,000 characters.",
);

export const meetupLocationSchema = normalizedOptional(
  120,
  "Keep the meetup location under 120 characters.",
);

export const needPostBodySchema = normalized(
  3,
  500,
  "Tell the community what you need.",
  "Keep your request under 500 characters.",
);

export const commentBodySchema = normalized(
  1,
  500,
  "Write a comment first.",
  "Keep comments under 500 characters.",
);

export const messageBodySchema = normalized(
  1,
  2000,
  "Write a message before sending.",
  "Keep messages under 2,000 characters.",
);

export const reviewBodySchema = normalized(
  1,
  1000,
  "Write a review first.",
  "Keep reviews under 1,000 characters.",
);

export const displayNameSchema = normalized(
  2,
  80,
  "Username must be at least 2 characters.",
  "Username must be 80 characters or fewer.",
);

export const bioSchema = normalized(
  0,
  280,
  "Bio is too short.",
  "Bio must be 280 characters or fewer.",
).nullable();

export const needPostSchema = z.object({
  body: needPostBodySchema,
  categoryId: z.string().uuid().optional(),
});

export const listingSchema = z.object({
  title: listingTitleSchema,
  description: listingDescriptionSchema,
  meetupLocation: meetupLocationSchema,
  price: z.coerce
    .number()
    .finite()
    .min(0, "Price cannot be negative.")
    .max(9999999999, "Enter a smaller price."),
  categoryId: z.string().uuid("Choose a category."),
  condition: z.enum(["new", "like_new", "good", "fair"]),
});

export const profileSchema = z.object({
  displayName: displayNameSchema,
  avatarUrl: z.string().url().nullable(),
  headerUrl: z.string().url().nullable(),
  bio: bioSchema,
});

export const reportSchema = z.object({
  targetType: z.enum(["listing", "need_post", "comment", "message", "review", "profile"]),
  targetId: z.string().uuid(),
  reason: z.enum(["spam", "harassment", "hate", "scam", "impersonation", "other"]),
  details: normalizedOptional(500, "Keep details under 500 characters."),
});

export const moderationTargetSchema = z
  .object({
    listingId: z.string().uuid().optional(),
    needPostId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
    reviewId: z.string().uuid().optional(),
  })
  .refine(
    (value) => [value.listingId, value.needPostId, value.commentId, value.reviewId].filter(Boolean).length === 1,
    "Choose one moderation target.",
  );

export const contentStatusSchema = z.object({
  targetType: z.enum(["listing", "need_post", "comment", "review"]),
  targetId: z.string().uuid(),
  status: z.enum(["visible", "hidden", "removed"]),
  reason: normalizedOptional(200, "Keep the reason under 200 characters."),
});

export const userStateSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["mute", "suspend", "reinstate"]),
  reason: normalizedOptional(200, "Keep the reason under 200 characters."),
});

export const reportResolutionSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["actioned", "dismissed"]),
  notes: normalizedOptional(500, "Keep notes under 500 characters."),
});
