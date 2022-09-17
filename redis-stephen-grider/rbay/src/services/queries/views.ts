import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {

    await Promise.all([
        client.zIncrBy(itemsByViewsKey(), 1, itemId),
        client.hIncrBy(itemsKey(itemId), 'views', 1)
    ])
};
