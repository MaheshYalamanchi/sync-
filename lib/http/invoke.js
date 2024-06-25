var httpReq = require("request");
var Config = require("../../configuration");
const qs = require('querystring');
const axiosConfig = require("../../lib/http/axios").instance;
const axiosConfig_userDataService = require("../../lib/http/axios").user_instance;
const axiosConfig_roomDataService = require("../../lib/http/axios").room_instance;
const AzureConfig = require("../../lib/http/axios").AzureService;
const userConfig = require("../../lib/http/axios").userservice;
const portalConfig = require("../../lib/http/axios").PORTAl;
const proctor_backend_Config = require("../../lib/http/axios").backend_instance;
const axios = require("axios");
const { exit } = require("process");
const { post } = require("request");
var qArray = [];
var q = {
  url: "http://localhost:3000/",
  client: "",
  query: {},
  docType: "",
  selector: ""
},
  options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: ""
  };
module.exports = {
  makeHTTPRequest: function (reqOptions, callback, errorCallback) {
    reqOptions.gzip = true;
    reqOptions.timeout = "1200000";
    httpReq = require("request");
    httpReq(reqOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if (body === "") {
          callback({ message: "no result found" });
        } else {
          var info = JSON.parse(body);
          callback(info);
        }
      } else {
        callback({ error: true, message: body != "" ? body : error }, null);
      }
    });
  },
  getSVCPostRequestJSON: function (
    req,
    res,
    cSession,
    url,
    client,
    method,
    selector,
    docType,
    callback,
    svcURL,
    errorCallback
  ) {
    try {
      console.log(req);
      var that = this;
      var requestJSON = [],
        query = cSession;
      var reqQuery = JSON.parse(JSON.stringify(q));
      options.url = svcURL;
      var reqOptions = JSON.parse(JSON.stringify(options));
      reqOptions.url = url;
      reqOptions.body = JSON.stringify(query);
      reqOptions.method = method;

      that.makeHTTPRequest(
        reqOptions,
        function (response) {
          if (!callback) {
            if (!response || response.statusCode !== 200) {
              that.sendErrorResponse(
                res,
                response.statusCode,
                response.statusMessage
              );
            } else {
              that.sendResponse(res, response);
            }
          } else {
            callback(response);
          }
        },
        errorCallback
      );
    } catch (error) {
      logs.log(
        logs.errorLevel.Error,
        "common.getPostRequestJSON : " + url + "\n" + error
      );
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    }
  },
  getPostRequestJSON: function (
    req,
    res,
    cSession,
    url,
    client,
    method,
    selector,
    docType,
    callback,
    svcURL,
    errorCallback
  ) {
    try {
      var that = this;
      var requestJSON = [],
        query = cSession.b;
      if (query.mid && !(query.mid instanceof Array)) {
        if (
          query.mid !== undefined &&
          query.mid !== null &&
          !query.mid._bsontype
        ) {
          query.mid = query.mid.replace(":", "");
        }
        if (
          query._id !== undefined &&
          query._id !== null &&
          !query._id._bsontype
        ) {
          query._id = query._id.replace(":", "");
        }
      }
      var reqQuery = JSON.parse(JSON.stringify(q));
      options.url = svcURL;
      var reqOptions = JSON.parse(JSON.stringify(options));
      (reqQuery.url = cSession.db);
      (reqQuery.client = client);
      (reqQuery.query = query);
      (reqQuery.database = cSession.database);
      (reqQuery.dbsource = cSession.b ? cSession.dbsource : null);
      (reqQuery.store = cSession.store);
      (reqQuery.docType = docType);
      (reqQuery.selector = selector);
      //reqQuery.res = JSON.stringify(res);
      reqOptions.url = url;
      reqOptions.body = JSON.stringify(reqQuery);
      reqOptions.method = method;

      that.makeHTTPRequest(
        reqOptions,
        function (response) {
          if (!callback) {
            if (!response || response.statusCode !== 200) {
              that.sendErrorResponse(
                res,
                response.statusCode,
                response.statusMessage
              );
            } else {
              that.sendResponse(res, response);
            }
          } else {
            callback(response);
          }
        },
        errorCallback
      );
    } catch (error) {
      logs.log(
        logs.errorLevel.Error,
        "common.getPostRequestJSON : " + url + "\n" + error
      );
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    }
  },
  getGetRequestJSON: function (
    req,
    res,
    cSession,
    url,
    client,
    method,
    selector,
    docType,
    callback,
    svcURL,
    errorCallback
  ) {
    try {
      var that = this;
      var requestJSON = [],
        query = cSession.q;
      if (
        query.mid !== undefined &&
        query.mid !== null &&
        !query.mid._bsontype
      ) {
        query.mid = query.mid.replace(":", "");
      }
      if (
        query._id !== undefined &&
        query._id !== null &&
        !query._id._bsontype
      ) {
        query._id = query._id.replace(":", "");
      }
      var reqQuery = JSON.parse(JSON.stringify(q));
      options.url = svcURL;
      var reqOptions = JSON.parse(JSON.stringify(options));
      (reqQuery.url = cSession.db);
      (reqQuery.client = client);
      (reqQuery.database = cSession.database);
      (reqQuery.dbsource = cSession.b ? cSession.b.dbsource : null);
      (reqQuery.query = query);
      (reqQuery.docType = docType);
      (reqQuery.selector = selector);
      reqOptions.url = url;
      reqOptions.body = JSON.stringify(reqQuery);
      reqOptions.method = method;
      that.makeHTTPRequest(
        reqOptions,
        function (data) {
          if (!data || (data.error && res)) {
            res.send(
              JSON.stringify({
                statusCode: 500,
                statusMessage: "Service not running"
              })
            );
          } else {
            callback(data);
          }
        },
        errorCallback
      );
    } catch (error) {
      logs.log(
        logs.errorLevel.Error,
        "common.getGetRequestJSON : " + url + "\n" + error
      );
      if (errorCallback) {
        errorCallback(error);
      } else {
        throw error;
      }
    }
  },
  // Database service call
  makeHttpCall: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.makeGetCall(url);
        break;
      case "post":
        return await this.makePostCall(url, postParam);
        break;
      case "put":
        return await this.makePutCall(url, postParam);
        break;
      case "patch":
        return await this.makePatchCall(url, postParam);
        break;
      case "delete":
        return await this.makeDeleteCall(url);
        break;
    }
  },
  makeGetCall: async function (url) {
    let config = axiosConfig;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  makePostCall: async function (url, postParam) {
    let config = axiosConfig;
    // config["headers"] = {
    //   authorization: postParam.authorization
    // };
    return await axios.post(url, postParam, config);
  },
  makePutCall: async function (url, postParam) {
    let config = axiosConfig;
    return await axios.put(url, postParam, config);
  },
  makePatchCall: async function (url, postParam) {
    let config = axiosConfig;
    return await axios.patch(url, postParam, config);
  },
  makeDeleteCall: async function (url) {
    let config = axiosConfig;
    return await axios.delete(url, config);
  },
  makeHttpCalluserservice: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.userserviceGetCall(url);
        break;
      case "post":
        return await this.userservicePostCall(url, postParam);
        break;
      case "put":
        return await this.userservicePutCall(url, postParam);
        break;
      case "patch":
        return await this.userservicePatchCall(url, postParam);
        break;
      case "delete":
        return await this.userserviceDeleteCall(url);
        break;
    }
  },
  userserviceGetCall: async function (url) {
    let config = userConfig;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  userservicePostCall: async function (url, postParam) {
    let config = userConfig;
    // config["headers"] = {
    //   authorization: postParam.authorization
    // };
    return await axios.post(url, postParam, config);
  },
  userservicePutCall: async function (url, postParam) {
    let config = userConfig;
    return await axios.put(url, postParam, config);
  },
  userservicePatchCall: async function (url, postParam) {
    let config = userConfig;
    return await axios.patch(url, postParam, config);
  },
  userserviceDeleteCall: async function (url) {
    let config = userConfig;
    return await axios.delete(url, config);
  },
  // Azure service call
  makeHttpAzureService: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.AzureServiceGetCall(url,postParam);
        break;
      case "post":
        return await this.AzureServicePostCall(url, postParam);
        break;
      case "put":
        return await this.AzureServicePutCall(url, postParam);
        break;
      case "patch":
        return await this.AzureServicePatchCall(url, postParam);
        break;
      case "delete":
        return await this.AzureServiceDeleteCall(url);
        break;
    }
  },
  AzureServiceGetCall: async function (url,token) {
    let config = AzureConfig;
    if (token){
      config.headers.Authorization=token
    }
    return await axios.get(url, config);
  },
  AzureServicePostCall: async function (url, postParam) {
    let config = AzureConfig;
    return await axios.post(url, postParam, config);
  },
  AzureServicePutCall: async function (url, postParam) {
    let config = AzureConfig;
    return await axios.put(url, postParam, config);
  },
  AzureServicePatchCall: async function (url, postParam) {
    let config = AzureConfig;
    return await axios.patch(url, postParam, config);
  },
  AzureServiceDeleteCall: async function (url) {
    let config = AzureConfig;
    return await axios.delete(url, config);
  },
  //azure portal
  makeHttpCallPortal: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.makePortalGetCall(url);
        break;
      case "post":
        return await this.makePortalPostCall(url, postParam);
        break;
      case "put":
        return await this.makePortalPutCall(url, postParam);
        break;
      case "patch":
        return await this.makePortalPatchCall(url, postParam);
        break;
      case "delete":
        return await this.makePortalDeleteCall(url);
        break;
    }
  },
  makePortalGetCall: async function (url) {
    let config = portalConfig;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  makePortalPostCall: async function (url, postParam) {
    let config = portalConfig;
    return await axios.post(url, postParam, config);
  },
  makePortalPutCall: async function (url, postParam) {
    let config = portalConfig;
    return await axios.put(url, postParam, config);
  },
  makePortalPatchCall: async function (url, postParam) {
    let config = portalConfig;
    return await axios.patch(url, postParam, config);
  },
  makePortalDeleteCall: async function (url) {
    let config = portalConfig;
    return await axios.delete(url, config);
  },
  makeHttpCall_userDataService: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.makeGetCall_userDataService(url);
        break;
      case "post":
        return await this.makePostCall_userDataService(url, postParam);
        break;
      case "put":
        return await this.makePutCall_userDataService(url, postParam);
        break;
      case "patch":
        return await this.makePatchCall_userDataService(url, postParam);
        break;
      case "delete":
        return await this.makeDeleteCall_userDataService(url);
        break;
    }
  },
  makeGetCall_userDataService: async function (url) {
    let config = axiosConfig_userDataService;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  makePostCall_userDataService: async function (url, postParam) {
    let config = axiosConfig_userDataService;
    // config["headers"] = {
    //   authorization: postParam.authorization
    // };
    return await axios.post(url, postParam, config);
  },
  makePutCall_userDataService: async function (url, postParam) {
    let config = axiosConfig_userDataService;
    return await axios.put(url, postParam, config);
  },
  makePatchCall_userDataService: async function (url, postParam) {
    let config = axiosConfig_userDataService;
    return await axios.patch(url, postParam, config);
  },
  makeDeleteCal_userDataService: async function (url) {
    let config = axiosConfig_userDataService;
    return await axios.delete(url, config);
  },
  makeHttpCall_roomDataService: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.makeGetCall_roomDataService(url);
        break;
      case "post":
        return await this.makePostCall_roomDataService(url, postParam);
        break;
      case "put":
        return await this.makePutCall_roomDataService(url, postParam);
        break;
      case "patch":
        return await this.makePatchCall_roomDataService(url, postParam);
        break;
      case "delete":
        return await this.makeDeleteCall_roomDataService(url);
        break;
    }
  },
  makeGetCall_roomDataService: async function (url) {
    let config = axiosConfig_roomDataService;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  makePostCall_roomDataService: async function (url, postParam) {
    let config = axiosConfig_roomDataService;
    // config["headers"] = {
    //   authorization: postParam.authorization
    // };
    return await axios.post(url, postParam, config);
  },
  makePutCall_roomDataService: async function (url, postParam) {
    let config = axiosConfig_roomDataService;
    return await axios.put(url, postParam, config);
  },
  makePatchCall_roomDataService: async function (url, postParam) {
    let config = axiosConfig_roomDataService;
    return await axios.patch(url, postParam, config);
  },
  makeDeleteCall_roomDataService: async function (url) {
    let config = axiosConfig_roomDataService;
    return await axios.delete(url, config);
  },
  makeHttpCallProctor_Backend: async function (method, url, postParam) {
    switch (method) {
      case "get":
        return await this.makeGetCallProctor_Backend(url);
        break;
      case "post":
        return await this.makePostCallProctor_Backend(url, postParam);
        break;
      case "put":
        return await this.makePutCallProctor_Backend(url, postParam);
        break;
      case "patch":
        return await this.makePatchCallProctor_Backend(url, postParam);
        break;
      case "delete":
        return await this.makeDeleteCallProctor_Backend(url);
        break;
    }
  },
  makeGetCallProctor_Backend: async function (url) {
    let config = proctor_backend_Config;
    // config["headers"] = {
    //   Authorization: postParam.headers
    // };
    return await axios.get(url, config);
  },
  makePostCallProctor_Backend: async function (url, postParam) {
    let config = proctor_backend_Config;
    // config["headers"] = {
    //   authorization: postParam.authorization
    // };
    return await axios.post(url, postParam, config);
  },
  makePutCallProctor_Backend: async function (url, postParam) {
    let config = proctor_backend_Config;
    return await axios.put(url, postParam, config);
  },
  makePatchCallProctor_Backend: async function (url, postParam) {
    let config = proctor_backend_Config;
    return await axios.patch(url, postParam, config);
  },
  makeDeleteCallProctor_Backend: async function (url) {
    let config = proctor_backend_Config;
    return await axios.delete(url, config);
  },
};
