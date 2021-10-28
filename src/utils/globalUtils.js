global.sleep = (time)=>{
    return new Promise((resolve => {setTimeout(resolve,time)}));
}

Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

global.showLongString = (str,length=10)=>{
    if(!str)
        return "";
    if(str.length<=length)
        return str;
    return str.substring(0,length/2) + '...'+str.substring(str.length-length/2 , str.length)
};

global.showDecimal = function (num,fixed,decimal){

    if(typeof num ==='string')
        num = parseFloat(num)

    let temp = (num / Math.pow(10, decimal))
    let tempStr = temp+'';
    let index = tempStr.indexOf(".");
    if(index <0){
        return {
            integer: temp,
            decimal: ""
        }
    }else {
        temp = temp.toFixed(fixed)
        index = temp.indexOf(".")
        return {
            integer:temp.substring(0,index),
            decimal:temp.substring(index+1,temp.length)
        }
    }
}
