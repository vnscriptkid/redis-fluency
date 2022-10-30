import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const mostRecentVisits = new MostRecentVisits(redis);

    await mostRecentVisits.storeVisit('user-1')
    await mostRecentVisits.storeVisit('user-2')
    await mostRecentVisits.storeVisit('user-1')
    await mostRecentVisits.storeVisit('user-3') // 1 2 3
    console.log(await mostRecentVisits.getMostRecentVisits());
    await mostRecentVisits.storeVisit('user-4') // 2 3 4
    console.log(await mostRecentVisits.getMostRecentVisits());
}

class MostRecentVisits {
    public readonly NUM_OF_ITEMS = 3;

    constructor(public readonly redis: Redis) { }

    async storeVisit(userId: string) {
        const visited = await this.redis.sismember(this._buildUniqueKey(), userId);

        if (visited) {
            console.info(`[storeVisit] visited`)
            return;
        }

        await this.redis.sadd(this._buildUniqueKey(), userId);
        await this.redis.rpush(this._buildRecentKey(), userId);

        const listSize = await this.redis.llen(this._buildRecentKey());
        if (listSize > this.NUM_OF_ITEMS) {
            await this.redis.lpop(this._buildRecentKey())
            await this.redis.srem(this._buildUniqueKey(), userId);
        }
    }

    getMostRecentVisits() {
        return this.redis.lrange(this._buildRecentKey(), 0, -1);
    }

    _buildRecentKey() {
        return `recent-visits`;
    }

    _buildUniqueKey() {
        return `unique-visits`;
    }
}

main();

