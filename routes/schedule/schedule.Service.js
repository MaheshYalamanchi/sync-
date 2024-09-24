const invoke = require("../../lib/http/invoke");
const globalMsg = require('../../configuration/messages/message');;
const jwt_decode = require('jwt-decode');
const scheduleService = require('../schedule/scheduleService');
const schedule = require('./schedule');
var ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
let getChatDetails = async (params) => {
    decodeToken = jwt_decode(params.body.authorization)
    try {
        let userResponse = await scheduleService.chatDetails(params.params);
        if (userResponse && userResponse.success){
            var getdata = {
                url:process.env.MONGO_URI,
                database:"proctor",
                model: "chats",
                docType: 0,
                query:{
                    filter: { "_id": userResponse.message[0]._id },
                    update: { $push:{attach: params.body.body.attach[0] }}
                }
            };
            let responseData = await invoke.makeHttpCall("post", "update", getdata);
            if (responseData && responseData.data && responseData.data.statusMessage.nModified) {
                    userResponse.message[0].attach = params.body.body.attach
                    userResponse.message[0].id = userResponse.message[0]._id
                    delete userResponse.message[0]._id
                    return { success: true, message:userResponse.message[0]}
            } else {
                return { success: false, message: 'Data Not Found' };
            }
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};

let getface = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "users",
            docType: 1,
            query:[
                {
                    $match: { _id:params.id}
                },
                {
                    $project :{
                        id:"$_id",_id:0,browser:"$browser",os:"$os",platform:"$platform",role:"$role",labels:"$labels",
                        exclude:"$exclude",nickname:"$nickname",provider:"$provider",loggedAt:"$loggedAt",ipaddress:"$ipaddress",
                        useragent:"$useragent",referer:"$referer",createdAt:"$createdAt",similar:"$similar",face:"$face",
                        username:"$_id",
                    }
                }
            ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
                return { success: true, message:responseData.data.statusMessage}
        } else {
            return { success: false, message: 'Data Not Found' };
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};
let getPassport = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "users",
            docType: 1,
            query:[
                {
                    $match: { _id:params.id}
                },
                {
                    $project :{
                        id:"$_id",_id:0,browser:"$browser",os:"$os",platform:"$platform",role:"$role",labels:"$labels",
                        exclude:"$exclude",nickname:"$nickname",provider:"$provider",loggedAt:"$loggedAt",ipaddress:"$ipaddress",
                        useragent:"$useragent",referer:"$referer",createdAt:"$createdAt",similar:"$similar",face:"$face",
                        username:"$_id",passport:"$passport",verified:"$verified"
                    }
                }
            ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
                return { success: true, message:responseData.data.statusMessage}
        } else {
            return { success: false, message: 'Data Not Found' };
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};
let getFacePassportResponse = async (params) => {
    try {
        let url;
        let database;
        // if(params && params.tenantResponse && params.tenantResponse.success){
        //     url = params.tenantResponse.message.connectionString+'/'+params.tenantResponse.message.databaseName;
        //     database = params.tenantResponse.message.databaseName;
        // } else {
            url = process.env.MONGO_URI+'/'+process.env.DATABASENAME;
            database = process.env.DATABASENAME;
        // }
        var getdata = {
            url: url,
			database: database,
            model: "attaches",
            docType: 1,
            query: {_id:params.face}
        };
        let responseData = await invoke.makeHttpCall("post", "read", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage.length) {
                return { success: true, message:responseData.data.statusMessage[0]}
        } else {
            return { success: false, message: 'Data Not Found' };
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};

let getUserRoomsCount = async (params) => {
    try {
        let url;
        let database;
        // if(params && params.tenantResponse && params.tenantResponse.success){
        //     url = params.tenantResponse.message.connectionString+'/'+params.tenantResponse.message.databaseName;
        //     database = params.tenantResponse.message.databaseName;
        // } else {
            url = process.env.MONGO_URI+'/'+process.env.DATABASENAME;
            database = process.env.DATABASENAME;
        // }
        var getdata = {
            url: url,
			database: database,
            model: "rooms",
            docType: 1,
            query:{ student: params.id }
        };
        let responseData = await invoke.makeHttpCall_userDataService("post", "read", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message: responseData.data.statusMessage }
        } else {
            return { success: false, message: 'Data Not Found' }
        }
    }
    catch (error) {
      if (error && error.code == 'ECONNREFUSED') {
        return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
      } else {
        return { success: false, message: error }
      }
    }
};
let GetFaceInsertionResponse = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database: "proctor",
            model: "users",
            docType: 0,
            query:{
                filter: { "_id": decodeToken.id },
                update: { $set: {"faceArray":[{"face": params}]} }
            }
        };
        let responseData = await invoke.makeHttpCall("post", "update", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage && responseData.data.statusMessage.nModified>0) {
            return { success: true, message: "record updated successfully" }
        } else {
            return { success: false, message: 'record updation failed' }
        }
    }
    catch (error) {
      if (error && error.code == 'ECONNREFUSED') {
        return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
      } else {
        return { success: false, message: error }
      }
    }
};
let GetPassportInsertionResponse = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database: "proctor",
            model: "users",
            docType: 0,
            query:{
                filter: { "_id": decodeToken.id },
                update: { $set: {"passportArray":[{"passport": params}]} }
            }
        };
        let responseData = await invoke.makeHttpCall("post", "update", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage && responseData.data.statusMessage.nModified>0) {
            return { success: true, message: "record updated successfully" }
        } else {
            return { success: false, message: 'record updation failed' }
        }
    }
    catch (error) {
      if (error && error.code == 'ECONNREFUSED') {
        return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
      } else {
        return { success: false, message: error }
      }
    }
};
module.exports = {
    getChatDetails,
    getface,
    getPassport,
    getFacePassportResponse,
    getUserRoomsCount,
    GetFaceInsertionResponse,
    GetPassportInsertionResponse
}