"use client";

import { useState } from "react";
import { toggleRepost } from "@/app/engagement-actions";
import ContactSellerButton from "@/app/messages/ContactSellerButton";
import ModerationBadge from "@/components/ModerationBadge";
import ReportMenu from "@/components/ReportMenu";
import LikeButton from "@/app/account/LikeButton";
import CommentForm from "@/app/account/CommentForm";

export type PostComment = {
  id: string;
  body: string;
  authorId: string;
  authorName: string;
  moderationStatus: string;
};

function CommentIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 7.8 7.8 0 0 1-3.15-.66L4 20l1.66-4.1A7.47 7.47 0 0 1 5 11.5 7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function RepostIcon({ active }: { active: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none"><path d="m17 3 4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ShareIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none"><path d="M7 12a5 5 0 0 1 5-5h6M17 3l4 4-4 4M17 12a5 5 0 0 1-5 5H6M7 21l-4-4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ShareButton({ postId }: { postId: string }) {
  const [shared, setShared] = useState(false);

  async function sharePost() {
    const url = `${window.location.origin}/post/${postId}`;
    const shareData = { title: "IskoMart post", text: "Check out this post on IskoMart", url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard?.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    }
  }

  return <button type="button" onClick={sharePost} aria-label="Share post" className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-[#7b2432]"><ShareIcon /><span>{shared ? "Copied" : "Share"}</span></button>;
}

export default function PostActions({
  listingId,
  sellerId,
  needPostId,
  likeCount,
  repostCount,
  liked,
  reposted,
  comments,
  currentUserId,
  blockedUserIds,
}: {
  listingId?: string;
  sellerId?: string;
  needPostId?: string;
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean | string | null;
  comments: PostComment[];
  currentUserId: string;
  blockedUserIds: string[];
}) {
  const isReposted = reposted === true || typeof reposted === "string";
  const sharedBy = typeof reposted === "string" ? reposted : isReposted ? "You" : null;

  return (
    <div className="mt-4">
      {sharedBy && (
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[#8b7775]">
          <RepostIcon active />
          {sharedBy} shared this
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-[#8b7775]">
        <LikeButton listingId={listingId} needPostId={needPostId} initialLiked={liked} initialCount={likeCount} />
        <details className="relative">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 transition hover:text-[#7b2432]">
            <CommentIcon />
            <span>{comments.length}</span>
          </summary>
          <div className="absolute left-0 top-7 z-20 w-[min(18rem,calc(100vw-5rem))] rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] p-3 shadow-lg">
            {comments.length > 0 && (
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <p className="break-words text-xs leading-5 text-[#45383a]">
                      <strong>{comment.authorName}</strong> {comment.body}
                      {comment.moderationStatus !== "visible" && (
                        <span className="ml-1">
                          <ModerationBadge status={comment.moderationStatus} />
                        </span>
                      )}
                    </p>
                    {comment.authorId !== currentUserId && (
                      <div className="flex justify-end">
                        <ReportMenu
                          targetType="comment"
                          targetId={comment.id}
                          authorId={comment.authorId}
                          authorName={comment.authorName}
                          isBlocked={blockedUserIds.includes(comment.authorId)}
                          inline
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <CommentForm listingId={listingId} needPostId={needPostId} />
          </div>
        </details>
        <form action={toggleRepost}>
          <input type="hidden" name="listingId" value={listingId ?? ""} />
          <input type="hidden" name="needPostId" value={needPostId ?? ""} />
          <button
            type="submit"
            aria-label={isReposted ? "Undo repost" : "Repost"}
            className={`inline-flex items-center gap-1.5 transition hover:text-[#7b2432] ${isReposted ? "font-bold text-[#7b2432]" : ""}`}
          >
            <RepostIcon active={isReposted} />
            <span>{repostCount}</span>
          </button>
        </form>
        {(listingId || needPostId) && (
          <div className="ml-auto flex items-center gap-4">
            {listingId && sellerId && <ContactSellerButton listingId={listingId} />}
            <ShareButton postId={(listingId ?? needPostId)!} />
          </div>
        )}
      </div>
    </div>
  );
}
