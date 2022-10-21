import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const financeTxn = new FinanceTransaction(redis);

    await financeTxn.deposite('user1', 100);
    await financeTxn.deposite('user2', 100);

    console.log(await financeTxn.getBalance('user1'), await financeTxn.getBalance('user2'))

    // await financeTxn.transfer('user1', 'user2', 120);
    // await financeTxn.transfer('user3', 'user2', 20);

    await financeTxn.transfer('user1', 'user2', 40);
    console.log(await financeTxn.getBalance('user1'), await financeTxn.getBalance('user2'))
}

class FinanceTransaction {
    constructor(private readonly redis: Redis) { }

    async transfer(srcUserId: string, destUserId: string, amount: number) {
        const srcAcc = this._buildAccountKey(srcUserId);
        const destAcc = this._buildAccountKey(destUserId);

        let srcAccBalance = await this.redis.get(srcAcc) // <<<<<<<<<< GET X

        if (!srcAccBalance) {
            throw new Error(`Source account not found`)
        }

        const multi = this.redis.multi();

        // Possible RACE condition
        // May use WATCH to mitigate
        multi.decrby(srcAcc, amount); // <<<<<<<<<< SET X
        multi.incrby(destAcc, amount);

        if (amount > parseFloat(srcAccBalance)) {
            multi.discard();
            throw new Error(`Source account balance is insufficient`)
        }

        return await multi.exec();
    }

    deposite(userId: string, amount: number) {
        return this.redis.incrby(this._buildAccountKey(userId), amount);
    }

    async getBalance(userId: string) {
        const balance = await this.redis.get(this._buildAccountKey(userId))

        if (!balance) {
            throw new Error(`Account not found`)
        }

        return parseFloat(balance);
    }

    private _buildAccountKey(userId: string) {
        return `accounts:${userId}`;
    }
}

main();