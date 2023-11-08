
var jwt = require('jsonwebtoken');
const TOKEN_KEY ="eime6Daeb2xanienojaefoh4";
const tokenService = require('../../routes/proctorToken/tokenService');
const scheduleService = require('../schedule/scheduleService');
const _ = require('lodash');
var bowser = require("bowser");
const invoke = require("../../lib/http/invoke");
let tokenValidation = async(params)=> {
    try {
        // console.log(params.body,'body....................jwt')
        const token =params.body.authorization.authorization.split(" ");
        if (!token) {
            return {success:false,message:"A token is required for authentication"+token[1]};
        }else{
            const decodedToken = jwt.verify(token[1],TOKEN_KEY);
            if(!decodedToken){
                // console.log(decodedToken,'decodedToken................')
                return {success:false,message:"A token is required for authentication"};
            }
            decodedToken.headers = params.body.authorization;
            let username = decodedToken.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_');
            if(decodedToken){
                console.log('decodedToken 1')
                let userResponse = await scheduleService.userFetch(decodedToken);
                var responseData ;	
                // console.log(userResponse)			
                if (userResponse&&userResponse.message&&(userResponse.message.length>0) &&(userResponse.message[0]._id == username)){
                    console.log('userResponse.message.length 2')
                        let response = await scheduleService.userUpdate(userResponse.message[0]);
                        if (response && response.success){
                            console.log('response.success 3')
                            let roomsResponse = await scheduleService.roomFetch(decodedToken);
                            if (roomsResponse && roomsResponse.success && (roomsResponse.message.length>0) && (roomsResponse.message[0]._id == decodedToken.id)){
                                console.log('roomsResponse.success 4')
                                responseData = await scheduleService.roomUpdate(decodedToken)
                            } else{
                                console.log('roomsResponse.message.length 5')
                                responseData = await scheduleService.roomInsertion(decodedToken);
                            }
                            
                        }
                } else { 
                    let response = await scheduleService.userInsertion(decodedToken);
                    if (response && response.success){
                        responseData = await scheduleService.roomInsertion(decodedToken);
                    } else {
                        return {success:false,message:"user insertion failed..."}
                    }
                }
                if (responseData.success){
                    let getToken = await tokenService.jwtToken(decodedToken);
                    if (getToken) {
                        return{success:true,message:{token:getToken}};
                    }else{
                        return {success:false, message : 'Error While Generating Token!'};
                    }
                }
            }else{
                return {success:false, message : 'Data Not Found'};
            }
        }
    }catch(error){
        console.log('jwtapicallfailed')
        console.log(error,"jwtError2===>>>>")
        if(error){
            return {success:false, message:"TokenExpiredError"}
        }else{
            return {success:false, message:error}
        }
    }
};

let validateToken = async(params)=> {
    try {
        console.log('body........jwt',params.body.authorization.authorization);
        const token =params.body.authorization.authorization.split(" ");
        if (!token) {
            return {success:false,message:"A token is required for authentication"+token[1]};
        }else{
            const decodedToken = jwt.verify(token[1],TOKEN_KEY);
            if(!decodedToken){
                console.log(decodedToken,'decodedToken................')
                return {success:false,message:"A token is required for authentication"};
            }
            decodedToken.headers = params.body.authorization;
            if(decodedToken){
                decodedToken.bowser = bowser.parse(params.body.bowserDetails);
                decodedToken.bowserDetails= params.body.bowserDetails
                let userResponse = await scheduleService.userFetch(decodedToken);
                let responseData;
                if (userResponse && userResponse.success){
                    decodedToken.role = userResponse.message[0].role;
                    decodedToken.provider = userResponse.message[0].provider;
                    if(userResponse&&userResponse.message&&userResponse.message[0].locked !=1){
                        let response = await scheduleService.userUpdate(userResponse.message);
                        if (response && response.success){
                            let roomsResponse = await scheduleService.roomFetch(decodedToken);
                                if (roomsResponse && roomsResponse.success ){
                                    if(roomsResponse.message.status != "stopped"  ){
                                         responseData = await scheduleService.roomUpdate(decodedToken)
                                    }else{
                                        return {success:false, message : 'Data Not Found'};
                                    }
                                } else{
                                    responseData = await scheduleService.roomInsertion(decodedToken);
                                 }
                        } else {
                            console.log("userresponse109======>",response)
                        }
                    }else{
                        return {success:false, message : 'Data Not Found'};
                    }
                } else {
                    let response = await scheduleService.userInsertion(decodedToken);
                    if (response && response.success){
                        decodedToken.role = response.message.role;
                        decodedToken.provider = response.message.provider;
                        responseData = await scheduleService.roomInsertion(decodedToken);
                    } else {
                        return {success:false,message:"user insertion failed..."}
                    }
                }
                console.log("responseData122=====>>>>",responseData)
                if (responseData.success){
                    let getToken = await tokenService.jwtToken(decodedToken);
                    if (getToken) {
                        console.log("fialResponse===>",getToken)
                        return{success:true,message:{token:getToken}};
                    }else{
                        return {success:false, message : 'Error While Generating Token!'};
                    }
                }
            } else{
                return {success:false, message : 'Data Not Found'};
            }
        }
    }catch(error){
        console.log('jwtapicallfailed')
        console.log(error,"jwtError2===>>>>")
        if(error){
            return {success:false, message:"TokenExpiredError"}
        }else{
            return {success:false, message:error}
        }
    }
};
let getConnections = async(params)=> {
    try {
        let closeconnection = await invoke.makeHttpCall_roomDataService("get", "closeconnection");
        if (closeconnection) {
            return {success:true, message: "connection closed"}
        } else {
            return {success:false, message:"connection close error"}
        }
    }catch(error){
        if(error){
            return {success:false, message:"closeConnection error"}
        }else{
            return {success:false, message:error}
        }
    }
};
module.exports = {
    tokenValidation,
    validateToken,
    getConnections

}