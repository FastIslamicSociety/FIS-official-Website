# FAST Islamic Society (FIS) Website

Official website of the FAST Islamic Society.

**Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Supabase (database, login, image storage), hosted on Vercel.

## Folder guide

| Folder / file | What it is |
|---|---|
| `public/` | The static homepage (`index.html`, `mobile.html`) and its images. `/` is pointed at `public/index.html` by a rewrite in `next.config.ts`. |
| `app/admin/` | The admin area: login, posts list, editor, approve/publish. |
| `lib/` | Supabase helpers (`lib/supabase/`) and the login/role check (`lib/auth.ts`). |
| `components/` | Shared pieces, such as the Markdown renderer. |
| `proxy.ts` | Keeps the admin login session fresh. |
| `supabase/migrations/` | The database setup, recorded as SQL. |

## Run it on your computer

1. Install Node.js (LTS) and Git.
2. `git clone https://github.com/FastIslamicSociety/FIS-official-Website.git`
3. `cd FIS-official-Website` then `npm install`
4. Create a file named `.env.local` in the top folder with these two lines (get the values from the Supabase dashboard: the project URL, and the **publishable** key):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

5. `npm run dev`, then open http://localhost:3000 (homepage) and http://localhost:3000/admin (admin).

**Never** commit `.env.local`. **Never** put the Supabase secret key, the database password or any login in this repo.

## Roles

| Role | Can do |
|---|---|
| `user` | Nothing in the admin area. Can read published posts. |
| `publisher` | Create and edit posts, submit for review, publish approved posts. |
| `admin` | Everything a publisher can, plus Approve, move back to draft, Delete, and manage roles. |

Keep the admin list short (EC technical team and leads).

### Giving someone access

1. In Supabase, open **Authentication > Users > Add user**, enter their email and a password, and tick **Auto Confirm User**.
2. In **SQL Editor**, run (use their email and the role):

```sql
update public.profiles set role = 'publisher' where email = 'name@example.com';
```

To remove access, set the role back to `user`.

## How to publish a blog post

1. A writer emails the article to the FIS blog email address. The content team proofreads it, and the EC approves it by email.
2. A **publisher or admin** opens `/admin` and signs in, then clicks **New post**.
3. Fill in the title, author name, article text, and optionally a short summary and a cover image. A cover image needs a short description (alt text). The article is written in Markdown: `# Heading`, `**bold**`, `- list item`, `[link text](https://address)`. Use **Preview** to check how it looks.
4. Click **Save as draft**, or **Submit for review** when it is ready.
5. An **admin** opens the post and clicks **Approve**. The system records who approved it and when.
6. A publisher or admin opens the post and clicks **Publish**. The database refuses to publish a post that is not approved.

Good to know:
- The slug (the web address) cannot be changed after publishing.
- Images must be JPG, PNG or WebP, up to 5 MB.
- **Unpublish** moves a post back to draft (admin only). **Delete** is permanent (admin only).
- Editing the text of an approved or published post does not require approving it again.

## Database

The database lives in Supabase. Its full setup is recorded in `supabase/migrations/`. That file is a **rebuild record for a new, empty Supabase project only**. Do not run it on the existing project, because everything in it already exists there.

## Deploying

The site is deployed by Vercel from this GitHub repo. Every pull request gets a preview link, and merging into `main` updates the live site.

- Work on a branch, open a pull request, get one review, then merge. Do not push straight to `main`.
- In the Vercel project, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must be set under **Settings > Environment Variables** (Production and Preview), or `/admin` will show an error.
- The Vercel project's Framework Preset must be **Next.js**.

## Handover checklist (every year, when the EC changes)

Do this together, with the outgoing and incoming technical teams in the same session. Record who holds each account, but **never write passwords here**.

| Account | Used for | Held by |
|---|---|---|
| FIS project email | Owner of the accounts below | |
| GitHub (repo `FastIslamicSociety/FIS-official-Website`) | Code, pull requests | |
| Vercel | Hosting and deploys | |
| Supabase (organization FIS-Website) | Database, login, image storage | |
| Password manager | Shared passwords | |
| Domain (if bought) | Website address | |

1. Add the new technical team to GitHub, Vercel and Supabase, then remove leaving members.
2. Update roles: make the new content secretary a `publisher` and the new technical leads `admin`, and set leaving members back to `user`.
3. Change the shared passwords and re-do two-factor authentication, so the new team holds the recovery options.
4. Make sure at least two people can log in to every account above.

## Status (November 2026)

Built: homepage, admin login, posts list and editor, save draft, submit for review, approve, publish, unpublish, delete, cover images, Markdown preview, database setup.

Not built yet: public blog pages, email to members when a post is published, newsletter, anonymous questions, events, in-app chat.

Known limits: cover images that are uploaded but never saved with a post stay in storage. Supabase's free plan pauses a project after about a week of no activity, so an uptime ping is planned.
