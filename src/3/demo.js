var b = 200;
var c = 300;

var abc = function () {
    var a = 1000;
}
abc();

function bcd() {
    var a = 1000;
    var b = 500;
    function test() {
        var a = 200;
        var c = 300;
        return a + c + b;
    }
    test();
    return a + b + c;
}
bcd();