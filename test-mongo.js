'use strict'

const dbConf = require('./config/mongo.userdata.conf.json')
const plugin = require('moonbeam-mongodb')(dbConf)

plugin.start(() => {
  const stmt = { username: 'testuser4321' }

  const { db } = plugin
  db.collection('tradefees')
    .find(stmt, { limit: 50 })
    .sort({ ts: -1 })
    // .project({ entry: 1, _id: 0 })
    .toArray((err, entries) => {
      if (err) throw err

      console.log(entries)
    })
})
