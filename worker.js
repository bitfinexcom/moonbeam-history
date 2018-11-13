'use strict'

const Redis = require('ioredis')

const dbConf = require('./config/moonbeam.mongo.conf.json')
const db = require('moonbeam-mongodb')(dbConf)

const conf = require('./config/moonbeam.history.conf.json')
const redis = new Redis(conf.redisPort, conf.redisUrl)
const getWorker = require('./workers/moonbeam.history')

const worker = getWorker(conf, db, redis)
worker.start()
