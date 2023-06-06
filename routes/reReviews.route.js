import express from 'express';
import { CREATE, DELETE, GETALL, SEARCH, UPDATE } from '../controllers/reReviews.controller.js';

const routerReReviews = express.Router();

routerReReviews.get('/reviews', GETALL);
routerReReviews.patch('/reviews/:id', UPDATE);
routerReReviews.put('/reviews/:id', UPDATE);
routerReReviews.post('/reviews/search', SEARCH);
routerReReviews.post('/reviews', CREATE);
routerReReviews.delete('/reviews/:id', DELETE);

export default routerReReviews;