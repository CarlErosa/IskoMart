-- Blocking previously only hid public posts. A blocked user could still open a
-- conversation and send messages, and the blocked messages still appeared in
-- the blocker's inbox. Enforce the block at the messaging boundary.
drop policy if exists "Buyers create conversations" on public.conversations;
create policy "Buyers create conversations"
  on public.conversations for insert
  with check (
    auth.uid() = conversations.buyer_id
    and not exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = conversations.buyer_id and b.blocked_id = conversations.seller_id)
         or (b.blocker_id = conversations.seller_id and b.blocked_id = conversations.buyer_id)
    )
  );

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert
  with check (
    auth.uid() = messages.sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.buyer_id, c.seller_id)
        and not exists (
          select 1 from public.user_blocks b
          where (b.blocker_id = c.buyer_id and b.blocked_id = c.seller_id)
             or (b.blocker_id = c.seller_id and b.blocked_id = c.buyer_id)
        )
    )
  );

drop policy if exists "Blocked conversations are hidden" on public.conversations;
create policy "Blocked conversations are hidden"
  on public.conversations as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = case
          when conversations.buyer_id = auth.uid() then conversations.seller_id
          else conversations.buyer_id
        end
    )
  );

drop policy if exists "Blocked messages are hidden" on public.messages;
create policy "Blocked messages are hidden"
  on public.messages as restrictive for select
  using (
    public.is_admin()
    or not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid()
        and b.blocked_id = messages.sender_id
    )
  );
