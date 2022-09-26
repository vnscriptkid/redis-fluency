import { itemsByPriceKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const itemsByPrice = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    // sortedset: items:price
    // { value: item3, score: 5 }
    // { value: item1, score: 10 }
    // { value: item2, score: 12 }

    let valuesList = await client.sort(itemsByPriceKey(), {
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
