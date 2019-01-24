'use strict'

const Redis = require('ioredis')
const redis = new Redis()
const async = require('async')

const queue = 'test_foo'

const msgs = [
  ['0', 'oc', ['34045', 0, 28265, 'EOS.USD', 1548171078025, 0.000000, 101.000000, 1, 'testuser4321', 'fully.filled', 1], 'testuser4321'],
  ['0', 'tu', ['30991', 'EOS.USD', 1548171078025, '34047', -0.565000, 101.000000, 'LIMIT', 0, 28250, 'USD', 28267, 1], 'testuser4321'],
  ['0', 'tu', ['30991', 'EOS.USD', 1548171078025, '18446744073709517345', 0.565000, 101.000000, 'LIMIT', 0, 113000, 'EOS', 28490, 1], 'testuser4321'],
  ['0', 'oc', ['18446744073709517345', 0, 28490, 'EOS.USD', 1548171078025, 0.000000, 101.000000, 0, 'testuser4321', 'fully.filled', 1], 'testuser4321'],
  ['0', 'on', ['34271', 0, 28491, 'EOS.USD', 1548171078025, 1.000000, 101.000000, 1, 'testuser4321', 1], 'testuser4321'],
  ['0', 'tu', ['30992', 'EOS.USD', 1548171078025, '34047', -0.435000, 101.000000, 'LIMIT', 0, 21750, 'USD', 28267, 1], 'testuser4321'],
  ['0', 'tu', ['30992', 'EOS.USD', 1548171078025, '18446744073709517343', 0.435000, 101.000000, 'LIMIT', 0, 87000, 'EOS', 28492, 1], 'testuser4321']
]

const amount = 350
const times = Math.ceil(amount / msgs.length)

let tradeId = 1
async.timesSeries(times, (n, cb) => {
  async.map(msgs, (data, cb) => {
    tradeId++

    data[0] = tradeId
    redis.lpush(queue, JSON.stringify(data), cb)
  }, cb)
}, async () => {
  console.log('finished')
  console.log(await redis.lpop(queue))
})
