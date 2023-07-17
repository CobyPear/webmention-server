import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { routes } from './routes';
import { morganMiddleware } from './utils/logger';

dotenv.config();
const app = express();

const port = process.env.PORT || 8000;
const host = process.env.HOST || 'localhost';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(morganMiddleware);

app.use('/api', routes);
app.use('*', (req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
	console.log(`🌎 Server listening at http://${host}:${port}`);
});

export default app;
