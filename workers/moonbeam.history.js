'use strict'

const Redis = require('ioredis')
const async = require('async')

class MoonbeamHistory {
  constructor (conf, db) {
    this.conf = conf
    this.db = db
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
        cb()
      },
      (cb) => {
        this.db.stop(cb)
      }
    ], cb)
  }
}

module.exports = MoonbeamHistory
