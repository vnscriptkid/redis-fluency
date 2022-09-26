import type { CreateItemAttrs } from '$services/types';

export const serialize = (attrs: CreateItemAttrs) => {
    return {
        name: attrs.name,
        description: attrs.description,
        createdAt: attrs.createdAt.toMillis(),
        endingAt: attrs.endingAt.toMillis(),
        likes: attrs.likes,
        views: attrs.views,
        bids: attrs.bids,
        highestBidUserId: attrs.highestBidUserId,
        imageUrl: attrs.imageUrl,
        ownerId: attrs.ownerId,
        price: attrs.price,
        status: attrs.status,
    }
};
