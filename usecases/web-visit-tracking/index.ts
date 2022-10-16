import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const webVisitTracking = new WebVisitTracking(redis);

    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '0'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '1'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '1'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '2'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '3'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '4'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '5'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '6'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '10'))
    console.log(await webVisitTracking.markDayVisitForUser('2022-09-21', '11'))

    console.log('===== Count day visit')
    console.log(await webVisitTracking.countDayVisits('2022-09-21'))

    console.log('===== List all users who has visited on a given day')
    console.log(await webVisitTracking.listVisitsOnDate('2022-09-21'))
}

class WebVisitTracking {
    constructor(public readonly redis: Redis) { }

    /**
     * Store user at offset `userId`
     * @returns original value at offset
     */
    async markDayVisitForUser(dateISO: string, userId: string): Promise<any> {
        return this.redis.setbit(this._buildKey(dateISO), userId, 1)
    }

    async countDayVisits(dateISO: string): Promise<number> {
        return this.redis.bitcount(this._buildKey(dateISO));
    }

    async listVisitsOnDate(dateISO: string): Promise<string[]> {
        const value = await this.redis.getBuffer(this._buildKey(dateISO))

        if (!value) return [];

        const listOfUserIds: string[] = [];

        for (let [byteIdx, byte] of value.toJSON().data.entries()) {
            for (let i = 7; i >= 0; i--) {
                const curBit = byte >> i & 1;

                if (curBit === 1) {
                    const bitOffset = byteIdx * 8 + (7 - i);

                    listOfUserIds.push(String(bitOffset));
                }
            }
        }

        return listOfUserIds;
    }

    /**
     * Key building given date
     */
    private _buildKey(dateISO: string): any {
        return `dayvisit:${dateISO}`;
    }
}

main();

