import Redis from 'ioredis';

async function main() {
    const redis = new Redis();
    await redis.flushall();

    await redis.set('name', 'thanh');

    ////////////// custom get
    redis.defineCommand('myGet', {
        numberOfKeys: 1,
        lua: `return redis.call('GET', KEYS[1])`
    });

    const result = await (redis as any).myGet('name')

    console.log({ result });
    ///////////// set then get
    redis.defineCommand('setThenGet', {
        numberOfKeys: 1,
        lua: `
            redis.call('SET', KEYS[1], ARGV[1])
            return redis.call('GET', KEYS[1])
        `
    })

    const setGetResult = await (redis as any).setThenGet('age', 27)

    console.log({ setGetResult });
}


main();

