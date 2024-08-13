const dbc = require('../../db/index')
const shared = require('./shared');
const invoke = require("../../lib/http/invoke");
let csvUpload = async data => {
    try {
      var updatestatus = await dbc.updateorinsert(
        data.data,
        data.model,
        1
      );
      return updatestatus;
    } catch (error) {
      return error;
    }
};
let csvDownload = async data => {
  try {
    var updatestatus = await dbc.exec(
      data,
      data.model,
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
};
let aggregate = async data =>{
  try {
    var updatestatus = await dbc.aggregate(
      data,
      "rooms",
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
}
let dataUpload = async data =>{
  try {

    var updatestatus = await dbc.bulkUpload(
      data,
      "rooms",
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
}
let getSessions = async (params) => {
  try {
      // let fetchTenantResponse = await _schedule.fetchTenant();
      // if(fetchTenantResponse && fetchTenantResponse.success){
      //   console.log("===========>>>>>>1",fetchTenantResponse)
      //     fetchTenantResponse.message.forEach(async element => {
      //         var getdata = {
      //             url: element?.connectionString+'/'+element?.databaseName,
      //             database: element?.databaseName,
      //             model: "rooms",
      //             docType: 1,
      //             query: {
      //                 filter:{ complete: { $ne: !0 }, status: "started", updatedAt: { $lt: new Date(Date.now() - 12e4) } },
      //                 update:{$set:{ status: "paused"}}
      //             }   
      //         };
      //         // let response = await schedule.fetchdata(getdata)
      //         let responseData = await invoke.makeHttpCall_userDataService("post", "updatedataMany", getdata);
      //         if(responseData && responseData.data && responseData.data.statusMessage.nModified>0) {
      //             // let closeconnection = await invoke.makeHttpCall("get", "closeconnection");
      //             // for (const iterator of response.data.statusMessage) {
      //             //     let jsondata = {
      //             //         pausetime : new Date(),
      //             //         room : iterator._id
      //             //     }
      //             //     let reportlog = await invoke.makeHttpCalluserservice("post", "/api/reportlog", jsondata);
      //             // }
      //             return { success: true, message: 'Status updated successfully...' };
      //         } else {
      //             // let closeconnection = await invoke.makeHttpCall("get", "closeconnection");
      //             return { success: false, message: 'Status not updated...' };
      //         }
      //     });
      // } else {
        var getdata = {
          url: process.env.MONGO_URI+'/'+process.env.DATABASENAME,
          database: process.env.DATABASENAME,
          model: "rooms",
          docType: 1,
          query: {
              filter:{ complete: { $ne: !0 }, status: "started", updatedAt: { $lt: new Date(Date.now() - 12e4) } },
              update:{$set:{ status: "paused"}}
          }   
        };
        // let response = await schedule.fetchdata(getdata)
        let responseData = await invoke.makeHttpCall("post", "updatedataMany", getdata);
        if(responseData && responseData.data && responseData.data.statusMessage.nModified>0) {
            // let closeconnection = await invoke.makeHttpCall("get", "closeconnection");
            // for (const iterator of response.data.statusMessage) {
            //     let jsondata = {
            //         pausetime : new Date(),
            //         room : iterator._id
            //     }
            //     let reportlog = await invoke.makeHttpCalluserservice("post", "/api/reportlog", jsondata);
            // }
            return { success: true, message: 'Status updated successfully...' };
        } else {
            // let closeconnection = await invoke.makeHttpCall("get", "closeconnection");
            return { success: false, message: 'Status not updated...' };
        }
      // }
  } catch (error) {
      if (error && error.code == 'ECONNREFUSED') {
          return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
      } else {
          return { success: false, message: error }
      }
  }
};
module.exports = {
  csvUpload,
  aggregate,
  dataUpload,
  csvDownload,
  getSessions
}

