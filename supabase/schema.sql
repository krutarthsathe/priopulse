-- Run once in the Supabase SQL Editor. Safe to rerun for this demo's schema.
-- All access goes through Vercel using a server-only secret/service_role key.
create table if not exists public.follow_up_calls (
  id uuid primary key,
  patient_id text not null,
  destination_id text not null,
  destination_label text not null,
  destination_number text not null,
  actor_id text not null,
  actor_name text not null,
  agent_id text not null,
  status text not null default 'initiating' check (status in ('initiating','uncertain','submitted','in_progress','processing','completed','failed','no_answer','busy')),
  active_slot smallint generated always as (case when status in ('initiating','uncertain','submitted','in_progress','processing') then 1 else null end) stored,
  conversation_id text unique,
  call_sid text unique,
  transcript jsonb not null default '[]'::jsonb check (jsonb_typeof(transcript) = 'array'),
  failure_message text,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_checked_at timestamptz,
  finished_at timestamptz,
  reviewed_note text,
  reviewed_at timestamptz,
  reviewed_by text
);
create unique index if not exists follow_up_calls_one_active on public.follow_up_calls(active_slot);
create index if not exists follow_up_calls_patient_created on public.follow_up_calls(patient_id, created_at desc);

-- Durable inbox handles repeated events and events arriving before the dial response.
-- Store only normalized transcripts/status, never raw provider analysis or audio.
create table if not exists public.follow_up_call_events (
  event_key text primary key,
  event jsonb not null,
  received_at timestamptz not null default now(),
  applied_call_id uuid references public.follow_up_calls(id)
);
alter table public.follow_up_calls enable row level security;
alter table public.follow_up_call_events enable row level security;
revoke all on public.follow_up_calls, public.follow_up_call_events from anon, authenticated;
grant select, insert, update on public.follow_up_calls, public.follow_up_call_events to service_role;

