import { itemsKey, userLikesKey, usersKey } from "$services/keys";
import { client } from "$services/redis";
import { getItem, getItems } from "./items";

export const userLikesItem = async (itemId: string, userId: string): Promise<boolean> => {
    return await client.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
    const itemIds = await client.sMembers(userLikesKey(userId));

    return getItems(itemIds);
};

export const likeItem = async (itemId: string, userId: string) => {
    const inserted = await client.sAdd(userLikesKey(userId), itemId);

    if (inserted) {
        await client.hIncrBy(itemsKey(itemId), 'likes', 1)
    }
};

export const unlikeItem = async (itemId: string, userId: string) => {
    const removed = await client.sRem(userLikesKey(userId), itemId);

    if (removed) {
        await client.hIncrBy(itemsKey(itemId), 'likes', -1);
    }
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
    const set1Key = userLikesKey(userOneId);
    const set2Key = userLikesKey(userTwoId);

    const itemIds = await client.sInter([set1Key, set2Key]);

    return getItems(itemIds);
};
