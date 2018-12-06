'use strict'

const async = require('async')

class MoonbeamHistory {
  constructor (conf, db, redis) {
    this.conf = conf
    this.db = db
    this.redis = redis
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
      const [, username, type, entry] = parsed
      let ts = entry[4]
      if (type === 'tu') {
        ts = entry[2]
      }

      const doc = {
        username: username,
        ts: ts,
        entry: parsed
      }

      this.db.collection.insertOne(doc, () => {
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

function worker (opts, db, redis) {
  return new MoonbeamHistory(opts, db, redis)
}

module.exports = worker
