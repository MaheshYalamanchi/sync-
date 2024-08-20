var jwt = require('jsonwebtoken');
var uuid = require('uuid-random');
// const scheduleService = require('../shared/scheduleService');
// const jwt_decode = require('jwt-decode');
// const sharedService = require('../shared/sharedService');
const secret = 'eime6Daeb2xanienojaefoh4';
const invoke = require("../../lib/http/invoke");
const { v4: uuidv4 } = require('uuid');
const scheduleService = require('../schedule/scheduleService');

let generateProctorToken = async (req) => {
    try {
        let user = { "provider": req.data.statusMessage[0].role, "username": req.data.statusMessage[0]._id }
        let tokenArg = {
            id: user.username,
            role: user.provider
        };
        user.proctorToken = jwt.sign(tokenArg, secret, { expiresIn: 5400000 });
        if (user.proctorToken) {
            return user.proctorToken;
        } else {
            return 'Error While Generating Token!';
        }
    } catch (err) {
        return err;
    }
};
let ProctorTokenGeneration = async (req) => {
    try {
        let user = { "id": req.statusMessage[0]._id, "provider": req.statusMessage[0].provider, "role": req.statusMessage[0].role };
        let tokenArg = {
            id: user.id,
            provider: user.provider,
            role: user.role
        };
        user.proctorToken = jwt.sign(tokenArg, secret, { expiresIn: 5400000 });
        if (user.proctorToken) {
            return user.proctorToken;
        } else {
            return 'Error While Generating Token!';
        }
    } catch (err){
        return err;
    }
};
let generateToken = async (req) => {
    try {
        let timeout = typeof req.timeout != 'undefined' ? req.timeout : 90
        let template = typeof req.template != 'undefined' ? req.template : "default"
        let user = {"assessmentId": req.assessmentId,"username": req.username,"nickname": req.nickname, "template": template,"subject":req.subject,"timeout":timeout,tenantId: req.tenantId}
        if (!req.roomId){
            user.id = uuid()
        }else{
            user.id = req.roomId
        }
        user.tags = [req.nickname,req.assessmentId, req.taskId];
        user.taskId = req.taskId
        user.nickname = req.nickname.replace(/\s/g, "");
        user.requestType = req.requestType;
        user.videoass=req.videoass
        let tokenArg = {
            nickname : user.nickname,
            id : user.id,
            tags : user.tags,
            username : user.username,
            template : user.template,
            subject : user.subject,
            timeout : user.timeout,
            videoass : user.videoass,
            tenantId: user.tenantId
        };
        user.proctorToken = jwt.sign(tokenArg, secret, { expiresIn: 5400000 });
        if (user.proctorToken){
            const data = {
                "assessmentId": user.assessmentId,
                "exp": req.exp,
                "iat": req.iat,
                "id": user.id,
                "nickname": user.nickname,
                "subject": user.subject,
                "taskId": user.taskId,
                "template": user.template,
                "timeout": user.timeout,
                "tags": user.tags,
                "username": user.username,
                "proctorToken": user.proctorToken,
                "requestType": user.requestType,
                "videoass": user.videoass,
                "tenantId": user.tenantId
            }
            const decodedToken = jwt.verify(user.proctorToken,secret);
            decodedToken.testId = req?.testId || null;
            decodedToken.scheduleId = req?.scheduleId || null;
            let userResponse = await scheduleService.userFetch(decodedToken);
            if(userResponse&&userResponse.success){
                decodedToken.role = userResponse.message[0].role;
                decodedToken.provider = userResponse.message[0].provider;
                let responseData = await scheduleService.roomInsertion(decodedToken);
            }else {
                let response = await scheduleService.userInsertion(decodedToken);
                if (response && response.success){
                    decodedToken.role = response.message.role;
                    decodedToken.provider = response.message.provider;
                    let responseData = await scheduleService.roomInsertion(decodedToken);
                }
            }
            return { success: true, message: "Proctor Token",ProctorToken:user.proctorToken ,data:data};
        }else{
            return {success: false, message:'Error While Generating Token!'};
        }
    } catch (err) {
        console.log(err,"geenrateToken2===>>>>")
        return {success:false,message:err};
    }
};
let generateToken1 = async (req) => {
    try {
        var postdata = {
        url:process.env.MONGO_URI,
        database: "proctor",
        model: "log",
        docType: 0,
        query: req
        };
        let responseData = await invoke.makeHttpCall("post", "write", postdata);
    } catch (err) {
        return {success:false,message:err};
    }
};
let jwtToken = async (req) => {
    try {
        console.log("tokenrequest",JSON.stringify(req))
        let username = req.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_');
        let user = { "provider": req.provider, "id": username ,"role": req.role,"room": req.id,"nickname": req.nickname,"tenantId": req.tenantId}
        let tokenArg = {
            id: user.id,
            provider: user.provider,
            role : user.role,
            room : user.room,
            nickname: user.nickname,
            tenantId: user.tenantId
        };
        user.proctorToken = jwt.sign(tokenArg, secret, { expiresIn: 5400000 });
        if (user.proctorToken) {
            return user.proctorToken;
        } else {
            return {success: false, message:'Error While Generating Token!'};
        }
    } catch (err) {
        return {success:false,message:err};
    }
};
let checkToken = async (req) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 1,
            query:[
              { $match:{ "_id":"check"}}
            ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data.statusMessage && responseData.data.statusMessage) {
            let user = { "id": uuidv4(), "role": "student" ,"room":responseData.data.statusMessage[0]._id}
            let tokenArg = {
                id: user.id,
                role : user.role,
                room : user.room
            };
            user.proctorToken = jwt.sign(tokenArg, secret);
            if (user.proctorToken) {
                return user.proctorToken;
            } else {
                return {success: false, message:'Error While Generating Token!'};
            }
        }else{
            return {success: false, message:'Data not found...'};
        }
    } catch (err) {
        return {success:false,message:err};
    }
};
let authCheckToken = async (req) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 1,
            query:[
              { $match:{ "_id":req.room}}
            ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data.statusMessage && responseData.data.statusMessage) {
            let user = { "id": uuidv4(), "role": "student" ,"room":responseData.data.statusMessage[0]._id}
            let tokenArg = {
                id: user.id,
                role : user.role,
                room : user.room
            };
            user.proctorToken = jwt.sign(tokenArg, secret,{ expiresIn: 5400000 });
            if (user.proctorToken) {
                return user.proctorToken;
            } else {
                return {success: false, message:'Error While Generating Token!'};
            }
        }else{
            return {success: false, message:'Data not found...'};
        }
    } catch (err) {
        return {success:false,message:err};
    }
};

module.exports = {
    generateProctorToken,
    ProctorTokenGeneration,
    generateToken,
    generateToken1,
    jwtToken,
    checkToken,
    authCheckToken
}