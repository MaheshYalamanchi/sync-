
var jwt = require('jsonwebtoken');
const TOKEN_KEY = "eime6Daeb2xanienojaefoh4";
const tokenService = require('../../routes/proctorToken/tokenService');
const scheduleService = require('../schedule/scheduleService');
const _ = require('lodash');
var bowser = require("bowser");
const invoke = require("../../lib/http/invoke");
const _schedule = require('../schedule/schedule')
const json = require('../json');
const shared_service = require('./shared.service')
const schedule_Service = require('./schedule.Service')
const jwt_decode = require('jwt-decode');
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
                    decodedToken.tenantResponse = tenantResponse;
                } else {
                    return { success: false, message: tenantResponse.message }
                }
            } else {
                url = process.env.MONGO_URI + '/' + process.env.DATABASENAME;
                database = process.env.DATABASENAME;
            }
            decodedToken.headers = params.body.authorization;
            if (decodedToken) {
                decodedToken.bowser = bowser.parse(params.body.bowserDetails);
                decodedToken.bowserDetails = params.body.bowserDetails;
                decodedToken.url = url;
                decodedToken.database = database;
                let userResponse = await scheduleService.userFetch(decodedToken);
                let responseData;
                if (userResponse && userResponse.success) {
                    if (userResponse && userResponse.message && userResponse.message[0].locked != 1) {
                        let userUpdateResponse = await scheduleService.user_Update(decodedToken);
                        if (userUpdateResponse && userUpdateResponse.success) {
                            decodedToken.role = userResponse.message[0].role;
                            decodedToken.provider = userResponse.message[0].provider;
                            let roomsResponse = await scheduleService.roomFetch(decodedToken);
                            if (roomsResponse && roomsResponse.success) {
                                if ((roomsResponse.message.status !== "stopped") && (roomsResponse.message.status !== "accepted") && (roomsResponse.message.status !== "rejected")) {
                                    responseData = await scheduleService.roomUpdate(decodedToken)
                                } else {
                                    return { success: false, message: 'Eroor while updating roomRecord' };
                                }
                            } else {
                                responseData = await scheduleService.roomInsertion(decodedToken);
                            }
                        }
                    } else {
                        return { success: false, message: 'Data Not Found' };
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
                    return { success: false, message: 'Error While Generating Token...!' };
                }
            } else {
                return { success: false, message: 'Data Not Found' };
            }
        }
    } catch (error) {
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
        let scheduleCreationResponse;
        const liveProctoredChunks = params.filter(item => item.liveProctoringEnable);
        console.log("LiveProctoredChunks ======>>>>>>",JSON.stringify(liveProctoredChunks))
        const chunks = await chunkArray(liveProctoredChunks, 20);
        for (let i = 0; i < chunks.length; i++) {
            let userArray = Array.from(new Set(chunks[i].map(user => user.email)));
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
                            query: { _id: chunks[i][0]?.templateName || "default" }
                        };
                        let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                        if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                            let SessionsList = chunks[i].map(user => user.roomId);
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
                                const missingSessions = Array.from(new Set(chunks[i].filter(param => !SessionsIds.includes(param.roomId))));
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
                                                jsonData.members = statusMessage.members[i];
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
                                        chunks[i][0].url = url;
                                        chunks[i][0].database = database;
                                        chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                        scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                    }
                                } else {
                                    scheduleCreationResponse = { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -1" };
                                }
                            } else {
                                const sessionArray = await Promise.all(
                                    chunks[i].map(async user => {
                                        let jsonData;
                                        try {
                                            jsonData = await json.sessionData(user);
                                            const statusMessage = templateResponse.data.statusMessage[0];
                                            jsonData.addons = statusMessage.addons;
                                            jsonData.threshold = statusMessage.threshold;
                                            jsonData.rules = statusMessage.rules;
                                            jsonData.members = statusMessage.members[i];
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
                                        chunks[i][0].url = url;
                                        chunks[i][0].database = database;
                                        chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                        scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                    }
                                } else {
                                    scheduleCreationResponse = { success: false, message: "Session Insertion Failed -1" };
                                }
                            }
                        } {
                            scheduleCreationResponse = { success: false, message: "Template fetching Error -1" };
                        }
                    } else {
                        scheduleCreationResponse = { success: false, message: "User Insertion Failed -1" };
                    }
                } else {
                    var getTemplate = {
                        url: url,
                        database: database,
                        model: "rooms",
                        docType: 1,
                        query: { _id: chunks[i][0]?.templateName || "default" }
                    };
                    let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                    if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                        let SessionsList = Array.from(new Set(chunks[i].map(user => user.roomId)));
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
                            const missingSessions = Array.from(new Set(chunks[i].filter(param => !SessionsIds.includes(param.roomId))));
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
                                            jsonData.members = statusMessage.members[i];
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
                                    chunks[i][0].url = url;
                                    chunks[i][0].database = database;
                                    chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                    scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                }
                            } else {
                                scheduleCreationResponse = { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -2" };
                            }
                        } else {
                            const sessionArray = await Promise.all(
                                chunks[i].map(async user => {
                                    let jsonData;
                                    try {
                                        jsonData = await json.sessionData(user);
                                        const statusMessage = templateResponse.data.statusMessage[0];
                                        jsonData.addons = statusMessage.addons;
                                        jsonData.threshold = statusMessage.threshold;
                                        jsonData.rules = statusMessage.rules;
                                        jsonData.members = statusMessage.members[i];
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
                                    chunks[i][0].url = url;
                                    chunks[i][0].database = database;
                                    chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                    scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                }
                            } else {
                                scheduleCreationResponse = { success: false, message: "Session Insertion Failed -2" };
                            }
                        }
                    } {
                        scheduleCreationResponse = { success: false, message: "Template fetching Error -2" };
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
                            query: { _id: chunks[i][0]?.templateName || "default" }
                        };
                        let templateResponse = await invoke.makeHttpCall_roomDataService("post", "read", getTemplate);
                        if (templateResponse && templateResponse.data && templateResponse.data.statusMessage) {
                            let SessionsList = Array.from(new Set(chunks[i].map(user => user.roomId)));
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
                                const missingSessions = Array.from(new Set(chunks[i].filter(param => !SessionsIds.includes(param.roomId))));
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
                                                jsonData.members = statusMessage.members[i];
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
                                        chunks[i][0].url = url;
                                        chunks[i][0].database = database;
                                        chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                        scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                    }
                                } else {
                                    scheduleCreationResponse = { success: false, message: "SessionIds allready present so, Please provide new sessionsIds -3" };
                                }
                            } else {
                                const sessionArray = await Promise.all(
                                    chunks[i].map(async user => {
                                        let jsonData;
                                        try {
                                            jsonData = await json.sessionData(user);
                                            const statusMessage = templateResponse.data.statusMessage[0];
                                            jsonData.addons = statusMessage.addons;
                                            jsonData.threshold = statusMessage.threshold;
                                            jsonData.rules = statusMessage.rules;
                                            jsonData.members = statusMessage.members[i];
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
                                        chunks[i][0].url = url;
                                        chunks[i][0].database = database;
                                        chunks[i][0].member = templateResponse.data.statusMessage[0].members[i];
                                        scheduleCreationResponse = await shared_service.scheduleCreation(chunks[i][0]);
                                    }
                                } else {
                                    scheduleCreationResponse = { success: false, message: "Session Insertion Failed -3" };
                                }
                            }
                        } {
                            scheduleCreationResponse = { success: false, message: "Template fetching Error -3" };
                        }
                    } else {
                        scheduleCreationResponse = { success: false, message: "User Insertion Failed -2" };
                    }
                } else {
                    scheduleCreationResponse = { success: false, message: "user creation failed -!" }
                }
            }
        }
        if (scheduleCreationResponse && scheduleCreationResponse.success) {
            return { success: true, message: "Inserted successfully" }
        } else {
            return { success: false, message: scheduleCreationResponse.message }
        }
    } catch (error) {
        if (error) {
            return { success: false, message: error }
        } else {
            return { success: false, message: error }
        }
    }
};
let getface = async (params) => {
    try {
        if(!params?.authorization){
            console.log("Me1 Token========>>>>",params.authorization)
            return { success: false, message: 'Authorization token missing.' }
        }
        var decodeToken = jwt_decode(params.authorization);
        if (decodeToken){
            let url;
            let database;
            let tenantResponse;
            if(decodeToken && decodeToken.tenantId ){
                tenantResponse = await _schedule.getTennant(decodeToken);
                if (tenantResponse && tenantResponse.success){
                    url = tenantResponse.message.connectionString+'/'+tenantResponse.message.databaseName;
                    database = tenantResponse.message.databaseName;
                    decodeToken.tenantResponse = tenantResponse;
                } else {
                    return { success: false, message: tenantResponse.message }
                }
            } else {
                url = process.env.MONGO_URI+'/'+process.env.DATABASENAME;
                database = process.env.DATABASENAME;
            }
            if(tenantResponse && tenantResponse.success){
                params.tenantResponse = tenantResponse;
            }
            let faceResponse = await schedule_Service.getFacePassportResponse(params);
            if (faceResponse && faceResponse.success){
                // let getCount = await schedule_Service.getUserRoomsCount(decodeToken);
                // if ( getCount.message.length >1 ){
                //     params.decodeToken = decodeToken
                //     let getFaceResponse = await schedule_Service.GetFaceInsertionResponse(params);
                //     if(getFaceResponse && getFaceResponse.success){
                //         return { success: true, message: getFaceResponse.message }
                //         // let response = await schedule_Service.getface(decodeToken)
                //         // if (response.success){
                //         //     return { success: true, message: response.message[0] }
                //         // } else {
                //         //     return { success: false, message: response.message }
                //         // }
                //     } else {
                //         return { success: false, message: getFaceResponse.message }
                //     }
                // } else {
                    let jsonData =  {
                        "face" : params.face,
                        "rep" : faceResponse.message[0].metadata.rep,
                        "threshold" : faceResponse.message[0].metadata.threshold,
                        "similar" : faceResponse.message[0].metadata.similar
                    };
                    var getdata = {
                        url: url,
                        database: database,
                        model: "users",
                        docType: 1,
                        query: {
                            filter: { "_id": decodeToken.id },
                            update: { $set: jsonData },
                            projection: {
                                id:"$_id",_id:0,browser:"$browser",os:"$os",platform:"$platform",role:"$role",labels:"$labels",
                                exclude:"$exclude",nickname:"$nickname",provider:"$provider",loggedAt:"$loggedAt",ipaddress:"$ipaddress",
                                useragent:"$useragent",referer:"$referer",createdAt:"$createdAt",similar:"$similar",face:"$face",
                                username:"$_id",
                            }
                        }
                    };
                    let responseData = await invoke.makeHttpCall_userDataService("post", "findOneAndUpdate", getdata);
                    // console.log('before response ',responseData.data)
                    if (responseData && responseData.data.statusMessage ) {
                        return { success: true, message: responseData.data.statusMessage }
                        // console.log('after response',responseData.data)
                        // console.log('before calling getface',decodeToken)
                        // let response = await schedule_Service.getface(decodeToken)
                        // console.log('response before........................',response)
                        // if (response.success){
                        //     // console.log('response after........................',response)
                        //     return { success: true, message: response.message[0] }
                        // }
                    } else {
                        return { success: false, message: 'Data Not Found' }
                    }
                // }
            } else {
                return { success: false, message: faceResponse.message }
            }
            
        } else {
            return { success: false, message: 'Invalid Token Error' }
        }
    } catch (error) {
        console.log("putme1 Error Body========>>>>",JSON.stringify(params))
            console.log(error,"putme1====>>>>putme1")
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};
let getPassport = async (params) => {
    try {
        if(!params?.authorization){
            console.log("Me2 Token========>>>>",params.authorization)
            return { success: false, message: 'Authorization token missing.' }
        }
        var decodeToken = jwt_decode(params.authorization);
        if (decodeToken){
            let url;
            let database;
            let tenantResponse;
            if(decodeToken && decodeToken.tenantId ){
                tenantResponse = await _schedule.getTennant(decodeToken);
                if (tenantResponse && tenantResponse.success){
                    url = tenantResponse.message.connectionString+'/'+tenantResponse.message.databaseName;
                    database = tenantResponse.message.databaseName;
                    decodeToken.tenantResponse = tenantResponse;
                    params.tenantResponse = tenantResponse;
                } else {
                    return { success: false, message: tenantResponse.message }
                }
            } else {
                url = process.env.MONGO_URI+'/'+process.env.DATABASENAME;
                database = process.env.DATABASENAME;
            }
            let getCount = await schedule_Service.getUserRoomsCount(decodeToken);
            // if ( getCount.message.length>1 ){
            //     let getPassportResponse = await schedule_Service.GetPassportInsertionResponse(params);
            //     if(getPassportResponse && getPassportResponse.success){
            //         return { success: true, message: getPassportResponse.message }
            //         // let response = await schedule_Service.getPassport(decodeToken)
            //         // if (response.success){
            //         //     return { success: true, message: response.message[0] }
            //         // } else {
            //         //     return { success: false, message: response.message }
            //         // }
            //     } else {
            //         return { success: false, message: getPassportResponse.message }
            //     }
            // } else {
                let jsonData =  {
                    "passport" : params.passport,
                };
                var getdata = {
                    url: url,
                    database: database,
                    model: "users",
                    docType: 1,
                    query: {
                        filter: { "_id": decodeToken.id },
                        update: { $set: jsonData },
                        projection: {
                            id:"$_id",_id:0,browser:"$browser",os:"$os",platform:"$platform",role:"$role",labels:"$labels",
                            exclude:"$exclude",nickname:"$nickname",provider:"$provider",loggedAt:"$loggedAt",ipaddress:"$ipaddress",
                            useragent:"$useragent",referer:"$referer",createdAt:"$createdAt",similar:"$similar",face:"$face",
                            username:"$_id",passport:"$passport",verified:"$verified"
                        }
                    }
                };
                let responseData = await invoke.makeHttpCall_userDataService("post", "findOneAndUpdate", getdata);
                if (responseData && responseData.data.statusMessage) {
                    return { success: true, message: responseData.data.statusMessage }
                    // let response = await schedule_Service.getPassport(decodeToken)
                    // if (response.success){
                    //     return { success: true, message: response.message[0] }
                    // }
                } else {
                    return { success: false, message: 'Data Not Found' }
                }
            // }
        } else {
            return { success: false, message: 'Invalid Token Error' }
        }
    } catch (error) {
        console.log("putme2 Error Body========>>>>",JSON.stringify(params))
        console.log(error,"putme2====>>>>>>")
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};

function chunkArray(array, chunkSize) {
    const results = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        results.push(array.slice(i, i + chunkSize));
    }
    return results;
}
module.exports = {
    tokenValidation,
    validateToken,
    getConnections,
    getScheduleInfo,
    getface,
    getPassport

}