create or replace function public.priopulse_apply_call_events(p_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare c public.follow_up_calls; e record; v jsonb;
begin
  select * into c from public.follow_up_calls where id = p_id for update;
  for e in select * from public.follow_up_call_events where applied_call_id is null and
    event->>'agent_id' = c.agent_id and (
      event->>'call_id' = c.id::text or
      (c.conversation_id is not null and event->>'conversation_id' = c.conversation_id) or
      (c.call_sid is not null and event->>'call_sid' = c.call_sid)
    ) order by received_at
  loop
    v := e.event;
    -- Never associate a conflicting provider identifier with this call.
    if (c.conversation_id is not null and nullif(v->>'conversation_id','') is not null and c.conversation_id <> v->>'conversation_id') or
       (c.call_sid is not null and nullif(v->>'call_sid','') is not null and c.call_sid <> v->>'call_sid') then continue; end if;
    update public.follow_up_calls set
      conversation_id = coalesce(conversation_id, nullif(v->>'conversation_id','')),
      call_sid = coalesce(call_sid, nullif(v->>'call_sid','')),
      status = case when status = 'completed' then status when active_slot is null and v->>'status' <> 'completed' then status else v->>'status' end,
      transcript = case when reviewed_at is not null then transcript when v->>'status' in ('completed','failed') and jsonb_array_length(coalesce(v->'transcript','[]'::jsonb)) > 0 then v->'transcript' else transcript end,
      duration_seconds = coalesce((v->>'duration_seconds')::integer, duration_seconds),
      failure_message = case when status = 'completed' or v->>'status' = 'completed' then null else coalesce(v->>'failure_message', failure_message) end,
      finished_at = case when v->>'status' in ('completed','failed','no_answer','busy') then coalesce(finished_at, now()) else finished_at end,
      updated_at = now()
    where id = p_id;
    update public.follow_up_call_events set applied_call_id = p_id where event_key = e.event_key;
    select * into c from public.follow_up_calls where id = p_id;
  end loop;
end $$;

create or replace function public.priopulse_reserve_call(p_id uuid, p_patient_id text, p_destination_id text, p_destination_label text, p_destination_number text, p_actor_id text, p_actor_name text, p_agent_id text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare c public.follow_up_calls;
begin
  perform pg_advisory_xact_lock(741902, 1);
  select * into c from public.follow_up_calls where id = p_id;
  if found then
    if c.patient_id <> p_patient_id or c.destination_id <> p_destination_id or c.actor_id <> p_actor_id then return jsonb_build_object('conflict', true); end if;
    return jsonb_build_object('created', false, 'call', to_jsonb(c));
  end if;
  select * into c from public.follow_up_calls where active_slot = 1;
  if found then return jsonb_build_object('busy', true, 'call', to_jsonb(c)); end if;
  insert into public.follow_up_calls(id, patient_id, destination_id, destination_label, destination_number, actor_id, actor_name, agent_id)
    values(p_id, p_patient_id, p_destination_id, p_destination_label, p_destination_number, p_actor_id, p_actor_name, p_agent_id) returning * into c;
  return jsonb_build_object('created', true, 'call', to_jsonb(c));
end $$;

create or replace function public.priopulse_update_call(p_id uuid, p_changes jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare c public.follow_up_calls;
begin
  perform pg_advisory_xact_lock(741902, 1);
  update public.follow_up_calls set
    conversation_id = coalesce(conversation_id, nullif(p_changes->>'conversation_id','')),
    call_sid = coalesce(call_sid, nullif(p_changes->>'call_sid','')),
    status = case when active_slot is null then status else coalesce(p_changes->>'status',status) end,
    failure_message = case when active_slot is null then failure_message else coalesce(p_changes->>'failure_message',failure_message) end,
    finished_at = case when active_slot = 1 and p_changes->>'status' in ('failed','no_answer','busy') then now() else finished_at end,
    last_checked_at = coalesce((p_changes->>'last_checked_at')::timestamptz,last_checked_at), updated_at = now()
  where id = p_id and
    (conversation_id is null or nullif(p_changes->>'conversation_id','') is null or conversation_id = p_changes->>'conversation_id') and
    (call_sid is null or nullif(p_changes->>'call_sid','') is null or call_sid = p_changes->>'call_sid');
  perform public.priopulse_apply_call_events(p_id);
  select * into c from public.follow_up_calls where id = p_id;
  return to_jsonb(c);
end $$;

create or replace function public.priopulse_ingest_call_event(p_event jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare c public.follow_up_calls;
begin
  perform pg_advisory_xact_lock(741902, 1);
  insert into public.follow_up_call_events(event_key, event) values(p_event->>'event_key',p_event) on conflict do nothing;
  select * into c from public.follow_up_calls where agent_id = p_event->>'agent_id' and (
    id::text = p_event->>'call_id' or conversation_id = p_event->>'conversation_id' or call_sid = p_event->>'call_sid'
  ) limit 1;
  if found then perform public.priopulse_apply_call_events(c.id); end if;
  return jsonb_build_object('received', true);
end $$;

create or replace function public.priopulse_review_call(p_id uuid, p_note text, p_actor text)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare c public.follow_up_calls;
begin
  update public.follow_up_calls set reviewed_note = p_note, reviewed_by = p_actor, reviewed_at = now(), updated_at = now()
    where id = p_id and status in ('completed','failed') and jsonb_array_length(transcript) > 0 and reviewed_at is null and length(trim(p_note)) between 1 and 100000 returning * into c;
  if found then return jsonb_build_object('saved',true,'call',to_jsonb(c)); end if;
  select * into c from public.follow_up_calls where id = p_id;
  return jsonb_build_object('saved',false,'call',to_jsonb(c));
end $$;

revoke all on function public.priopulse_apply_call_events(uuid), public.priopulse_reserve_call(uuid,text,text,text,text,text,text,text), public.priopulse_update_call(uuid,jsonb), public.priopulse_ingest_call_event(jsonb), public.priopulse_review_call(uuid,text,text) from public, anon, authenticated;
grant execute on function public.priopulse_apply_call_events(uuid), public.priopulse_reserve_call(uuid,text,text,text,text,text,text,text), public.priopulse_update_call(uuid,jsonb), public.priopulse_ingest_call_event(jsonb), public.priopulse_review_call(uuid,text,text) to service_role;
