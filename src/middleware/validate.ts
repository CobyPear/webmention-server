import type { Request, Response, NextFunction } from 'express';
import { parse } from 'node-html-parser';
import { USER_AGENT } from '../utils/constants';

export const validate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.accepts('html', 'x-www-form-urlencoded')) {
		res.status(406);
	}
	const { target, source } = req.body;
	if (!target || !source) {
		return res.status(400).json({ message: 'Missing target or source' });
	} else if (target === source) {
		return res
			.status(400)
			.json({ message: 'Target and source can not be the same' });
	}

	// 3.2.1 check if target is valid webmention post
	let targetDOM;
	try {
		const targetRes = await fetch(target, {
			headers: { 'User-Agent': `${USER_AGENT} Webmention` },
		});
		targetDOM = parse(await targetRes.text());
	} catch (error) {
		console.error(error);
		return res.status(400).json({ message: 'Specified target URL not found' });
	}
	const validRel = targetDOM.querySelector('[rel=webmention]');
	const validPermalink = validRel?.attributes.href;
	console.log('validPermalink', validPermalink);
	if (!validPermalink) {
		return res
			.status(400)
			.json({ message: 'Specified target does not accept web mentions' });
	}

	// console.log("validated webmention URL", validPermalink);
	// TODO: use some sort of queue to process the request
	res.status(202).json({ message: 'Accepted' });
	next();
};
