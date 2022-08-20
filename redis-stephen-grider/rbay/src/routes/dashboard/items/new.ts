import type { RequestHandler } from '@sveltejs/kit';
import { createItem } from '$services/queries/items/items';
import { DateTime } from 'luxon';

export const post: RequestHandler = async ({ request, locals }) => {
	const data = await request.json();
	const id = await createItem({
		...data,
		createdAt: DateTime.now(),
		endingAt: DateTime.now().plus({ seconds: data.duration })
	}, locals.session.userId);

	return {
		status: 200,
		body: {
			id
		}
	};
};
