import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ModerationBadge from "@/components/ModerationBadge";
import {
  deleteModerationItem,
  resolveReport,
  setContentStatus,
  setUserState,
} from "./actions";

type JoinedProfile = { display_name: string } | { display_name: string }[] | null;

function profileName(profile: JoinedProfile) {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.display_name ?? "Iskolar";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function targetTable(targetType: string) {
  switch (targetType) {
    case "listing":
      return "listing";
    case "need_post":
      return "need_post";
    case "comment":
      return "comment";
    case "review":
      return "review";
    default:
      return null;
  }
}

function DeleteForm({ targetType, targetId }: { targetType: string; targetId: string }) {
  const field =
    targetType === "listing"
      ? "listingId"
      : targetType === "need_post"
        ? "needPostId"
        : targetType === "comment"
          ? "commentId"
          : targetType === "review"
            ? "reviewId"
            : null;

  if (!field) return null;

  return (
    <form action={deleteModerationItem}>
      <input type="hidden" name={field} value={targetId} />
      <button type="submit" className="rounded-full border border-[#c98f86] px-3 py-1.5 text-[11px] font-bold text-[#7b2432]">
        Delete
      </button>
    </form>
  );
}

function StatusForms({
  targetType,
  targetId,
  currentStatus,
}: {
  targetType: "listing" | "need_post" | "comment" | "review";
  targetId: string;
  currentStatus: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentStatus !== "hidden" && (
        <form action={setContentStatus}>
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="status" value="hidden" />
          <button type="submit" className="rounded-full border border-[#d8c6b5] px-3 py-1.5 text-[11px] font-bold text-[#69595a]">
            Hide
          </button>
        </form>
      )}
      {currentStatus !== "removed" && (
        <form action={setContentStatus}>
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="status" value="removed" />
          <button type="submit" className="rounded-full border border-[#d8c6b5] px-3 py-1.5 text-[11px] font-bold text-[#69595a]">
            Remove
          </button>
        </form>
      )}
      {currentStatus !== "visible" && (
        <form action={setContentStatus}>
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="status" value="visible" />
          <button type="submit" className="rounded-full bg-[#e4efdf] px-3 py-1.5 text-[11px] font-bold text-[#345b36]">
            Restore
          </button>
        </form>
      )}
      <DeleteForm targetType={targetType} targetId={targetId} />
    </div>
  );
}

