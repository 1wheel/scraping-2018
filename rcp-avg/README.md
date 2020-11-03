
https://github.com/hartator/wayback-machine-downloader

https://www.realclearpolitics.com/epolls/2020/president/pa/pennsylvania_trump_vs_biden-6861.html


```
gem install wayback_machine_downloader


wayback_machine_downloader https://www.realclearpolitics.com/epolls/2020/president/pa/pennsylvania_trump_vs_biden-6861.html \
  --directory raw-data \
  --all-timestamps \
  --exact-url \
  --concurrency 10 \
  --maximum-snapshot 5000
```


https://www.realclearpolitics.com/json/battleground_script/pa_president_2020_vs_2016_trump_vs_biden_polling_average_difference_days_until_election.json?1604411756181