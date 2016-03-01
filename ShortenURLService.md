# Introduction #

快，稳定，301，API。


# Details #

  * long url come, create an uid.
```
uid string <= int to (0-9a-z): uid.toString(36) <= INCR longurl_uid
```
  * save to db, return s8.hk/uid to request client.
```
HSET uid url "longurl"
```