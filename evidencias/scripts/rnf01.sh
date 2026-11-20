#!/usr/bin/env bash
# RNF01: acceso a /api/admin sin cookie, con token alterado y con sesión CLIENT.
# Uso: rnf01.sh <baseURL> <correoCliente> <claveCliente>   (los tokens no se imprimen)
B=$1; EMAIL=$2; PASS=$3; JAR=$(mktemp)
ROUTES=(/api/admin/notificaciones /api/admin/planes/1/blackouts "/api/admin/reportes/export?type=requests")
hit() { curl -s -o /tmp/rnf01_body -w '%{http_code}' "$@"; echo " $(head -c 120 /tmp/rnf01_body)"; }
echo "Fecha: $(date -Iseconds)  Base: $B"
login=$(curl -s -c "$JAR" -o /dev/null -w '%{http_code}' -X POST "$B/api/auth/login" -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
echo "Login cliente: HTTP $login"
TOKEN=$(awk '$6=="pds_session"{print $7}' "$JAR")
IFS=. read -r H P S <<<"$TOKEN"
# Token alterado: mismo encabezado y firma, payload con role=ADMIN.
PAY=$(printf '%s' "$P" | tr '_-' '/+' | base64 -d 2>/dev/null; true)
[ -z "$PAY" ] && PAY=$(printf '%s==' "$P" | tr '_-' '/+' | base64 -d 2>/dev/null)
NEWP=$(printf '%s' "$PAY" | sed 's/"role":"CLIENT"/"role":"ADMIN"/' | base64 -w0 | tr '/+' '_-' | tr -d '=')
FORGED="$H.$NEWP.$S"
echo "Payload alterado: $(printf '%s' "$PAY" | sed 's/"role":"CLIENT"/"role":"ADMIN"/' | sed -E 's/"email":"[^"]*"/"email":"<redactado>"/')"
for r in "${ROUTES[@]}"; do
  echo "== GET $r"
  echo -n "  sin cookie:     "; hit "$B$r"
  echo -n "  token alterado: "; hit -b "pds_session=$FORGED" "$B$r"
  echo -n "  sesion cliente: "; hit -b "pds_session=$TOKEN" "$B$r"
done
rm -f "$JAR"
