create table public.restaurant_claims (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  restaurant_osm_type text not null check (restaurant_osm_type in ('node', 'way', 'relation')),
  restaurant_osm_id text not null check (restaurant_osm_id ~ '^[1-9][0-9]{0,18}$'),
  restaurant_name text not null check (length(btrim(restaurant_name)) between 1 and 200),
  evidence text not null check (length(btrim(evidence)) between 20 and 3000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.restaurant_claim_reviewers (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.restaurant_claim_reviewers enable row level security;
revoke all on public.restaurant_claim_reviewers from public, anon, authenticated;
grant select on public.restaurant_claim_reviewers to authenticated;
create policy "Reviewers check their own membership" on public.restaurant_claim_reviewers
  for select to authenticated using (user_id = (select auth.uid()));

create unique index restaurant_one_approved_owner
  on public.restaurant_claims (restaurant_osm_type, restaurant_osm_id) where status = 'approved';
create unique index restaurant_one_active_claim_per_owner
  on public.restaurant_claims (owner_id, restaurant_osm_type, restaurant_osm_id) where status <> 'rejected';

create table public.restaurant_menu_drafts (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.restaurant_claims on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  description text not null default '' check (length(description) <= 1500),
  category text not null check (length(btrim(category)) between 1 and 80),
  price numeric(10,2) not null check (price between 0 and 99999999.99),
  image_url text check (length(image_url) <= 2048 and image_url ~ '^https://[^[:space:]]+$'),
  available boolean not null default true
);
create index restaurant_menu_drafts_claim on public.restaurant_menu_drafts (claim_id);

create table public.published_restaurant_menus (
  claim_id uuid primary key references public.restaurant_claims on delete cascade,
  restaurant_osm_type text not null,
  restaurant_osm_id text not null,
  items jsonb not null,
  published_at timestamptz not null default now(),
  unique (restaurant_osm_type, restaurant_osm_id)
);

alter table public.restaurant_claims enable row level security;
alter table public.restaurant_menu_drafts enable row level security;
alter table public.published_restaurant_menus enable row level security;

revoke all on public.restaurant_claims, public.restaurant_menu_drafts,
  public.published_restaurant_menus from anon, authenticated;
grant select on public.restaurant_claims to authenticated;
grant insert (restaurant_osm_type, restaurant_osm_id, restaurant_name, evidence)
  on public.restaurant_claims to authenticated;
grant update (status) on public.restaurant_claims to authenticated;
grant select, delete on public.restaurant_menu_drafts to authenticated;
grant insert (claim_id, name, description, category, price, image_url, available),
  update (name, description, category, price, image_url, available)
  on public.restaurant_menu_drafts to authenticated;
grant select (restaurant_osm_type, restaurant_osm_id, items, published_at)
  on public.published_restaurant_menus to anon, authenticated;

create policy "Owners read their claims" on public.restaurant_claims
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Owners submit pending claims" on public.restaurant_claims
  for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'pending');
create policy "Reviewers read claims they can review" on public.restaurant_claims
  for select to authenticated using (
    owner_id <> (select auth.uid()) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  );
create policy "Reviewers decide pending claims" on public.restaurant_claims
  for update to authenticated
  using (
    status = 'pending' and owner_id <> (select auth.uid()) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  )
  with check (
    status in ('approved', 'rejected') and owner_id <> (select auth.uid()) and exists (
      select 1 from public.restaurant_claim_reviewers where user_id = (select auth.uid())
    )
  );
create policy "Approved owners manage drafts" on public.restaurant_menu_drafts
  for all to authenticated
  using (exists (
    select 1 from public.restaurant_claims c
    where c.id = claim_id and c.owner_id = (select auth.uid()) and c.status = 'approved'
  ))
  with check (exists (
    select 1 from public.restaurant_claims c
    where c.id = claim_id and c.owner_id = (select auth.uid()) and c.status = 'approved'
  ));
create policy "Anyone reads published menus" on public.published_restaurant_menus
  for select to anon, authenticated using (true);

create function public.set_restaurant_menu_published(target_claim uuid, publish_menu boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  approved_claim public.restaurant_claims%rowtype;
  menu_items jsonb;
begin
  select * into approved_claim from public.restaurant_claims
  where id = target_claim and owner_id = (select auth.uid()) and status = 'approved'
  for update;
  if not found then
    raise exception 'An approved ownership claim is required.';
  end if;

  if publish_menu then
    select jsonb_agg(jsonb_build_object(
      'id', id, 'name', name, 'description', description, 'category', category,
      'price', price, 'imageUrl', image_url, 'available', available
    ) order by category, name, id) into menu_items
    from public.restaurant_menu_drafts where claim_id = target_claim;
    if menu_items is null then
      raise exception 'Add at least one menu item before publishing.';
    end if;

    insert into public.published_restaurant_menus (claim_id, restaurant_osm_type, restaurant_osm_id, items)
    values (target_claim, approved_claim.restaurant_osm_type, approved_claim.restaurant_osm_id, menu_items)
    on conflict (claim_id) do update set items = excluded.items, published_at = now();
  else
    delete from public.published_restaurant_menus where claim_id = target_claim;
  end if;
end;
$$;

revoke all on function public.set_restaurant_menu_published(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_restaurant_menu_published(uuid, boolean) to authenticated;

create function public.remove_menu_after_claim_revocation()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.status = 'approved' and new.status <> 'approved' then
    delete from public.published_restaurant_menus where claim_id = old.id;
  end if;
  return new;
end;
$$;
revoke all on function public.remove_menu_after_claim_revocation() from public, anon, authenticated;
create trigger remove_menu_after_claim_revocation after update of status on public.restaurant_claims
  for each row execute function public.remove_menu_after_claim_revocation();
