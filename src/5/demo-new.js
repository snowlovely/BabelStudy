Date.prototype.format = function (formatStr) {
  var str = formatStr;
  eval(atob("dmFyIFdlZWsgPSBbIuaXpSIsICLkuIAiLCAi5LqMIiwgIuS4iSIsICLlm5siLCAi5LqUIiwgIuWFrSJdOw=="));
  str = str.replace(/yyyy|YYYY/, this.getFullYear());
  str = str.replace(/MM/, this.getMonth() + 1 > 9 ? (this.getMonth() + 1).toString() : "0" + (this.getMonth() + 1));
  str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : "0" + this.getDate());
  return str;
};

console.log(new Date().format("yyyy-MM-dd"));