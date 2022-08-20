import type { CreateItemAttrs } from '$services/types';

export const serialize = (attrs: CreateItemAttrs) => {
    console.log({ attrs })

    return {
        name: attrs.name,
        description: attrs.description,
        createdAt: attrs.createdAt.toMillis(),
        endingAt: attrs.endingAt.toMillis(),
        // bids: attrs.bids,
        // highestBidUserId: attrs.highestBidUserId,
        // imageUrl: attrs.imageUrl,
        // likes: attrs.likes,
        // ownerId: attrs.ownerId,
        // price: attrs.price,
        // status: attrs.status,
        // views: attrs.views,
    }
};
