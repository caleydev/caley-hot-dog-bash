# Event setup (one-time, ~5 minutes)

The app needs a shared database so leads registered on attendees' phones show up
on your staff dashboard. We use Supabase (free tier). Do this once before the event.

## 1. Create the Supabase project
1. Go to https://supabase.com → sign up / log in → **New project**.
2. Pick a name and a strong database password (you won't need the password again).
3. Wait ~1 minute for it to provision.

## 2. Create the database
1. In the project, open **SQL Editor → New query**.
2. Open [`supabase/setup.sql`](supabase/setup.sql) from this repo, copy **all** of it,
   paste it in, and click **Run**. You should see "Success".

## 3. Create your admin login
1. Go to **Authentication → Users → Add user**.
2. Enter an email + password for staff, and enable **Auto Confirm User**.
3. That's the account you'll use to log in at `/admin`. (Add more users the same way
   if multiple staff need access — anyone in this user list can open the dashboard.)

## 4. Connect the app to Supabase
Get your keys from **Project Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

**Local testing:** copy `.env.example` to `.env`, paste the two values, then run `npm run dev`.

**Live site (AWS Amplify):** add both as environment variables in
Amplify → App settings → Environment variables, then redeploy.

## 5. Verify
- Open the site on your phone, register, complete the giveaway → you get a ticket.
- Open `/admin` on a different device, log in → your registration appears.
- If the dashboard is empty after registering on another device, the env vars
  aren't set on the live site (the app fell back to local demo mode).

---

### How people use it on event day
- Print a QR code that points to your live site URL. Attendees scan → register on
  their own phones → add 3 referrals → get a ticket number.
- Staff open `/admin` (no public link to it), log in, and use the **Giveaway Wheel**
  tab to draw winners. Use **Export** to download CSVs afterward.

### Notes
- The `CALEY-HOTDOG-2026` access code only works in local demo mode (no Supabase).
  Once the env vars are set, login is email + password only.
- Attendee phone/email is never readable by the public — the registration form can
  only submit, and ticket lookups are token-gated.
