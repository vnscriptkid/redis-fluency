import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const dealTrackingSystem = new DealTrackingSystem(redis);

    const sendDeal = async (dealId: string, userId: string) => {
        console.log(`[sendDeal] sending deal ${dealId} to user ${userId}`)
        return Promise.resolve();
    }

    await dealTrackingSystem.sendDealIfNotSent('1', 'x', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('1', 'y', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('1', 'z', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('1', 'z', sendDeal) // duplicate

    await dealTrackingSystem.sendDealIfNotSent('2', 'y', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('2', 'z', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('2', 't', sendDeal)

    await dealTrackingSystem.sendDealIfNotSent('3', 'z', sendDeal)
    await dealTrackingSystem.sendDealIfNotSent('3', 'k', sendDeal)

    console.log('===== users received deals (1,2,3)')
    console.log(String(await dealTrackingSystem.showUsersThatReceivedAllDeals(['1', '2', '3'])))
    console.log('===== users received at least one deal amongst (1,2,3)')
    console.log(String(await dealTrackingSystem.showUsersThatReceivedAtLeastOneDeal(['1', '2', '3'])))
}

type HowToSend = (dealId: string, userId: string) => Promise<void>;

export class DealTrackingSystem {
    /**
     * IDEA: each deal uses a Set to store all users to which the deal has been sent
     * key: `deal:123`
     * value { user:1, user:5, user:7 }
     */

    constructor(public readonly redis: Redis) { }

    public async markAsSent(dealId: string, userId: string): Promise<void> {
        const key = this._buildSetKey(dealId);

        await this.redis.sadd(key, userId);
    }

    public async sendDealIfNotSent(dealId: string, userId: string, howToSend: HowToSend): Promise<void> {
        const key = this._buildSetKey(dealId);

        if (await this.redis.sismember(key, userId)) { ///////////// GET
            // if already exists in set, do not send again
            console.error(`[sendDealIfNotSent] already sent. stop!!!`)
            return;
        }

        await howToSend(dealId, userId)
        await this.markAsSent(dealId, userId); /////////////// SET => potential concurrency issue 
        console.info(`[sendDealIfNotSent] done sending deal ${dealId} to user ${userId}`)
    }

    public async showUsersThatReceivedAllDeals(dealIds: string[]): Promise<string[]> {
        /*
            deal:1 { x, y, (z)       }
            deal:2 {    y, (z), t    }
            deal:3 {       (z),    k }
        */

        return this.redis.sinter(dealIds.map(this._buildSetKey))
    }

    public async showUsersThatReceivedAtLeastOneDeal(dealIds: string[]): Promise<string[]> {
        /*
            deal:1 { x, y, z       }
            deal:2 {    y, z, t    }
            deal:3 {       z,    k }
            => {x,y,z,t,k}
        */

        return this.redis.sunion(dealIds.map(this._buildSetKey));
    }

    private _buildSetKey(dealId: string): string {
        return `deals:${dealId}`;
    }
}

main();