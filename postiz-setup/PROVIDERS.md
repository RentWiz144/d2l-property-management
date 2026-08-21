# Connecting ChoZen's Social Accounts to Self-Hosted Postiz

This is the slow part of self-hosting. Each platform needs its own free developer app;
you paste its two keys into Postiz, then click "connect" and log in as ChoZen.

**Order matters.** Do Facebook/Instagram/Threads first (one Meta app covers all three),
then TikTok, then YouTube. Expect app review waits on Meta and TikTok.

For every platform, the **redirect/callback URL** is:

```
https://postiz.YOURDOMAIN.com/integrations/social/<provider>
```

…where `<provider>` is `facebook`, `instagram`, `threads`, `tiktok`, or `youtube`.
Postiz shows the exact URL on each channel's connect screen — copy it from there rather
than typing it, since a mismatch is the #1 cause of "invalid redirect URI" errors.

Where to put the keys: Postiz reads them from environment variables in
`docker-compose.yml`. Add them under the `postiz:` service's `environment:` block,
then `docker compose up -d` to restart.

---

## 1. Meta — Facebook + Instagram + Threads

One app covers all three. Instagram must be a **Business or Creator** account linked to
a Facebook Page (ChoZen's already is).

1. Go to **developers.facebook.com** → My Apps → **Create App**.
2. Use case: **Other** → Type: **Business** → name it "ChoZen Social".
3. In the app dashboard, add these products: **Facebook Login**, **Instagram Graph API**,
   and (for Threads) **Threads API**.
4. Facebook Login → Settings → **Valid OAuth Redirect URIs** → paste your callback URLs.
5. App Settings → Basic → copy the **App ID** and **App Secret**.
6. Add to `docker-compose.yml`:

```yaml
      FACEBOOK_APP_ID: "your-app-id"
      FACEBOOK_APP_SECRET: "your-app-secret"
      INSTAGRAM_APP_ID: "your-app-id"
      INSTAGRAM_APP_SECRET: "your-app-secret"
      THREADS_APP_ID: "your-app-id"
      THREADS_APP_SECRET: "your-app-secret"
```

7. **App Review** — request these permissions:
   `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`,
   `instagram_basic`, `instagram_content_publish`,
   and for Threads: `threads_basic`, `threads_content_publish`.

   Meta requires a screencast showing the flow and a privacy-policy URL. Review typically
   takes a few days and rejections are common on the first try — usually for a vague
   screencast. Show clearly: logging into Postiz, connecting the ChoZen page, composing a
   post, and it appearing on Facebook/Instagram.

**While waiting:** your own app works in *development mode* for accounts listed as admins
of the app. Add ChoZen's accounts as app admins/testers and you can schedule to your own
pages before review completes — often enough to never need full review at all.

---

## 2. TikTok

1. Go to **developers.tiktok.com** → Manage Apps → **Create an App**.
2. Add the **Content Posting API** product.
3. Set the redirect URI to your `/integrations/social/tiktok` callback.
4. Request scopes: `user.info.basic`, `video.publish`, `video.upload`.
5. Copy the **Client Key** and **Client Secret**:

```yaml
      TIKTOK_CLIENT_ID: "your-client-key"
      TIKTOK_CLIENT_SECRET: "your-client-secret"
```

Note: unaudited TikTok apps can only post **private** videos. To publish publicly you must
pass their content-posting audit — apply from the app dashboard once basic posting works.

---

## 3. YouTube

1. Go to **console.cloud.google.com** → new project "ChoZen Social".
2. APIs & Services → Library → enable **YouTube Data API v3**.
3. OAuth consent screen → External → fill in app name, support email, and your domain.
4. Credentials → Create Credentials → **OAuth client ID** → Web application →
   add your `/integrations/social/youtube` callback.
5. Copy the Client ID and Secret:

```yaml
      YOUTUBE_CLIENT_ID: "your-client-id"
      YOUTUBE_CLIENT_SECRET: "your-client-secret"
```

Until Google verifies the app, refresh tokens expire every 7 days and you'll re-connect
weekly. Submit for verification to remove that limit.

---

## After each platform

```bash
cd /opt/postiz
docker compose up -d          # picks up new env vars
```

Then in Postiz → **Channels** → click the platform → log in as ChoZen → authorize.
The channel appears in the calendar and is ready to receive scheduled posts.

## Then finish the loop

1. Postiz → Settings → generate a **Public API key**.
2. claude.ai → Settings → Connectors → add Postiz as a custom connector using your
   server URL and that key.
3. Tell Claude **"check my posting engine"** — `chozen-social-command` will detect Postiz,
   verify the channels, and from then on scheduling is fully automatic.

## Common errors

| Error | Fix |
|---|---|
| `invalid redirect URI` | Callback in the developer app must match Postiz's shown URL character-for-character, including https and no trailing slash |
| `Instagram account not eligible` | IG must be Business/Creator and linked to the FB Page |
| Channel connects then drops | Token expired — usually means the app is unreviewed/unverified; re-connect and submit for review |
| TikTok posts land private | Content-posting audit not yet passed |
