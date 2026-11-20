#!/usr/bin/env bash
# RNF06: GET a la URL de producción cada 5 min. Uso: monitor.sh <url> <n_verificaciones> <salida.csv>
url=$1; n=$2; out=$3
echo "timestamp,http_code,time_total_s,ok" > "$out"
for i in $(seq 1 "$n"); do
  r=$(curl -s -o /dev/null -w '%{http_code},%{time_total}' --max-time 30 "$url" || true)
  code=${r%%,*}; ok=0; [[ $code =~ ^(2|3) ]] && ok=1
  echo "$(date -Iseconds),$r,$ok" >> "$out"
  [ "$i" -lt "$n" ] && sleep 300
done
