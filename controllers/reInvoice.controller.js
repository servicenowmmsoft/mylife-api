import mongoose from 'mongoose';
import INVOICE from '../models/reInvoice.model.js';
import USER from '../models/user.model.js';

const RULES = {
    "24041990": "Admin",
    "19051994": "User",
    "04012022": "Guest"
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
        const record = new INVOICE({
            _id: mongoose.Types.ObjectId(),
            slug: mongoose.Types.ObjectId(),
            created: Date.now(),
            createdBy: req.body.createdBy ? req.body.createdBy : "Guest",
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
}

// create multiple
export function CREATEMULTIPLE(req, res) {
    const errorAuth = isAuthorization(req, res, "create");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        var items = req.body;
        for(var i = 0; i < items.length; i++){
            items[i] = {
                _id: mongoose.Types.ObjectId(),
                slug: mongoose.Types.ObjectId(),
                created: Date.now(),
                createdBy: items[i].createdBy ? items[i].createdBy : "Guest",
                active: true,
                ...items[i]
            }
        }

        INVOICE.insertMany(items).then((newRecord) => {
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
}

// Get all
export function GETALL(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        INVOICE.find().sort({ created: -1 }).then((results) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all INVOICE',
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
export function SEARCH(req, res) {
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

        const limit = req.body.limit ? req.body.limit : 6;
        const startIndex = req.body.startIndex ? req.body.startIndex : 0;
        const sortBy = (req.body.sortBy && req.body.sortBy == "asc") ? 1 : -1;

        var queries = req.body;
        if (req.body.title || req.body.title == '') {
            var title = req.body.title;
            delete req.body.title;
            var regex = new RegExp([title].join(""), "i");
            queries = { $and: [{ "title": regex }, req.body] };
        }
        USER.find().then((resUser) => {
            var users = resUser;
            INVOICE.find(queries).count().then((total) => {
                INVOICE.find(queries, fields).skip(startIndex).limit(limit).sort({ created: sortBy }).then((results) => {
                    for (var i = 0; i < results.length; i++) {
                        var result = results[i];
                        if (result.userId) {
                            var id = result.userId.toString();
                            result.user = users.find(c => c._id == id);
                        }
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'Search INVOICE by STARTINEX , LIMIT and FIELDS',
                        results: results,
                        total: total,
                        limit: limit, startIndex: startIndex, fields: fields
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
        const id = req.params.id;
        var cond = mongoose.Types.ObjectId.isValid(req.params.id)
        if (!cond) {
            return res.status(400).json({
                success: false,
                message: '_id invalid',
                error: "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer",
            });
        }
        INVOICE.find({ _id: id }).then(results => {
            if (results && results.length <= 0) {
                return res.status(404).json({
                    success: false,
                    message: `INVOICE NOT FOUND`,
                });
            }
            else {
                const updateRecord = req.body;
                const title = updateRecord.title;
                INVOICE.find({ title: title }).then(result => {
                    var isDuplicate = false
                    if (result && result.length > 0) {
                        var record = result[0];
                        if (record._id != id) {
                            isDuplicate = true;
                            return res.status(400).json({
                                success: false,
                                message: `Can not save with duplicate title = ${title}`,
                            });
                        }
                    }
                    if (!isDuplicate) {
                        updateRecord.modified = Date.now();
                        updateRecord.modifiedBy = updateRecord.modifiedBy ? updateRecord.modifiedBy : "Guest";
                        INVOICE.updateOne({ _id: id }, { $set: updateRecord }).exec().then(() => {
                            res.status(200).json({
                                success: true,
                                message: 'INVOICE is updated',
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
        const id = req.params.id;
        INVOICE.findByIdAndRemove(id).exec().then((result) => {
            if (result) {
                return res.status(204).json({
                    success: true,
                    message: `Deleted ${id}\n${result}`
                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: `INVOICE NOT FOUND`
                });
            }
        }).catch((err) => res.status(500).json({
            success: false,
            error: err.message
        }));
    }
}