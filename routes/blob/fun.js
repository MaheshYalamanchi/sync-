const { param } = require('../../app');
// const dbc = require('../../db/index')
const invoke = require("../../lib/http/invoke");
const { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions } = require("@azure/storage-blob");
//userbackup
let backup = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query',  "{\"createdAt\":{\"$lte\":ISODate('2022-02-28T00:00:00.000Z')}}" , '--collection', 'users','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
//rooms backup
let roombackup = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query', "{\"createdAt\":{\"$lte\":\"ISODate(2022-02-28T00:00:00.000Z)\"}}", '--collection', 'rooms','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}

//attaches
let attaches = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query', "{\"createdAt\":{\"$lte\":\"ISODate(2022-02-28T00:00:00.000Z)\"}}", '--collection', 'attaches','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
//chat
let chat = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query', "{\"createdAt\":{\"$lte\":\"ISODate(2022-02-28T00:00:00.000Z)\"}}", '--collection', 'chats','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
//stats
let stats = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query', "{\"createdAt\":{\"$lte\":\"ISODate(2022-02-28T00:00:00.000Z)\"}}", '--collection', 'stats','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
//create tags
let tags = async () => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri',process.env.MONGO_URI,'--query', "{\"createdAt\":{\"$lte\":\"ISODate(2022-02-28T00:00:00.000Z)\"}}", '--collection', 'tags','--out','D:\\dbbackup\\proctorbackuptest'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongodump', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
let store = async (sasToken) => {
    var spawn = require('child_process').spawn;
    return new Promise((resolve, reject) => {
        try {
            var args = ['--uri','mongodb://localhost:27017/proctor','--db','proctor','--drop','D:\\dbbackup\\proctorbackuptest\\proctor'] , 
            mongodump = spawn('D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongorestore', args);
            mongodump.stdout.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stdout: ' + data);
            });
            mongodump.stderr.on('data', function (data) {
                resolve({ success: true, message: data })
                console.log('stderr: ' + data);
            });
            mongodump.on('exit', function (code) {
                resolve({ success: false, message: code })
                console.log('mongodump exited with code ' + code);
            });          
        } catch (error) {
            console.log(error)
            resolve({ success: false, message: error.message })
        }
    })
}
//fetch record
let fetchUserWiserRooms=async()=>{
    try {
        var aggregateData = await dbc.aggregate(
            [
                {
                    $lookup:{
                        from:"rooms",
                        localField:"_id",
                        foreignField:"student",
                        as:"rooms"
                    }
                }
            ],
            "users"
          );
          if(aggregateData.length){
            return {success:true,message:aggregateData}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return error
    }
}
//find rec
let getAttacheData=async(id)=>{
    try {
        var findAttach = await dbc.findRec(
            {user:id},
            "attaches"
          );
          if(findAttach.length){
            return {success:true,message:findAttach}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return error
    }
}
let moveFileToStorageData=async(params)=>{
    try {
        const account = "proctordevstg";
        const accountKey="jfO0GMc373J47Y9D2RmXPiJMFHivoW1fy/1EQLZb6N7ClXuoJwnzEU19A4WXSudG5Y+1sAtiS6rcCbR0v6HIIA=="

        const accountDest = "lntcoolstorage";
        const accountKeyDest="SpVg/pWZ3amrI7PY0IzwojQUVMrehnrrA3nNUw7YmP1m/f3/rlHduu7iFpU3tWo7IS+8aiA+k+8D+AStNIS0CA=="

        const cert = new StorageSharedKeyCredential(account,accountKey)
        const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        cert
        );

        const certDest = new StorageSharedKeyCredential(accountDest,accountKeyDest)
        const blobServiceClientDest = new BlobServiceClient(
        `https://${accountDest}.blob.core.windows.net`,
        certDest
        );
        
        const sourceContainer=blobServiceClient.getContainerClient("storage")
        const desContainer=blobServiceClientDest.getContainerClient("storage")
        //if the desContainer does not exist, please run the following code
        //await desContainer.create()
        
        //copy blob
        const sourceBlob=sourceContainer.getBlobClient(params);
        // const now = new Date();
        // const expiry = new Date(now.getTime() + 30 * 60000); // Token expires in 30 minutes
        // const permissions = BlobSASPermissions.parse('r');
        //var sasTokenFun=funService.generateToken(sasToken)
        const desBlob=desContainer.getBlobClient(sourceBlob.name)
        const response =await desBlob.beginCopyFromURL(sourceBlob.url+"?sv=2021-12-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-03-21T12:08:11Z&st=2023-03-21T04:08:11Z&spr=https&sig=2mwRt0ZRl13h6g3zvNw4h%2BJFJo45Gnczom7qSSBsZFY%3D");
        const result = (await response.pollUntilDone())
        console.log(result._response.status)
        console.log(result.copyStatus)
        if(result._response.status){
            sourceBlob.deleteIfExists().then(response=>{
                if(response.succeeded){
                  // Blob has been deleted
                  console.log(response,'deleted blob file'+params)
                }else{
                    console.log(error)
                }
              });
            return {success:true,message:'File moved to cool storage successfully. '+params}
        }else{
            return {success:false,message:"Something went wrong please debug. " +params}
        }
    } catch (error) {
        return {success:false,message:'Something went wrong check the log or debug. '+params}
    }
}
let removeRecFromDbData=async(id)=>{
    try {
        var removeAttach = await dbc.removeRec(
            {_id:id},
            "attaches"
          );
          if(removeAttach.deletedCount){
            return {success:true,message:removeAttach}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return {success:false,message:'Something went wrong '}
    }
}
let removeRecFromDbchat=async(userid,roomid)=>{
    try {
        var removeAttach = await dbc.removeRec(
            {user:userid,room:roomid},
            "chats"
          );
          if(removeAttach.deletedCount){
            return {success:true,message:removeAttach}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return {success:false,message:"Something went wrong!"}
    }
}
let removeRecFromDbRoom=async(roomid)=>{
    try {
        var removeAttach = await dbc.removeRecId(
            {_id:roomid},
            "rooms"
          );
          if(removeAttach.deletedCount){
            return {success:true,message:removeAttach}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return {success:false,message:'SomeThing went wrong!'}
    }
}
let removeRecFromDbUser=async(userid)=>{
    try {
        var removeAttach = await dbc.removeRecId(
            {_id:userid},
            "users"
          );
          if(removeAttach.deletedCount){
            return {success:true,message:removeAttach}
          }else{
            return {success:false,message:"There is no record."}
          }
    } catch (error) {
        return {success:false,message:'SomeThing went wrong!'}
    }
}
let getuserdata = async () => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "users",
            docType: 1,
            query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"}, "role" : "student"}
        };
        let responseData = await invoke.makeHttpCall("post", "read", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message: { data: responseData.data.statusMessage} }
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
let getRoomIdData = async (id) => {
    try {
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "users",
            docType: 1,
            query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"}, student:id}
        };
        let responseData = await invoke.makeHttpCall("post", "read", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message: { data: responseData.data.statusMessage} }
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
let getAttacheRec = async (skip) => {
    try {
        if(skip==0){
            skip=0
        }else{
            skip=parseInt(skip+"0000")
        }
        var getdata = {
            url:process.env.MONGO_URI,
            database:"proctor",
            model: "attaches",
            docType: 1,
            query:[
                { $addFields: { created_on: { $substr: ["$createdAt", 0, 10] }} },
                {
                    $match:{created_on:{$lte:"2022-02-28"}}
                },
                    {
                        "$project": {
                            "id": "$_id",
                            "user": "$user"
                        }
                    },
                    {
                        "$limit": 100000+skip
                    },
                    {
                        "$skip": skip
                    },
                    {
                        "$group": {
                            "_id": null,
                            "attachArray": {
                                "$push": {
                                    "id": "$id",
                                    "user": "$user"
                                }
                            }
                        }
                    },
                    
                ]
        };
        console.log(JSON.stringify(getdata.query))
        let responseData = await invoke.makeHttpCall("post", "aggregate", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message:  responseData.data.statusMessage}
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
let removeRecFromDB = async (query) => {
    try {
        var getdata = query
        let responseData = await invoke.makeHttpCall("post", "removedoc", getdata);
        if (responseData && responseData.data && responseData.data.statusMessage) {
            return { success: true, message: { data: responseData.data.statusMessage} }
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
let gettotalattachcount=async()=>{
    try {
        return {success:true,message:800}
    } catch (error) {
        return {success:false,message:'Something went wrong'}
    }
}
module.exports = {
    backup,
    store,
    roombackup,
    attaches,
    chat,
    stats,
    tags,
    fetchUserWiserRooms,
    getAttacheData,
    moveFileToStorageData,
    removeRecFromDbData,
    removeRecFromDbchat,
    removeRecFromDbRoom,
    removeRecFromDbUser,
    getuserdata,
    getRoomIdData,
    getAttacheRec,
    removeRecFromDB,
    gettotalattachcount
}