import { itemsByEndingAtKey, itemsByPriceKey, itemsByViewsKey, itemsKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { deserialize } from './deserialize';
import { serialize } from './serialize';

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));

    if (Object.keys(item).length === 0) {
        return null;
    }

    return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map(id => client.hGetAll(itemsKey(id)));

    const items = await Promise.all(commands);

    return items.map((x, i) => {
        if (Object.keys(x).length === 0) {
            return null;
        }
        return deserialize(ids[i], x);
    })
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    const itemId = genId();

    await Promise.all([
        client.hSet(itemsKey(itemId), serialize(attrs)),
        client.zAdd(itemsByViewsKey(), {
            value: itemId,
            score: 0
        }),
        client.zAdd(itemsByEndingAtKey(), {
            value: itemId,
            score: attrs.endingAt.toMillis()
        }),
        client.zAdd(itemsByPriceKey(), {
            value: itemId,
            score: 0
        })
    ])

    return itemId;
};
