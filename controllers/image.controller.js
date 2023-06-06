import mongoose from 'mongoose';
import Image from '../models/image.model.js';
import USER from '../models/user.model.js';
import { authorize, searchFile, uploadToFolder } from '../services/google.service.js';

const FolderSushiId = "1FWWDbyW6KuexI2m1TFgPHZeAPjvxq4kt";
const ObjectId = mongoose.Types.ObjectId;

const RULES = {
    "24041990": "Admin",
    "19051994": "User",
    "04012022": "Guest"
}

function convertSlugByName(name) {
    return name.toLowerCase().replace(/\s/g, '-').replace("%", "percent").replace("+", "plus");
}
function isAuthorization(req, res, method = null) {
    const { authorization } = req.headers;
    let errorMessage = "";
    if (!authorization) {
        errorMessage = 'Unauthorized due to ACL on resource';
    }
    else {
        const [authType, token] = authorization.trim().split(' ');
        if (authType !== 'Bearer')
            errorMessage = "Could not authorize the request. Make sure the request has an Authorization header with a bearer token, of the form 'Authorization: Bearer [token]'";
        else {
            if (RULES[token] == null) {
                errorMessage = "Authorization failed.";
            }
            else {
                if (method == "create") {
                    if (RULES[token] != "Admin") {
                        errorMessage = "Forbidden.";
                    }
                }
                else if (method == "update" || method == "delete") {
                    if (RULES[token] != "Admin" && RULES[token] != "User") {
                        errorMessage = "Forbidden.";
                    }
                }
                else if (method == "search") {
                    if (RULES[token] != "Admin" && RULES[token] != "User" && RULES[token] != "Guest") {
                        errorMessage = "Forbidden.";
                    }
                }
            }
        }
    }
    return errorMessage;
}

export async function UPLOAD(req, res) {
    try {
        const client = await authorize();
        if (client) {
            const resNewFile = await uploadToFolder(FolderSushiId, client, req.file);
            if (resNewFile.success) {
                res.status(200).json({
                    message: "uploaded success!!!",
                    data: resNewFile
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "upload fail",
                    error: resNewFile.message,
                });
            }
        } else {
            res.status(401).json({
                success: false,
                message: "google auth fail"
            });
        }
    }
    catch (ex) {
        res.status(500).json({
            success: false,
            error: ex.message
        });
    }
}
export async function GoogleFiles(req, res) {
    try {
        const client = await authorize();
        if (client) {
            const files = await searchFile(client);
            if (files) {
                res.status(200).json({
                    success: true,
                    files: files,
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: "google auth fail"
                });
            }
        }
    }
    catch (ex) {
        res.status(500).json({
            success: false,
            error: ex.message
        });
    }
}
export async function SyncImageGoogleFiles(req, res) {
    const category = req.params.categoryId;
    try {
        const client = await authorize();
        if (client) {
            const files = await searchFile(client);
            const FILE = files.find(c => c.name === category);
            if (files) {
                const fields = "name images";
                Image.find({ category: category }, fields).then((results) => {
                    let needToUpdate = [];
                    results.forEach(element => {
                        const findFile = FILE.child.find(c => c.name === element.name);
                        if (findFile && findFile.files.length > 0) {
                            let isUpdate = true;
                            findFile.images = element.images;
                            findFile.files.forEach(elm => {
                                if (element.images.indexOf("https://drive.google.com/uc?export=view&id=" + elm.id) > -1) {
                                    isUpdate = false;
                                }
                            });
                            if (isUpdate)
                                needToUpdate.push(findFile);
                        }
                    });
                    return res.status(200).json({
                        success: true,
                        message: 'A list of all images need to update',
                        needToUpdate: needToUpdate,
                        results: results,
                        FILE: FILE
                    });
                }).catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err.message,
                    });
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: "google auth fail"
                });
            }
        }
    }
    catch (ex) {
        res.status(500).json({
            success: false,
            error: ex.message
        });
    }
}

