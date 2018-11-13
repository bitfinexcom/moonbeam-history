'use strict'

const Redis = require('ioredis')
const redis = new Redis()

const queue = 'test_foo'

for (let i = 0; i < 200; i++) {
  const data = JSON.stringify(
    ['0', 'testuser4321', 'on', [i + '', 0, 12345, 'EOS.USD', i, 1.000000, 500.000000, 1, 'testuser4321']]
  )

  redis.lpush(queue, data)
}

;(async () => {
  console.log(await redis.lpop(queue))
})()
