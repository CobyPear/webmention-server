import { Router } from 'express';

import { webmentions as webmentionsController } from './webmentions';
import { validate } from '../middleware/validate';
const router = Router();

//router.route('/webmentions/:source/*').get(webmentionsController.get);
router
	.route('/webmentions')
	.get(webmentionsController.get)
	.post(validate, webmentionsController.post);

export const routes = router;
