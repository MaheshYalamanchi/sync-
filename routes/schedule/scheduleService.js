const invoke = require("../../lib/http/invoke");
const globalMsg = require('../../configuration/messages/message');
const schedule = require("./schedule")
const json = require('../json');
// function getOperatingSystemInfo(browser) {
//     try{
//         const userAgent = browser;
//         let osName = 'Unknown';
//         let osVersion = 'Unknown';
      
//         // Check for Windows
//         if (userAgent.indexOf('Win') !== -1) {
//           osName = 'Windows';
//           if (userAgent.indexOf('Windows NT 10.0') !== -1) osVersion = 'Windows 10';
//           else if (userAgent.indexOf('Windows NT 6.3') !== -1) osVersion = 'Windows 8.1';
//           else if (userAgent.indexOf('Windows NT 6.2') !== -1) osVersion = 'Windows 8';
//           else if (userAgent.indexOf('Windows NT 6.1') !== -1) osVersion = 'Windows 7';
//           else if (userAgent.indexOf('Windows NT 6.0') !== -1) osVersion = 'Windows Vista';
//           else if (userAgent.indexOf('Windows NT 5.1') !== -1) osVersion = 'Windows XP';
//         }
//         // Check for macOS
//         else if (userAgent.indexOf('Mac') !== -1) {
//           osName = 'macOS';
//           const regex = /Mac OS X (\d+[._]\d+[._]\d+)/;
//           const match = userAgent.match(regex);
//           if (match) osVersion = match[1].replace(/_/g, '.');
//         }
//         // Check for Linux
//         else if (userAgent.indexOf('Linux') !== -1) {
//           osName = 'Linux';
//         }
//         // Check for Android
//         else if (userAgent.indexOf('Android') !== -1) {
//           osName = 'Android';
//           const regex = /Android (\d+[._]\d+)/;
//           const match = userAgent.match(regex);
//           if (match) osVersion = match[1].replace(/_/g, '.');
//         }
//         // Check for iOS
//         else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) {
//           osName = 'iOS';
//           const regex = /OS (\d+[._]\d+[._]\d+)/;
//           const match = userAgent.match(regex);
//           if (match) osVersion = match[1].replace(/_/g, '.');
//         }
      
//         return { name: osName, version: osVersion };
//     }catch(error){
//         console.log(error,'while capturing os')
//     }
//   }
// function getBrowserInfo(userAgent){
//    try {
//     if (userAgent.includes('Firefox/')) {
//         console.log(`Firefox v${userAgent.split('Firefox/')[1]}`)
//         return (`Firefox v${userAgent.split('Firefox/')[1]}`)
//     } else if (userAgent.includes('Edg/')) {
//         console.log(`Edg v${userAgent.split('Edg/')[1]}`)
//         return (`Edg v${userAgent.split('Edg/')[1]}`)
//     } else if (userAgent.includes('Chrome/')) {
//         console.log(`Chrome v${userAgent.split('Chrome/')[1]}`)
//         return (`Chrome v${userAgent.split('Chrome/')[1]}`)
//     } else if (userAgent.includes('Safari/')) {
//         // Safari
//     }
//    } catch (error) {
//     console.log(error,'while capturing browser')
//    }
// }
  
