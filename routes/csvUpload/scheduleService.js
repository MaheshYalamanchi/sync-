const dbc = require('../../db/index')

let csvUpload = async data => {
    try {
      var updatestatus = await dbc.updateorinsert(
        data.data,
        "rooms",
        1
      );
      return updatestatus;
    } catch (error) {
      return error;
    }
};
let csvDownload = async data => {
  try {
    var updatestatus = await dbc.exec(
      data,
      "rooms",
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
};
let aggregate = async data =>{
  try {
    var updatestatus = await dbc.aggregate(
      data,
      "rooms",
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
}
let dataUpload = async data =>{
  try {

    var updatestatus = await dbc.bulkUpload(
      data,
      "rooms",
      1
    );
    return updatestatus;
  } catch (error) {
    return error;
  }
}
module.exports = {
  csvUpload,
  aggregate,
  dataUpload,
  csvDownload
}

