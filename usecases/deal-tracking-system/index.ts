import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const dealTrackingSystem = new DealTrackingSystem(redis);

}

