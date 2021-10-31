const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require("fs");

const jscode = fs.readFileSync("../demo.js", {
    encoding: "utf-8"
});
let ast = parser.parse(jscode);
// 把代码中的a.b变成a["b"]
traverse(ast, {
    MemberExpression(path) {
        if (t.isIdentifier(path.node.property)) {
            let name = path.node.property.name;
            path.node.property = t.stringLiteral(name);
        }
        path.node.computed = true;
    },
});

function base64Encode(e) {
    return new Buffer.from(e).toString("base64");
}

// 全局大数组
let bigArr = [];
traverse(ast, {
    StringLiteral(path) {
        // 对字符串值进行Base64编码
        let cipherText = base64Encode(path.node.value);
        let bigArrIndex = bigArr.indexOf(cipherText);
        let index = bigArrIndex;
        // 如果大数组中没有该值则加入末尾
        if (bigArrIndex == -1) {
            let length = bigArr.push(cipherText);
            index = length - 1;
        }
        // 调用表达式：atob(arr[int])
        // true为computed表示[]调用
        let encStr = t.callExpression(
            t.identifier("atob"),
            [t.memberExpression(t.identifier("arr"),
                t.numericLiteral(index), true)]);
        // 修改简单字符串的调用
        path.replaceWith(encStr);
    }
});
// 将大数组中的字符串转为AST的简单字符串
bigArr = bigArr.map(function (v) {
    return t.stringLiteral(v);
});
// 简单的加密算法将大数组元素打乱
(function (arr, num) {
    var func = function (nums) {
        while (--nums) {
            arr.unshift(arr.pop());
        }
    };
    func(++num);
})(bigArr, 0x10);
// 定义变量的具体内容
bigArr = t.variableDeclarator(t.identifier("arr"), t.arrayExpression(bigArr));
// 设置VariableDeclaration的kind为var
bigArr = t.variableDeclaration("var", [bigArr]);
// 需要加入混淆后JS的数组还原代码
const jscodeFront = fs.readFileSync("front.js", {
    encoding: "utf-8"
});
let astFront = parser.parse(jscodeFront);
// 普通HEX编码
function hexEnc(code) {
    for (var hexStr = [], i = 0, s; i < code.length; i++) {
        s = code.charCodeAt(i).toString(16);
        hexStr += "\\x" + s;
    }
    return hexStr
}
// 同上把代码中的a.b变成a["b"]
traverse(astFront, {
    MemberExpression(path) {
        if (t.isIdentifier(path.node.property)) {
            let name = path.node.property.name;
            // 并且将a["b"]中的"b"做HEX编码
            path.node.property = t.stringLiteral(hexEnc(name));
        }
        path.node.computed = true;
    }
});

traverse(ast, {
    // 所有的普通数字类型
    NumericLiteral(path) {
        let value = path.node.value;
        let key = parseInt(Math.random() * (999999 - 100000) + 100000, 10);
        // 根据异或规则生成
        let cipherNum = value ^ key;
        // 构造一个表达式使得两个值异或结果为原来的值
        path.replaceWith(t.binaryExpression("^", t.numericLiteral(cipherNum), t.numericLiteral(key)));
        // 跳过是因为异或中还有数字不需要再异或防止卡死
        path.skip();
    }
});

ast.program.body.unshift(astFront.program.body[0]);
// unshift是头插所有最后插入大数组
ast.program.body.unshift(bigArr);

let code = generator(ast).code;
// 将"\\x"变成"\x"
code = code.replace(/\\\\x/g, "\\x");
fs.writeFile("./demo-new.js", code, (err) => { });
