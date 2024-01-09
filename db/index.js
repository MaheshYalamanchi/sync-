const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const _ = require("lodash");
const {v4 : uuidv4} = require('uuid')
let connection = async () => {
    let db, client;
    try {
      client = await MongoClient.connect(
        process.env.MONGO_URI,
        {
         connectTimeoutMS: 300000, socketTimeoutMS: 300000, useNewUrlParser: true,useUnifiedTopology: true
        }
      );
      return client;
      }catch (err) {
        //console.log("gdfg");
        throw err;
      }

  };
  let connectionLocal = async () => {
    let db, client;
    try {
      client = await MongoClient.connect(
        process.env.MONGO_URI_LOCAL,
        {
         connectTimeoutMS: 300000, socketTimeoutMS: 300000, useNewUrlParser: true,useUnifiedTopology: true
        }
      );
      return client;
      }catch (err) {
        //console.log("gdfg");
        throw err;
      }

  };
let updateorinsert = async (data, collectionname, docType) => {
    try {
      if (docType == 0) {
        if (data._id === undefined) {
          var requ = await insertDoc(data, collectionname);
        } else {
          var requ = await updateDoc(data, collectionname);
        }
      } else if (docType == 1) {
        var insertBatch = _.filter(data, function(o) {
          return o._id != undefined;
        });
        var updateBatch = _.filter(data, function(o) {
          return o._id != undefined;
        });
        if (insertBatch.length > 0) {
          var requ = await insertBatchDoc(insertBatch, collectionname);
          //console.log(requ);
          if (requ ){
            return requ
          }
          // else if(updateBatch.length > 0) {
          //   var requ = await updateBatchDoc(updateBatch, collectionname);
          //   // console.log(requ);
          //   if (requ && requ.result.nModified > 0){
          //     return requ
          //   }else {
          //     return "import proper csv file..."
          //   }
          // }
        }else{
          return { message: "Please upload the correct CSV file." }
        }
      } else {
        return "invalid format";
      }
    } catch (error) {
      console.log(error)
      throw error;
    }
};
let insertBatchDoc = async (data, collection) => {
    var client = await connection();
    try {
      let BatchDoc =[]
      let dataupdate =[]
      for (const iterator of data) {
        let status = "created";
        iterator.status = status
        var db = await client.db(process.env.DATABASENAME);
        let record = await db.collection(collection).find({_id:iterator._id}).toArray();
        record.push(record.length)
        // if(!record.length){
          const stringArray = iterator.addons.split(',')
          const members = iterator.members.split(',')
          const metrics = iterator.metrics.split(',')
          const numberArray = iterator.weights.split(',').map(parseFloat);
          var jsondata = {
            "_id" : iterator._id,
            "timesheet" : {
              "xaxis" : [],
              "yaxis" : []
            },
            "invites" : [iterator.invites],
            "quota" : parseFloat(iterator.quota),
            "concurrent" : parseFloat(iterator.concurrent),
            "members" : members,
            "addons" : stringArray,
            "metrics" : metrics,
            "weights" : numberArray,
            "status" : iterator.status,
            "tags" : [iterator.tags],
            "integrator" : iterator.integrator,
            "template" : iterator.template,
            "subject" : iterator.subject,
            "locale" : iterator.locale,
            "timeout" : parseFloat(iterator.timeout),
            "deadline" : parseFloat(iterator.deadline),
            "duration" : parseFloat(iterator.duration),
            "rules" : iterator.rules,
            "url" : iterator.url,
            "api" : iterator.api,
            "threshold" : parseFloat(iterator.threshold),
            "createdAt" : new Date(iterator.createdAt) || new Date(),
            "scheduledAt" : new Date(iterator.scheduledAt) || new Date(),
            "startedAt" : new Date(iterator.startedAt) || null,
            "stoppedAt" : new Date(iterator.stoppedAt) || null,
            "signedAt" : new Date(iterator.signedAt) || new Date(),
            "averages" : {
               "b1" : iterator["averages.b1"],
               "b2" : iterator["averages.b2"],
               "b3" : iterator["averages.b3"],
               "c1" : iterator["averages.c1"],
               "c2" : iterator["averages.c2"],
               "c3" : iterator["averages.c3"],
               "c4" : iterator["averages.c4"],
               "c5" : iterator["averages.c5"],
               "h1" : iterator["averages.h1"],
               "k1" : iterator["averages.k1"],
               "m1" : iterator["averages.m1"],
               "m2" : iterator["averages.m2"],
               "m3" : iterator["averages.m3"],
               "n1" : iterator["averages.n1"],
               "n2" : iterator["averages.n2"],
               "s1" : iterator["averages.s1"],
               "s2" : iterator["averages.s2"]
              },
            "score" : parseFloat(iterator.score) ,
            "student" : iterator.student,
            "incidents" : iterator.incidents,
            "conclusion" : iterator.conclusion,
            "comment" : iterator.comment,
            "ipaddress" : iterator.ipaddress,
            "useragent" : iterator.useragent,
            "updatedAt" : new Date(iterator.updatedAt) || new Date(),
            "isActive" : true
          }
          if(!jsondata.score){
            jsondata.score = null
          }
          if(!jsondata.deadline){
            jsondata.deadline = null
          }
          if(!jsondata.duration){
            jsondata.duration = null
          }
          if(!jsondata.concurrent){
            jsondata.concurrent = null
          }
          if(!jsondata.quota){
            jsondata.quota = null
          }
          if(!jsondata.threshold){
            jsondata.threshold = null
          }
          if(!jsondata.timeout){
            jsondata.timeout = null
          }
          if(!jsondata._id){
            jsondata._id = uuidv4()
          }
          for (let key in jsondata.averages) {
            if (jsondata.averages[key] === "") {
                jsondata.averages[key] = null;
            }else{
              averages[key] = parseFloat(averages[key]);
            }
          } 
          if(record.length == 2){
            var updateO = {
              updateOne: {
                filter: { _id: iterator._id },
                update: { $set: jsondata }
              }
            };
            dataupdate.push(updateO);
          }else{
            BatchDoc.push(jsondata)
          }
        // }
      }
      if(BatchDoc.length > 0){
        var db = await client.db(process.env.DATABASENAME);
        var response = await db.collection(collection).insertMany(BatchDoc);
      }
      if(dataupdate.length > 0){
        var db = await client.db(process.env.DATABASENAME);
        var response = await db.collection(collection).bulkWrite(dataupdate);
      }
      if( response){
        return ({ success: true, message: 'csv uploaded sucessfully ' })
      }
    } catch (error) {
      throw error;
    } finally {
      client.close();
    }
  };
