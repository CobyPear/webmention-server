import type { Request, Response } from 'express';
import { webMentionQueue, webMentionGetter } from '../utils/queue';

export const webmentions = {
	post: async (req: Request, res: Response) => {
		const { target, source } = req.body;
		await webMentionQueue.add({ target, source });

		return res.end();
	},
	get: async (req: Request, res: Response) => {
		const encodedTarget = req.query.target;
		if (typeof encodedTarget !== 'string') {
			return res
				.status(400)
				.json({ message: 'source query param is required' });
		}
		const target = Buffer.from(encodedTarget, 'base64').toString();
		if (!target) {
			res.status(400).send('Provided target could not be decoded');
		}
		try {
			const job = await webMentionGetter.add({ target });
			const result = await job.finished();
			res.status(200).send(result);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: error });
		}
	},
};
