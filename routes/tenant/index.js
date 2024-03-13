const messages = require('../../configuration/messages/message');
var tenantService=require('./tenant.service')
const { exec } = require('child_process');
const MongoClient = require('mongodb').MongoClient;
// MongoDB connection URI
const uri = "mongodb+srv://dbimport:dbimport@proctordev.jsoli.mongodb.net";

// Database Name
const dbName = 'edutech_1';
const client = new MongoClient(uri);
module.exports = function (params) {
    var app = params.app;
    app.post('/createtenant', async (req, res, next) => {
        if(req.body){
            let createtenant=await tenantService.createtenant(req.body)
            if(createtenant.success){
                app.http.customResponse(res, { success: true, message: 'Tenant created successfully.' }, 200);
            }else{
                app.http.customResponse(res, { success: false, message: 'There is a problem with tenant creation.' }, 200);
            }
            
        }else{
            app.http.customResponse(res, { success: false, message: 'Please provide required field.' }, 200);
        }
    })
    app.post('/createdatabasemaster', async (req, res, next) => {
        if(req.body){
            let createdatabasemaster=await tenantService.createdatabasemaster(req.body)
            if(createdatabasemaster.success){

                app.http.customResponse(res, { success: true, message: 'Tenant created successfully.' }, 200);
            }else{
                app.http.customResponse(res, { success: false, message: 'There is a problem with tenant creation.' }, 200);
            }
            
        }else{
            app.http.customResponse(res, { success: false, message: 'Please provide required field.' }, 200);
        }
    })
    //for windows
    app.get('/restore', (req, res) => {
        const command = `D:\\software\\mongodb-database-tools-windows-x86_64-100.5.3\\mongodb-database-tools-windows-x86_64-100.5.3\\bin\\mongorestore --uri "mongodb+srv://lntedutech:microcertdevusr@proctordev.jsoli.mongodb.net" --db edutech --drop ./proctor`;
    
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
                return res.status(500).send({success:false,messages:'Internal Server Error'});
            }
            
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            
            res.status(200).send({success:true,messages:'Database restored successfully'});
        });
    });
    app.get('/import', async (req, res) => {
        try {


            // Connect to the MongoDB client
            await client.connect();
    
            // Specify the path to your backup file
            const backupFilePath = './proctor';
    
            // Database Name from the connection URI
            const databaseName = dbName;
    
            // Drop the existing database
            await client.db(databaseName).dropDatabase();
    
            // Import the database from the backup file
            exec(`mongorestore --uri ${uri}/${databaseName} --drop ${backupFilePath}`, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return res.status(500).send('Internal Server Error');
                }
    
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
    
                res.status(200).send('Database imported successfully');
            });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send('Internal Server Error');
        } finally {
            await client.close();
        }
    });
}