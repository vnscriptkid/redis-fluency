import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    let valuesList = await client.sort(itemsByViewsKey(), {
        DIRECTION: order,
        LIMIT: {
            offset,
            count
        },
        BY: 'nosort',
        GET: [
            '#',
            `${itemsKey('*')}->name`,
            `${itemsKey('*')}->views`,
            `${itemsKey('*')}->endingAt`,
            `${itemsKey('*')}->imageUrl`,
            `${itemsKey('*')}->price`,
        ]
    })

    const results: any[] = [];

    while (Array.isArray(valuesList) && valuesList.length) {
        const [id, name, views, endingAt, imageUrl, price, ...rest] = valuesList;

        const item = deserialize(id, {
            name,
            views,
            endingAt,
            imageUrl,
            price
        })

        results.push(item)

        valuesList = rest;
    }

    return results;
};
