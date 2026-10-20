import { Router } from 'express';
import { products } from '../data/products';
import { paginationSchema } from '../schemas/pagination';
import { paginate } from '../utils/pagination';

export const productsRouter = Router();

productsRouter.get('/', (request, response) => {
  const query = paginationSchema.parse(request.query);
  response.json(paginate(products, query));
});
