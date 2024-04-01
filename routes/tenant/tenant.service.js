const invoke = require("../../lib/http/invoke");
let createtenant = async (params) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI+"/masterdb",
            database:"masterdb",
            model: "tenantuser",
            docType: 0,
            query: params
        };
        let responseData = await invoke.makeHttpCall("post", "write", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage._id) {

        }else{

        }
    } catch (error) {
        return {success:false,message :error}   
    }
}
let createdatabasemaster = async (params) => {
    try {
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


module.exports={
    createtenant,
    createdatabasemaster
}