import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const uniqueVisitCounter = new UniqueVisitsCounter(redis);

    await uniqueVisitCounter.markUserVisit('2012-09-21T0', 'user1', 'user2', 'user3', 'user4')
    await uniqueVisitCounter.markUserVisit('2012-09-21T3', 'user4', 'user5', 'user6', 'user7')
    await uniqueVisitCounter.markUserVisit('2012-09-21T4', 'user6', 'user7', 'user8', 'user9')

    const zeroToOneVisits = await uniqueVisitCounter.countVisits('2012-09-21T0')
    const threeToFourVisits = await uniqueVisitCounter.countVisits('2012-09-21T3')
    const fourToFiveVisits = await uniqueVisitCounter.countVisits('2012-09-21T4')

    console.log({ zeroToOneVisits, threeToFourVisits, fourToFiveVisits })

    await uniqueVisitCounter.aggregateDateVisits('2012-09-21')

    const wholeDayVisits = await uniqueVisitCounter.countVisits('2012-09-21')

    console.log({ wholeDayVisits })
}

class UniqueVisitsCounter {
    constructor(public readonly redis: Redis) { }

    public markUserVisit(dateTime: string, ...userIds: string[]) {
        return this.redis.pfadd(this._buildKey(dateTime), ...userIds)
    }

    /**
     * Combine all hours during the day: 2012-09-21T0 -> 2012-09-21T23
     * Store in `2012-09-21`
     */
    public aggregateDateVisits(date: string) {
        const sourceKeys: string[] = [];

        for (let hour = 0; hour <= 23; hour++) {
            sourceKeys.push(this._buildKey(`${date}T${hour}`))
        }

        return this.redis.pfmerge(this._buildKey(date), ...sourceKeys);
    }

    public countVisits(dateTime: string) {
        return this.redis.pfcount(this._buildKey(dateTime));
    }

    /**
     * @arguments date: 2012-09-21T1 (1-2h) | 2012-09-21 (whole day)
     */
    private _buildKey(dateTime: string) {
        return `visits:${dateTime}`;
    }
}

main();

