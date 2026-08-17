-- tasks
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  description text,
  category    text not null default 'AdHoc',
  status      text not null default 'todo',
  stakeholder text,
  due_date    date,
  user_id     uuid not null references auth.users(id) on delete cascade
);

-- comms_log
create table if not exists public.comms_log (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  created_at  timestamptz not null default now(),
  type        text not null default 'note',    -- email | note | meeting
  entry_date  date not null default current_date,
  body        text not null,
  source      text not null default 'manual'   -- manual | graph_api
);

-- email_scan_log (for future Outlook integration)
create table if not exists public.email_scan_log (
  id            uuid primary key default gen_random_uuid(),
  scanned_at    timestamptz not null default now(),
  emails_found  int not null default 0,
  tasks_created int not null default 0,
  tasks_updated int not null default 0,
  raw_summary   text
);

-- RLS
alter table public.tasks enable row level security;
alter table public.comms_log enable row level security;
alter table public.email_scan_log enable row level security;

create policy "Users manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage comms on their tasks"
  on public.comms_log for all
  using (
    exists (select 1 from public.tasks where tasks.id = comms_log.task_id and tasks.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.tasks where tasks.id = comms_log.task_id and tasks.user_id = auth.uid())
  );

create policy "Authenticated users manage scan log"
  on public.email_scan_log for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Indexes
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists comms_log_task_id_idx on public.comms_log(task_id);
create index if not exists comms_log_entry_date_idx on public.comms_log(entry_date desc);
