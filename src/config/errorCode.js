let code = {};
code.SUCCESS = 200;
code.ERRORS = {
    NORMAL: 400,

    PARAM_NOT_FOUND: 401,
    PARAM_NOT_EXPECTED: 402,

    GENESIS_EXIST:403,
};
code.msgs = {
    400: "系统异常",

    401: "缺少参数",
    402: "参数不符合预期",
    403:"请勿重复添加",
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

global.SUCCESS = code.SUCCESS;
global.errorCode = code.ERRORS;
global.errorMsg = code.msgs;
global.getError = code.getError;
