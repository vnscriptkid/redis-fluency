import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const votingSystem = new VotingSystem(redis);

    await votingSystem.storeArticle({
        id: '123',
        content: 'hello',
        title: 'welcome'
    })

    votingSystem.upvote('123');
    votingSystem.upvote('123');
    votingSystem.upvote('123');
    votingSystem.downvote('123');

    console.log(await votingSystem.getArticleDetails('123'))
}

class VotingSystem {
    constructor(public readonly redis: Redis) { }

    /**
     * VOTING
     */
    upvote(articleId: string) {
        const key = this._buildHashKey(articleId)

        return this.redis.hincrby(key, 'score', +1);
    }

    downvote(articleId: string) {
        const key = this._buildHashKey(articleId);

        return this.redis.hincrby(key, 'score', -1);
    }

    /**
     * HASH 
     */

    async getArticleDetails(articleId: string) {
        // await this.redis.hgetall(this._buildHashKey(articleId))
        const [id, title, content, score] = await this.redis.hmget(this._buildHashKey(articleId), ...[
            'id',
            'title',
            'content',
            'score'
        ])

        return this._deserialize({
            id, title, content, score
        })
    }

    async storeArticle(args: { id: string, title: string, content: string }) {
        const { id, title, content } = args;

        this.redis.hset(this._buildHashKey(id), this._serialized({ id, title, content, score: 0 }))
    }

    /**
     * DE/SERIALIZED
     */
    private _serialized(args: { id: string; title: string; content: string; score: number; }): any {
        const { id, title, content, score } = args;

        return {
            id,
            title,
            content,
            score
        }
    }

    private _deserialize(args: { id: string | null; title: string | null; content: string | null; score: string | null; }) {
        const { id, title, content, score } = args;

        return {
            id,
            title,
            content,
            score: score !== null ? parseInt(score) : null
        }
    }

    /**
     * KEY BUILDING
     */
    private _buildHashKey(articleId: string): any {
        return `articles:${articleId}`;
    }
}

main();