import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage'
import Grid from 'gridfs-stream';

const username = "admin", password = "UX1NOyjuL4BFxaO7", database = "production", server = "1ibyk";
const URLDATABASE = `mongodb+srv://${username}:${password}@cluster0.${server}.mongodb.net/${database}?retryWrites=true&w=majority`;

const conn = mongoose.createConnection(URLDATABASE);
// Init gfs
let gfs;
let gfsReadFile;
let chunksCollection;
const ObjectId = mongoose.Types.ObjectId;
conn.once('open', () => {
    // Init stream
    gfsReadFile = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' })
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
    chunksCollection = conn.collection("uploads.chunks");
});
// Create storage engine
const storage = new GridFsStorage({
    url: URLDATABASE,
    file: (req, file) => {
        var imageId = req.headers.imageid ? req.headers.imageid : "xxx";
        var arr = file.mimetype.split("/");
        var TYPE = "." + arr[arr.length - 1]
        var imageName = req.headers.imagename ? (req.headers.imagename + TYPE) : file.originalname;

        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                // const filename = buf.toString('hex') + path.extname(file.originalname);
                const filename = imageId + "_" + imageName;
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

const routerUpload = express.Router();

//BEGIN UPLOADS TO MONGODB
// @route POST /upload
// @desc  Uploads file to DB
routerUpload.post('/files/upload', upload.single('file'), (req, res) => {
    var FILE = req.file;
    if (!FILE) {
        res.status(400).json({ errorMessage: "FILE NOT FOUND" });
    }
    gfs.files.find({ filename: FILE.filename }).toArray((err, files) => {
        if (files.length > 1) {
            var deleteIds = new Array();
            for (var i = 0; i < (files.length - 1); i++) {
                // console.log("REMOVED - " + files[i]._id);
                deleteIds.push(new ObjectId(files[i]._id));
            }
            gfs.files.deleteMany({ _id: { $in: deleteIds } });
            chunksCollection.deleteMany({ files_id: { $in: deleteIds } });
        }
    });
    res.json({ file: FILE });
});

// @route GET /files
// @desc  Display all files in JSON
routerUpload.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                message: 'No files exist',
                err
            });
        }
        // Files exist
        return res.json({ files });
    });
});

routerUpload.post('/chunks/search', (req, res) => {
    var { startIndex = 1, limit = 6 } = req.body;
    chunksCollection.estimatedDocumentCount().then((total) => {
        chunksCollection.find().skip(startIndex - 1).limit(limit).toArray((err, files) => {
            // Check if files
            if (!files || files.length === 0) {
                return res.status(404).json({
                    message: 'No files exist',
                    err
                });
            }
            // Files exist
            return res.json({ message: startIndex + " - " + (startIndex - 1 + limit) + " of " + total, files });
        });
    });
});

// @route GET /files/:filename
// @desc  Display single file object
routerUpload.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                message: 'No file exists',
                err
            });
        }
        // File exists
        return res.json({ file });
    });
});

routerUpload.get('/chunks/:fileId', (req, res) => {
    var FileId = new ObjectId(req.params.fileId);
    chunksCollection.find({ files_id: FileId }).toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                message: 'No files exist',
                err
            });
        }
        // Files exist
        return res.json({ files });
    });
});

// @route GET /image/:filename
// @desc Display Image
routerUpload.get('/files/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfsReadFile.openDownloadStreamByName(req.params.filename);
            // readstream.pipe(res);
            readstream.on("data", (chunk) => {
                res.write(chunk);
            });
            readstream.on("end", () => {
                res.status(200).end();
            });
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc  Delete file
routerUpload.delete('/files/:id', (req, res) => {
    var _id = new ObjectId(req.params.id);
    gfs.files.remove({ _id: _id }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
        // Unlink the chunks file
        chunksCollection.remove({ files_id: _id }, (errChunks, gridStoreChunks) => {
            if (err) {
                return res.status(404).json({ errChunks: errChunks });
            }
            return res.json({ gridStore, gridStoreChunks });
        });

    });
});

routerUpload.delete('/files/filename/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                message: 'No file exists',
                err
            });
        }
        var _id = new ObjectId(file._id);
        gfs.files.remove({ _id: _id }, (err, gridStore) => {
            if (err) {
                return res.status(404).json({ err: err });
            }
            // Unlink the chunks file
            chunksCollection.remove({ files_id: _id }, (errChunks, gridStoreChunks) => {
                if (err) {
                    return res.status(404).json({ errChunks: errChunks });
                }
                return res.json({ gridStore, gridStoreChunks });
            });
        });
    });
});
  //END UPLOADS TO MONGODB

  export default routerUpload;