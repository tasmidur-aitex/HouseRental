#!/bin/sh
# Runs when the frontend container starts (the nginx image executes /docker-entrypoint.d/*.sh).
# Asks ngrok for its dynamic public URL, shares it with the backend, and prints the addresses.
NGROK_API="${NGROK_API:-http://ngrok:4040/api/tunnels}"
OUT="${PUBLIC_URL_FILE:-/shared/public_url}"
mkdir -p "$(dirname "$OUT")"
rm -f "$OUT"   # never keep a stale address from a previous run

URL=""
i=0
while [ $i -lt 90 ]; do
  URL=$(wget -qO- "$NGROK_API" 2>/dev/null | tr -d '\n' | sed -n 's/.*"public_url" *: *"\(https:[^"]*\)".*/\1/p' | head -n1)
  [ -n "$URL" ] && break
  i=$((i+1)); sleep 2
done

if [ -n "$URL" ]; then
  echo "$URL" > "$OUT"
  chmod 644 "$OUT"
  cat <<BANNER

  ==========================================================
   PUBLIC (ngrok)
     Website : $URL
     API     : $URL/backend/api/v1
     Admin   : $URL/admin
   LOCAL
     Website : http://localhost:8080
     ngrok UI: http://localhost:4040
  ==========================================================

BANNER
else
  echo "[frontend] ngrok URL not available (is NGROK_AUTHTOKEN valid?). Serving locally only on http://localhost:8080"
fi
