'use strict'

const dbConf = require('./config/mongo.userdata.conf.json')
const db = require('moonbeam-mongodb')(dbConf)

const conf = require('./config/moonbeam.history.conf.json')

const MoonbeamHistory = require('./workers/moonbeam.history')

const worker = new MoonbeamHistory(conf, db)
worker.start()
