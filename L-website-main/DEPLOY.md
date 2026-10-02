# Deploy Lumedia to AWS EC2 (Amazon Linux 2023 + Nginx)

Static HTML/CSS/JS site for **lumediaads.com**. No build step. No framework migration.

## What to upload

Copy the **contents** of this folder (the directory that contains `index.html`) into:

```text
/var/www/lumediaads.com/
```

Correct:

```text
/var/www/lumediaads.com/index.html
/var/www/lumediaads.com/css/
/var/www/lumediaads.com/js/
/var/www/lumediaads.com/assets/
...
```

Incorrect (do not nest):

```text
/var/www/lumediaads.com/L-website-main/index.html
```

## EC2 setup (summary)

```bash
sudo dnf update -y
sudo dnf install -y nginx
sudo mkdir -p /var/www/lumediaads.com
sudo rsync -a --delete ./ /var/www/lumediaads.com/
# or: unzip / scp your release archive into that path

sudo cp deploy/nginx-lumediaads.com.conf /etc/nginx/conf.d/lumediaads.com.conf
sudo nginx -t
sudo systemctl enable --now nginx
```

Open security group ports **80** and **443**.

## HTTPS (Let's Encrypt)

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lumediaads.com -d www.lumediaads.com
```

Then enable the HTTPS server block / HTTP→HTTPS redirect in the Nginx config (Certbot often does this automatically).

## URL style

This site uses **`.html` URLs** (for example `/about.html`, `/outdoor-led.html`).  
Do not enable extensionless clean URLs unless you intentionally update every internal link.

`/services.html` redirects to `/outdoor-led.html`.

## Forms

Contact and newsletter forms originally targeted **Netlify Forms**. On EC2/Nginx they will not reach Netlify.

The site JS falls back to a **mailto:** handoff to `contact@lumediaads.com` when Netlify is not available, and still shows the on-page success state.

Optional later: point forms at a form backend by setting `data-form-endpoint` on the `<form>` (do not commit API secrets).

## 404

`404.html` is present. Nginx is configured with `error_page 404 /404.html`.

## SEO files included

- `robots.txt`
- `sitemap.xml`

## Security notes

- No AWS keys, API secrets, or `.env` files are required for static hosting.
- Do not commit credentials into this repo.
- Keep `netlify.toml` only if you also publish to Netlify; Nginx uses `deploy/nginx-lumediaads.com.conf`.
