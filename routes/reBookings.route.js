import express from 'express';
import { CREATE, DELETE, GETALL, SEARCH, UPDATE } from '../controllers/reBookings.controller.js';

const routerReBookings = express.Router();

routerReBookings.get('/bookings', GETALL);
routerReBookings.patch('/bookings/:id', UPDATE);
routerReBookings.put('/bookings/:id', UPDATE);
routerReBookings.post('/bookings/search', SEARCH);
routerReBookings.post('/bookings', CREATE);
routerReBookings.delete('/bookings/:id', DELETE);

export default routerReBookings;