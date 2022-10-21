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
    constructor(private readonly redis: Redis, private readonly namespace: string) { }

    add(score: number, member: string) {
        return this.redis.zadd(this.namespace, score, member);
    }

    async peek() {
        const eles = await this.redis.zrevrange(this.namespace, 0, 0);

        return eles?.[0];
    }

    async popHead(): Promise<string> {
        try {
            const watched = await this.redis.watch(this.namespace);

            if (watched !== 'OK') {
                throw new Error(`Failed to watch ${this.namespace}`)
            }

            const multi = this.redis.multi();

            const eles = await this.redis.zrevrange(this.namespace, 0, 0);

            if (eles.length === 0) {
                throw new Error(`Empty sorted set`);
            }

            const memberToPop = eles[0];

            const txnResult = await multi.zrem(this.namespace, memberToPop)
                .exec()

            if (!txnResult || txnResult.length === 0) {
                throw new Error(`Failed to pop head`)
            }

            if (txnResult[0][1]) {
                return memberToPop;
            }

            // retry
            console.info(`[popHead] retrying...`)
            return this.popHead();
        } finally {
            await this.redis.unwatch();
        }

    }
}

main();