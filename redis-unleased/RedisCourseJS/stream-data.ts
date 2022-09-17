import Redis from 'ioredis';
import fs from 'fs'
import readline from 'readline'

const redis = new Redis({ lazyConnect: true });

async function main() {
    await redis.connect();

    const rl = readline.createInterface({
        input: fs.createReadStream('./OnlineRetail.csv'),
        crlfDelay: Infinity
    })

    for await (const line of rl) {
        console.log('line: ', line);
        await redis.xadd('orders', '*', 'line', line);
        await sleep(1000);
    }
}

var sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

main();