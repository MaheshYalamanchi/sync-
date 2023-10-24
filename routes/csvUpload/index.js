const schedule = require('./scheduleService');
const sharedService = require("../schedule/sharedService");
let os = require('os')
const search = require('./filter')
module.exports = function (params) {
  var app = params.app;
  app.post('/api/csv/:model', async (req, res, next) => {
    if (req.body) {
      var csvUpload = await schedule.csvUpload(req.body);
      if (csvUpload && csvUpload.insertedCount > 0) {
        app.http.customResponse(res, ({ success: true, message: "records inserted successfully..." }), 200);
      } else if ((csvUpload && csvUpload.result && (csvUpload.result.nModified > 0))) {
        app.http.customResponse(res, ({ success: true, message: "records updated successfully..." }), 200);
      } else {
        app.http.customResponse(res, ({ success: false, message: csvUpload }), 200);
      }
    }
  });
  app.put('/api/csv/:model', async (req, res, next) => {
    try {
      if (req && req.body) {
        let filterData = await search.searchData(req.body.query.filter);
        let filter;
        if ('string' == typeof filterData){
          filter = {
            $or:
                [
                  { _id: { $regex: filterData, $options: 'i' } },
                  { subject: { $regex:  filterData, $options: 'i' } },
                  { student: { $regex:  filterData, $options: 'i' } },
                  { status: { $regex:  filterData, $options: 'i' } },
                  { startedAt: { $regex:  filterData, $options: 'i' } },
                  { duration: { $regex:  filterData, $options: 'i' } },
                  { score: { $regex:  filterData, $options: 'i' } },
                  { tags: { $regex:  filterData, $options: 'i' } },
                  { proctor: { $regex:  filterData, $options: 'i' } },
                  { members: { $regex:  filterData, $options: 'i' } }
                ]
          }
        } else if('object'== typeof filterData){
          filter = filterData;
        } else {
          filter = {};
        }
        const w = {
          model: req.params.model,
          filter: filter,
          skip: req.body.query.start||0,
          limit: req.body.query.limit||100,
          sort: req.body.query.sort||{createdAt:-1},
          populate: req.body.query.populate,
          select: req.body.query.select || "id",
          cursor: !0,
          single: !1,
        }
        let Q = req.body.query.delimiter || ";";
        let cursor = await schedule.csvDownload(w);
        let jsondata = {
          cursor: cursor,
          w: w,
          Q:Q
        }
        let csvResponse = await csv(jsondata);
        if (csvResponse){
          app.http.customResponse(res, ({ success: true, message: csvResponse.message }), 200);
        }
      } else {
        app.http.customResponse(res, ({ success: false, message: "requset body missing.." }), 200);
      }
    } catch (error) {
      app.http.customResponse(res, ({ success: false, message: error }), 400);
    }

  });
  app.get('/api/sessions/stopped', async (req, res, next) => {
    try {
      let data = [
        {
          $match: {
            $and: [
              { complete: { $ne: !0 } },
              { status: "paused" }
            ]
          }
        },
        {
          $project: {
            DifferenceInMin: { $divide: [{ $subtract: ["$updatedAt", "$startedAt"] }, (1000 * 60)] },
            timeout: 1,
            status: 1
          }
        },
        {
          $match: {
            $and: [
              { DifferenceInMin: { $ne: null } },
              { $expr: { $gt: ["$DifferenceInMin", "$timeout"] } }
            ]
          }
        }
      ]
      var responseData = await schedule.aggregate(data);
      if (responseData && responseData.length > 0) {
        let Bulkdata = []
        for (const iterator of responseData) {
          let jsonData = {
            _id: iterator._id,
            status: "stopped"
          }
          Bulkdata.push(jsonData)
        }
        if (Bulkdata.length > 0) {
          let response = await schedule.dataUpload(Bulkdata);
          if (response && response.nModified > 0) {
            app.http.customResponse(res, ({ success: true, message: "records updated successfully..." }), 200);
          }
        } else {
          app.http.customResponse(res, ({ success: false, message: "records missing" }), 200);
        }
      } else {
        app.http.customResponse(res, ({ success: false, message: "data not found" }), 200);
      }
    } catch (error) {
      app.http.customResponse(res, ({ success: false, message: error }), 400);
    }
  });
//   app.post('/api/auth/jwt', async (req, res,next) => {
//     try {
//         console.log('jwtapicall')
//         if(req.body && req.body.authorization){
//             let result = await sharedService.tokenValidation(req);
//             if (result && result.success) {
//                 app.logger.info({ success: true, message: result.message });
//                 app.http.customResponse(res, result.message, 200);
//             } else {
//               console.log(JSON.stringify(result))
//                 // app.logger.info({ success: false, message: result.message });
//                 app.http.customResponse(res, { success: false, message: 'Data Not Found' }, 200);
//             }
//         }else{
//             app.http.customResponse(res, { success: false, message: 'authorization error' }, 200);
//         }
//     } catch (error) {
//         console.log('jwtapicallfailedapi')
//         console.log(error,"jwtError1===>>>>")
//         app.logger.error({ success: false, message: error });
//         if (error && error.message) {
//             app.http.customResponse(res, { success: false, message: error.message }, 400);
//         } else {
//             app.http.customResponse(res, { success: false, message: error }, 400);
//         }
//     }
// });
  app.post('/api/auth/jwt', async (req, res,next) => {
    try {
        console.log('jwtapicall')
        if(req.body && req.body.authorization){
            let result = await sharedService.validateToken(req);
            if (result && result.success) {
                app.logger.info({ success: true, message: result.message });
                app.http.customResponse(res, result.message, 200);
            } else {
              // console.log(JSON.stringify(result))
                // app.logger.info({ success: false, message: result.message });
                app.http.customResponse(res, { success: false, message: 'Data Not Found' }, 200);
            }
        }else{
            app.http.customResponse(res, { success: false, message: 'authorization error' }, 200);
        }
    } catch (error) {
        console.log('jwtapicallfailedapi')
        console.log(error,"jwtError1===>>>>")
        app.logger.error({ success: false, message: error });
        if (error && error.message) {
            app.http.customResponse(res, { success: false, message: error.message }, 400);
        } else {
            app.http.customResponse(res, { success: false, message: error }, 400);
        }
    }
  });
}

function csv(data) {
  return new Promise((resolve, reject) => {
    try {
      let C = data.w.select.split(/\s+/);
      let g = [C.join(data.Q)];
      const I = function () {
        data.cursor.next(function (A, w) {
          if (A) return E(A);
          if (w) {
            if (g.length<100){
              const A = [];
              for (let B = 0; B < C.length; B++) {
                let E = R(w, C[B]);
                null == E && (E = "");
                const s = String(E).replace(new RegExp(`[${data.Q}\n\r]`, "g"), " ");
                A.push(s);
              }
              g.push(A.join(data.Q)), process.nextTick(I);
            } else {
              resolve({ success: true, message: g });
            }
          } else {
            resolve({ success: true, message: g })
          }
        });
        
      };
      process.nextTick(I);
      function R(A, B) {
        const E = "string" == typeof B ? B.split(".") : B;
        let w = E.reduce(function (A, B, w) {
          if (Array.isArray(A)) {
            const B = E.splice(w);
            return A.map(function (A) {
              return "object" != typeof A ? A : R(A, B.slice());
            }).join(", ");
          }
          return (A || {})[B];
        }, A);
        return w && "function" == typeof w.toJSON && (w = w.toJSON()), w;
      }
    } catch (error) {
      console.log(error)
      reject({ success: false, message: error })
    }

  })
};


