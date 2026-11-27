# FoodFinder Supabase setup

1. Apply the SQL in `migrations/20261127000100_owner_menus.sql` and then `migrations/20261127000200_owner_locations.sql` using the project’s SQL Editor or Supabase migrations. If the menu migration is already installed, apply only the location migration.
2. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` to your project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key. Restart Vite after saving. Keep secret and service-role keys server-side.
3. Enable email/password sign-in in Supabase Auth. Set the Site URL and allow the dashboard, password-reset page, and owner-portal redirects for each app origin. For local development, allow `http://localhost:5173/dashboard`, `http://localhost:5173/reset-password`, and `http://localhost:5173/owner**`. The owner pattern also allows confirmation links that contain a restaurant claim query string.
4. After a designated reviewer has created an account, copy their user UUID from Supabase Authentication and run this in the SQL Editor.

```sql
insert into public.restaurant_claim_reviewers (user_id)
values ('REPLACE_WITH_REVIEWER_USER_UUID');
```

Diners can create an account at `/register` and sign in at `/login`. Owners use the same Supabase account at `/owner`. They can claim an existing Cebu City listing or submit a new restaurant with an address and map coordinates. The review queue appears in the designated reviewer's portal. Reviewers verify the location and independently confirm the claimant represents the restaurant before approving. After approval, an owner can publish location updates and publish a menu. Photos use HTTPS image URLs.
