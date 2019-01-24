'use strict'

const Redis = require('ioredis')
const async = require('async')

class MoonbeamHistory {
  constructor (conf, db) {
    this.conf = conf
    this.db = db
  }

  handleTrade (msg) {
    const [id, pair, t, amount, price] = msg
    const trade = {
      id: id,
      pair: pair,
      symbol: 't' + pair,
      t: t / 1000,
      price: price,
      amount: amount,
      side: 0 // amount already has sign
    }

    this.redisPubTrades.rpush('te.out', JSON.stringify({ o: trade, a: 'te_trade_mem' }))
    this.redisPubTrades.publish('eosfinex.trades.1', JSON.stringify(trade))
  }

  work () {
    const { redisListName, interval } = this.conf
    this.redis.lpop(redisListName, (err, data) => {
      if (err) {
        console.log(err)
      }

      if (data === null) {
        this.tmos = setTimeout(() => { this.work() }, interval)
        return
      }
      const parsed = JSON.parse(data)

      let [, type, entry] = parsed

      let ts = entry[4]
      let username = parsed.pop()

      if (type === 'tu') {
        ts = entry[2]

        this.handleTrade(entry)
      }

      const doc = {
        username: username,
        ts: ts,
        entry: parsed
      }

      this.db.collection.insertOne(doc, (err) => {
        if (err) console.error(err)

        this.tmos = setTimeout(() => { this.work() }, interval)
      })
    })
  }

  start (cb) {
    async.series([
      (cb) => {
        this.db.start(cb)
      },
      (cb) => {
        this.redis = new Redis(this.conf.redisPort, this.conf.redisUrl)
        this.redisPubTrades = new Redis(this.conf.redisPort, this.conf.redisUrl)
        cb()
      },
      (cb) => {
        this.work()
      }
    ], cb)
  }

  stop (cb) {
    async.series([
      (cb) => {
        clearTimeout(this.tmos)
      },
      (cb) => {
        this.redis.disconnect()
        this.redisPubTrades.disconnect()
        cb()
      },
      (cb) => {
        this.db.stop(cb)
      }
    ], cb)
  }
}

module.exports = MoonbeamHistory
