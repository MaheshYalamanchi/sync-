const invoke = require("../../lib/http/invoke");
const globalMsg = require('../../configuration/messages/message');
const shared_Service = require("./shared.service");
const fs = require('fs');
const path = require('path');

let getRoomDetails = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 1,
            query: [
                {$match:{_id: params.query.id}}
        ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
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

// let tenantResponse = async (params) => {
//     try {
//         // const filePath = path.join(__dirname, 'data.json');
//         const filePath = path.join("/mnt/", 'data.json');
//         if(fs.existsSync(filePath)) {
//             let fsReadResponse = await fsRead(filePath)
//             if(fsReadResponse && fsReadResponse.success){
//                 let JsonData = JSON.parse(fsReadResponse.message);
//                 let message;
//                 JsonData.forEach(async element => {
//                     if(element.tenantId == params.tenantId){
//                         message = element;
//                     } 
//                 });
//                 if(message){
//                     return { success: true, message: message }
//                 } else {
//                     if(params.tenantId){
//                         var getdata = {
//                             url: process.env.MONGO_URI+"/masterdb",
//                             database:"masterdb",
//                             model: "tenantuser",
//                             docType: 1,
//                             query:
//                             [
//                                 {$match:{tenantId: params.tenantId}},
//                                 {$lookup:{
//                                     from: 'databasemaster',
//                                     localField: 'tenantId',
//                                     foreignField: 'tenantId',
//                                     as: 'data',
//                                 }},
//                                 { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
//                                 { $project: {_id:0,tenantId:"$tenantId",connectionString:"$data.connectionString",databaseName:"$data.databaseName"}}
//                             ]
//                         };
//                         let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
//                         if (responseData && responseData.data && responseData.data.statusMessage) {
//                             let fsReadResponse = await fsRead(filePath);
//                             if(fsReadResponse && fsReadResponse.success){
//                                 let JsonData = JSON.parse(fsReadResponse.message);
//                                 JsonData.push(responseData.data.statusMessage[0]);
//                                 let fsWriteResponse = await fsWrite(filePath,JsonData);
//                                 if(fsWriteResponse && fsWriteResponse.success){
//                                 return { success: true, message: responseData.data.statusMessage[0] }
//                                 }
//                             }
//                         } else {
//                             return { success: false, message: 'Provide proper tenant params' }
//                         }
//                     }  else {
//                         return { success: false, message: 'Provide proper tenantId' }
//                     }
//                     return { success: false, message: message }
//                 }
//             }
//         } else {
//             if(params.tenantId){
//                 var getdata = {
//                     url: process.env.MONGO_URI+"/masterdb",
//                     database:"masterdb",
//                     model: "tenantuser",
//                     docType: 1,
//                     query:
//                     [
//                         {$match:{tenantId: params.tenantId}},
//                         {$lookup:{
//                             from: 'databasemaster',
//                             localField: 'tenantId',
//                             foreignField: 'tenantId',
//                             as: 'data',
//                          }},
//                          { $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
//                          { $project: {_id:0,tenantId:"$tenantId",connectionString:"$data.connectionString",databaseName:"$data.databaseName"}}
//                     ]
//                 };
//                 let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
//                 if (responseData && responseData.data && responseData.data.statusMessage) {
//                     let jsonData = []
//                     jsonData.push(responseData.data.statusMessage[0])
//                     let fsWriteResponse = await fsWrite(filePath,jsonData);
//                     if(fsWriteResponse && fsWriteResponse.success){
//                         return { success: true, message: responseData.data.statusMessage[0]}
//                     }
//                 } else {
//                     return { success: false, message: 'Provide proper tenant params' };
//                 }
//             }  else {
//                 return { success: false, message: 'Provide proper tenantId' };
//             }
//         }
//     } catch (error) {
//         if (error && error.code == 'ECONNREFUSED') {
//             return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
//         } else {
//             return { success: false, message: error }
//         }
//     }
// };

let getTennant = async(params) => {
    try {
        const filePath = path.join("/mnt/", 'data.json');
        let fsReadResponse = await fsRead(filePath)
        if(fsReadResponse && fsReadResponse.success){
            let JsonData = JSON.parse(fsReadResponse.message);
            let message;
            JsonData.forEach(async element => {
                if(element.tenantId == params.tenantId){
                    message = element;
                } 
            });
            if(message){
                return { success: true, message: message }
            }
        }

    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
}

let fetchTenant = async() => {
    try {
        const filePath = path.join("/mnt/", 'data.json');
        let fsReadResponse = await fsRead(filePath)
        if(fsReadResponse && fsReadResponse.success){
            let JsonData = JSON.parse(fsReadResponse.message);
            return { success: true, message: JsonData }
        } else {
            return { success: false, message: "Data not found" }
        }

    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
}

let fsRead = async (filename) => {
    return new Promise(async (resolve, reject) => {
      try {
        fs.readFile(filename, 'utf8', (err, data) => {
            if(err){
                resolve({ success: false, message: err })
            } else {
                resolve({ success: true, message: data })
            }
        })
      } catch (error) {
        reject({ success: false, message: error })
      }
  
    })
};

let fsWrite = async (filename,fileData) => {
    return new Promise(async (resolve, reject) => {
      try {
        fs.writeFile (filename, JSON.stringify(fileData,null, 2), function(err){
            if(err){
                resolve({ success: false, message: err })
            } else {
                resolve({ success: true, message: "data inserted successfully" })
            }
        })
      } catch (error) {
        reject({ success: false, message: error })
      }
  
    })
};

module.exports = {
    eventInfo,
    updateScore,
    faceInfo,
    attachInsertion,
    getRoomDetails,
    // tenantResponse,
    getTennant,
    fetchTenant
    
}