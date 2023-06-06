import mongoose from 'mongoose';
import USER from '../models/user.model.js';
import jwt from 'jsonwebtoken';

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
        var username = req.body.username;
        USER.find({ username: username }).then(result => {
            if (result && result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Can not create with duplicate username = ${username}`,
                });
            }
            else {
                const record = new USER({
                    _id: mongoose.Types.ObjectId(),
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
export function GetUsers(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        USER.find().then((results) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all users',
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

export function GetUsersByQueries(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const fields = req.body.fields ? req.body.fields : '';
        const limit = req.body.limit;
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
            queries = { $and: [{ "fullname": regex }, req.body] };
        }
        USER.find(queries).count().then((total) => {
            USER.find(queries, fields).skip(startIndex).limit(limit).sort({ created: -1 }).then((results) => {
                return res.status(200).json({
                    success: true,
                    message: 'GET ' + limit + " Users " + " Start at " + startIndex + " With FIELDS: " + fields,
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
    }
}

export function GetUserById(req, res) {
    const errorAuth = isAuthorization(req, res, "search");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const id = req.params.userId;
        USER.find({ _id: id }).then(results => {
            if (results && results.length <= 0) {
                return res.status(404).json({
                    success: true,
                    message: `Can not found User ID = ${id}`,
                });
            }
            var result = results[0];
            return res.status(200).json({
                success: true,
                message: `User by ID ${id}`,
                result: result
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
        const id = req.params.userId;
        const updateRecord = req.body;
        const username = updateRecord.username;
        USER.find({ username: username }).then(result => {
            var isDuplicate = false
            if (result && result.length > 0) {
                var record = result[0];
                if (record._id != id) {
                    isDuplicate = true;
                    return res.status(400).json({
                        success: false,
                        message: `Can not save with duplicate username = ${username}`,
                    });
                }
            }
            if (!isDuplicate) {
                updateRecord.modified = Date.now();
                updateRecord.modifiedBy = updateRecord.modifiedBy ? updateRecord.modifiedBy : "Hung Nguyen";
                USER.updateOne({ _id: id }, { $set: updateRecord }).exec().then(() => {
                    res.status(200).json({
                        success: true,
                        message: 'User is updated',
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
export function LOGIN(req, res) {
    const errorAuth = isAuthorization(req, res, "update");
    if (errorAuth != "") {
        res.status(401).json({
            success: false,
            error: errorAuth
        });
    }
    else {
        const updateRecord = req.body;
        const username = updateRecord.username;
        const password = updateRecord.password;
        USER.find({ username: username, password: password }).then(results => {
            if (results && results.length <= 0) {
                return res.status(404).json({
                    success: true,
                    message: `Can not found User`,
                });
            }
            var user = results[0];
            var JWT_SECRET = "my-32-character-ultra-secure-and-ultra-long-secret";
            var JWT_EXPIRES_IN = '2h';
            var token = jwt.sign(
                {
                    userID: "MYLIFE-" + user._id
                }, JWT_SECRET,
                {
                    expiresIn: JWT_EXPIRES_IN,
                    subject: "WELCOME TO MYLIFE",
                    jwtid: user._id.toString()
                });
            updateRecord.token = token;
            USER.updateOne({ _id: user._id }, {
                $set: {
                    lastLogin: Date.now(),
                    token: token
                }
            }).exec().then(() => {
                res.status(200).json({
                    success: true,
                    message: 'Login success',
                    result: updateRecord,
                });
            }).catch((err) => {
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err.message
                });
            });
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
        const id = req.params.userId;
        USER.findByIdAndRemove(id).exec().then((result) => res.status(204).json({
            success: true,
            message: `Deleted ${id}\n${result}`
        })).catch((err) => res.status(500).json({
            success: false,
            error: err.message
        }));
    }
}