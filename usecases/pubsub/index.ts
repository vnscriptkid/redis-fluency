import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

}

main();

