const invoke = require("../../lib/http/invoke");
const globalMsg = require('../../configuration/messages/message');

let fetchdata = async (params) => {
    try {
        var userdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "rooms",
            docType: 1,
            query: params.filter
        }
        let response = await invoke.makeHttpCall("post", "read", userdata);
        if (response) {
            return response;
        } else {
            return "Data Not Found";
        }
    } catch (error) {
        if (error && error.code == 'ECONNREFUSED') {
            return { success: false, message: globalMsg[0].MSG000, status: globalMsg[0].status }
        } else {
            return { success: false, message: error }
        }
    }
};

module.exports = {
    fetchdata
  }