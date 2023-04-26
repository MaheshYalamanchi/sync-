const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const _ = require("lodash");
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
          if (requ && requ.insertedCount > 0){
            return requ
          }else if(updateBatch.length > 0) {
            var requ = await updateBatchDoc(updateBatch, collectionname);
            // console.log(requ);
            if (requ && requ.result.nModified > 0){
              return requ
            }else {
              return "import proper csv file..."
            }
          }
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
      for (const iterator of data) {
        let status = "created";
        iterator.status = status
        var db = await client.db(process.env.DATABASENAME);
        let record = await db.collection(collection).find({_id:iterator._id}).toArray();
        if(!record.length){
          BatchDoc.push(iterator)
        }
      }
      if(BatchDoc.length>0){
        var db = await client.db(process.env.DATABASENAME);
        return await db.collection(collection).insertMany(data);
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
      return db.collection(collection).find(data.filter).sort(data.sort).limit(data.limit).skip(data.skip);
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