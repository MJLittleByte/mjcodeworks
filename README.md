# MJ Codeworks website

Source for **https://mjcodeworks.org**: the studio's home page, the company privacy policy and the privacy policy of
each MJ Codeworks app. Plain HTML, CSS and JavaScript: no framework and no build step.

## Structure

```
site/                         ← everything in here is published
  index.html                  home page (hero, services, process, about, contact)
  privacy/index.html          website privacy policy + list of app policies
  apps/<app>/privacy/         one privacy policy per app (sgbusxing, sgcarbuddy, speedtick, amblyofit)
  404.html                    "page not found" (uses root-absolute links, so it only works on the custom domain)
  app-ads.txt                 AdMob authorised sellers file (see below)
  robots.txt, sitemap.xml, favicon.svg
  assets/css/styles.css       all styles (light + dark theme, responsive)
  assets/js/theme.js          applies the saved light/dark theme before the page paints
  assets/js/main.js           theme toggle, mobile menu, scroll reveal, copy button
  assets/fonts/               self-hosted Geist + Instrument Serif (SIL OFL, licences included)
scripts/check-site.mjs        link / page checker used by CI
dns/mjcodeworks.org.zone.txt  Cloudflare DNS records (BIND zone file, ready to import)
.github/workflows/pages.yml   checks the site and deploys it to GitHub Pages
```

## Preview locally

```bash
python3 -m http.server 8080 --directory site    # then open http://localhost:8080
node scripts/check-site.mjs                      # checks titles, headings, links and #anchors
```

Opening `site/index.html` directly in a browser also works (everything except `404.html` uses relative links).

## Common edits

- **Email and phone** are placeholders ("Coming soon"). Search for `Coming soon` in `site/index.html` and
  `coming soon` in `site/privacy/index.html`. The replacement markup is in an HTML comment next to each one.
- **Adding an app policy:** copy an existing `site/apps/<app>/privacy/index.html`, edit it, add a card to the list in
  `site/privacy/index.html` and a `<loc>` line to `site/sitemap.xml`.
- **Brand colours** are CSS variables at the top of `site/assets/css/styles.css` (`--p1`, `--p2`, `--glow1`,
  `--glow2`, `--t1`, `--t2`, `--accent`), with dark-theme values in the `[data-theme="dark"]` block.

## Deployment

Every push to `main` runs `.github/workflows/pages.yml`: it runs the site checker, then publishes `site/` to GitHub
Pages. Pull requests run the checker only. You can also deploy by hand from **Actions → Deploy website → Run workflow**.

### Custom domain (Cloudflare DNS)

GitHub Pages is set to the custom domain `mjcodeworks.org` (repository **Settings → Pages**). Add these records in
**Cloudflare → mjcodeworks.org → DNS → Records**, all with **Proxy status: DNS only** (grey cloud). The quickest way is
to import [`dns/mjcodeworks.org.zone.txt`](dns/mjcodeworks.org.zone.txt) via **Import and Export → Import DNS records**.
Every record in that file is tagged `cf-proxied:false`, so it stays DNS only whatever the "Proxy imported DNS records"
checkbox says:

| Type  | Name  | Content                  |
|-------|-------|--------------------------|
| A     | `@`   | `185.199.108.153`        |
| A     | `@`   | `185.199.109.153`        |
| A     | `@`   | `185.199.110.153`        |
| A     | `@`   | `185.199.111.153`        |
| AAAA  | `@`   | `2606:50c0:8000::153`    |
| AAAA  | `@`   | `2606:50c0:8001::153`    |
| AAAA  | `@`   | `2606:50c0:8002::153`    |
| AAAA  | `@`   | `2606:50c0:8003::153`    |
| CNAME | `www` | `mjlittlebyte.github.io` |

Then:

1. Wait for **Settings → Pages** to show "DNS check successful" (minutes to a few hours), then tick **Enforce HTTPS**
   once GitHub has issued the certificate.
2. Recommended: verify the domain for the account (**GitHub profile Settings → Pages → Add a domain**), which adds a
   `TXT` record `_github-pages-challenge-MJLittleByte`. This stops anyone else's repository from claiming the domain.
3. Optional: if you later switch the records to **Proxied** (orange cloud) for Cloudflare caching, set
   **SSL/TLS → Overview** to **Full (strict)**. "Flexible" causes redirect loops with Enforce HTTPS.

### Business email (suggestion)

**Cloudflare → Email → Email Routing** can forward an address such as `hello@mjcodeworks.org` to an existing inbox for
free. It only adds `MX`/`TXT` records and does not affect the website.

## Google Play checklist

- Update each app's **Privacy policy URL** in Play Console to its new address, e.g.
  `https://mjcodeworks.org/apps/sgbusxing/privacy/`. Keep the old URLs online until every listing has been updated.
- Set the developer **Website** to `https://mjcodeworks.org`.
- **app-ads.txt:** AdMob reads `https://mjcodeworks.org/app-ads.txt` (the developer website's domain). Put the real
  publisher ID into `site/app-ads.txt` and uncomment the line before an app with ads goes live.

## Credits

Fonts: [Geist](https://github.com/vercel/geist-font) and
[Instrument Serif](https://github.com/Instrument/instrument-serif) under the SIL Open Font License 1.1
(see `site/assets/fonts/`). Icons are adapted from [Lucide](https://lucide.dev) (ISC licence).
