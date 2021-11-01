Date.prototype.format = function (formatStr) {
  let _array = "2|5|1|0|4|3".split("|"),
      _index = 0;

  while (!![]) {
    switch (+_array[_index++]) {
      case 0:
        str = str.replace(/MM/, this.getMonth() + 1 > 9 ? (this.getMonth() + 1).toString() : "0" + (this.getMonth() + 1));
        continue;

      case 1:
        str = str.replace(/yyyy|YYYY/, this.getFullYear());
        continue;

      case 2:
        var str = formatStr;
        continue;

      case 3:
        return str;
        continue;

      case 4:
        str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : "0" + this.getDate());
        continue;

      case 5:
        var Week = ["日", "一", "二", "三", "四", "五", "六"];
        continue;
    }

    break;
  }
};

console.log(new Date().format("yyyy-MM-dd"));