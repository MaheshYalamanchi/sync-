let instance = {
  baseURL: process.env.DATA_SERVICE_ENDPOINT,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
};
let AzureService = {
  baseURL: process.env.AZURE_SERVICE_ENDPOINT,
  timeout: 50000000,
  headers: { 
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key":process.env.SUBSCRIPTION_KEY ,
    "Cache-Control":process.env.CACHE_CONTROL
  }
};
let PORTAl = {
  baseURL: process.env.AZURE_PORTAL,
  timeout: 50000000,
  headers: { "Content-Type": "application/x-www-form-urlencoded" }
};
let userservice = {
  baseURL: process.env.USER_SERVICE,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
}

let user_instance = {
  baseURL: process.env.USERS_DATA_SERVICE_ENDPOINT,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
};
let room_instance = {
  baseURL: process.env.ROOMS_DATA_SERVICE_ENDPOINT,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
};
let backend_instance = {
  baseURL: process.env.PROCTOR_BACKEND,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
};
module.exports = {
  instance,
  AzureService,
  PORTAl,
  userservice,
  user_instance,
  room_instance,
  backend_instance
};
