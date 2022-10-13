import Redis from 'ioredis';
import { Queue } from './queue';

async function main() {

    const redis = new Redis();

    const queue = new Queue(redis, 'fruits');

    let [idx, fruits] = [0, ['apple', 'orange', 'watermelon']]

    const intervalId = setInterval(async () => {
        if (idx < fruits.length) {
            const fruit = fruits[idx++];
            await queue.enqueue(fruit);
        } else {
            clearInterval(intervalId);
        }
    }, 2000)
}

main();