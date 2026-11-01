"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLike } from "@/app/social-actions";

function LikeIcon({ active }: { active: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill={active ? "currentColor" : "none"}><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Zm0 10h9.2a2 2 0 0 0 1.94-1.52l1.5-6A2 2 0 0 0 17.7 10H14l.55-3.28A2.3 2.3 0 0 0 12.28 4L7 10v10Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
}

export default function LikeButton({ listingId, needPostId, initialLiked, initialCount }: { listingId?: string; needPostId?: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleLike() {
    if (pending) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((current) => current + (nextLiked ? 1 : -1));
    const formData = new FormData();
    if (listingId) formData.set("listingId", listingId);
    if (needPostId) formData.set("needPostId", needPostId);

    startTransition(async () => {
      try {
        await toggleLike(formData);
        router.refresh();
      } catch {
        setLiked(!nextLiked);
        setCount((current) => current + (nextLiked ? -1 : 1));
      }
    });
  }

  return <button type="button" onClick={handleLike} aria-label={liked ? "Unlike post" : "Like post"} className={`inline-flex items-center gap-1.5 transition hover:text-[#7b2432] ${liked ? "font-bold text-[#7b2432]" : ""}`}><LikeIcon active={liked} /> <span>{count}</span></button>;
}
