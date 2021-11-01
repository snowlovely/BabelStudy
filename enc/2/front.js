(function (arr, num) {
    var func = function (nums) {
        while (--nums) {
            arr.push(arr.shift());
        }
    };
    func(++num);
})(arr, 0x10);