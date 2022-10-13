import Redis from 'ioredis';

async function test() {
    const redis = new Redis();

    const result1 = await redis.set("phone", "samsung");
    const result2 = await redis.get("phone");

    console.log({ result1, result2 }) // 'OK', 'samsung'
}

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const votingSystem = new VotingSystem(redis);

    await votingSystem.setHeader('123', 'hey there');
    await votingSystem.upvote('123'); // 1
    await votingSystem.upvote('123'); // 2
    await votingSystem.upvote('123'); // 3

    const info = await votingSystem.getArticleInfo('123')
    console.log({ info })

    await votingSystem.downvote('123'); // 3
    const infoNow = await votingSystem.getArticleInfo('123');
    console.log({ infoNow })
}

class VotingSystem {
    constructor(public readonly redis: Redis) { }

    /**
     * VOTING
     */
    upvote(articleId: string) {
        const key = this._buildVotesKey(articleId)

        return this.redis.incr(key);
    }

    downvote(articleId: string) {
        const key = this._buildVotesKey(articleId);

        return this.redis.decr(key);
    }

    async getvote(articleId: string): Promise<number | null> {
        const votes = await this.redis.get(articleId);

        if (votes === null) return null;

        return parseInt(votes);
    }

    /**
     * ARTICLE HEADER
     */
    setHeader(articleId: string, header: string) {
        return this.redis.set(this._buildHeadersKey(articleId), header)
    }

    getHeader(articleId: string) {
        return this.redis.get(this._buildHeadersKey(articleId));
    }

    /**
     * MIXED 
     */

    async getArticleInfo(articleId: string) {
        const [header, votes] = await this.redis.mget(
            this._buildHeadersKey(articleId),
            this._buildVotesKey(articleId)
        )

        return {
            header,
            votes: votes ? parseInt(votes) : 0
        }
    }

    /**
     * KEY BUILDING
     */
    private _buildHeadersKey(articleId: string): any {
        return `articles:${articleId}:header`;
    }

    private _buildVotesKey(articleId: string) {
        return `articles:${articleId}:votes`
    }
}

main();