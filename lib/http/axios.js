let instance = {
  baseURL: process.env.DATA_SERVICE_ENDPOINT,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
};
let userservice = {
  baseURL: process.env.USERSERVICE,
  timeout: 50000000,
  headers: { "Content-Type": "application/json" }
}
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

module.exports = {
  instance,
  AzureService,
  PORTAl,
  userservice
};
