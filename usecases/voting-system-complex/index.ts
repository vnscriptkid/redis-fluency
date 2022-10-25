import crypto from 'crypto';
import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const votingSystem = new VotingSystem(redis);

    await votingSystem.storeArticle({
        id: 'article-x',
        title: 'x title',
        content: 'x content',
        authorId: 'user-1',
        createdAt: Date.now() - 3600 * 1000 // 1 hour ago
    })

    await votingSystem.storeArticle({
        id: 'article-y',
        title: 'y title',
        content: 'y content',
        authorId: 'user-2',
        createdAt: Date.now() - 3600 * 2 * 1000 // 2 hours ago
    })

    await votingSystem.storeArticle({
        id: 'article-z',
        title: 'z title',
        content: 'z content',
        authorId: 'user-3',
        createdAt: Date.now()
    })

    console.log(await votingSystem.getArticle('article-x'))
    console.log(await votingSystem.getArticle('article-y'))
    console.log(await votingSystem.getArticle('article-z'))

    // 3 votes for article-x
    await votingSystem.upvote('user-2', 'article-x')
    await votingSystem.upvote('user-2', 'article-x')
    await votingSystem.upvote('user-1', 'article-x')
    await votingSystem.upvote('user-3', 'article-x')

    // 2 votes for article-y
    await votingSystem.upvote('user-1', 'article-y')
    await votingSystem.upvote('user-2', 'article-y')

    console.log(await votingSystem.getArticle('article-x'))
    console.log(await votingSystem.getArticle('article-y'))


    console.log(await votingSystem.getTopArticles(1, 2))
    console.log(await votingSystem.getTopArticles(3, 1, 'articles:by:createdAt'))

}

class VotingSystem {
    constructor(public readonly redis: Redis) { }
    async upvote(userId: string, articleId: string) {
        // if user has voted this article
        if (await this.redis.sismember(this._buildVotesPerArticleKey(articleId), userId)) {
            console.error(`[upvote] User "${userId}" already upvoted article "${articleId}"`)
            return;
        }

        // incr votes by one in hash
        await this.redis.hincrby(this._buildArticleKey(articleId), 'votes', 1)
        // incr votes by one in sortedset
        await this.redis.zincrby(this._buildArticlesByVotesKey(), 1, articleId);

        // put to set to mark as voted
        await this.redis.sadd(this._buildVotesPerArticleKey(articleId), userId)
    }


    downvote(userId: string, articleId: string) { }

    async getArticle(articleId: string) {
        const keyvalues = await this.redis.hgetall(this._buildArticleKey(articleId))

        return {
            ...keyvalues,
            createdAt: new Date(parseInt(keyvalues?.createdAt))
        }
    }

    async storeArticle(props: { id: string, title: string, content: string, authorId: string, createdAt: number }) {
        await this.redis.hset(
            this._buildArticleKey(props.id),
            {
                id: props.id,
                title: props.title,
                content: props.content,
                authorId: props.authorId,
                createdAt: props.createdAt,
                votes: 0
            }
        )

        await this.redis.zadd(this._buildArticlesByVotesKey(), 0, props.id);
        await this.redis.zadd(this._buildArticlesByCreatedAtKey(), props.createdAt, props.id);
    }


    /**
     * Get top x articles ordered by (votes | createdAt) in desc order
     */
    async getTopArticles(page = 1, limit = 10, order = this._buildArticlesByVotesKey()) {
        // page 1: { start: 0, stop: 9 }
        // page 2: { start: 10, stop: 19 }
        // ...
        // page x: { start: limit * (page - 1), stop: start + limit - 1 }

        const startIdx = limit * (page - 1);
        const stopIdx = startIdx + limit - 1;

        const results = await this.redis.zrevrange(order, startIdx, stopIdx, 'WITHSCORES')

        const scoreKey = order.includes('votes') ? 'votes' : 'createdAt';
        const topArticles: { articleId: string, votes?: number, createdAt?: number }[] = [];

        for (let i = 0; i < results.length; i += 2) {
            const [articleId, score] = [results[i], results[i + 1]]

            topArticles.push({
                articleId,
                [scoreKey]: parseInt(score)
            })
        }

        return topArticles;
    }


    /**
     * Add and remove article into/from groups
     */
    addRemoveGroups(articleId: string, toAdd: string[] = [], toRemove: string[] = []) { }

    /**
     * groups: fun | serious
     */
    getGroupArticles(group: string, page: number = 1, order = this._buildArticlesByVotesKey()) { }

    private _buildVotesPerArticleKey(articleId: string): string {
        return `articles:${articleId}:votes`
    }

    private _buildArticleKey(id: string): string {
        return `articles:${id}`
    }

    private _buildArticlesByVotesKey() {
        return `articles:by:votes`
    }

    private _buildArticlesByCreatedAtKey() {
        return `articles:by:createdAt`
    }
}

main();