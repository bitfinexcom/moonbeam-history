'use strict'

const Redis = require('ioredis')
const async = require('async')
const Long = require('mongodb').Long

class MoonbeamHistory {
  constructor (conf, dbPlugin) {
    this.conf = conf
    this.dbPlugin = dbPlugin
  }

  handleTrade (msg) {
    const [pair, , tr, , uintId] = msg
    const [id, t, amount, price] = tr

    const trade = {
      id: id,
      uintId: uintId,
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

      if (!data) {
        this.tmos = setTimeout(() => { this.work() }, interval)
        return
      }

      const parsed = JSON.parse(data)
      let [, type, entry] = parsed

      if (type === 'te') {
        this.handleTrade(parsed)
        this.tmos = setTimeout(() => { this.work() }, interval)
        return
      }

      const uintId = parsed.pop()
      const username = parsed.pop()

      let ts = entry[4]

      if (type === 'tu') {
        ts = entry[2]
      }

      const uintIdLong = Long.fromString(uintId)
      async.parallel([
        (next) => {
          const doc = {
            uintId: uintIdLong,
            username: username,
            ts: ts,
            entry: parsed
          }

          this.tradesCollection.insertOne(doc, next)
        },
        (next) => {
          if (type !== 'tu') {
            return next()
          }

          const fee = parsed[2][8]
          const cur = parsed[2][9]
          const amount = parsed[2][4]

          const doc = {
            uintId: uintIdLong,
            username: username,
            ts: ts,
            fee: fee,
            cur: cur,
            amount: amount
          }

          this.feesCollection.insertOne(doc, next)
        }

      ], (err) => {
        if (err) {
          console.error(err)
        }

        this.tmos = setTimeout(() => { this.work() }, interval)
      })
    })
  }

  start (cb) {
    async.series([
      (cb) => {
        this.dbPlugin.start(cb)
      },
      (cb) => {
        const { db, conf } = this.dbPlugin

        this.tradesCollection = db.collection(conf.collection_trades)
        this.feesCollection = db.collection(conf.collection_fees)
        cb()
      },
      (cb) => {
        this.redis = new Redis(this.conf.redisConf)
        this.redisPubTrades = new Redis(this.conf.redisConf)
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
        this.dbPlugin.stop(cb)
      }
    ], cb)
  }
}

module.exports = MoonbeamHistory
