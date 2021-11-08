const br=Math.pow(2,32)-1;

var Random = function(seed) {
	this.randomseed = seed;
	this.id = 0;
};

module.exports = Random;


Random.prototype.random = function(){
    const next = (1103515245*this.randomseed+123456789)%br;
    this.randomseed = next;
    return next/br;
}

//生成的随机数区间为 [min, max)
Random.prototype.randomInt = function(min,max){
    return Math.floor(min + this.random()  * (max - min))
}

Random.prototype.randomFloat = function(min,max){
    return (min + this.random()  * (max - min))
}

//返回整数随机值[min,max)
Random.prototype.randomInRange = function(from, to) {
    return this.randomInt(from,to);
};



Random.prototype.randomColor = function() {
    var color = '#' + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6);
    var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    var r = (parseInt(c[1], 16) - 32) > 0 ? (parseInt(c[1], 16) - 32) : 0;
    var g = (parseInt(c[2], 16) - 32) > 0 ? (parseInt(c[2], 16) - 32) : 0;
    var b = (parseInt(c[3], 16) - 32) > 0 ? (parseInt(c[3], 16) - 32) : 0;
    return {color,r,g,b};
};

Random.prototype.randomId = function() {
	return (this.randomseed + '' + this.id++) >>> 0;
}

Random.prototype.randomSort = function(arr){
     for (let i = 0, l = arr.length; i < l; i++) {
        let rc = this.randomInRange(0,l);
        const empty = arr[i];
        arr[i] = arr[rc];
        arr[rc] = empty;       
     }
     return arr;
}