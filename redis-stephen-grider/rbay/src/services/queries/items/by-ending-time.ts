import { itemsByEndingAtKey } from "$services/keys";
import { client } from "$services/redis";
import { getItem, getItems } from "./items";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	const itemIds = await client.zRange(itemsByEndingAtKey(), Date.now(), '+inf', {
		LIMIT: {
			offset,
			count
		},
		BY: 'SCORE'
	})

	const items = await getItems(itemIds);

	return items;
};