export default async function AdminPage() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=%2Fadmin");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", authData.user.id).maybeSingle();
  if (!profile?.is_admin) redirect("/account");

  const [
    { data: reports, error: reportsError },
    { data: flaggedListings, error: flaggedListingsError },
    { data: flaggedNeeds, error: flaggedNeedsError },
    { data: flaggedComments, error: flaggedCommentsError },
    { data: flaggedReviews, error: flaggedReviewsError },
    { data: users, error: usersError },
    { data: audit, error: auditError },
    { count: openReportCount },
  ] = await Promise.all([
    supabase
      .from("content_reports")
      .select("id, reporter_id, target_type, target_id, reason, details, snapshot, status, created_at, profiles!content_reports_reporter_id_fkey(display_name)")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .limit(100),
    supabase
      .from("listings")
      .select("id, title, description, moderation_status, moderation_reasons, created_at, profiles!listings_seller_id_fkey(display_name)")
      .eq("moderation_status", "flagged")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("need_posts")
      .select("id, body, moderation_status, moderation_reasons, created_at, profiles!need_posts_requester_id_fkey(display_name)")
      .eq("moderation_status", "flagged")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("post_comments")
      .select("id, body, moderation_status, moderation_reasons, created_at, profiles!post_comments_author_id_fkey(display_name)")
      .eq("moderation_status", "flagged")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("reviews")
      .select("id, body, rating, moderation_status, moderation_reasons, created_at, profiles!reviews_reviewer_id_fkey(display_name)")
      .eq("moderation_status", "flagged")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("id, display_name, account_state, muted_until, suspended_at, strike_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("moderation_actions")
      .select("id, target_type, action, reason, created_at, profiles!moderation_actions_admin_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  if (
    reportsError
    || flaggedListingsError
    || flaggedNeedsError
    || flaggedCommentsError
    || flaggedReviewsError
    || usersError
    || auditError
  ) {
    throw new Error("Unable to load moderation data.");
  }

  const flaggedCount =
    (flaggedListings?.length ?? 0)
    + (flaggedNeeds?.length ?? 0)
    + (flaggedComments?.length ?? 0)
    + (flaggedReviews?.length ?? 0);
  const restrictedUsers = (users ?? []).filter((user) => user.account_state !== "active").length;

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e] sm:py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Admin workspace</p>
            <h1 className="mt-1 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">Moderation</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8b7775]">
              Reports show only the reported snapshot. Private conversations are never exposed in full.
            </p>
          </div>
          <Link href="/account" className="text-sm font-semibold text-[#7b2432]">Back to marketplace</Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] px-5 py-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Open reports</p>
            <p className="mt-1 font-serif text-3xl font-bold text-[#7b2432]">{openReportCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] px-5 py-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Flagged content</p>
            <p className="mt-1 font-serif text-3xl font-bold text-[#7b2432]">{flaggedCount}</p>
          </div>
          <div className="rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] px-5 py-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Restricted accounts</p>
            <p className="mt-1 font-serif text-3xl font-bold text-[#7b2432]">{restrictedUsers}</p>
          </div>
        </div>

        <Panel title="Report queue" count={reports?.length ?? 0} description={`${openReportCount ?? 0} open`}>
          {reports?.length ? (
            <ul className="divide-y divide-[#e8d9c5]">
              {reports.map((report) => (
                <li key={report.id} className="px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide text-[#8b7775] uppercase">
                    <span className="rounded-full bg-[#f5ead8] px-2 py-0.5 text-[#7b2432]">{report.target_type.replace("_", " ")}</span>
                    <span className="rounded-full bg-[#f7e5e3] px-2 py-0.5 text-[#7b2432]">{report.reason}</span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#8b7775]">
                    Reported by {profileName(report.profiles)}
                  </p>
                  {report.snapshot && (
                    <blockquote className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line rounded-xl bg-[#fbf8f2] px-3 py-2 text-sm leading-6 text-[#45383a]">
                      {report.snapshot}
                    </blockquote>
                  )}
                  {report.details && (
                    <p className="mt-2 text-sm leading-6 text-[#69595a]">
                      <span className="font-semibold">Reporter notes:</span> {report.details}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {targetTable(report.target_type) && (
                      <>
                        <a
                          href={`#${report.target_type}-${report.target_id}`}
                          className="rounded-full border border-[#d8c6b5] px-3 py-1.5 text-[11px] font-bold text-[#69595a]"
                        >
                          View in queue
                        </a>
                        <StatusForms
                          targetType={targetTable(report.target_type) as "listing" | "need_post" | "comment" | "review"}
                          targetId={report.target_id}
                          currentStatus="visible"
                        />
                      </>
                    )}
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-[11px] font-bold tracking-wide text-[#7b2432] uppercase">
                      Resolve report
                    </summary>
                    <form action={resolveReport} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input type="hidden" name="reportId" value={report.id} />
                      <input
                        name="notes"
                        maxLength={500}
                        placeholder="Notes (optional)"
                        className="min-w-0 flex-1 rounded-lg border border-[#e8d9c5] bg-[#fbf8f2] px-3 py-2 text-xs outline-none"
                      />
                      <button
                        type="submit"
                        name="status"
                        value="actioned"
                        className="rounded-full bg-[#7b2432] px-3 py-1.5 text-[11px] font-bold text-white"
                      >
                        Action taken
                      </button>
                      <button
                        type="submit"
                        name="status"
                        value="dismissed"
                        className="rounded-full border border-[#d8c6b5] px-3 py-1.5 text-[11px] font-bold text-[#69595a]"
                      >
                        Dismiss
                      </button>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No open reports.</Empty>
          )}
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Listings" count={flaggedListings?.length ?? 0}>
            {flaggedListings?.length ? (
              <ul className="divide-y divide-[#e8d9c5]">
                {flaggedListings.map((listing) => (
                  <li key={listing.id} id={`listing-${listing.id}`} className="space-y-2 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#45383a]">{listing.title}</h3>
                      <ModerationBadge status={listing.moderation_status} />
                    </div>
                    <p className="text-xs text-[#a4938d]">
                      {profileName(listing.profiles)} · {formatDate(listing.created_at)}
                    </p>
                    <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 text-[#69595a]">{listing.description}</p>
                    <StatusForms targetType="listing" targetId={listing.id} currentStatus={listing.moderation_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No flagged listings.</Empty>
            )}
          </Panel>

          <Panel title="Requests" count={flaggedNeeds?.length ?? 0}>
            {flaggedNeeds?.length ? (
              <ul className="divide-y divide-[#e8d9c5]">
                {flaggedNeeds.map((need) => (
                  <li key={need.id} id={`need_post-${need.id}`} className="space-y-2 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ModerationBadge status={need.moderation_status} />
                      <span className="text-xs text-[#a4938d]">
                        {profileName(need.profiles)} · {formatDate(need.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-[#45383a]">{need.body}</p>
                    <StatusForms targetType="need_post" targetId={need.id} currentStatus={need.moderation_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No flagged requests.</Empty>
            )}
          </Panel>

          <Panel title="Comments" count={flaggedComments?.length ?? 0}>
            {flaggedComments?.length ? (
              <ul className="divide-y divide-[#e8d9c5]">
                {flaggedComments.map((comment) => (
                  <li key={comment.id} id={`comment-${comment.id}`} className="space-y-2 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <ModerationBadge status={comment.moderation_status} />
                      <span className="text-xs text-[#a4938d]">
                        {profileName(comment.profiles)} · {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-[#45383a]">{comment.body}</p>
                    <StatusForms targetType="comment" targetId={comment.id} currentStatus={comment.moderation_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No flagged comments.</Empty>
            )}
          </Panel>

          <Panel title="Reviews" count={flaggedReviews?.length ?? 0}>
            {flaggedReviews?.length ? (
              <ul className="divide-y divide-[#e8d9c5]">
                {flaggedReviews.map((review) => (
                  <li key={review.id} id={`review-${review.id}`} className="space-y-2 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#b07b1d]">{review.rating}/5</span>
                      <ModerationBadge status={review.moderation_status} />
                      <span className="text-xs text-[#a4938d]">
                        {profileName(review.profiles)} · {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-6 text-[#45383a]">{review.body ?? "No written review."}</p>
                    <StatusForms targetType="review" targetId={review.id} currentStatus={review.moderation_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No flagged reviews.</Empty>
            )}
          </Panel>
        </div>

        <Panel title="Users" count={users?.length ?? 0} description="Most recent 50 accounts">
          {users?.length ? (
            <ul className="divide-y divide-[#e8d9c5]">
              {users.map((user) => (
                <li key={user.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#45383a]">{user.display_name}</p>
                    <p className="text-xs text-[#a4938d]">
                      {user.account_state === "muted"
                        ? `Muted until ${formatDate(user.muted_until)}`
                        : user.account_state === "suspended"
                          ? `Suspended ${formatDate(user.suspended_at)}`
                          : "Active"}
                      {user.strike_count > 0 ? ` · ${user.strike_count} strike${user.strike_count === 1 ? "" : "s"}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {user.account_state !== "muted" && (
                      <form action={setUserState}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="action" value="mute" />
                        <button type="submit" className="rounded-full border border-[#d8c6b5] px-3 py-1.5 text-[11px] font-bold text-[#69595a]">
                          Mute 24h
                        </button>
                      </form>
                    )}
                    {user.account_state !== "suspended" && (
                      <form action={setUserState}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="action" value="suspend" />
                        <button type="submit" className="rounded-full border border-[#c98f86] px-3 py-1.5 text-[11px] font-bold text-[#7b2432]">
                          Suspend
                        </button>
                      </form>
                    )}
                    {user.account_state !== "active" && (
                      <form action={setUserState}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="action" value="reinstate" />
                        <button type="submit" className="rounded-full bg-[#e4efdf] px-3 py-1.5 text-[11px] font-bold text-[#345b36]">
                          Reinstate
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No accounts yet.</Empty>
          )}
        </Panel>

        <Panel title="Audit log" count={audit?.length ?? 0} description="Latest 50 admin actions">
          {audit?.length ? (
            <ul className="divide-y divide-[#e8d9c5]">
              {audit.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-xs text-[#69595a] sm:px-5">
                  <span className="font-bold text-[#7b2432]">{entry.action.replace("_", " ")}</span>
                  <span>{entry.target_type.replace("_", " ")}</span>
                  <span>{profileName(entry.profiles)}</span>
                  <span className="ml-auto text-[#a4938d]">{formatDate(entry.created_at)}</span>
                  {entry.reason && <span className="w-full text-[#a4938d]">{entry.reason}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No moderation actions yet.</Empty>
          )}
        </Panel>
      </div>
    </main>
  );
}

function Panel({
  title,
  count,
  description,
  children,
}: {
  title: string;
  count: number;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e8d9c5] bg-[#fffdf8]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e8d9c5] px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#7b2432]">{title}</h2>
          {description && <p className="mt-0.5 text-[11px] text-[#a4938d]">{description}</p>}
        </div>
        <span className="rounded-full bg-[#f5ead8] px-2.5 py-1 text-xs font-bold text-[#7b2432]">{count}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-[#8b7775]">{children}</p>;
}
