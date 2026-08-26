-- Run this entire file once in the Supabase SQL Editor.
-- It creates private, realtime text chat for round participants.

create table if not exists public.round_messages (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.shared_rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists round_messages_round_created_idx
  on public.round_messages (round_id, created_at);

alter table public.round_messages enable row level security;

drop policy if exists "Participants can view round messages" on public.round_messages;
create policy "Participants can view round messages"
on public.round_messages for select to authenticated
using (public.is_round_participant(round_id));

drop policy if exists "Participants can send round messages" on public.round_messages;
create policy "Participants can send round messages"
on public.round_messages for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_round_participant(round_id)
);

revoke all on public.round_messages from anon, authenticated;
grant select, insert on public.round_messages to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'round_messages'
  ) then
    alter publication supabase_realtime add table public.round_messages;
  end if;
end;
$$;
