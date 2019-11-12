# moonbeam-history

redis to mongo bridge for historical trade data

## Config

```
bash setup-config.sh
```


```
node worker.js
```


## Developmeent

```
mongod --config /usr/local/etc/mongod.conf
```

## Indexes

```js
db.userdata.createIndex({ "ts": 1 })
db.userdata.createIndex({ "username": 1 })
db.userdata.createIndex({ "uintId": 1 }, { "unique": true })

db.tradefees.createIndex({ "ts": 1, "username": 1, "symbol": 1 })
db.tradefees.createIndex({ "uintId": 1 }, { "unique": true })
```
