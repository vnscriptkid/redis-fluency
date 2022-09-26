import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserialize = (id: string, item: { [key: string]: string }): Item => {
    return {
        id,
        name: item.name,
        description: item.description,
        createdAt: DateTime.fromMillis(Number(item.createdAt)),
        endingAt: DateTime.fromMillis(Number(item.endingAt)),
        ownerId: item.ownerId,
        imageUrl: item.imageUrl,
        views: Number(item.views),
        likes: Number(item.likes),
        price: Number(item.price),
        bids: Number(item.bids),
        highestBidUserId: item.highestBidUserId,
    } as any
};
