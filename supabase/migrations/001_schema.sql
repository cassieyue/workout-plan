-- USER PROFILES
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  age integer not null,
  height_inches integer not null,
  weight_lbs decimal(5,1) not null,
  calorie_target integer not null default 1890,
  protein_g integer not null default 130,
  carbs_g integer not null default 220,
  fat_g integer not null default 55,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- WORKOUT SCHEDULE (customizable per user)
create table workout_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  session_type text not null check (session_type in ('strength_a','strength_b','easy_run','long_run','rest')),
  unique (user_id, day_of_week)
);

-- GLOBAL EXERCISE LIBRARY (shared, not user-specific)
create table workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_type text not null check (workout_type in ('strength_a','strength_b')),
  exercise_name text not null,
  sets integer not null,
  reps integer,
  duration_seconds integer,
  notes text,
  order_index integer not null
);

-- GLOBAL RUN PLAN (shared, not user-specific)
create table run_plan (
  id uuid primary key default gen_random_uuid(),
  week_number integer not null check (week_number between 1 and 12),
  run_type text not null check (run_type in ('easy_run','long_run')),
  distance_miles decimal(4,1) not null,
  notes text
);

-- WORKOUT LOGS
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  date date not null,
  session_type text not null check (session_type in ('strength_a','strength_b','easy_run','long_run')),
  week_number integer,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- STRENGTH SETS
create table strength_sets (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references workout_logs(id) on delete cascade,
  exercise_name text not null,
  set_number integer not null,
  reps integer not null,
  weight_lbs decimal(5,1) not null,
  created_at timestamptz not null default now()
);

-- RUN LOGS
create table run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  workout_log_id uuid references workout_logs(id) on delete set null,
  date date not null,
  run_type text not null check (run_type in ('easy_run','long_run')),
  distance_miles decimal(4,2) not null,
  duration_minutes decimal(5,1) not null,
  created_at timestamptz not null default now()
);

-- WORKOUT VARIATIONS (AI-generated weekly)
create table workout_variations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  week_start_date date not null,
  variations jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

-- MEAL PLANS
create table meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  week_start_date date not null,
  generated_at timestamptz not null default now(),
  unique (user_id, week_start_date)
);

-- MEALS (28 rows per plan: 7 days × 4 entries)
create table meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','drink')),
  name text not null,
  recipe text,
  ingredients text[],
  preparation text,
  calories integer not null,
  protein_g decimal(5,1),
  carbs_g decimal(5,1),
  fat_g decimal(5,1)
);

-- GROCERY LISTS
create table grocery_lists (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  items jsonb not null,
  checked_items text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (meal_plan_id)
);

-- BODY WEIGHT LOGS
create table body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  date date not null,
  weight_lbs decimal(5,1) not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- RLS
alter table user_profiles enable row level security;
alter table workout_schedule enable row level security;
alter table workout_logs enable row level security;
alter table strength_sets enable row level security;
alter table run_logs enable row level security;
alter table workout_variations enable row level security;
alter table meal_plans enable row level security;
alter table meals enable row level security;
alter table grocery_lists enable row level security;
alter table body_weight_logs enable row level security;

create policy "self" on user_profiles for all using (auth.uid() = id);
create policy "self" on workout_schedule for all using (auth.uid() = user_id);
create policy "self" on workout_logs for all using (auth.uid() = user_id);
create policy "self" on strength_sets for all using (
  exists (select 1 from workout_logs w where w.id = strength_sets.workout_log_id and w.user_id = auth.uid())
);
create policy "self" on run_logs for all using (auth.uid() = user_id);
create policy "self" on workout_variations for all using (auth.uid() = user_id);
create policy "self" on meal_plans for all using (auth.uid() = user_id);
create policy "self" on meals for all using (
  exists (select 1 from meal_plans mp where mp.id = meals.meal_plan_id and mp.user_id = auth.uid())
);
create policy "self" on grocery_lists for all using (auth.uid() = user_id);
create policy "self" on body_weight_logs for all using (auth.uid() = user_id);

-- SEED GLOBAL WORKOUT PLAN
insert into workout_plan_exercises (workout_type, exercise_name, sets, reps, duration_seconds, notes, order_index) values
  ('strength_a','Goblet Squat',3,12,null,null,1),
  ('strength_a','Romanian Deadlift',3,12,null,null,2),
  ('strength_a','Dumbbell Row',3,12,null,'each side',3),
  ('strength_a','Dumbbell Chest Press',3,15,null,null,4),
  ('strength_a','Plank',3,null,40,null,5),
  ('strength_b','Sumo Deadlift',3,10,null,null,1),
  ('strength_b','Bulgarian Split Squat',3,10,null,'each leg',2),
  ('strength_b','Lat Pulldown',3,12,null,null,3),
  ('strength_b','Dumbbell Shoulder Press',3,12,null,null,4),
  ('strength_b','Hip Thrust',3,15,null,null,5);

insert into run_plan (week_number, run_type, distance_miles, notes) values
  (1,'easy_run',3.0,'Easy conversational pace'),
  (1,'long_run',4.0,'Easy pace throughout'),
  (2,'easy_run',3.0,'Easy conversational pace'),
  (2,'long_run',4.5,'Easy pace throughout'),
  (3,'easy_run',3.0,'Easy conversational pace'),
  (3,'long_run',5.0,'Easy pace throughout'),
  (4,'easy_run',3.5,'3 miles easy + 0.5 mile tempo'),
  (4,'long_run',6.0,'Easy pace throughout'),
  (5,'easy_run',3.5,'3 miles easy + 0.5 mile tempo'),
  (5,'long_run',6.5,'Easy pace throughout'),
  (6,'easy_run',4.0,'3 miles easy + 1 mile tempo'),
  (6,'long_run',7.0,'Easy pace throughout'),
  (7,'easy_run',4.0,'2 easy + 1 tempo + 1 easy'),
  (7,'long_run',8.0,'Easy pace throughout'),
  (8,'easy_run',4.0,'4×0.5 mile tempo intervals'),
  (8,'long_run',8.5,'Easy pace throughout'),
  (9,'easy_run',4.0,'3×1 mile tempo intervals'),
  (9,'long_run',9.0,'Easy pace throughout'),
  (10,'easy_run',4.0,'Easy conversational pace'),
  (10,'long_run',10.0,'Easy pace throughout'),
  (11,'easy_run',4.0,'Easy conversational pace'),
  (11,'long_run',11.0,'Easy pace throughout'),
  (12,'easy_run',3.0,'Taper — easy pace'),
  (12,'long_run',5.0,'Taper — easy pace');
