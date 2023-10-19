let roomsData =  async (params) => {
    let username = params.username.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'_')
    let getrooms = {
        "_id" : params.id,
        "timesheet" : {
            "xaxis" : [],
            "yaxis" : []
        },
        "invites" :params.invites || [],
        "quota" : params.quota || 0,
        "concurrent" : params.concurrent || 0,
        "status" : "created",
        "tags" : [ 
            params.nickname
        ],
        "subject" : params.subject,
        "locale" : params.locale || null,
        "timeout" : params.timeout || 90,
        "createdAt" : params.createdAt,
        "updatedAt" : params.updatedAt,
        "api" : params.api ||null,
        "comment" : params.comment ||null,
        "complete" : params.complete ||false,
        "conclusion" : params.conclusion ||null,
        "deadline" : params.deadline ||null,
        "stoppedAt" : params.stoppedAt ||null,
        "timezone" : params.timezone ||null,
        "url" : params.url ||null,
        "lifetime" : params.lifetime ||null,
        "error" : params.error ||null,
        "scheduledAt" : params.scheduledAt ,
        "duration" : params.duration ||null,
        "incidents" : params.incidents ||null,
        "integrator" : params.integrator ||"sdk",
        "ipaddress" : params.ipaddress ||null,
        "score" : params.score ||null,
        "signedAt" : params.signedAt ,
        "startedAt": params.startedAt ||null,
        "useragent" : params.bowserDetails,
        "student" : username,
        "template" : params.template,
    }
    return getrooms;
    
}

module.exports = {
    roomsData
}


