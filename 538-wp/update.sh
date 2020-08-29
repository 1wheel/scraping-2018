while true
do
  node download.js
  cp 538-2020-nba-forecasts.json ../../../../usr/share/nginx/html/data/
  cp 538-2020-nba-games.json ../../../../usr/share/nginx/html/data/
  sleep 4h
done
