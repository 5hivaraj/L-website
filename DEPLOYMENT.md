# Deploy Lumedia to AWS EC2 (Amazon Linux 2023 + Nginx)

Static HTML/CSS/JS site for **lumediaads.com** and **www.lumediaads.com**.  
No build step. No framework.

Document root:

```text
/var/www/lumediaads.com
```

`index.html` must sit directly in that directory.

---

## 1. Required packages

```bash
sudo dnf update -y
sudo dnf install -y nginx git
```

Later (HTTPS):

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

EC2 security group inbound:

- TCP **22** (SSH; restrict if possible)
- TCP **80** (HTTP)
- TCP **443** (HTTPS, after Certbot)

---

## 2. Nginx installation

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
curl -I http://127.0.0.1
```

---

## 3. Document root setup

```bash
sudo mkdir -p /var/www/lumediaads.com
```

---

## 4. Copying website files

Upload the **repository root contents** (the folder that already contains `index.html`).

Do **not** upload a nested folder such as `L-website-main/`.

From your laptop (example with rsync):

```bash
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '.DS_Store' \
  --exclude '.vscode' \
  --exclude 'netlify.toml' \
  --exclude 'nginx' \
  --exclude 'deploy' \
  --exclude 'DEPLOY.md' \
  --exclude 'DEPLOYMENT.md' \
  ./ \
  ec2-user@YOUR_EC2_HOST:/tmp/lumedia-site/
```

On the EC2 instance:

```bash
sudo rsync -a --delete /tmp/lumedia-site/ /var/www/lumediaads.com/
sudo chown -R nginx:nginx /var/www/lumediaads.com
sudo find /var/www/lumediaads.com -type d -exec chmod 755 {} \;
sudo find /var/www/lumediaads.com -type f -exec chmod 644 {} \;
```

Verify:

```bash
ls /var/www/lumediaads.com/index.html
ls /var/www/lumediaads.com/css/styles.css
ls /var/www/lumediaads.com/js/main.js
ls /var/www/lumediaads.com/404.html
ls /var/www/lumediaads.com/robots.txt
ls /var/www/lumediaads.com/sitemap.xml
# Must NOT exist:
# /var/www/lumediaads.com/L-website-main/index.html
```

---

## 5. Nginx server block configuration

Example config in this repo:

- `nginx/lumediaads.conf` (preferred)
- `deploy/nginx-lumediaads.com.conf` (same intent; kept for compatibility)

Install:

```bash
sudo cp nginx/lumediaads.conf /etc/nginx/conf.d/lumediaads.conf
sudo nginx -t
sudo systemctl reload nginx
```

This config is **HTTP-only** until Certbot runs. It:

- Serves `lumediaads.com` and `www.lumediaads.com` on port 80
- Uses `root /var/www/lumediaads.com`
- Keeps `.html` URLs (no clean-URL rewriting)
- Uses `error_page 404 /404.html`

`/services.html` is a client-side redirect to `/outdoor-led.html` (kept as-is).

---

## 6. Permissions

```bash
sudo chown -R nginx:nginx /var/www/lumediaads.com
sudo find /var/www/lumediaads.com -type d -exec chmod 755 {} \;
sudo find /var/www/lumediaads.com -type f -exec chmod 644 {} \;
```

---

## 7. HTTP testing

On the instance:

```bash
curl -I -H "Host: lumediaads.com" http://127.0.0.1/
curl -I -H "Host: lumediaads.com" http://127.0.0.1/about.html
curl -I -H "Host: lumediaads.com" http://127.0.0.1/outdoor-led.html
curl -I -H "Host: lumediaads.com" http://127.0.0.1/indoor-led.html
curl -s -o /dev/null -w "%{http_code}\n" -H "Host: lumediaads.com" http://127.0.0.1/missing-page
```

Optional local hosts entry while DNS is pending:

```text
YOUR_EC2_PUBLIC_IP  lumediaads.com www.lumediaads.com
```

Then open http://lumediaads.com/ and confirm CSS/JS/images load.

---

## 8. HTTPS / Certbot setup

1. Point DNS **A** records for `lumediaads.com` and `www.lumediaads.com` to the EC2 Elastic IP / public IP.
2. Wait for propagation.
3. On the instance:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lumediaads.com -d www.lumediaads.com
```

Certbot will obtain certificates and update the Nginx server block with real `ssl_certificate` paths.  
Do not invent certificate paths before Certbot succeeds.

---

## 9. Renewal testing

```bash
sudo certbot renew --dry-run
sudo systemctl list-timers | grep -i certbot || true
```

After a real renewal:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Basic troubleshooting

| Symptom | Check |
|--------|--------|
| Connection refused | `sudo systemctl status nginx`; security group ports |
| Default Nginx page | Confirm `/etc/nginx/conf.d/lumediaads.conf` exists; `sudo nginx -t`; reload |
| Nested path / wrong site | Ensure files are in `/var/www/lumediaads.com/`, not `.../L-website-main/` |
| CSS/JS 404 | Permissions; confirm `css/` and `js/` under docroot |
| Real pages 404 | Use `.html` URLs (`/about.html`); clean URLs are not enabled |
| Forms | On EC2, mailto opens to `contact@lumediaads.com` or `career@lumediaads.com` (newsletter). No Netlify Forms on Nginx. |
| Certbot fails | DNS must already point here; ports 80/443 open |

Logs:

```bash
sudo tail -n 100 /var/log/nginx/error.log
sudo tail -n 100 /var/log/nginx/access.log
```

---

## 11. Updating the website later

```bash
# From your machine
rsync -avz --delete \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '.DS_Store' \
  --exclude '.vscode' \
  --exclude 'netlify.toml' \
  --exclude 'nginx' \
  --exclude 'deploy' \
  --exclude 'DEPLOY.md' \
  --exclude 'DEPLOYMENT.md' \
  ./ \
  ec2-user@YOUR_EC2_HOST:/tmp/lumedia-site/

# On EC2
sudo rsync -a --delete /tmp/lumedia-site/ /var/www/lumediaads.com/
sudo chown -R nginx:nginx /var/www/lumediaads.com
sudo find /var/www/lumediaads.com -type d -exec chmod 755 {} \;
sudo find /var/www/lumediaads.com -type f -exec chmod 644 {} \;
```

Static file updates do not require an Nginx reload.  
If you change `nginx/lumediaads.conf`:

```bash
sudo cp nginx/lumediaads.conf /etc/nginx/conf.d/lumediaads.conf
sudo nginx -t && sudo systemctl reload nginx
```

---

## Notes

- **URLs:** `.html` paths only.
- **Forms:** Netlify Forms work only on Netlify. On EC2, JS opens a mailto draft.
- **CDN:** Some media still loads from Webflow CDN.
- **Secrets:** Do not place AWS keys, SMTP passwords, or API tokens under the web root.
