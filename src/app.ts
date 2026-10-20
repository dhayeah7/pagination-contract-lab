import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { productsRouter } from './routes/products';

export const app = express();

app.disable('x-powered-by');
app.set('query parser', 'simple');

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' },
  });
});

app.use(errorHandler);
