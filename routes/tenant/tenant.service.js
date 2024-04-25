const invoke = require("../../lib/http/invoke");
const jwt_decode = require('jwt-decode');
let createtenant = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI+"/masterdb",
            database:"masterdb",
            model: "tenantuser",
            docType: 0,
            query: params
        };
        console.log('payload',params)
        let responseData = await invoke.makeHttpCall("post", "write", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage._id) {
            return {success:true,message :'Tenant created successfully.'}   
        }else{
            return {success:false,message :'Tenant creation failed.'}   
        }
    } catch (error) {
        console.log(error)
        if(error&&error.response&&error.response.data&&error.response.data.code&&(error.response.data.code==11000)){
            return {success:false,message:'Tenant id already exists.'}
        }
        return {success:false,message :'error'}   
    }
}
let createdatabasemaster = async (params) => {
    try {
        params.connectionString = process.env.MONGO_URI;
        var getdata = {
            url:process.env.MONGO_URI+"/masterdb",
            database:"masterdb",
            model: "databasemaster",
            docType: 0,
            query: params
        };
        let responseData = await invoke.makeHttpCall("post", "write", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage._id) {
            return{success:true,message:"Database configuration created successfully."}
        }else{
            return{success:false,message:"failed to create database configuration."}
        }
    } catch (error) {
        console.log(error)
        return {success:false,message :error}   
    }
}

let getTenantDtl = async () => {
    try {
        var getdata = {
            url:process.env.MONGO_URI+"/masterdb",
            database:"masterdb",
            model: "tenantuser",
            docType: 1,
            query: {}
        };
        let responseData = await invoke.makeHttpCall("post", "read", getdata);
        console.log(responseData.data.statusMessage)
        if (responseData && responseData.data && responseData.data.statusMessage.length) {
            return {success:true,message:responseData.data.statusMessage}
        }else{
            return{success:false,message:"Failed to fetch data."}
        }
    } catch (error) {
        console.log(error)
        return {success:false,message :error}   
    }
}

let getBranding = async (params) => {
    try {
        let tenantId;
        if(params && params.authorization){
            let  decodeToken = jwt_decode(params.authorization);
            tenantId = decodeToken.tenantId
        } else {
            tenantId = params.tenantId
        }
        var getdata = {
            url:process.env.MONGO_URI+"/masterdb",
            database:"masterdb",
            model: "tenantuser",
            docType: 1,
            query: [
                {$match:{"tenantId": tenantId}},
                {$project:{_id:0,branding:"$branding"}}
            ]
        };
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return {success:true,message : responseData.data.statusMessage}   
        }else{
            return {success:false,message :'Data Not Found'}   
        }
    } catch (error) {
        if(error&&error.response&&error.response.data&&error.response.data.code&&(error.response.data.code==11000)){
            return {success:false,message:'Provide proper tenantId.'}
        }
        return {success:false,message :'error'}   
    }
}

module.exports={
    createtenant,
    createdatabasemaster,
    getTenantDtl,
    getBranding
}