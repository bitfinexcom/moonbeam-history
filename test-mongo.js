'use strict'

const dbConf = require('./config/moonbeam.mongo.conf.json')
const db = require('moonbeam-mongodb')(dbConf)

db.start(() => {
  const stmt = { $query: { username: 'testuser4321' } }

  db.collection
    .find(stmt, { limit: 50 })
    .sort({ ts: -1 })
    .project({ 'entry': 1, _id: 0 })
    .toArray((err, entries) => {
      if (err) throw err

      console.log(entries)
    })
})
