import Redis from 'ioredis';
import { Publisher } from "../publisher";

async function main() {
    const redis = new Redis();
    await redis.flushall();

    const pub = new Publisher(redis)

    await pub.publish('orange', 'DATE')
    await pub.publish('apple', 'HOSTNAME')
    await pub.publish('global', 'PING')
}

main();
