import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const promotionService = new PromotionService(redis);

    await promotionService.initItem('item-1', 2000);

    promotionService.updateItemsInInterval();

}

class PromotionService {
    constructor(public readonly redis: Redis) { }

    async initItem(itemId: string, delayInMs = 1000) {
        await this.redis.zadd(this._buildDelayKey(), delayInMs, itemId);
        await this.redis.zadd(this._buildScheduleKey(), Date.now(), itemId);
    }

    async updateItemsInInterval() {
        while (true) {
            const now = Date.now();

            const candidateItem = await this.redis.zrange(this._buildScheduleKey(), 0, 0, 'WITHSCORES');

            if (!candidateItem || parseInt(candidateItem[1]) > now) {
                console.info(`waiting 1 sec`)
                await wait(1000)
                continue;
            }

            const delay = await this.redis.zscore(this._buildDelayKey(), candidateItem[0])

            if (delay && parseInt(delay) > 0) {
                console.info(`[updateItemsInInterval] updating`)
                const freshItem = await fetchItemFromDb(candidateItem[0]);
                await this.redis.hset(candidateItem[0], freshItem);
                await this.redis.zadd(this._buildScheduleKey(), now + parseInt(delay), candidateItem[0])
            } else {
                console.info(`[updateItemsInInterval] removing`)
                await this.redis.hdel(candidateItem[0]);
                await this.redis.zrem(this._buildDelayKey(), candidateItem[0]);
                await this.redis.zrem(this._buildScheduleKey(), candidateItem[0]);
            }

            console.log(await this.redis.hgetall(candidateItem[0]))
        }
    }

    _buildScheduleKey() {
        return `schedule-items`
    }

    _buildDelayKey() {
        return `delay-items`
    }
}

function fetchItemFromDb(itemId: string) {
    return new Promise<{ id: string, price: number, title: string, quantity: number }>(resolve => {
        resolve({
            id: itemId,
            price: 100,
            title: `title of ${itemId}`,
            quantity: Math.floor(Math.random() * 101) // [0,100]
        })
    })
}

function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();

