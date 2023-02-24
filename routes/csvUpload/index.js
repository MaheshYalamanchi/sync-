const schedule = require('./scheduleService')
module.exports = function (params) {
  var app = params.app;
  app.post('/api/csv/:model', async(req, res, next)=> {
    if(req.body){
      var csvUpload = await schedule.csvUpload(req.body);
      if (csvUpload && csvUpload.insertedCount > 0){
        app.http.customResponse(res,({success:true,message:"records inserted successfully..."}), 200);
      } else if ((csvUpload && csvUpload.result && (csvUpload.result.nModified > 0))){
        app.http.customResponse(res, ({success:true,message:"records updated successfully..."}), 200);
      }else {
        app.http.customResponse(res, ({success:false,message:csvUpload}), 200);
      }
    }
  });
}
