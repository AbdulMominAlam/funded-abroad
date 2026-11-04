# Setting up Funded Abroad: website + email alerts

This guide takes you from zero to a live site with working email alerts. Everything uses **free plans**:

| Service | What it does | Free plan |
| --- | --- | --- |
| **Cloudflare Pages** | Hosts the website (works with private GitHub repos) | Unlimited static requests |
| **Supabase** | Database for subscribers + 3 small "Edge Functions" | 500 MB database, 500k function calls/month |
| **Resend** | Sends the emails | 3,000 emails/month, 100/day |
| **GitHub Actions** | Runs the daily alert job | Free minutes for public repos; 2,000 min/month for private |

You can do steps 1–2 alone and get a working site; the alerts panel then shows "Alerts coming soon". Steps 3–7 switch the alerts on.

> **Keys are passwords.** Never paste the *service role / secret* key or the Resend key into the website, a `VITE_…` variable, a commit, or a chat. Only the Supabase **URL** and **anon/publishable key** are safe to be public.

---

## 0. What you need on your computer

* [Node.js 22](https://nodejs.org/) (check with `node -v`)
* Git, and a terminal in the project folder:

```bash
git clone https://github.com/AbdulMominAlam/funded-abroad.git
```

```bash
cd funded-abroad
```

```bash
npm install
```

Check that everything works before you touch any accounts:

```bash
npm run validate-data && npm test && npm run build
```

---

## 1. Try the alert emails with no accounts at all

```bash
npm run alerts:sample
```

This plans emails for a made-up subscriber (Pakistani, master's) and prints the subject lines and the plain-text versions. Nothing is sent.

---

## 2. Put the website online (Cloudflare Pages)

1. Create a free account at <https://dash.cloudflare.com/sign-up>.
2. In the dashboard: **Workers & Pages → Create → Pages → Connect to Git**. Authorise GitHub and pick the `funded-abroad` repository (private repos are fine).
3. Settings:
   * **Production branch:** `main`
   * **Framework preset:** *None* (or "Vite")
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
   * **Environment variables (Production *and* Preview):** `NODE_VERSION` = `22`
4. Click **Save and Deploy**. Your site will be at `https://<project-name>.pages.dev`. **Write this URL down: it's your `SITE_URL`** (no slash at the end).

Every push to `main` now redeploys automatically. Other branches (like `v3-global`) get preview URLs.

Prefer the terminal? After `npm run build`:

```bash
npx wrangler login
```

```bash
npx wrangler pages deploy dist --project-name funded-abroad
```

---

## 3. Create the Supabase project and database

1. Sign up at <https://supabase.com/dashboard/sign-up> and click **New project**. Pick a name, a strong database password (save it in a password manager) and the region closest to most users.
2. When it's ready, open **Project Settings → API Keys** (older dashboards: **Settings → API**) and note:
   * **Project URL**, like `https://abcdefghijklm.supabase.co` → this is `SUPABASE_URL` / `VITE_SUPABASE_URL`
   * **anon / publishable key** → `VITE_SUPABASE_ANON_KEY` (public, safe in the website)
   * **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY` (**secret!**)
   * The **project ref** is the `abcdefghijklm` part of the URL.
3. Create the tables. Easiest way: open **SQL Editor → New query**, paste the whole contents of
   `supabase/migrations/20261104000000_deadline_alerts.sql`, and click **Run**. You should see "Success. No rows returned".

   (Terminal alternative:)

   ```bash
   npx supabase login
   ```

   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

   ```bash
   npx supabase db push
   ```

The migration turns on Row Level Security and removes all public access. The public key can't read or write the tables; only the Edge Functions and the daily job (using the secret key) can.

---

## 4. Create the Resend account (email sending)

1. Sign up at <https://resend.com/signup> **with the email address you want owner notices to go to**.
2. **API Keys → Create API Key**: name it `funded-abroad`, permission **Sending access**. Copy it (it starts with `re_`). This is `RESEND_API_KEY` (**secret!**).
3. Choose a sender:
   * **For testing, use the test sender:** `Funded Abroad <onboarding@resend.dev>`. Resend only delivers test-sender mail **to your own Resend account address**, which is perfect for trying everything yourself.
   * **For real subscribers you need your own domain.** Go to **Domains → Add Domain**, enter e.g. `mail.yourdomain.com`, and add the DNS records Resend shows (at your domain registrar or in Cloudflare DNS). Wait for "Verified", then use a sender like `Funded Abroad <alerts@mail.yourdomain.com>`. A `*.pages.dev` address can't be verified. Students can often get a free domain through the [GitHub Student Developer Pack](https://education.github.com/pack) (check current offers).

---

## 5. Deploy the Edge Functions and add their secrets

Run these in the project folder (the Supabase CLI runs through `npx`, nothing to install):

```bash
npx supabase login
```

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Set the function secrets. Replace the values; keep the quotes. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically, so you don't set them here.

```bash
npx supabase secrets set RESEND_API_KEY="re_your_key" SITE_URL="https://your-project.pages.dev" ADMIN_EMAIL="you@example.com" NOTIFY_ADMIN_ON_CONFIRM="true" EMAIL_FROM="Funded Abroad <onboarding@resend.dev>" HASH_SALT="any-long-random-text"
```

Deploy the three functions:

```bash
npx supabase functions deploy subscribe --no-verify-jwt
```

```bash
npx supabase functions deploy confirm --no-verify-jwt
```

```bash
npx supabase functions deploy unsubscribe --no-verify-jwt
```

(`--no-verify-jwt` is needed because confirm and unsubscribe are opened straight from email links. The functions check their own input and tokens. The same setting is in `supabase/config.toml`.)

What the secrets do:

| Secret | Example | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | Sending emails |
| `SITE_URL` | `https://funded-abroad.pages.dev` | Links in emails, and which website may call `subscribe` |
| `ADMIN_EMAIL` | `you@example.com` | Gets a "New subscriber: Pakistan, Master's" notice when someone confirms |
| `NOTIFY_ADMIN_ON_CONFIRM` | `true` / `false` | Turns those notices on or off |
| `EMAIL_FROM` | `Funded Abroad <onboarding@resend.dev>` | Sender address (see step 4) |
| `HASH_SALT` | random text | Used to scramble IPs for rate limiting |

To change one later, run `npx supabase secrets set NAME="new value"` again. Functions pick it up automatically.

---

## 6. Connect the website to Supabase (Cloudflare)

In Cloudflare: **Workers & Pages → your project → Settings → Variables and Secrets** (older dashboards: *Environment variables*). Add, for **Production** (and Preview if you like):

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | your Project URL, e.g. `https://abcdefghijklm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the **anon / publishable** key (NOT the secret one) |

Then **Deployments → … → Retry deployment** (Vite bakes these values in at build time). Open the site: the "Get deadline alerts" panel should no longer say "coming soon".

For local development, copy `.env.example` to `.env.local`, fill in the two `VITE_` values, and run `npm run dev`.

---

## 7. Add the GitHub Actions secrets (daily alert job)

GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**. Add each of these (exact names):

| Secret name | Value |
| --- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key |
| `RESEND_API_KEY` | Resend key |
| `SITE_URL` | your site URL, no trailing slash |
| `EMAIL_FROM` | same sender as in step 5 |

Or with the GitHub CLI (it asks you to paste each value):

```bash
gh secret set SUPABASE_URL
```

```bash
gh secret set SUPABASE_SERVICE_ROLE_KEY
```

```bash
gh secret set RESEND_API_KEY
```

```bash
gh secret set SITE_URL
```

```bash
gh secret set EMAIL_FROM
```

The workflow `.github/workflows/alerts.yml` runs every day at 06:17 UTC from the **default branch** (merge `v3-global` into `main` first). Until the secrets exist it just prints "not configured" and succeeds.

---

## 8. Test it end to end

**a) A real email to yourself, without any subscribers** (needs `RESEND_API_KEY` in your terminal; with the test sender, use your Resend account address):

```bash
RESEND_API_KEY="re_your_key" SITE_URL="https://your-project.pages.dev" npm run alerts -- --sample --to=you@example.com
```

You should receive a sample digest and a reminder email.

**b) Sign up through the site.** Open your site, pick a nationality and level, star a programme or two, open **Get deadline alerts**, enter your email and submit. Then:
1. You get "Confirm your Funded Abroad deadline alerts". Click the button and you land on the site with "You're subscribed".
2. `ADMIN_EMAIL` gets "New subscriber: <country>, <level>".
3. In Supabase **Table Editor → subscribers** you'll see your row with `confirmed = true`.

**c) Dry run of the real job** (reads your subscribers, sends nothing): GitHub → **Actions → Deadline alerts → Run workflow** and leave "Dry run" ticked. The log lists what would be sent, e.g. `[dry-run] digest → yo***@example.com: "5 scholarship deadlines in the next 30 days"`. Locally:

```bash
SUPABASE_URL="https://abcdefghijklm.supabase.co" SUPABASE_SERVICE_ROLE_KEY="your-secret-key" SITE_URL="https://your-project.pages.dev" npm run alerts -- --dry-run
```

**d) Real run:** run the workflow again with "Dry run" unticked (or wait for the daily schedule). Digests only go out on each subscriber's chosen weekday (in UTC). To see what a particular day would send, add `--now` to the dry-run command from (c), e.g. `--now=2026-11-09T07:00:00Z` (a Monday).

**e) Unsubscribe:** click "Unsubscribe and delete my data" in any alert. Your row disappears from `subscribers`.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Panel still says "Alerts coming soon" | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing in Cloudflare, or you didn't redeploy after adding them. |
| "Couldn't reach the alerts service" | The `subscribe` function isn't deployed, or `SITE_URL` doesn't exactly match your site's address (it's used to allow browser requests). |
| No confirmation email | With `onboarding@resend.dev` you can only email your own Resend address. Otherwise check Resend → Logs, and that your domain is verified. |
| Function logs | Supabase → **Edge Functions → subscribe → Logs**. |
| Daily job failed | GitHub → Actions → the run → "Send alerts" step. A Resend error usually means an unverified sender or the free daily limit (100/day). |
| Hit the Resend limit | The free plan allows 100 emails/day. Failed sends are retried the next day automatically (nothing is marked as sent). |

## Costs and limits to keep an eye on

* Supabase pauses free projects after about a week with no activity. The daily GitHub job queries it every day, which should keep it active. If it does get paused, resume it from the dashboard.
* Resend free: 100 emails/day. Each subscriber gets at most a weekly digest plus occasional reminders, so this covers a few hundred subscribers.
