import express from 'express';
import { CREATE, DELETE, GetUserById, GetUsers, GetUsersByQueries, LOGIN, UPDATE } from '../controllers/user.controller.js';

const routerUser = express.Router();

routerUser.get('/users', GetUsers);
routerUser.get('/users/:userId', GetUserById);
routerUser.patch('/users/:userId', UPDATE);
routerUser.put('/users/:userId', UPDATE);
routerUser.post('/users/queries', GetUsersByQueries);
routerUser.post('/users', CREATE);
routerUser.post('/users/login', LOGIN);
routerUser.delete('/users/:userId', DELETE);

export default routerUser;