let userInsertion = async (params) => {
    try {
        let username = params.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_')
        let jsonData = {
            "_id" : username,
            // "browser" : {
            //     "name" : params.bowser.browser.name || null,
            //     "version" : params.bowser.browser.version || null
            // },
            // "os" : {
            //     "name" : params.bowser.os.name || null,
            //     "version" : params.bowser.os.version || null,
            //     "versionName" : params.bowser.os.version || null
            // },
            // "platform" : {
            //     "type" : params.bowser.platform.type || null
            // },
            "nickname" : params.nickname || null,
            "provider" : "jwt",
            // "useragent" : params.bowserDetails || null,
            // "referer" : params.headers.referer || null
        }
        var getdata = {
            url: params.url,
			database: params.database,
            model: "users",
            docType: 0,
            query: jsonData
        };
        // console.log(JSON.stringify(jsonData))
        let responseData = await invoke.makeHttpCall_userDataService("post", "insert", getdata);
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

let user_Update = async (params) => {
    try {
        let username = params.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_')
        let jsonData = {
            "browser" : {
                "name" : params.bowser.browser.name,
                "version" : params.bowser.browser.version
            },
            "os" : {
                "name" : params.bowser.os.name,
                "version" : params.bowser.os.version,
                "versionName" : params.bowser.os.version
            },
            "platform" : {
                "type" : params.bowser.platform.type
            },
            "nickname" : params.nickname,
            "provider" : "jwt",
            "useragent" : params.bowserDetails,
            "referer" : params.headers.referer
        }
        var getdata = {
            url: params.url,
			database: params.database,
            model: "users",
            docType: 0,
            query: {
                filter: { "_id": username},
                update: { $set: jsonData }
            }
        };
        let responseData = await invoke.makeHttpCall_userDataService("post", "update", getdata);
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

let userFetch = async (params) => {
    try {
        let username = params.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_');
        var getdata = {
            url: params.url,
			database: params.database,
            model: "users",
            docType: 1,
            query: {_id:username}
            // query:username
        };
        let responseData = await invoke.makeHttpCall_roomDataService("post", "read", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage&&responseData.data.statusMessage.length) {
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
let userUpdate = async (params) => {
    try {
        jsonData = {
            loggedAt : new Date()
        }
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "users",
            docType: 0,
            query:{
                filter: { "_id": params[0]._id },
                update: { $set: jsonData }
            }
        };
        let responseData = await invoke.makeHttpCall_roomDataService("post", "findOneAndUpdate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message: responseData.data.statusMessage}
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
let roomInsertion = async (params) => {
    try {
        var getdata = {
            url: params.url,
			database: params.database,
            model: "rooms",
            docType: 1,
            query:  {_id:params.template}
        };
        let response = await invoke.makeHttpCall_roomDataService("post", "read", getdata);
        if (response && response.data && response.data.statusMessage) {
            let jsonData;
                jsonData = await json.roomsData(params);
                jsonData.addons = response.data.statusMessage[0].addons
                jsonData.threshold = response.data.statusMessage[0].threshold
                jsonData.rules = response.data.statusMessage[0].rules
                jsonData.members = response.data.statusMessage[0].members
                jsonData.metrics = response.data.statusMessage[0].metrics
                jsonData.weights = response.data.statusMessage[0].weights
            var getdata = {
                url: params.url,
			    database: params.database,
                model: "rooms",
                docType: 0,
                query: jsonData
            };
            let responseData = await invoke.makeHttpCall_roomDataService("post", "insert", getdata);
            if (responseData && responseData.data && responseData.data.statusMessage) {
                return { success: true, message:responseData.data.statusMessage}
            } else {
                return { success: false, message: 'Error while inserting roomRecord' };
            }
        } else {
            return { success: false, message: 'Data Not Found while fetching template' };
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};
let roomUpdate = async (params) => {
    try {
        var jsonData = {
            "browser" : {
                "name" : params.bowser.browser.name,
                "version" : params.bowser.browser.version
            },
            "os" : {
                "name" : params.bowser.os.name,
                "version" : params.bowser.os.version,
                "versionName" : params.bowser.os.version
            },
            "platform" : {
                "type" : params.bowser.platform.type
            }
            // "updatedAt" : new Date()
        }
        var getdata = {
            url: params.url,
			database: params.database,
            model: "rooms",
            docType: 0,
            query:{
                filter: { "_id": params.id },
                update: { $set: jsonData }
            }
        };
        let responseData = await invoke.makeHttpCall_roomDataService("post", "update", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage.nModified ) {
            return { success: true, message: responseData.data.statusMessage}
        } else {
            return { success: true, message: 'Data Not Found' };
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};
let chatDetails = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "chats",
            docType: 1,
            query: [
                { $match: { "_id": params.chatId } },
                {
                    "$project":{
                        "_id":1,"type":"$type","room":"$room","user":"$user","createdAt":"$createdAt","metadata":"$metadata","attach":"$attach"
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
let roomFetch = async (params) => {
    try {
        var getdata = {
            url: params.url,
			database: params.database,
            model: "rooms",
            docType: 1,
            query: {_id:params.id}
        };
        let responseData = await invoke.makeHttpCall_roomDataService("post", "read", getdata);
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

let fetchTemplate =async(params)=>{
    try {
        let F = params.template
        data = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 1,
            query: [
                { $match: { _id: F, "status" : "template"} },
                { $project: { weights: 1,metrics:1 } },
            ]
        };
        let result = await invoke.makeHttpCall("post", "aggregate", data)
        if (result && result.data && result.data.statusMessage.length) {
            return { success: true, message: result.data.statusMessage[0] }
        } else {
            return { success: true, message: 'Data Not Found' }
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
}
let errorupdate =async(params)=>{
    try {
        const date = new Date()
        const object = {
            error : params.body,
            "createdAt": date
          }
        data = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 0,
            query: {
                filter: { "_id": params.id },
                update: { 
                    $push: { "errorlog" : object},
                    $set: { error : params.body}
                }
            }
        };
        let result = await invoke.makeHttpCall("post", "update", data)
        if (result && result.data && result.data.statusMessage) {
            return { success: true, message: result.data.statusMessage }
        } else {
            return { success: true, message: 'Data Not Found'  }
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
}
module.exports = {
    userInsertion,
    userFetch,
    userUpdate,
    roomInsertion,
    roomUpdate,
    chatDetails,
    roomFetch,
    errorupdate,
    user_Update
}