'use strict'

const dbConf = require('./config/moonbeam.mongo.conf.json')
const db = require('moonbeam-mongodb')(dbConf)

db.start(() => {
  const stmt = { $query: { username: 'testuser4321' }, $orderby: { ts: -1 } }
  db.collection.find(stmt, { limit: 10 }, (err, cur) => {
    if (err) throw err

    cur.toArray((err, res) => {
      if (err) throw err
      console.log(JSON.stringify(res, null, '  '))
    })
  })
})
