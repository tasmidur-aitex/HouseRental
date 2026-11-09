# Run everything with Docker + a public ngrok URL

```bash
NGROK_AUTHTOKEN=<your token> docker compose up --build
```
That is the only setting you need (free token: https://dashboard.ngrok.com/get-started/your-authtoken).
Tip: put `NGROK_AUTHTOKEN=...` in a `.env` file next to `docker-compose.yml` (Docker Compose reads it) so you can just run `docker compose up`.

## What starts, in order
| # | Service | What it does |
|---|---|---|
| 1 | `db` | MySQL 8 (data kept in the `db_data` volume) |
| 2 | `backend` | Laravel API on PHP 7.4. Waits for the DB, creates the app key and the admin account once, runs migrations, seeds starter cities/areas/settings |
| 3 | `ngrok` | Public tunnel with a **dynamic** URL (starts after the backend is healthy) |
| 4 | `frontend` | React site + nginx. Reads the ngrok URL, shares it with the backend, prints the addresses, and proxies `/backend` to Laravel |

## Addresses (printed in the frontend container's log)
```
https://<dynamic>.ngrok-free.app            website
https://<dynamic>.ngrok-free.app/backend    Laravel API   ->  /backend/api/v1/...
https://<dynamic>.ngrok-free.app/admin      admin panel
http://localhost:8080                       same site, local only
http://localhost:4040                       ngrok inspector
```
Show them again: `docker compose logs frontend | grep -A8 PUBLIC`

The website calls the API with a relative URL (`/backend/api/v1`), so it works on any dynamic ngrok address and on localhost with no configuration. Laravel builds photo and payment-callback links from the incoming host, and payment returns / password-reset links use the ngrok address the frontend container discovered.

## Admin login
The admin password is generated on first start and printed once in the backend log:
```bash
docker compose logs backend | grep -A4 "Admin panel login"
```
Email defaults to `admin@example.com`. Set your own with `ADMIN_EMAIL=... ADMIN_PASSWORD=...` (in the shell or `.env`).

## Optional settings (shell variables or `.env`)
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SEED_DEMO=false` (skip sample cities), `DB_PASSWORD`,
`STORE_ID` / `STORE_PASSWORD` (SSLCommerz sandbox, then online payments work through the tunnel),
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## Everyday commands
```bash
docker compose up -d --build     # start in the background
docker compose logs -f backend   # follow the API log
docker compose down              # stop (data kept)
docker compose down -v           # stop and delete database, uploads, generated admin password
```
The ngrok URL changes every time the `ngrok` container restarts; the frontend container re-reads it when it starts (`docker compose restart ngrok frontend`).

## Notes and limits
- Meant for demos, testing and sharing a preview, not for production (see `DEPLOYMENT.md` for that). The database is not exposed on the host; only ports 8080 and 4040 (localhost) are published.
- Free ngrok shows a one-time "Visit site" warning page to browsers on first visit.
- Mail is written to the backend log (`MAIL_DRIVER=log`), so password-reset mails appear in `docker compose logs backend`.
- Uploaded photos live in the `media` volume.
- Laravel 6 needs PHP <= 8.0, so the backend image uses PHP 7.4.
