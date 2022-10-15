import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const leaderboard = new LeaderboardSystem(redis, 'leaders');

    await leaderboard.addUser('userx', 5);
    await leaderboard.addUser('usery', 10);
    await leaderboard.addUser('userz', 2);
    await leaderboard.addUser('usert', 6);
    await leaderboard.addUser('userm', 7);
    await leaderboard.addUser('usern', 1);
    await leaderboard.addUser('userp', 8);

    console.log(await leaderboard.getUserDetails('usery'))
    // console.log(await leaderboard.getUserDetails('userm'))
    console.log(await leaderboard.getTopUsers(2))
    console.log(await leaderboard.getUsersAroundUser('userm', 3))
    console.log(await leaderboard.getUsersAroundUser('userm', 4))
    console.log(await leaderboard.getUsersAroundUser('userm', 5))

}


export class LeaderboardSystem {
    constructor(
        public readonly redis: Redis,
        public readonly key: string
    ) { }

    /**
     * Add user with score to sorted set
     * Returns num of effected members
     */
    async addUser(userId: string, score: number): Promise<number> {
        return this.redis.zadd(this.leaderboardKey, score, userId);
    }

    async removeUser(userId: string): Promise<number> {
        return this.redis.zrem(this.leaderboardKey, userId);
    }

    async getUserDetails(userId: string): Promise<{ score: number, rank: number, userId: string }> {
        const score = await this.redis.zscore(this.leaderboardKey, userId)

        if (score === null || score === undefined) {
            throw new Error('User not found')
        }

        const rank = await this.redis.zrevrank(this.leaderboardKey, userId);

        if (rank === null || rank === undefined) {
            throw new Error('unreachable code');
        }

        return {
            userId,
            score: Number(score),
            rank: rank + 1
        }
    }
    async getTopUsers(topx: number): Promise<{ userId: string, score: number }[]> {
        const usersWithScores = await this.redis.zrevrange(this.leaderboardKey, 0, topx - 1, 'WITHSCORES')

        const results: { userId: string, score: number }[] = [];

        for (let i = 0; i < usersWithScores.length; i += 2) {
            const [userId, score] = [usersWithScores[i], usersWithScores[i + 1]]

            results.push({ userId, score: Number(score) })
        }

        return results;
    }

    async getUsersAroundUser(userid: string, numOfUsers: number): Promise<string[]> {
        const curRank = await this.redis.zrevrank(this.leaderboardKey, userid);

        if (curRank === null || curRank === undefined) {
            throw new Error('User not found');
        }

        const half = Math.floor(numOfUsers / 2)

        const startIdx = Math.max(0, curRank - half);
        const endIdx = startIdx + numOfUsers - 1;
        // case 1: k = 5 => Math.floor(5 / 2) === 2
        // case 2: k = 4 => Math.floor(4 / 2) === 2

        //        2
        // 1 2 3 (4) 5 6

        return this.redis.zrevrange(this.leaderboardKey, startIdx, endIdx);
    }

    get leaderboardKey(): string {
        return this.key;
    }
}

main();