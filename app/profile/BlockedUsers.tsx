"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleBlock, type BlockActionState } from "@/app/moderation-actions";

const initialState: BlockActionState = {};

export default function BlockedUsers({
  users,
}: {
  users: { id: string; name: string; campus: string | null }[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(toggleBlock, initialState);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state, router]);

  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-[#8b7775]">
        You haven&apos;t blocked anyone.
      </div>
    );
  }

  return (
    <div>
      <p className="px-2 pt-5 text-xs leading-5 text-[#8b7775]">
        Blocked accounts are hidden from your feed and cannot message you.
      </p>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="flex items-center justify-between gap-3 border-b border-[#e8d9c5] px-2 py-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#281d1e]">{user.name}</p>
              <p className="text-xs text-[#8b7775]">{user.campus ?? "PUP campus"}</p>
            </div>
            <form action={action}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="action" value="unblock" />
              <button
                type="submit"
                disabled={pending}
                className="shrink-0 rounded-full border border-[#7b2432] px-4 py-2 text-xs font-bold text-[#7b2432] transition hover:bg-[#f5ead8] disabled:opacity-60"
              >
                {pending ? "Unblocking..." : "Unblock"}
              </button>
            </form>
          </li>
        ))}
      </ul>
      {state.error && (
        <p role="alert" className="mx-2 mt-4 rounded-xl bg-[#f7dfda] px-4 py-3 text-sm leading-6 text-[#7b2432]">
          {state.error}
        </p>
      )}
    </div>
  );
}