let updateBatchDoc = async (data, collection) => {
    var client = await connection();
    try {
      var batchData = [];
    for (const iterator of data) {
      var _id = iterator._id;
      delete iterator._id;
      // var _id = new ObjectID(iterator._id);
      var updateO = {
        updateOne: {
          filter: { _id: _id },
          update: { $set: iterator }
        }
      };
      batchData.push(updateO);
    }
      var db = await client.db(process.env.DATABASENAME);
      var re = await db.collection(collection).bulkWrite(batchData);
      return re;
    } catch (error) {
      throw error;
    } finally {
      client.close();
    }
};
let insertDoc = async (data, collection) => {
    var client = await connection();
    //console.log(data,collection)
    try {
      var db = await client.db(process.env.DATABASENAME);
      return await db.collection(collection).insertOne(data);
    } catch (error) {
      throw error;
    } finally {
      client.close();
    }
};
let updateDoc = async (data, collection) => {
    var client = await connection();
    try {
      // data._id = new ObjectID(data._id);
      var db = await client.db(process.env.DATABASENAME);
      return await db
        .collection(collection)
        .updateOne({ _id: data._id }, { $set: data });
    } catch (error) {
      throw error;
    } finally {
      client.close();
    }
};
//aggregate
let aggregate = async (data, collection) => {
  var client = await connectionLocal();
  try {
    var db = await client.db(process.env.DATABASENAME);
    return await db
      .collection(collection)
      .aggregate(data,{allowDiskUse: true}).toArray();
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
};
//find
let findRec = async (data, collection) => {
  var client = await connectionLocal();
  try {
    var db = await client.db(process.env.DATABASENAME);
    return await db.collection(collection).find(data).toArray();
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
};
//remove
let removeRec = async (data, collection) => {
  var client = await connection();
  try {
    if(data&&data._id){
      data._id=new ObjectID(data._id)
    }

    var db = await client.db(process.env.DATABASENAME);
    return await db.collection(collection).deleteMany(data);
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
};
//remove
let removeRecId = async (data, collection) => {
  var client = await connection();
  try {
   
    var db = await client.db(process.env.DATABASENAME);
    return await db.collection(collection).deleteMany(data);
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
};
//Bulkupload
 let bulkUpload = async (data, collection,docType) => {
  if (docType == 1) {
    var client = await connection();
    try {
      var batchData = [];
    for (const iterator of data) {
      var _id = iterator._id;
      delete iterator._id;
      // var _id = new ObjectID(iterator._id);
      var updateO = {
        updateOne: {
          filter: { _id: _id },
          update: { $set: iterator }
        }
      };
      batchData.push(updateO);
    }
      var db = await client.db(process.env.DATABASENAME);
      var re = await db.collection(collection).bulkWrite(batchData);
      return re;
    } catch (error) {
      throw error;
    } finally {
      client.close();
    }
  }
};

//exec
let exec = async (data, collection,docType) => {
  if (docType == 1) {
    var client = await connection();
    try {
      var db = await client.db(process.env.DATABASENAME);
        return db.collection(collection).find(data.filter).sort(data.sort).skip(data.skip);
      // db.collection(collection).find(data.filter).sort(data.sort).limit(data.limit).populate(data.populate).skip(data.skip).exec(function (B, re){
      //   if (!re){
      //     return null;
      //   }
      //   return re;
      // });
      
    } catch (error) {
      throw error;
    } finally {
      // client.close();
    }
  }
};

module.exports = {
    connection,
    insertDoc,
    updateDoc,
    insertBatchDoc,
    updateBatchDoc,
    updateorinsert,
    aggregate,
    findRec,
    removeRec,
    removeRecId,
    bulkUpload,
    exec
}