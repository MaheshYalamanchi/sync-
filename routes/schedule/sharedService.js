
var jwt = require('jsonwebtoken');
const TOKEN_KEY = "eime6Daeb2xanienojaefoh4";
const tokenService = require('../../routes/proctorToken/tokenService');
const scheduleService = require('../schedule/scheduleService');
const _ = require('lodash');
var bowser = require("bowser");
const invoke = require("../../lib/http/invoke");
const _schedule = require('../schedule/schedule')
const json = require('../json');
let tokenValidation = async (params) => {
    try {
        // console.log(params.body,'body....................jwt')
        const token = params.body.authorization.authorization.split(" ");
        if (!token) {
            return { success: false, message: "A token is required for authentication" + token[1] };
        } else {
            const decodedToken = jwt.verify(token[1], TOKEN_KEY);
            if (!decodedToken) {
                // console.log(decodedToken,'decodedToken................')
                return { success: false, message: "A token is required for authentication" };
            }
            decodedToken.headers = params.body.authorization;
            let username = decodedToken.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '_');
            if (decodedToken) {
                console.log('decodedToken 1')
                let userResponse = await scheduleService.userFetch(decodedToken);
                var responseData;
                // console.log(userResponse)			
                if (userResponse && userResponse.message && (userResponse.message.length > 0) && (userResponse.message[0]._id == username)) {
                    console.log('userResponse.message.length 2')
                    let response = await scheduleService.userUpdate(userResponse.message[0]);
                    if (response && response.success) {
                        console.log('response.success 3')
                        let roomsResponse = await scheduleService.roomFetch(decodedToken);
                        if (roomsResponse && roomsResponse.success && (roomsResponse.message.length > 0) && (roomsResponse.message[0]._id == decodedToken.id)) {
                            console.log('roomsResponse.success 4')
                            responseData = await scheduleService.roomUpdate(decodedToken)
                        } else {
                            console.log('roomsResponse.message.length 5')
                            responseData = await scheduleService.roomInsertion(decodedToken);
                        }

                    }
                } else {
                    let response = await scheduleService.userInsertion(decodedToken);
                    if (response && response.success) {
                        responseData = await scheduleService.roomInsertion(decodedToken);
                    } else {
                        return { success: false, message: "user insertion failed..." }
                    }
                }
                if (responseData.success) {
                    let getToken = await tokenService.jwtToken(decodedToken);
                    if (getToken) {
                        return { success: true, message: { token: getToken } };
                    } else {
                        return { success: false, message: 'Error While Generating Token!' };
                    }
                }
            } else {
                return { success: false, message: 'Data Not Found' };
            }
        }
    } catch (error) {
        console.log('jwtapicallfailed')
        console.log(error, "jwtError2===>>>>")
        if (error) {
            return { success: false, message: "TokenExpiredError" }
        } else {
            return { success: false, message: error }
        }
    }
};

