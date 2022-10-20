import { Subscriber } from "../subscriber";
import Redis from 'ioredis';

async function main() {
    const redis = new Redis();
    await redis.flushall();

    const sub = new Subscriber(redis)
    sub.listen();
    await sub.subscribe('orange')
}

main();
