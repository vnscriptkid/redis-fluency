import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const sortedSet = new SortedSet(redis, 'scoreboard');

    await sortedSet.add(10, 'user1');
    await sortedSet.add(1, 'user2');
    await sortedSet.add(20, 'user3');
    await sortedSet.add(15, 'user4');

    console.log(await sortedSet.peek())

    console.log('Removed: ', await sortedSet.popHead())

    console.log(await sortedSet.peek())

}

export class SortedSet {
    constructor(private readonly redis: Redis, private readonly namespace: string) {
        this.redis.defineCommand('popHead', {
            numberOfKeys: 0,
            lua: [
                `local eles = redis.call('zrevrange', '${this.namespace}', 0, 0)`,
                `redis.call('zrem', '${this.namespace}', eles[1])`,
                `return eles[1]`
            ].join('\n')
        })
    }

    add(score: number, member: string) {
        return this.redis.zadd(this.namespace, score, member);
    }

    async peek() {
        const eles = await this.redis.zrevrange(this.namespace, 0, 0);

        return eles?.[0];
    }

    async popHead(): Promise<string> {
        return (this.redis as any).popHead()
    }
}

main();