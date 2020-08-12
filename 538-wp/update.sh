while true
do
  node download.js
  cp merged-forecasts.json ../../../../usr/share/nginx/html/data/
  sleep 360
done
