import { bidHistoryKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
	const item = await getItem(attrs.itemId);

	if (!item) {
		throw new Error('ItemNotFound')
	}

	if (attrs.amount <= item.price) {
		throw new Error('BidPriceMustBeGreaterThanItemPrice')
	}

	if (Date.now() >= item.endingAt.toMillis()) {
		throw new Error('ItemHasBeenExpired')
	}

	const valueForList = serialize(attrs.amount, attrs.createdAt);

	await client.rPush(bidHistoryKey(attrs.itemId), valueForList);
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIdx = -offset - count;
	const endIdx = -1 - offset;
	const range = await client.lRange(bidHistoryKey(itemId), startIdx, endIdx);

	return range.map(deserialize);
};

export function serialize(amount: number, createdAt: DateTime) {
	return `${amount}:${createdAt.toMillis()}`;
}

export function deserialize(str: string): Bid {
	const [amount, createdAt] = str.split(':')

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	}
}