let validateToken = async (params) => {
    try {
        const token = params.body.authorization.authorization.split(" ");
        if (!token) {
            return { success: false, message: "A token is required for authentication" + token[1] };
        } else {
            const decodedToken = jwt.verify(token[1], TOKEN_KEY);
            if (!decodedToken) {
                return { success: false, message: "A token is required for authentication" };
            }
            let url;
            let database;
            let tenantResponse;
            if (decodedToken && decodedToken.tenantId) {
                tenantResponse = await _schedule.tenantResponse(decodedToken);
                if (tenantResponse && tenantResponse.success) {
                    url = tenantResponse.message.connectionString + '/' + tenantResponse.message.databaseName;
                    database = tenantResponse.message.databaseName;
                } else {
                    return { success: false, message: tenantResponse.message }
                }
            } else {
                url = process.env.MONGO_URI + '/' + process.env.DATABASENAME;
                database = process.env.DATABASENAME;
            }
            decodedToken.headers = params.body.authorization;
            if (decodedToken) {
                // console.log("decoded the token====>>", params.body.authorization.authorization)
                decodedToken.bowser = bowser.parse(params.body.bowserDetails);
                decodedToken.bowserDetails = params.body.bowserDetails;
                if (tenantResponse && tenantResponse.success) {
                    decodedToken.tenantResponse = tenantResponse;
                }
                let userResponse = await scheduleService.userFetch(decodedToken);
                let responseData;
                if (userResponse && userResponse.success) {
                    let userUpdateResponse = await scheduleService.user_Update(decodedToken);
                    if (userUpdateResponse && userUpdateResponse.success) {
                        decodedToken.role = userResponse.message[0].role;
                        decodedToken.provider = userResponse.message[0].provider;
                        if (userResponse && userResponse.message && userResponse.message[0].locked != 1) {
                            let roomsResponse = await scheduleService.roomFetch(decodedToken);
                            if (roomsResponse && roomsResponse.success) {
                                if ((roomsResponse.message.status !== "stopped") && (roomsResponse.message.status !== "accepted") && (roomsResponse.message.status !== "rejected")) {
                                    responseData = await scheduleService.roomUpdate(decodedToken)
                                    if (responseData && !responseData.success) {
                                    }
                                } else {
                                    return { success: false, message: 'Eroor while updating roomRecord' };
                                }
                            } else {
                                responseData = await scheduleService.roomInsertion(decodedToken);
                            }
                        } else {
                            return { success: false, message: 'Data Not Found' };
                        }
                    }
                } else {
                    let response = await scheduleService.userInsertion(decodedToken);
                    if (response && response.success) {
                        decodedToken.role = response.message.role;
                        decodedToken.provider = response.message.provider;
                        responseData = await scheduleService.roomInsertion(decodedToken);
                    } else {
                        return { success: false, message: "user insertion failed..." }
                    }
                }
                if (responseData.success) {
                    let getToken = await tokenService.jwtToken(decodedToken);
                    if (getToken) {
                        return { success: true, message: { token: getToken } };
                    } else {
                        return { success: false, message: 'Error While Generating Token!' };
                    }
                } else {
                    // console.log("responseData136=====>>>>",responseData)
                }
            } else {
                return { success: false, message: 'Data Not Found' };
            }
        }
    } catch (error) {
        console.log('jwtapicallfailed')
        console.log(error, "jwtError2===>>>>")
        if (error) {
            return { success: false, message: "TokenExpiredError" }
        } else {
            return { success: false, message: error }
        }
    }
};
let getConnections = async (params) => {
    try {
        let closeconnection = await invoke.makeHttpCall_roomDataService("get", "closeconnection");
        if (closeconnection) {
            return { success: true, message: "connection closed" }
        } else {
            return { success: false, message: "connection close error" }
        }
    } catch (error) {
        if (error) {
            return { success: false, message: "closeConnection error" }
        } else {
            return { success: false, message: error }
        }
    }
};

