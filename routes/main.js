import express from 'express';
import { GetImages, UPDATE, CREATE, DELETE, GetImageById, GetImageBySlug, GetImagesByQueries, UPLOAD, GoogleFiles, SyncImageGoogleFiles, GetImagesByQueriesAndLimit } from '../controllers/image.controller.js';

import multer from 'multer';

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage });

const router = express.Router();

router.get('/images', GetImages);
router.get('/images/:imageId', GetImageById);
router.get('/images/slug/:slug', GetImageBySlug);
router.patch('/images/:imageId', UPDATE);
router.put('/images/:imageId', UPDATE);
router.post('/images/queries', GetImagesByQueries);
router.post('/images/queries/limit/:limit', GetImagesByQueriesAndLimit);
router.delete('/images/:imageId', DELETE);

//Google Drive
router.get('/images/files', GoogleFiles);
router.put('/images/sync/:categoryId', SyncImageGoogleFiles);
router.post('/images', CREATE);
router.post('/images/upload', upload.single('file'), UPLOAD);

export default router;