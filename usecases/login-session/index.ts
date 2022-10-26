import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const loginSession = new LoginSession(redis);

    console.log(await loginSession.checkToken('token-1'))
    await loginSession.updateToken('token-1', 'user-x')
    console.log(await loginSession.checkToken('token-1'))

    await loginSession.updateToken('token-1', 'user-x', 'item-1')
    await loginSession.updateToken('token-1', 'user-x', 'item-2')
    await loginSession.updateToken('token-1', 'user-x', 'item-3')

    console.log(await loginSession.getViewHistory('token-1'))

}

class LoginSession {
    public readonly VIEW_ITEM_LIMIT = 5;

    constructor(public readonly redis: Redis) { }

    checkToken(token: string) {
        return this.redis.hget(this._buildLoginKey(), token);
    }

    async updateToken(token: string, user: string, item: string | null = null) {
        const unixTs = Math.floor(Date.now() / 1000);

        await this.redis.hset(this._buildLoginKey(), token, user)

        await this.redis.zadd(this._buildRecentKey(), unixTs, token)

        if (item) {
            await this.redis.zadd(this._buildViewKey(token), unixTs, item)

            // Maintain sortedset 25 items at max
            await this.redis.zremrangebyrank(this._buildViewKey(token), 0, -(this.VIEW_ITEM_LIMIT + 1));
        }
    }

    async getViewHistory(token: string) {
        const viewHistory: any[] = [];

        const pairsList = await this.redis.zrange(this._buildViewKey(token), 0, -1, 'WITHSCORES');

        for (let i = 0; i < pairsList.length; i += 2) {
            const [item, viewedAt] = [pairsList[i], pairsList[i + 1]];

            console.log(item, viewedAt)

            viewHistory.push({
                item,
                viewedAt: new Date(parseInt(viewedAt) * 1000)
            })
        }

        return viewHistory;
    }

    cleanSessions() {

    }

    _buildLoginKey() {
        return `login:`
    }

    _buildRecentKey() {
        return `recent:`
    }

    _buildViewKey(token: string) {
        return `view:${token}`
    }
}

main();