let getScheduleInfo = async (params) => {
    try {
        let url;
        let database;
        if (params && params.authorization) {
            let decodeToken = jwt_decode(params.authorization);
            if (decodeToken && decodeToken.tenantId) {
                let tenantResponse = await _schedule.getTennant(decodeToken);
                if (tenantResponse && tenantResponse.success) {
                    url = tenantResponse.message.connectionString + '/' + tenantResponse.message.databaseName;
                    database = tenantResponse.message.databaseName;
                } else {
                    return { success: false, message: tenantResponse.message }
                }
            } else {
                url = process.env.MONGO_URI + '/' + process.env.DATABASENAME;
                database = process.env.DATABASENAME;
            }
        } else {
            url = process.env.MONGO_URI + '/' + process.env.DATABASENAME;
            database = process.env.DATABASENAME;
        }
        let userArray = Array.from(new Set(params.map(user => user.email)));
        var getdata = {
            url: url,
            database: database,
            model: "users",
            docType: 1,
            query: [
                { $match: { nickname: { $in: userArray } } },
                { $project: { id: "$nickname", _id: 0 } }
            ]
        };
        let existingUser = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (existingUser && existingUser.data && existingUser.data.statusMessage && (existingUser.data.statusMessage.length > 0)) {
            const existingUserIds = Array.from(new Set(existingUser.data.statusMessage.map(user => user.id)));
            const missingUsers = userArray.filter(user => !existingUserIds.includes(user))
                .map(user => ({
                    "_id": user.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '_'),
                    "nickname": user,
                    "provider": "jwt"
                }));
            if (missingUsers && (missingUsers.length > 0)) {
                var bulkWriteData = {
                    url: url,
                    database: database,
                    model: "users",
                    docType: 0,
                    query: missingUsers
                };
                let bulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", bulkWriteData);
                if (bulkwriteResponse && bulkwriteResponse.data && bulkwriteResponse.data.statusMessage && (bulkwriteResponse.data.statusMessage.length > 0)) {
                    var getTemplate = {
                        url: url,
                        database: database,
                        model: "rooms",
                        docType: 1,
                        query: { _id: params[0].templateName }
                    };
                    let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                    if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                        let SessionsList = params.map(user => user.roomId);
                        var SessionsListData = {
                            url: url,
                            database: database,
                            model: "rooms",
                            docType: 1,
                            query: [
                                { $match: { _id: { $in: SessionsList } } },
                                { $project: { id: "$_id", _id: 0 } }
                            ]
                        };
                        let SessionsListUser = await invoke.makeHttpCall("post", "aggregate", SessionsListData);
                        if (SessionsListUser && SessionsListUser.data && SessionsListUser.data.statusMessage && (SessionsListUser.data.statusMessage.length > 0)) {
                            const SessionsIds = SessionsListUser.data.statusMessage.map(user => user.id);
                            const missingSessions = Array.from(new Set(params.filter(param => !SessionsIds.includes(param.roomId))));
                            if (missingSessions && (missingSessions.length > 0)) {
                                const sessionArray = await Promise.all(
                                    missingSessions.map(async user => {
                                        let jsonData;
                                        try {
                                            jsonData = await json.sessionData(user);
                                            const statusMessage = templateResponse.data.statusMessage[0];
                                            jsonData.addons = statusMessage.addons;
                                            jsonData.threshold = statusMessage.threshold;
                                            jsonData.rules = statusMessage.rules;
                                            jsonData.members = statusMessage.members;
                                            jsonData.metrics = statusMessage.metrics;
                                            jsonData.weights = statusMessage.weights;
                                            return jsonData;
                                        } catch (error) {
                                            console.error(`Error processing user ${user}:`, error);
                                            throw error;
                                        }
                                    })
                                );
                                var SessionbulkWriteData = {
                                    url: url,
                                    database: database,
                                    model: "rooms",
                                    docType: 0,
                                    query: sessionArray
                                };
                                let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                                if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                    return { success: true, message: "Inserted successfully" }
                                }
                            } else {
                                return { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -1" };
                            }
                        } else {
                            const sessionArray = await Promise.all(
                                params.map(async user => {
                                    let jsonData;
                                    try {
                                        jsonData = await json.sessionData(user);
                                        const statusMessage = templateResponse.data.statusMessage[0];
                                        jsonData.addons = statusMessage.addons;
                                        jsonData.threshold = statusMessage.threshold;
                                        jsonData.rules = statusMessage.rules;
                                        jsonData.members = statusMessage.members;
                                        jsonData.metrics = statusMessage.metrics;
                                        jsonData.weights = statusMessage.weights;
                                        return jsonData;
                                    } catch (error) {
                                        console.error(`Error processing user ${user}:`, error);
                                        throw error;
                                    }
                                })
                            );
                            if (sessionArray && (sessionArray.length > 0)) {
                                var SessionbulkWriteData = {
                                    url: url,
                                    database: database,
                                    model: "rooms",
                                    docType: 0,
                                    query: sessionArray
                                };
                                let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                                if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                    return { success: true, message: "Inserted successfully" };
                                }
                            } else {
                                return { success: false, message: "Session Insertion Failed -1" };
                            }
                        }
                    } {
                        console.log("Template Error1====>>>>>",JSON.stringify(params[0]))
                        return { success: false, message: "Template fetching Error -1" };
                    }
                } else {
                    return { success: false, message: "User Insertion Failed -1" };
                }
            } else {
                var getTemplate = {
                    url: url,
                    database: database,
                    model: "rooms",
                    docType: 1,
                    query: { _id: params[0].templateName }
                };
                let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                    let SessionsList = Array.from(new Set(params.map(user => user.roomId)));
                    var SessionsListData = {
                        url: url,
                        database: database,
                        model: "rooms",
                        docType: 1,
                        query: [
                            { $match: { _id: { $in: SessionsList } } },
                            { $project: { id: "$_id", _id: 0 } }
                        ]
                    };
                    let SessionsListUser = await invoke.makeHttpCall("post", "aggregate", SessionsListData);
                    if (SessionsListUser && SessionsListUser.data && SessionsListUser.data.statusMessage && (SessionsListUser.data.statusMessage.length > 0)) {
                        const SessionsIds = SessionsListUser.data.statusMessage.map(user => user.id);
                        const missingSessions = Array.from(new Set(params.filter(param => !SessionsIds.includes(param.roomId))));
                        if (missingSessions && (missingSessions.length > 0)) {
                            const sessionArray = await Promise.all(
                                missingSessions.map(async user => {
                                    let jsonData;
                                    try {
                                        jsonData = await json.sessionData(user);
                                        const statusMessage = templateResponse.data.statusMessage[0];
                                        jsonData.addons = statusMessage.addons;
                                        jsonData.threshold = statusMessage.threshold;
                                        jsonData.rules = statusMessage.rules;
                                        jsonData.members = statusMessage.members;
                                        jsonData.metrics = statusMessage.metrics;
                                        jsonData.weights = statusMessage.weights;
                                        return jsonData;
                                    } catch (error) {
                                        console.error(`Error processing user ${user}:`, error);
                                        throw error;
                                    }
                                })
                            );
                            var SessionbulkWriteData = {
                                url: url,
                                database: database,
                                model: "rooms",
                                docType: 0,
                                query: sessionArray
                            };
                            let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                            if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                return { success: true, message: "Inserted successfully" }
                            }
                        } else {
                            return { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -2" };
                        }
                    } else {
                        const sessionArray = await Promise.all(
                            params.map(async user => {
                                let jsonData;
                                try {
                                    jsonData = await json.sessionData(user);
                                    const statusMessage = templateResponse.data.statusMessage[0];
                                    jsonData.addons = statusMessage.addons;
                                    jsonData.threshold = statusMessage.threshold;
                                    jsonData.rules = statusMessage.rules;
                                    jsonData.members = statusMessage.members;
                                    jsonData.metrics = statusMessage.metrics;
                                    jsonData.weights = statusMessage.weights;
                                    return jsonData;
                                } catch (error) {
                                    console.error(`Error processing user ${user}:`, error);
                                    throw error;
                                }
                            })
                        );
                        if (sessionArray && (sessionArray.length > 0)) {
                            var SessionbulkWriteData = {
                                url: url,
                                database: database,
                                model: "rooms",
                                docType: 0,
                                query: sessionArray
                            };
                            let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                            if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                return { success: true, message: "Inserted successfully" };
                            }
                        } else {
                            return { success: false, message: "Session Insertion Failed -2" };
                        }
                    }
                } {
                    console.log("Template Error2====>>>>>",JSON.stringify(params[0]))
                    return { success: false, message: "Template fetching Error -2" };
                }
            }
        } else {
            const missingUsers = userArray
                .map(user => ({
                    "_id": user.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '_'),
                    "nickname": user,
                    "provider": "jwt"
                }));
            if (missingUsers && (missingUsers.length > 0)) {
                var bulkWriteData = {
                    url: url,
                    database: database,
                    model: "users",
                    docType: 0,
                    query: missingUsers
                };
                let bulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", bulkWriteData);
                if (bulkwriteResponse && bulkwriteResponse.data && bulkwriteResponse.data.statusMessage && (bulkwriteResponse.data.statusMessage.length > 0)) {
                    var getTemplate = {
                        url: url,
                        database: database,
                        model: "rooms",
                        docType: 1,
                        query: { _id: params[0].templateName }
                    };
                    let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                    if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                        let SessionsList = Array.from(new Set(params.map(user => user.roomId)));
                        var SessionsListData = {
                            url: url,
                            database: database,
                            model: "rooms",
                            docType: 1,
                            query: [
                                { $match: { _id: { $in: SessionsList } } },
                                { $project: { id: "$_id", _id: 0 } }
                            ]
                        };
                        let SessionsListUser = await invoke.makeHttpCall("post", "aggregate", SessionsListData);
                        if (SessionsListUser && SessionsListUser.data && SessionsListUser.data.statusMessage && (SessionsListUser.data.statusMessage.length > 0)) {
                            const SessionsIds = SessionsListUser.data.statusMessage.map(user => user.id);
                            const missingSessions = Array.from(new Set(params.filter(param => !SessionsIds.includes(param.roomId))));
                            if (missingSessions && (missingSessions.length > 0)) {
                                const sessionArray = await Promise.all(
                                    missingSessions.map(async user => {
                                        let jsonData;
                                        try {
                                            jsonData = await json.sessionData(user);
                                            const statusMessage = templateResponse.data.statusMessage[0];
                                            jsonData.addons = statusMessage.addons;
                                            jsonData.threshold = statusMessage.threshold;
                                            jsonData.rules = statusMessage.rules;
                                            jsonData.members = statusMessage.members;
                                            jsonData.metrics = statusMessage.metrics;
                                            jsonData.weights = statusMessage.weights;
                                            return jsonData;
                                        } catch (error) {
                                            console.error(`Error processing user ${user}:`, error);
                                            throw error;
                                        }
                                    })
                                );
                                var SessionbulkWriteData = {
                                    url: url,
                                    database: database,
                                    model: "rooms",
                                    docType: 0,
                                    query: sessionArray
                                };
                                let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                                if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                    return { success: true, message: "Inserted successfully" }
                                }
                            } else {
                                return { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -3" };
                            }
                        } else {
                            const sessionArray = await Promise.all(
                                params.map(async user => {
                                    let jsonData;
                                    try {
                                        jsonData = await json.sessionData(user);
                                        const statusMessage = templateResponse.data.statusMessage[0];
                                        jsonData.addons = statusMessage.addons;
                                        jsonData.threshold = statusMessage.threshold;
                                        jsonData.rules = statusMessage.rules;
                                        jsonData.members = statusMessage.members;
                                        jsonData.metrics = statusMessage.metrics;
                                        jsonData.weights = statusMessage.weights;
                                        return jsonData;
                                    } catch (error) {
                                        console.error(`Error processing user ${user}:`, error);
                                        throw error;
                                    }
                                })
                            );
                            if (sessionArray && (sessionArray.length > 0)) {
                                var SessionbulkWriteData = {
                                    url: url,
                                    database: database,
                                    model: "rooms",
                                    docType: 0,
                                    query: sessionArray
                                };
                                let SessionbulkwriteResponse = await invoke.makeHttpCall_userDataService("post", "bulkWrite", SessionbulkWriteData);
                                if (SessionbulkwriteResponse && SessionbulkwriteResponse.data && SessionbulkwriteResponse.data.statusMessage && (SessionbulkwriteResponse.data.statusMessage.length > 0)) {
                                    return { success: true, message: "Inserted successfully" };
                                }
                            } else {
                                return { success: false, message: "Session Insertion Failed -3" };
                            }
                        }
                    } {
                        console.log("Template Error3====>>>>>",JSON.stringify(params[0]))
                        return { success: false, message: "Template fetching Error -3" };
                    }
                } else {
                    return { success: false, message: "User Insertion Failed -2" };
                }
            } else {
                return { success: false, message: "user creation failed -!" }
            }
        }

    } catch (error) {
        if (error) {
            return { success: false, message: error }
        } else {
            return { success: false, message: error }
        }
    }
};
module.exports = {
    tokenValidation,
    validateToken,
    getConnections,
    getScheduleInfo

}