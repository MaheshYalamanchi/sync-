const { remove } = require('lodash');
const { get } = require('request');

module.exports = function (params) {
    var app = params.app;
    var funService=require('./fun')
    var _=require('lodash')
    const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
    app.get('/copyfiletocoolstorage',async(req,res)=>{
       try {
        // Set the connection string and credentials for the source hot storage account
        const hotStorageConnectionString = "DefaultEndpointsProtocol=https;AccountName=proctordevstg;AccountKey=jfO0GMc373J47Y9D2RmXPiJMFHivoW1fy/1EQLZb6N7ClXuoJwnzEU19A4WXSudG5Y+1sAtiS6rcCbR0v6HIIA==;EndpointSuffix=core.windows.net";
        const hotStorageCredential = new StorageSharedKeyCredential("proctordevstg", "jfO0GMc373J47Y9D2RmXPiJMFHivoW1fy/1EQLZb6N7ClXuoJwnzEU19A4WXSudG5Y+1sAtiS6rcCbR0v6HIIA==");

        // Set the connection string and credentials for the target cool storage account
        const coolStorageConnectionString = "DefaultEndpointsProtocol=https;AccountName=lntcoolstorage;AccountKey=SpVg/pWZ3amrI7PY0IzwojQUVMrehnrrA3nNUw7YmP1m/f3/rlHduu7iFpU3tWo7IS+8aiA+k+8D+AStNIS0CA==;EndpointSuffix=core.windows.net";
        const coolStorageCredential = new StorageSharedKeyCredential("lntcoolstorage", "SpVg/pWZ3amrI7PY0IzwojQUVMrehnrrA3nNUw7YmP1m/f3/rlHduu7iFpU3tWo7IS+8aiA+k+8D+AStNIS0CA==");

        // Set the name of the container and the file to be copied
        const containerName = "storage";
        const fileName = "007f15f5b510c1d9cc6de6200";
        //https://proctordevstg.blob.core.windows.net/storage/007f15f5b510c1d9cc6de6200

        // Create a BlobServiceClient instance for both hot and cool storage
        //const hotBlobServiceClient = new BlobServiceClient(hotStorageConnectionString, hotStorageCredential);
        const hotBlobServiceClient = new BlobServiceClient(`https://proctordevstg.blob.core.windows.net`,hotStorageCredential);
        const coolBlobServiceClient = new BlobServiceClient(`https://lntcoolstorage.blob.core.windows.net`, coolStorageCredential);

        // Get a reference to the source blob and its properties
        const sourceBlobClient = hotBlobServiceClient.getContainerClient(containerName);
        const sourceBlobProperties = await sourceBlobClient.getProperties();

        // Check if the blob is hot or not
        // if (sourceBlobProperties.accessTier === "Hot") {
        console.log(`Blob '${fileName}' is hot, copying to cool storage...`);
        const desContainer = coolBlobServiceClient.getContainerClient(containerName);
          //copy blob
        const sourceBlob=sourceBlobClient.getBlobClient(fileName);
        const desBlob=desContainer.getBlobClient(sourceBlob.name)
        const response =await desBlob.beginCopyFromURL(sourceBlob.url);
        const result = (await response.pollUntilDone())
        console.log(result._response.status)
        console.log(result.copyStatus)
        
        /*// Create a reference to the target cool blob
        const targetBlobClient = coolBlobServiceClient.getContainerClient(containerName).getBlobClient(fileName);

        // Start the copy operation from source to target blob
        const copyResponse = await targetBlobClient.beginCopyFromURL(sourceBlobClient.url);

        // Wait for the copy operation to complete
        await copyResponse.pollUntilDone();*/

        console.log(`Blob '${fileName}' copied successfully to cool storage.`);
        //}
        //  else {
        // console.log(`Blob '${fileName}' is not hot, no action required.`);
        // }
       } catch (error) {
           res.send({success:false,message:error})
       }
        
    })
    //working one.
    app.get('/copy',async(req,res)=>{
        try {
            let getcount=await funService.gettotalattachcount()
            for(var i=10;i<=getcount.message;i++){
                console.log(i)
                var j=0;
                app.logger.info({ success: true, message: 'iterator i ...',data:i });
                let getAttach=await funService.getAttacheRec(i)
                if(getAttach&&getAttach.success){
                    for (const iterator of getAttach.message[0].attachArray) {
                        app.logger.info({ success: true, message: 'started...',data:iterator,'file loop':j, "parent loop":i});
                        let moveFileToStorage=await funService.moveFileToStorageData(iterator.id)
                        if(moveFileToStorage&&moveFileToStorage.success){
                            app.logger.info({ success: true, message: 'processing...',data:moveFileToStorage });
                        }else{
                            console.log('not available..',j)
                            app.logger.error({ success: false, message: 'processing...',data:moveFileToStorage });
                        }
                        j++;
                    }
                    app.logger.info({ success: true, message:i+ ' lakh data completed' });
                }else{
                    res.send( {success:false,message:'Something went wrong.'})
                    app.logger.error({ success: false, message: 'processing...failed or no data',data:getAttach });
                }
            }
            res.send( {success:true,message:'Completed'})
            // let moveFileToStorage=await funService.moveFileToStorageData('007f15f5b510c1d9cc6de6200')
            // if(moveFileToStorage&&moveFileToStorage.success){
            //     app.logger.info({ success: true, message: 'processing...',data:moveFileToStorage });
            // }else{
            //     app.logger.error({ success: false, message: 'processing...',data:moveFileToStorage });
            // }
            
           /* //call db backup
            var dbBackup=await funService.backup()
            var roomBackup=await funService.roombackup()
            var attachBackup=await funService.attaches()
            var chatBackup=await funService.chat()
            var statsBackup=await funService.stats()
            var tagBackup=await funService.tags()
            //store in local
            var storedb=await funService.store()
            
           let fetchUserWiserRoomsData=await funService.fetchUserWiserRooms()
           if(fetchUserWiserRoomsData&&fetchUserWiserRoomsData.success){
                var chunkUser=_.chunk(fetchUserWiserRoomsData.message,100)
                for (const iterator of chunkUser) {
                    for (const rooms of iterator) {
                        if(rooms.rooms.length){
                            let getAttache=await funService.getAttacheData(rooms._id)
                            if(getAttache&&getAttache.success){
                                for (const moveattach of getAttache.message) {
                                    let moveFileToStorage=await funService.moveFileToStorageData(moveattach._id.toString())
                                    console.log(moveFileToStorage)
                                    if(moveFileToStorage&&moveFileToStorage.success){
                                        var removeRecFromAttach=await funService.removeRecFromDbData(moveattach._id.toString())
                                        var removeRecFromChat=await funService.removeRecFromDbchat(moveattach.user,rooms._id)
                                        var removeRecFromRoom=await funService.removeRecFromDbRoom(rooms._id)
                                        var removeRecFromUser=await funService.removeRecFromDbRoom(rooms.student)
                                        console.log(removeRecFromDb)
                                    }
                                }
                                
                            }
                        }
                    }
                }
                res.send({success:true,message:"All file moved to cool storage"})
           }
          */
        } catch (error) {
            res.send( {success:false,message:error})
        }
    })
    app.get('/copydata',async(req,res)=>{
        try {
            const axios = require('axios');
            const AzureStorage=require("@azure/storage-blob");
            const sourceAccountName = 'proctordevstg';
            const sourceAccountKey = 'jfO0GMc373J47Y9D2RmXPiJMFHivoW1fy/1EQLZb6N7ClXuoJwnzEU19A4WXSudG5Y+1sAtiS6rcCbR0v6HIIA==';
            const sourceContainer = 'storage';
            const sourceBlob = '007f15f5b510c1d9cc6de6200';

            const targetAccountName = 'lntcoolstorage';
            const targetAccountKey = 'SpVg/pWZ3amrI7PY0IzwojQUVMrehnrrA3nNUw7YmP1m/f3/rlHduu7iFpU3tWo7IS+8aiA+k+8D+AStNIS0CA==';
            const targetContainer = 'storage';
            const targetBlob = '007f15f5b510c1d9cc6de6200';


            // Generate SAS token for the source blob
            const sourceBlobUrl = `https://${sourceAccountName}.blob.core.windows.net/${sourceContainer}/${sourceBlob}`;
            const destinationBlobUrl=`https://lntcoolstorage.blob.core.windows.net/${sourceContainer}/${sourceBlob}`;

            const now = new Date();
            const expiry = new Date(now.getTime() + 30 * 60000); // Token expires in 30 minutes
            const sas = getBlobSas(sourceAccountName, sourceAccountKey, sourceContainer, sourceBlob, expiry);
            const sasT = getBlobSas(targetAccountName, targetAccountKey, targetContainer, targetBlob, expiry);
            sas.then((sas_) => {
                var token=sas_.split("?")[1]
                console.log(token)
                            // Copy the source blob to the target container in the target storage account
                            const targetBlobUrl = `https://${targetAccountName}.blob.core.windows.net/${targetContainer}/${targetBlob}`;
                            const headers = {
              
                            'x-ms-copy-source': `${sourceBlobUrl}?${token}`,
                            "x-ms-date": new Date().toUTCString(),
                            "x-ms-version": "2022-02-14",
                            "x-ms-copy-destination": destinationBlobUrl + '?sv=2021-06-08&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2023-03-04T19:55:57Z&st=2023-03-04T11:55:57Z&spr=https&sig=XD%2B2T%2BzTCEBm5nRkNKcjI%2FyMc2MaknjcFdgqCRix7nI%3D',
                            };
                            axios.put(targetBlobUrl, null, { headers })
                            .then(() => {
                                console.log('Blob copied successfully');
                            })
                            .catch((err) => {
                                console.error(err);
                            });
            });


            // Function to generate a SAS token for the source blob
            function getBlobSas(accountName, accountKey, containerName, blobName, expiry) {
            const blobService = AzureStorage.BlobServiceClient.fromConnectionString(
                `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
            );
            const containerClient = blobService.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobName);
            const permissions = AzureStorage.BlobSASPermissions.parse('r');
            const sasToken = blobClient.generateSasUrl({
                expiresOn: expiry,
                permissions
            });
            console.log(sasToken)
          
              
            return sasToken
            }

        } catch (error) {
            return {success:false,message:"something went wrong."}
        }
    })
    app.get('/copyrecord',async(req,res)=>{
        try {
            var i=0;
            let getuser=await funService.getuserdata()
            if(getuser&&getuser.success){
                for (const iterator of getuser.message.data) {
                    app.logger.info({ success: true, message: 'processing... user collection',data:iterator });
                    let getAttach=await funService.getAttacheRec(iterator._id)
                    if(getAttach&&getAttach.success){
                        for (const iteratorFile of getAttach.message.data) {
                            app.logger.info({ success: true, message: 'get and process attachs collection..',data:iteratorFile });
                            let moveFileToStorage=await funService.moveFileToStorageData(iteratorFile._id.toString())
                            if(moveFileToStorage&&moveFileToStorage.success){
                                app.logger.info({ success: true, message: 'file transfered success',data:moveFileToStorage });
                                let removeRecrodAttach=await funService.removeRecFromDB({url:process.env.MONGO_URI,database:"proctor",model: "attaches",docType: 0,query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"}, "user" : iteratorFile._id.toString()}})
                                if(removeRecrodAttach&&removeRecrodAttach.success){
                                    app.logger.info({ success: true, message: 'Record deleted from attaches collection successfully.',data:removeRecrodAttach });
                                }else{
                                    app.logger.error({ success: false, message: 'Record deleted from attaches collection failed.',data:removeRecrodAttach });
                                }
                            }else{                                
                                app.logger.error({success:false,message:"file transfered failed",data:moveFileToStorage})
                            }
                        }
                        //get room dtl
                        let getRoom=await funService.getRoomIdData(iterator._id)
                        if(getRoom&&getRoom.success){
                            for (const iteratorRoom of getRoom.message) {
                                app.logger.info({ success: true, message: 'processing.. rooms',data:getRoom });
                                //remove chat
                                let removeRecrodChat=await funService.removeRecFromDB({url:process.env.MONGO_URI,database:"proctor",model: "chats",docType: 0,query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"}, "user" : iterator._id,room:iteratorRoom._id}})
                                if(removeRecrodChat&&removeRecrodChat.success){
                                    app.logger.info({ success: true, message: 'Record deleted from chats collection ',data:removeRecrodChat });
                                    let removeRecrodRoom=await funService.removeRecFromDB({url:process.env.MONGO_URI,database:"proctor",model: "rooms",docType: 0,query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"},room:iteratorRoom._id}})
                                    if(removeRecrodRoom&&removeRecrodRoom.success){
                                        app.logger.info({ success: true, message: 'Record deleted from rooms collection ',data:removeRecrodRoom });
                                        let removeRecrodUser=await funService.removeRecFromDB({url:process.env.MONGO_URI,database:"proctor",model: "users",docType: 0,query: {createdAt:{$lt:"2022-02-28T12:00:00.000Z"},room:iterator._id}})
                                        if(removeRecrodUser&&removeRecrodUser.success){
                                            app.logger.info({ success: true, message: 'Record deleted from rooms collection ',data:removeRecrodUser });
                                        }else{
                                            app.logger.error({ success: false, message: 'Record deleted from users collection is failed',data:removeRecrodChat });
                                        }
                                    }else{
                                        app.logger.error({ success: false, message: 'Record deleted from rooms collection is failed',data:removeRecrodChat });
                                    }
                                }else{
                                    app.logger.error({ success: false, message: 'Record deleted from chats collection is failed',data:removeRecrodChat });
                                }   
                            }
                        }else{
                            app.logger.info({ success: true, message: 'while fetching record from room collection it failed. ',data:getRoom });
                        }
                        
                    }else{
                        app.logger.error({success:false,message:"failed to get attachs record",data:getAttach})
                    }
                    console.log(i,' No. of record.')
                    i++;
                    
                }
                res.send(getuser)
            }else{
                res.send({success:false,message:getuser})
            }
        } catch (error) {
            console.log(error)
        }
    })
}
