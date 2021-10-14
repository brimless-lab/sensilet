let code = {};
code.SUCCESS = 200;
code.ERRORS = {
    NORMAL: 400,
    NETWORK_ERR: 401,

    PARAM_NOT_FOUND: 402,
    PARAM_NOT_EXPECTED: 403,

    GENESIS_EXIST:404,
};
code.msgs = {
    400: "系统异常",

    401: "网络异常",
    402: "缺少参数",
    403: "参数不符合预期",
    404:"请勿重复添加",
};

code.getError = function (errCode, msg) {
    if(errCode===code.ERRORS.NORMAL && !isNaN(msg)){
        errCode = parseInt(msg),
        msg = ""
    }

    if (!code.msgs[errCode])
        errCode = code.ERRORS.NORMAL;

    return {code: -errCode, msg: msg ? (code.msgs[errCode] + " : " + msg) : code.msgs[errCode]}
};

code.getErrorMsg = function (errCode, msg) {
    if(errCode===code.ERRORS.NORMAL && !isNaN(msg)){
        errCode = parseInt(msg)
        msg = ""
    }

    if (!code.msgs[errCode])
        errCode = code.ERRORS.NORMAL;

    return msg ? (code.msgs[errCode] + " : " + msg) : code.msgs[errCode]
};

global.SUCCESS = code.SUCCESS;
global.errorCode = code.ERRORS;
global.errorMsg = code.msgs;
global.getError = code.getError;
global.getErrorMsg = code.getErrorMsg;
