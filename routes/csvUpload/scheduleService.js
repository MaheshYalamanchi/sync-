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

module.exports = {
  csvUpload
}

