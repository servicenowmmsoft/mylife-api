import express from 'express';
import { CREATE, GETALL, SEARCH, UPDATE, DELETE } from '../controllers/re.controller.js';

const routerRealestate = express.Router();

routerRealestate.get('/realestate', GETALL);
routerRealestate.patch('/realestate/:id', UPDATE);
routerRealestate.put('/realestate/:id', UPDATE);
routerRealestate.post('/realestate/search', SEARCH);
routerRealestate.post('/realestate', CREATE);
routerRealestate.delete('/realestate/:id', DELETE);

export default routerRealestate;