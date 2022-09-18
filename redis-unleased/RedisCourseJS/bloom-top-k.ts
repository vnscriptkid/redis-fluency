import { createClient } from 'redis';
import fs from 'fs'
import readline from 'readline'

async function main() {
    const client = createClient();
    await client.connect();

    const rl = readline.createInterface({
        input: fs.createReadStream('./OnlineRetail.csv'),
        crlfDelay: Infinity
    })

    const key = 'topsellers'
    const topK = 11;

    try {
        await client.topK.reserve(key, topK, { width: 50, depth: 4, decay: 0.9 })
        console.log('Reserved Top K.');
    } catch (e) {
        if ((e as any)?.message?.endsWith('key already exists')) {
            console.log('Top K already reserved.');
        } else {
            console.log('Error, maybe RedisBloom is not installed?:');
            console.log(e);
        }
    }

    const stockCodeToDesc: Record<string, string> = {};

    for await (const line of rl) {
        const items = line.split(',');
        const stockCode = items[1];
        const desc = items[2];

        if (!(stockCode in stockCodeToDesc)) {
            stockCodeToDesc[stockCode] = desc;
        }

        const [evictedStockCode] = await client.topK.add(key, stockCode);

        if (evictedStockCode) {
            console.log('==> evictedStockCode: ', stockCodeToDesc[evictedStockCode]);
            const topKResults = await client.topK.list(key)
            console.log('==> topK now: ', topKResults);

        }
        await sleep(300);
    }
}

var sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

main();