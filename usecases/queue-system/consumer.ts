import Redis from 'ioredis';
import { Queue } from './queue';

async function main() {

    const redis = new Redis();

    const queue = new Queue(redis, 'fruits');

    queue.process((item) => {
        console.log('log: ', item)
    })
}

main();