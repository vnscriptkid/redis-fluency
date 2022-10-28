import Redis from 'ioredis';

async function main() {


    const redis = new Redis();
    await redis.flushall();

    const shoppingCart = new ShoppingCart(redis);

    await shoppingCart.saveItem('user-1', 'item-x', 1)
    await shoppingCart.saveItem('user-1', 'item-y', 2)
    await shoppingCart.saveItem('user-1', 'item-z', 3)
    await shoppingCart.saveItem('user-2', 'item-x', 3)

    console.log(await shoppingCart.getCartItems('user-1'))

}

class ShoppingCart {
    constructor(public readonly redis: Redis) { }

    /**
     * save (item:quantity) pair to user's cart
     */
    saveItem(userId: string, itemId: string, quantity: number) {
        const cartKey = this._buildCartKey(userId);

        if (quantity <= 0) {
            return this.redis.hdel(cartKey, itemId);
        }

        return this.redis.hset(cartKey, itemId, quantity);
    }

    /**
     * get all items in user's cart
     */
    async getCartItems(userId: string) {
        const cartKey = this._buildCartKey(userId);

        const cart = await this.redis.hgetall(cartKey)

        return cart;
    }

    _buildCartKey(userId: string) {
        return `cart:${userId}`
    }

}

main();

