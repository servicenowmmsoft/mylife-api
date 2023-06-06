import express from 'express';
import { CREATE, CREATEMULTIPLE, DELETE, GETALL, SEARCH, UPDATE } from '../controllers/reInvoice.controller.js';

const routerReInvoice = express.Router();

routerReInvoice.get('/invoice', GETALL);
routerReInvoice.patch('/invoice/:id', UPDATE);
routerReInvoice.put('/invoice/:id', UPDATE);
routerReInvoice.post('/invoice/search', SEARCH);
routerReInvoice.post('/invoice', CREATE);
routerReInvoice.post('/invoicemultiple', CREATEMULTIPLE);
routerReInvoice.delete('/invoice/:id', DELETE);

export default routerReInvoice;