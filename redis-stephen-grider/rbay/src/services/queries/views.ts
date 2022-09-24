import { itemsByViewsKey, itemsKey, itemsViewsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {

    const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);

    if (!inserted) {
        console.log(`[incrementView] user ${userId} has probably seen item ${itemId}`)
        return;
    }

    await Promise.all([
        client.zIncrBy(itemsByViewsKey(), 1, itemId),
        client.hIncrBy(itemsKey(itemId), 'views', 1)
    ])
};