// create new
export function CREATE(req, res) {
    const errorAuth = isAuthorization(req, res, "create");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const name = req.body.name;
        Image.find({ name: name }).then(result => {
            if (result && result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Can not create with duplicate name = ${name}`,
                });
            }
            else {
                const record = new Image({
                    _id: mongoose.Types.ObjectId(),
                    slug: convertSlugByName(name),
                    created: Date.now(),
                    createdBy: req.body.createdBy ? req.body.createdBy : "HN",
                    active: true,
                    ...req.body
                });

                return record.save().then((newRecord) => {
                    return res.status(201).json({
                        success: true,
                        message: 'Created successfully',
                        result: newRecord,
                    });
                }).catch((error) => {
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: error.message,
                    });
                });
            }
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
    }
}

// Get all
export function GetImages(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        Image.find().then((results) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all images',
                results: results,
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
    }
}
export function GetImagesByQueriesAndLimit(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const fields = req.body.fields ? req.body.fields : '';
        if (req.body && req.body._id) {
            var cond = mongoose.Types.ObjectId.isValid(req.body._id)
            if (!cond) {
                return res.status(400).json({
                    success: false,
                    message: '_id invalid',
                    error: "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
                });
            }
        }
        const startIndex = req.body.startIndex ? req.body.startIndex : 0;
        var queries = req.body;
        if (req.body.name || req.body.name == '') {
            var name = req.body.name;
            delete req.body.name;
            var regex = new RegExp([name].join(""), "i");
            queries = { $and: [{ "name": regex }, req.body] };
        }

        const limit = req.params.limit;
        const sortBy = (req.body.sortBy && req.body.sortBy == "asc") ? 1 : -1;

        USER.find().then((resUser) => {
            var users = resUser;
            Image.find(queries).count().then((total) => {
                Image.find(queries, fields).skip(startIndex).limit(limit).sort({ created: sortBy }).then((results) => {
                    for(var i = 0; i < results.length; i++){
                        var result = results[i];
                        if( result.userId){
                            var id = result.userId.toString();
                            result.user = users.find(c => c._id == id);
                        }
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'GET ' + limit + " Images " + " Start at " + startIndex + " With FIELDS: " + fields,
                        results: results,
                        total: total
                    });
                }).catch((err) => {
                    return res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err.message,
                    });
                });
            })
        });
    }
}
export function GetImagesByQueries(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const fields = req.body.fields;
        Image.find(req.body, fields).sort({ created: -1 }).then((results) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all images By Request Body ??' + fields,
                results: results,
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
    }
}
export function GetImageById(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const id = req.params.imageId;
        Image.find({ _id: id }).then(results => {
            if (results && results.length <= 0) {
                return res.status(404).json({
                    success: true,
                    message: `Can not found Image ID = ${id}`,
                });
            }
            var result = results[0];
            var skillsName = [result.leaderSkill, result.skill1, result.skill2, result.skill3, result.skill4];
            Image.find({
                'name': { $in: skillsName }
            }, function (err, skills) {
                if (err) {
                    return res.status(200).json({
                        success: true,
                        message: `Image by ID ${id}`,
                        result: result,
                        errorMessage: "Can not load skills"
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: `Image by ID ${id}`,
                    result: { result, skills },
                });
            });

        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
    }
}
export function GetImageBySlug(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const slug = req.params.slug;
        Image.find({ slug: slug }).then(results => {
            if (results && results.length <= 0) {
                return res.status(404).json({
                    success: true,
                    message: `Can not found Image by SLUG = ${slug}`,
                });
            }
            var result = results[0];
            var skillsName = [result.leaderSkill, result.skill1, result.skill2, result.skill3, result.skill4];
            Image.find({
                'name': { $in: skillsName }
            }, function (err, skills) {
                if (err) {
                    return res.status(200).json({
                        success: true,
                        message: `Image by Slug ${slug}`,
                        result: result,
                        errorMessage: "Can not load skills"
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: `Image by Slug ${slug}`,
                    result: { result, skills },
                });
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
    }
}

// update
export function UPDATE(req, res) {
    const errorAuth = isAuthorization(req, res, "update");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const id = req.params.imageId;
        const updateRecord = req.body;
        const name = updateRecord.name;
        Image.find({ name: name }).then(result => {
            var isDuplicate = false
            if (result && result.length > 0) {
                var record = result[0];
                if (record._id != id) {
                    isDuplicate = true;
                    return res.status(400).json({
                        success: false,
                        message: `Can not save with duplicate name = ${name}`,
                    });
                }
            }
            if (!isDuplicate) {
                updateRecord.modified = Date.now();
                updateRecord.modifiedBy = updateRecord.modifiedBy ? updateRecord.modifiedBy : "Hung Nguyen";
                if (updateRecord.name) {
                    updateRecord.slug = convertSlugByName(updateRecord.name);
                }
                Image.updateOne({ _id: id }, { $set: updateRecord }).exec().then(() => {
                    res.status(200).json({
                        success: true,
                        message: 'Image is updated',
                        result: updateRecord,
                    });
                }).catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err.message
                    });
                });
            }
        });
    }
}

// delete
export function DELETE(req, res) {
    const errorAuth = isAuthorization(req, res, "delete");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const id = req.params.imageId;
        Image.findByIdAndRemove(id).exec().then((result) => res.status(204).json({
            success: true,
            message: `Deleted ${id}\n${result}`
        })).catch((err) => res.status(500).json({
            success: false,
            error: err.message
        }));
    }
}