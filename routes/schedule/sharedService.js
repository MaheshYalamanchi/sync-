
var jwt = require('jsonwebtoken');
const TOKEN_KEY ="eime6Daeb2xanienojaefoh4";
const tokenService = require('../../routes/proctorToken/tokenService');
const scheduleService = require('../schedule/scheduleService');
const _ = require('lodash');

let tokenValidation = async(params)=> {
    try {
        console.log(params.body,'body....................jwt')
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
            let username = decodedToken.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_');
            if(decodedToken){
                let userResponse = await scheduleService.userFetch(decodedToken);
                var responseData ;				
                if (userResponse&&userResponse.message&&(userResponse.message.length>0) &&(userResponse.message[0]._id == username)){
                        let response = await scheduleService.userUpdate(userResponse.message[0]);
                        if (response && response.success){
                            let roomsResponse = await scheduleService.roomFetch(decodedToken);
                            if (roomsResponse && roomsResponse.success && (roomsResponse.message.length>0) && (roomsResponse.message[0]._id == decodedToken.id)){
                                responseData = await scheduleService.roomUpdate(decodedToken)
                            } else{
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
module.exports = {
    tokenValidation
}