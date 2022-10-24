import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();
}

class VotingSystem {
    constructor(public readonly redis: Redis) { }
    upvote(userId: string, articleId: string) { }

    downvote(userId: string, articleId: string) { }

    getArticle(articleId: string) { }

    storeArticle(props: any) { }

    /**
     * Get top x articles ordered by (votes | createdAt) in desc order
     */
    getTopArticles(page = 1, limit = 10, order = 'votes:') { }


    /**
     * Add and remove article into/from groups
     */
    addRemoveGroups(articleId: string, toAdd: string[] = [], toRemove: string[] = []) { }

    /**
     * groups: fun | serious
     */
    getGroupArticles(group: string, page: number = 1, order = 'votes:') { }
}

main();