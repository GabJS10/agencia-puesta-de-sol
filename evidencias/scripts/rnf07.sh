#!/usr/bin/env bash
# RNF07: confirmaciones concurrentes sobre un plan de 1 cupo. SOLO BD local de pruebas.
# Uso: rnf07.sh <baseURL> <adminEmail> <adminPass> <A|B> <ensayos>
#  A: dos PENDING con apartado vigente (como las crea la app).
#  B: dos PENDING con apartado vencido (no bloquean): solo el lock evita la doble confirmación.
B=$1; AE=$2; AP=$3; V=$4; N=$5
SQL() { docker exec -i pds-postgres psql -q -U postgres -d puestadelsol_test -At -v ON_ERROR_STOP=1 "$@"; }
JAR=$(mktemp)
curl -s -c "$JAR" -o /dev/null -X POST "$B/api/auth/login" -H 'content-type: application/json' -d "{\"email\":\"$AE\",\"password\":\"$AP\"}"
PLAN=$(SQL -c "INSERT INTO \"Plan\"(title,slug,price,location,description,includes,recommendations,\"photoUrl\",\"availabilityMode\",capacity,\"updatedAt\")
  VALUES ('QA RNF07','qa-rnf07',1,'QA','qa','qa','qa','https://images.unsplash.com/photo-1507525428034-b723cf961d3e','CAPACITY',1,now())
  ON CONFLICT (slug) DO UPDATE SET capacity=1 RETURNING id;")
HOLD=$([ "$V" = A ] && echo "now() + interval '72 hours'" || echo "now() - interval '1 hour'")
echo "Fecha: $(date -Iseconds) Variante: $V Plan id: $PLAN (CAPACITY, cupo 1)"
echo "ensayo,req1,req2,http1,http2,confirmadas,personas_confirmadas,eventos_confirm,eventos_creacion,ok"
for i in $(seq 1 "$N"); do
  SQL -q -c "DELETE FROM \"PlanRequest\" WHERE \"planId\"=$PLAN;"
  ids=$(SQL -c "WITH r AS (INSERT INTO \"PlanRequest\"(\"planId\",name,email,phone,\"travelDate\",guests,status,\"holdExpiresAt\",\"updatedAt\")
    SELECT $PLAN,'QA '||g,'qa'||g||'@test.local','3000000000','2027-01-15',1,'PENDING',$HOLD,now() FROM generate_series(1,2) g RETURNING id)
    INSERT INTO \"PlanRequestEvent\"(\"requestId\",\"toStatus\",actor) SELECT id,'PENDING','CLIENT' FROM r RETURNING \"requestId\";" | tr '\n' ' ')
  set -- $ids; R1=$1; R2=$2
  for r in $R1 $R2; do
    curl -s -b "$JAR" -o /dev/null -w '%{http_code}' -X PATCH "$B/api/admin/solicitudes/$r" -H 'content-type: application/json' -d '{"status":"CONFIRMED"}' > "$JAR.$r" &
  done; wait
  read -r conf pers evc evp <<<"$(SQL -F' ' -c "SELECT
    (SELECT count(*) FROM \"PlanRequest\" WHERE \"planId\"=$PLAN AND status='CONFIRMED'),
    (SELECT coalesce(sum(guests),0) FROM \"PlanRequest\" WHERE \"planId\"=$PLAN AND status='CONFIRMED'),
    (SELECT count(*) FROM \"PlanRequestEvent\" e JOIN \"PlanRequest\" r ON r.id=e.\"requestId\" WHERE r.\"planId\"=$PLAN AND e.\"toStatus\"='CONFIRMED'),
    (SELECT count(*) FROM \"PlanRequestEvent\" e JOIN \"PlanRequest\" r ON r.id=e.\"requestId\" WHERE r.\"planId\"=$PLAN AND e.\"fromStatus\" IS NULL);")"
  ok=$([ "$pers" -le 1 ] && [ "$evc" -eq "$conf" ] && echo SI || echo NO)
  echo "$i,$R1,$R2,$(cat $JAR.$R1),$(cat $JAR.$R2),$conf,$pers,$evc,$evp,$ok"
  rm -f "$JAR.$R1" "$JAR.$R2"
done
rm -f "$JAR"
