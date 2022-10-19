import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

}

type GranularityLevel = '1sec' | '1min' | '1hour' | '1day';
type Granularity = { name: string, ttl: number | null, duration: number }

class Timeseries {
    // utils prop that maps from duration to number of seconds
    mapToSecs: Record<'second' | 'minute' | 'hour' | 'day', number>;

    // define for each granularity level: name, ttl (expire after seconds), duration (how long in secs)
    granularities: Record<GranularityLevel, Granularity>;

    constructor(public readonly redis: Redis, public readonly namespace: string) {
        this.mapToSecs = {
            second: 1,
            minute: 60,
            hour: 60 * 60,
            day: 24 * 60 * 60
        }
        this.granularities = {
            '1sec': { name: '1sec', ttl: this.mapToSecs['hour'] * 2, duration: this.mapToSecs['second'] },
            '1min': { name: '1min', ttl: this.mapToSecs['day'] * 7, duration: this.mapToSecs['minute'] },
            '1hour': { name: '1hour', ttl: this.mapToSecs['day'] * 60, duration: this.mapToSecs['hour'] },
            '1day': { name: '1day', ttl: null, duration: this.mapToSecs['day'] },
        }
    }

    /**
     * Increment value of data points by 1 in which timestamp value is contained
     * @param timestamp unix timestamp seconds since 1970-01-01
     * For each timestamp X, update data point at 4 levels of granularities
     * - `events:1sec:X`
     * - `events:1min:3660`
     * - `events:1hour:3600`
     * - `events:1day:0`
     * 
     * 1970-01-01T00:00:00[                                             (X)                                                                        ] -> future
     *                    {  min  }{  min  }........{  min  }{  min  }{  min  }........{  min  }
     *                    {              hour               }{              hour               }....{              hour               }
     *                    {                                                 day                                                       }
     *                                                              
     */
    public async insert(unixTimestamp: number) {
        for (let granularityName in this.granularities) {
            const granularity = this.granularities[granularityName as GranularityLevel]

            const key: string = this._buildKey(granularity, unixTimestamp)

            await this.redis.incr(key)

            if (granularity.ttl) {
                await this.redis.expire(key, granularity.ttl)
            }
        }
    }

    private _buildKey(granularity: Granularity, unixTimestamp: number): string {
        const roundedTimestamp = this._getRoundedTimestamp(unixTimestamp, granularity.duration);

        return [this.namespace, granularity.name, roundedTimestamp].join(':');
    }

    public async fetch(
        granularityLevel: GranularityLevel,
        beginTimestamp: number,
        endTimestamp: number,
        consume: (glanularityName: string, results: any) => void
    ) {
        const granularity = this.granularities[granularityLevel];

        const start = this._getRoundedTimestamp(beginTimestamp, granularity.duration);
        const end = this._getRoundedTimestamp(endTimestamp, granularity.duration);

        const keys: string[] = [];
        for (let ts = start; ts <= end; ts += granularity.duration) {
            keys.push(this._buildKey(granularity, ts))
        }

        const replies = await this.redis.mget(...keys);

        const results = replies.map((reply, i) => ({ timestamp: beginTimestamp + i * granularity.duration, value: parseInt(reply as any, 10) || 0 }))

        consume(granularity.name, results);
    }

    private _getRoundedTimestamp(unixTimestamp: number, precision: number): number {
        return Math.floor(unixTimestamp / precision) * precision;
    }
}

main();

