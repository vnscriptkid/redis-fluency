import { createApp } from './app';
import { redis } from './cache';

async function main() {
    await redis.flushall();

    await createApp();
}


main();

