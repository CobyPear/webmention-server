import Queue from 'bull';
import { parse } from 'node-html-parser';
import sanitize from 'sanitize-html';
import { prisma } from '../prisma/index';
import { USER_AGENT } from './constants';

const redisHost = process.env.REDIS_URL;

if (!redisHost) {
	throw new Error('No REDIS_URL defined');
}

export const webMentionQueue = new Queue('webmention processing', redisHost, {
	defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
});
webMentionQueue.setMaxListeners(1000);

webMentionQueue.process(async (job, done) => {
	const { target, source } = job.data;

	let sourceDOM;
	let rawHTML;
	try {
		const sourceRes = await fetch(source, {
			headers: {
				'User-Agent': `${USER_AGENT} Webmentions`,
			},
		});
		rawHTML = await sourceRes.text();
		sourceDOM = parse(rawHTML);
	} catch (error) {
		console.error(error);
		return done(new Error('source URL not found'));
	}

	if (sourceDOM) {
		// 3.2.2
		const regex = new RegExp(target);
		const targetInSource = regex.test(rawHTML);
		if (targetInSource) {
			// store the source to be able to fetch later
			const hEntry = sourceDOM.querySelectorAll('.h-entry');
			// save html to the DB
			const cleanedAndValidHtml = hEntry.map((e) => {
				const cleanHTML = sanitize(e.toString(), {
					allowedAttributes: {
						'*': ['class', 'href'],
					},
					// generously allow microformats classes
					// see http://microformats.org/wiki/microformats2#Converters
					allowedClasses: {
						'*': ['h-*', 'e-*', 'u-*', 'p-*', 'dt-*'],
					},
				});
				return cleanHTML;
			});
			try {
				const result = await prisma.hTML.upsert({
					where: {
						source,
					},
					update: {
						markup: [...cleanedAndValidHtml],
						target,
					},
					create: {
						source,
						target,
						markup: [...cleanedAndValidHtml],
					},
				});
				return done(null, `Webmention processed and saved at ${result.id}`);
			} catch (error) {
				console.error(error);
				if (error instanceof Error) {
					return done(error);
				}
			}
		} else {
			console.log('source URL does not contain a link to the target URL');
			return done();
		}
	}
});

webMentionQueue.on('error', (error) => {
	console.error('job failed with error: ', error);
});
webMentionQueue.on('progress', (job) => {
	console.log(job.progress());
});

webMentionQueue.on('completed', (job, result) => {
	console.log(`job ${job.id} completed with result:`);
});

export const webMentionGetter = new Queue('webmention getter', redisHost, {
	defaultJobOptions: { removeOnFail: true, removeOnComplete: true },
});

webMentionGetter.process(async (job, done) => {
	const { target } = job.data;
	try {
		const html = await prisma.hTML.findMany({
			where: {
				target,
			},
			select: {
				markup: true,
			},
		});
		return done(null, html.map(({ markup }) => markup).join('\n'));
	} catch (error) {
		if (error instanceof Error) {
			return done(error);
		}
	}
});

webMentionGetter.on('error', (error) => {
	console.error('webmentionGetter failed with error: ', error);
});

webMentionGetter.on('completed', (job) => {
	console.log(`webmentionGetter completed ${job.id} successfully`);
});
